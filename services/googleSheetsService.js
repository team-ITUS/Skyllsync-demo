const { google } = require('googleapis');
const path = require('path');
const { warn, error, info } = require('../utils/logger');
require('dotenv').config();
const { IssuedCertificateModel } = require('../models/issuedCertificateModel');
const Studentmodel = require('../models/resisterStudentModel');

/**
 * Google Sheets Service
 * - Provides read, append, and update capabilities on a single spreadsheet defined in env.
 * - Uses Service Account credentials JSON path from GOOGLE_APPLICATION_CREDENTIALS.
 *
 * Required env vars:
 * - GOOGLE_APPLICATION_CREDENTIALS (relative or absolute path to service account json)
 * - SPREADSHEET_ID (target spreadsheet id)
 */

function getAuth() {
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyFile) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS is not set');
  }

  // Resolve relative path (e.g., ./service-secrets.json) to absolute
  const keyPath = path.isAbsolute(keyFile) ? keyFile : path.resolve(process.cwd(), keyFile);

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth;
}

function getSheets() {
  const auth = getAuth();
  return google.sheets({ version: 'v4', auth });
}

function ensureSpreadsheetId() {
  const spreadsheetId = process.env.SPREADSHEET_ID;
  if (!spreadsheetId) {
    throw new Error('SPREADSHEET_ID is not set');
  }
  return spreadsheetId;
}

/**
 * Read a range from the spreadsheet
 * @param {string} range - A1 notation, e.g., 'Sheet1!A1:C10'
 * @returns {Promise<string[][]>} rows
 */
async function readRange(range = 'Sheet1!A1:C10') {
  const sheets = getSheets();
  const spreadsheetId = ensureSpreadsheetId();
  try {
    info('GoogleSheets.readRange request', { range });
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = res.data.values || [];
    info('GoogleSheets.readRange response', { rowCount: rows.length });
    return rows;
  } catch (err) {
    error('GoogleSheets.readRange error', { err: err.message, range });
    throw err;
  }
}

/**
 * Read all used cells from a sheet by name (no A1 range required)
 * API still requires a range param, but passing just the sheet name returns the used grid.
 * @param {string} sheetName - e.g., 'Sheet1'
 * @returns {Promise<string[][]>} rows
 */
async function readSheet(sheetName = 'Sheet1') {
  if (!sheetName) throw new Error('sheetName is required');
  return readRange(sheetName);
}

/**
 * Append a row to a sheet
 * @param {string[]} values - Array of values to append as a single row
 * @param {string} range - A1 notation start (e.g., 'Sheet1!A1')
 * @param {('RAW'|'USER_ENTERED')} valueInputOption
 * @returns {Promise<any>} API response data
 */
async function appendRow(values = [], range = 'Sheet1!A1', valueInputOption = 'USER_ENTERED') {
  const sheets = getSheets();
  const spreadsheetId = ensureSpreadsheetId();
  try {
    info('GoogleSheets.appendRow request', { range, valuesCount: values.length });
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption,
      requestBody: { values: [values] },
    });
    info('GoogleSheets.appendRow response', { updatedRange: res.data?.updates?.updatedRange });
    return res.data;
  } catch (err) {
    error('GoogleSheets.appendRow error', { err: err.message, range });
    throw err;
  }
}

/**
 * Append multiple rows to a sheet without specifying A1 range.
 * For appends, the API finds the next row in the table identified by the range. Using the sheet name is enough.
 * @param {string} sheetName - e.g., 'Sheet1'
 * @param {Array<string[]>} rows2D - 2D array of rows
 * @param {('RAW'|'USER_ENTERED')} valueInputOption
 */
async function appendRows(sheetName, rows2D, valueInputOption = 'USER_ENTERED') {
  if (!sheetName) throw new Error('sheetName is required');
  if (!Array.isArray(rows2D)) throw new Error('rows2D must be an array of rows');
  // Use just the sheet name as the range to let Sheets handle row incrementation.
  return appendRowInternal(sheetName, rows2D, valueInputOption);
}

async function appendRowInternal(rangeLike, rows2D, valueInputOption = 'USER_ENTERED') {
  const sheets = getSheets();
  const spreadsheetId = ensureSpreadsheetId();
  try {
    info('GoogleSheets.appendRows request', { range: rangeLike, rowCount: rows2D.length });
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: rangeLike,
      valueInputOption,
      requestBody: { values: rows2D },
    });
    info('GoogleSheets.appendRows response', { updatedRange: res.data?.updates?.updatedRange });
    return res.data;
  } catch (err) {
    error('GoogleSheets.appendRows error', { err: err.message, range: rangeLike });
    throw err;
  }
}

/**
 * Update a specific range with a 2D array of values
 * @param {string} range - A1 notation, e.g., 'Sheet1!B2'
 * @param {string[][] | string[]} values - If a flat array is passed, it's converted to a single row
 * @param {('RAW'|'USER_ENTERED')} valueInputOption
 * @returns {Promise<any>} API response data
 */
async function updateRange(range, values, valueInputOption = 'USER_ENTERED') {
  const sheets = getSheets();
  const spreadsheetId = ensureSpreadsheetId();
  const normalized = Array.isArray(values[0]) ? values : [values];
  try {
    info('GoogleSheets.updateRange request', { range });
    const res = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption,
      requestBody: { values: normalized },
    });
    info('GoogleSheets.updateRange response', { updatedRange: res.data?.updatedRange });
    return res.data;
  } catch (err) {
    error('GoogleSheets.updateRange error', { err: err.message, range });
    throw err;
  }
}

// Helpers for header/column utilities
function normalizeHeader(text = '') {
  return String(text).trim().toLowerCase();
}

/**
 * Find duplicates by a given column name.
 * - Uses the first header row by default to map column names to indexes.
 * - Trims and compares case-insensitively by default.
 * @param {Object} params
 * @param {string} params.sheetName
 * @param {string} params.columnName
 * @param {number} [params.headerRowIndex=1] - 1-based index of header row
 * @param {boolean} [params.caseSensitive=false]
 * @param {boolean} [params.trim=true]
 * @param {boolean} [params.ignoreBlank=true]
 * @returns {Promise<{columnIndex:number, header:string[], duplicates:Array<{key:string, rows:Array<{rowIndex:number, values:string[]}>}>}>}
 */
async function findDuplicatesByColumn({ sheetName, columnName, headerRowIndex = 1, caseSensitive = false, trim = true, ignoreBlank = true }) {
  if (!sheetName) throw new Error('sheetName is required');
  if (!columnName) throw new Error('columnName is required');

  const rows = await readSheet(sheetName);
  if (!rows.length) return { columnIndex: -1, header: [], duplicates: [] };

  const headerIdx = Math.max(1, headerRowIndex) - 1;
  const header = rows[headerIdx] || [];
  const target = normalizeHeader(columnName);
  const colIndex = header.findIndex((h) => normalizeHeader(h) === target);
  if (colIndex === -1) {
    throw new Error(`Column "${columnName}" not found in sheet "${sheetName}"`);
  }

  const keyOf = (val) => {
    let v = val == null ? '' : String(val);
    if (trim) v = v.trim();
    if (!caseSensitive) v = v.toLowerCase();
    return v;
  };

  const map = new Map();
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const raw = row[colIndex] ?? '';
    const key = keyOf(raw);
    if (ignoreBlank && !key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push({ rowIndex: i + 1, values: row }); // 1-based index for Sheets UX
  }

  const duplicates = [];
  for (const [key, grouped] of map.entries()) {
    if (grouped.length > 1) duplicates.push({ key, rows: grouped });
  }

  return { columnIndex: colIndex, header, duplicates };
}

/**
 * Build flattened student certificate data by joining IssuedCertificates.studList with Studentregister.
 * @param {Object} params
 * @param {string} [params.batchId] - If provided, filter to a single batch
 * @param {boolean} [params.onlyIssued=false] - If true, include only studList items where issued=true
 * @returns {Promise<Array<Object>>}
 */
async function issueCertData({ batchId, onlyIssued = false } = {}) {
  const query = {};
  if (batchId) query.batchId = batchId;

  const issuedDocs = await IssuedCertificateModel.find(query).lean();
  if (!issuedDocs?.length) return [];

  // Flatten studList with origin batchId
  const studItems = [];
  for (const doc of issuedDocs) {
    const list = Array.isArray(doc.studList) ? doc.studList : [];
    for (const s of list) {
      if (onlyIssued && !s.issued) continue;
      studItems.push({
        batchId: doc.batchId,
        studentId: s.studentId,
        certificateId: s.certificateId || '',
        issued: !!s.issued,
        issuedDate: s.issuedDate || null,
        grade: s.grade || '',
        meterDive: s.meterDive || '',
        examinerGiven: !!s.examinerGiven,
      });
    }
  }

  if (!studItems.length) return [];

  const ids = [...new Set(studItems.map((x) => x.studentId).filter(Boolean))];
  const students = await Studentmodel.find({ studentId: { $in: ids } }).lean();
  const studentById = new Map(students.map((s) => [s.studentId, s]));

  const merged = studItems.map((x) => {
    const stu = studentById.get(x.studentId) || {};
    return {
      batchId: x.batchId,
      certificateId: x.certificateId,
      studentId: x.studentId,
      name: stu.name || '',
      mobile: stu.mobile || '',
      email: stu.email || '',
      nickname: stu.nickname || '',
      dob: stu.dob || null,
      gender: stu.gender || '',
      occupation: stu.occupation || '',
      qualification: stu.qualification || '',
      address: stu.address || '',
      bloodGrp: stu.bloodGrp || '',
      imagePath: stu.imagePath || '',
      registedDate: stu.registedDate || null,
      // Issuance details
      issued: x.issued,
      issuedDate: x.issuedDate,
      grade: x.grade,
      meterDive: x.meterDive,
      examinerGiven: x.examinerGiven,
      // Original docs metadata
      createdAt: stu.createdAt || null,
      updatedAt: stu.updatedAt || null,
    };
  });

  return merged;
}

module.exports = {
  readRange,
  readSheet,
  appendRow,
  appendRows,
  updateRange,
  findDuplicatesByColumn,
  issueCertData,
};
