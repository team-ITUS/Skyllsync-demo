const { IssuedCertificateModel } = require("../models/issuedCertificateModel");
const { BatchModel } = require("../models/batchModel");
const { log, warn, error, info } = require('../utils/logger');
const {
  readRange: gsReadRange,
  readSheet: gsReadSheet,
  appendRow: gsAppendRow,
  appendRows: gsAppendRows,
  updateRange: gsUpdateRange,
  findDuplicatesByColumn: gsFindDuplicatesByColumn,
  issueCertData: gsIssueCertData,
} = require('../services/googleSheetsService');

const StudentModel = require("../models/resisterStudentModel");
const { BranchModel } = require("../models/branchModel");
const { completeBatchByTrainer } = require("../services/batchService");
const { compByTrainer } = require("./batchController");

const getExportableData = async (req, res) => {
  try {
    const { batchId } = req.params;

    const issuedCertificate = await IssuedCertificateModel.findOne({ batchId });
    if (!issuedCertificate) {
      return res
        .status(404)
        .json({ message: "Issued certificate not found", success: false });
    }

    //find batch details
    const batchDtl = await BatchModel.findOne({ batchId }, { assessment: 1 });

    const studentIds = issuedCertificate?.studList.map((stud) => stud.studentId);

    const students = await StudentModel.find(
      { studentId: { $in: studentIds } },
    ).sort({ name: 1 });

    const exportableData = issuedCertificate.studList.map((stud) => {
      const student = students.find((s) => s.studentId === stud.studentId);
      const matchedCertificateId = issuedCertificate?.studList.find(
        stud => stud?.studentId === student.studentId
      )?.certificateId;
      return {
        ...stud.toObject(),
        ...student.toObject(),
        certificateId: matchedCertificateId
      };
    });

    return res.status(200).json({
      exportableData,
      message: "Successfully get details",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
}

const getExaminDtlById = async (req, res) => {
  try {
    const { batchId } = req.params;

    const issuedCertificateCheck = await IssuedCertificateModel.findOne({ batchId });

    if (!issuedCertificateCheck) {
      try {
        const result = await completeBatchByTrainer(batchId);
      } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
      }
    }
    const issuedCertificate = await IssuedCertificateModel.findOne({ batchId });
    if (!issuedCertificate) {
      return res
        .status(404)
        .json({ message: "Issued certificate not found", success: false });
    }

    //find batch details
    const batchDtl = await BatchModel.findOne({ batchId }, { assessment: 1 });

    const studentIds = issuedCertificate?.studList.map((stud) => stud.studentId);

    const students = await StudentModel.find(
      { studentId: { $in: studentIds } },
      "studentId name email imagePath mobile isProfile"
    ).sort({ name: 1 });

    const studListWithNames = issuedCertificate.studList.map((stud) => {
      const student = students.find((s) => s.studentId === stud.studentId);
      const matchedCertificateId = issuedCertificate?.studList.find(
        stud => stud?.studentId === student.studentId
      )?.certificateId;
      const matchedIssuedDate = issuedCertificate?.studList.find(
        stud => stud?.studentId === student.studentId
      )?.issuedDate;
      return {
        ...stud.toObject(),
        studentName: student ? student.name : "N/A",
        studentEmail: student ? student.email : "N/A",
        imagePath: student ? student.imagePath : "N/A",
        mobile: student ? student.mobile : "N/A",
        isProfile: student ? student.isProfile : "Pending",
        certificateId: matchedCertificateId,
        issuedDate: matchedIssuedDate,
      };
    });

    const issuedData = {
      ...issuedCertificate.toObject(),
      studList: studListWithNames,
      assessment: batchDtl?.assessment,
    };

    return res.status(200).json({
      issuedData,
      message: "Successfully get details",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const updateExaminById = async (req, res) => {
  try {
    const { issuedCertificateId } = req.params;
    const { selectedData, role } = req.body;

    const year = new Date().getFullYear();
    const month = new Date()
      .toLocaleString("en-US", { month: "short" })
      .toUpperCase();

    //current number of certificate
    let currentNo;
    let branchDtl;
    let batchDtl;

    //find batchId from issuedCertificateId
    const issuedDtl = await IssuedCertificateModel.findOne(
      { issuedCertificateId },
      { batchId: 1 }
    );

    //find branchId from batch
    batchDtl = await BatchModel.findOne(
      { batchId: issuedDtl?.batchId },
      { branchId: 1, batchId: 1, endDate: 1 }
    );

    if (role === "admin") {
      //find startIndex from branch
      branchDtl = await BranchModel.findOne(
        { branchId: batchDtl?.branchId },
        {
          prefixOne: 1,
          prefixTwo: 1,
          startIndex: 1,
          currentIndex: 1,
          includeMonth: 1,
          includeYear: 1,
          branchId: 1,
        }
      );

      currentNo = branchDtl?.currentIndex || 0;
    }

    for (const { studentId, grade, meterDive } of selectedData) {
      const updateFields = {
        "studList.$.grade": grade,
        "studList.$.meterDive": meterDive,
        "studList.$.examinerGiven": true,
      };

      // If role is 'admin', set issued to true
      if (role === "admin") {
        updateFields["studList.$.issued"] = true;
        updateFields["studList.$.issuedDate"] = batchDtl.endDate;

        //check certificate already issued or not
        const isAssigned = await IssuedCertificateModel.findOne(
          {
            issuedCertificateId,
            "studList.studentId": studentId,
          },
          { "studList.$": 1 }
        );

        if (isAssigned?.studList[0]?.issued === false) {
          //add certificate id
          currentNo = currentNo + 1;
          let newId = `${branchDtl?.prefixOne}`;
          if (branchDtl?.prefixTwo.length > 0) {
            newId = `${newId}/${branchDtl?.prefixTwo}`;
          }
          if (branchDtl?.includeMonth === true) {
            newId = `${newId}/${month}`;
          }
          if (branchDtl?.includeYear === true) {
            newId = `${newId}/${year}`;
          }
          currentNoWithZeros = currentNo.toString().padStart(4, "0");
          newId = `${newId}/${currentNoWithZeros}`;
          updateFields["studList.$.certificateId"] = newId;

          //update currentIndex in branch
          await BranchModel.findOneAndUpdate(
            { branchId: branchDtl?.branchId },
            { $set: { currentIndex: currentNo } }
          );
        }
      }

      const updateResult = await IssuedCertificateModel.updateOne(
        { issuedCertificateId, "studList.studentId": studentId },
        { $set: updateFields }
      );

      if (updateResult.matchedCount === 0) {
        return res.status(404).json({
          message: "Fail to process your request",
          success: false,
        });
      }

      if (updateResult.modifiedCount === 0) {
        return res.status(400).json({
          message: "Fail to process your request",
          success: false,
        });
      }
    }

    if (role === "accessor") {
      //if value get that mean there is some student that not assing grade or meterDive by examiner.
      const isAllDone = await IssuedCertificateModel.findOne(
        {
          issuedCertificateId,
          "studList.examinerGiven": false,
        },
        { "studList.$": 1 }
      );

      if (isAllDone == null) {
        const w = await BatchModel.findOneAndUpdate(
          { batchId: batchDtl?.batchId },
          { $set: { byExaminer: "Completed" } },
          { new: true }
        );
      }
    } else if (role === "admin") {
      //if value get that mean not complete by admin
      const isAllDone = await IssuedCertificateModel.findOne(
        {
          issuedCertificateId,
          "studList.issued": false,
        },
        { "studList.$": 1 }
      );
      if (isAllDone == null) {
        await BatchModel.findOneAndUpdate(
          { batchId: batchDtl?.batchId },
          { $set: { byAdmin: "Completed" } },
          { new: true }
        );
      }
    }

    return res.status(200).json({
      message: "Process Completed.",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getMyCertList = async (req, res) => {
  try {
    const { studentId } = req.params;

    const batches = await IssuedCertificateModel.find(
      {
        studList: { $elemMatch: { studentId: studentId, issued: true } },
      },
      { batchId: 1, _id: 0 }
    );

    const batchIds = batches.map((batch) => batch.batchId);

    if (batchIds.length === 0) {
      return res.status(404).json({
        message: "Certificate not available",
        success: false,
      });
    }

    const courseDetails = await BatchModel.find(
      { batchId: { $in: batchIds } },
      { courseName: 1, courseId: 1, batchId: 1, _id: 0 }
    );

    const certificateList = courseDetails.map((course) => ({
      batchId: course.batchId,
      courseId: course.courseId,
      courseName: course.courseName,
    }));

    if (!certificateList || certificateList.length === 0) {
      return res.status(404).json({
        message: "Certificate not available",
        success: false,
      });
    }

    return res.status(200).json({
      certificateList,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const isIssuedCert = async (req, res) => {
  try {
    const { studentId, batchId } = req.body;

    const certificate = await IssuedCertificateModel.findOne({
      batchId: batchId,
      "studList.studentId": studentId,
      "studList.issued": true,
    });

    if (!certificate) {
      return res.status(404).json({
        message: "Certificate not issued yet.",
        success: false,
      });
    }

    // Filter to get only the student that matches the criteria
    const studentData = certificate.studList.find(
      (stud) => stud.studentId === studentId && stud.issued === true
    );

    if (!studentData) {
      return res.status(404).json({
        message: "Certificate not issued yet.",
        success: false,
      });
    }

    return res
      .status(200)
      .json({ message: "Certificate is issued to student.", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Increment certificateId and update issuedDate for a batch
const certIdIncrementor = async (req, res) => {
  try {
    const { batchId } = req.body;
    const { old_cert_id, old_start_id, new_cert_prefix, start_number, new_issued_date } = req.body;
    const issuedCertificate = await IssuedCertificateModel.findOne({ batchId });
    if (!issuedCertificate) {
      return res.status(404).json({ message: `No document found with batchId=${batchId}`, success: false });
    }

    let counter = start_number;
    let old_counter = old_start_id;
    let modified = false;
    for (let student of issuedCertificate.studList) {
      if (student.issued === true) {
        // console.log(`Comparing with: ${old_cert_id}${old_counter}`);
        if (student.certificateId) {
          // console.log(`Updating to: ${new_cert_prefix}${counter}`);
          student.certificateId = `${new_cert_prefix}${counter}`;
          counter++;
          old_counter++;
          modified = true;
        }
        // Always update issuedDate if provided
        if (new_issued_date) {
          student.issuedDate = new_issued_date;
          modified = true;
        }
      }
    }

    if (!modified) {
      return res.status(400).json({ message: `No studList entry matched for update.`, success: false });
    }

    const result = await IssuedCertificateModel.updateOne(
      { _id: issuedCertificate._id },
      { $set: { studList: issuedCertificate.studList } }
    );
    return res.status(200).json({
      message: `Updated certificateId and issuedDate for batchId=${batchId}`,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Delete issued certificate document by batchId
const deleteIssuedCertificateByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    if (!batchId) {
      return res.status(400).json({ message: 'batchId is required', success: false });
    }

    const deleted = await IssuedCertificateModel.findOneAndDelete({ batchId });
    if (!deleted) {
      return res.status(404).json({ message: 'Issued certificate not found for this batch', success: false });
    }
    // also in batch toggle Completed to pending
    await BatchModel.updateOne({ batchId: batchId }, { byAdmin: 'Pending', byExaminer: 'Pending', byTrainer: 'Pending' });

    return res.status(200).json({
      message: 'Issued certificate deleted successfully',
      success: true,
      batchId,
      issuedCertificateId: deleted.issuedCertificateId,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message, success: false });
  }
};

// Issue a single certificate by batchId and studentId
const issueSingleCertificateById = async (req, res) => {
  try {
    const { batchId, studentId } = req.params;
    const { grade } = req.body; // optional grade parameter

    if (!batchId || !studentId) {
      return res.status(400).json({ message: 'batchId and studentId are required', success: false });
    }

    // ensure batch exists
    const batchExists = await BatchModel.findOne({ batchId });
    if (!batchExists) {
      return res.status(404).json({ message: 'Batch not found', success: false });
    }

    // find or create issued certificate document for this batch
    let issuedDoc = await IssuedCertificateModel.findOne({ batchId });
    const issuedDateValue = batchExists.endDate || new Date();

    // If no document exists, create one and add the student as issued (atomic upsert)
    if (!issuedDoc) {
      const newEntry = {
        studentId,
        issued: false,
        issuedDate: issuedDateValue,
        grade: grade !== undefined ? grade : '',
      };
      compByTrainer(batchId);
      const createdOrUpdated = await IssuedCertificateModel.findOneAndUpdate(
        { batchId },
        { $setOnInsert: { batchId }, $push: { studList: newEntry } },
        { upsert: true, new: true }
      );
      return res.status(201).json({ message: 'Issued certificate document created and student added as issued', success: true, issuedDoc: createdOrUpdated });
    }

    // locate student entry within studList
    const existing = issuedDoc.studList.find((s) => s.studentId === studentId);

    // If student already exists in studList
    if (existing) {
      // If already issued, optionally update grade
      if (existing.issued) {
        if (grade !== undefined && existing.grade !== grade) {
          const upd = await IssuedCertificateModel.updateOne(
            { batchId, 'studList.studentId': studentId },
            { $set: { 'studList.$.grade': grade } }
          );
          return res.status(200).json({ message: 'Student already issued; grade updated', success: true, modified: upd.modifiedCount > 0 });
        }
        return res.status(200).json({ message: 'Student already issued', success: true, modified: false });
      }

      // Student present but not issued yet -> mark issued
      const updateFields = {
        'studList.$.issued': false,
        'studList.$.issuedDate': issuedDateValue,
      };
      if (grade !== undefined) updateFields['studList.$.grade'] = grade;

      const result = await IssuedCertificateModel.updateOne(
        { batchId, 'studList.studentId': studentId },
        { $set: updateFields }
      );

      return res.status(200).json({ message: 'Student marked as issued', success: true, modified: result.modifiedCount > 0 });
    }

    // Student not found in studList -> push new entry with issued=true
    const newEntry = {
      studentId,
      issued: false,
      issuedDate: issuedDateValue,
      grade: grade !== undefined ? grade : '',
    };

    // Use atomic push to append the student while preserving existing entries
    const updatedDoc = await IssuedCertificateModel.findOneAndUpdate(
      { batchId },
      { $push: { studList: newEntry } },
      { new: true }
    );
    if (!updatedDoc) {
      return res.status(500).json({ message: 'Failed to add student to issued certificate document', success: false });
    }

    return res.status(200).json({ message: 'Student added to issued list and marked as issued', success: true, issuedDoc: updatedDoc });
  } catch (err) {
    return res.status(500).json({ message: err.message, success: false });
  }
};


module.exports = {
  getExaminDtlById,
  updateExaminById,
  getMyCertList,
  isIssuedCert,
  getExportableData,
  certIdIncrementor,
  deleteIssuedCertificateByBatch,
  issueSingleCertificateById,
  // Google Sheets helpers
  gsReadRangeCtrl,
  gsReadSheetCtrl,
  gsUpdateRangeCtrl,
  gsAppendRowCtrl,
  gsAppendRowsCtrl,
  gsFindDuplicatesCtrl,
  // Issue cert data aggregation
  getAllIssueCertDataSorted,
};

/**
 * Google Sheets: Read a range (A1 notation). Example: GET /issuedCert/sheets/range?range=Sheet1!A1:Z
 */
async function gsReadRangeCtrl(req, res) {
  try {
    const { range = 'Sheet1' } = req.query;
    const rows = await gsReadRange(range);
    return res.status(200).json({ success: true, rows, range });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Google Sheets: Read full used grid of a sheet by name. Example: GET /issuedCert/sheets/read?sheetName=Sheet1
 */
async function gsReadSheetCtrl(req, res) {
  try {
    const { sheetName = 'Sheet1' } = req.query;
    const rows = await gsReadSheet(sheetName);
    return res.status(200).json({ success: true, rows, sheetName });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Google Sheets: Update a range with values. Example: POST /issuedCert/sheets/updateRange
 * Body: { range: 'Sheet1!B2', values: [['val1','val2']], valueInputOption: 'USER_ENTERED' }
 */
async function gsUpdateRangeCtrl(req, res) {
  try {
    const { range, values, valueInputOption = 'USER_ENTERED' } = req.body || {};
    if (!range) return res.status(400).json({ success: false, message: 'range is required' });
    if (!values) return res.status(400).json({ success: false, message: 'values is required' });
    const data = await gsUpdateRange(range, values, valueInputOption);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Google Sheets: Append a single row. Example: POST /issuedCert/sheets/appendRow
 * Body: { values: ['a','b','c'], range: 'Sheet1!A1', valueInputOption: 'USER_ENTERED' }
 */
async function gsAppendRowCtrl(req, res) {
  try {
    const { values = [], range = 'Sheet1!A1', valueInputOption = 'USER_ENTERED' } = req.body || {};
    const data = await gsAppendRow(values, range, valueInputOption);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Google Sheets: Append multiple rows. Example: POST /issuedCert/sheets/appendRows
 * Body: { sheetName: 'Sheet1', rows: [['a','b'], ['c','d']], valueInputOption: 'USER_ENTERED' }
 */
async function gsAppendRowsCtrl(req, res) {
  try {
    const { sheetName, rows = [], valueInputOption = 'USER_ENTERED' } = req.body || {};
    if (!sheetName) return res.status(400).json({ success: false, message: 'sheetName is required' });
    if (!Array.isArray(rows)) return res.status(400).json({ success: false, message: 'rows must be an array' });
    const data = await gsAppendRows(sheetName, rows, valueInputOption);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Google Sheets: Find duplicates by column. Example:
 * GET /issuedCert/sheets/duplicates?sheetName=Sheet1&columnName=certificateId&headerRowIndex=1&caseSensitive=false&trim=true&ignoreBlank=true
 */
async function gsFindDuplicatesCtrl(req, res) {
  try {
    const {
      sheetName,
      columnName,
      headerRowIndex = '1',
      caseSensitive = 'false',
      trim = 'true',
      ignoreBlank = 'true',
    } = req.query;

    const result = await gsFindDuplicatesByColumn({
      sheetName,
      columnName,
      headerRowIndex: Number(headerRowIndex) || 1,
      caseSensitive: String(caseSensitive).toLowerCase() === 'true',
      trim: String(trim).toLowerCase() === 'true',
      ignoreBlank: String(ignoreBlank).toLowerCase() === 'true',
    });
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Get flattened issue certificate data (optionally by batchId), sorted by certificateId.
 * Example: GET /issuedCert/allIssueData?onlyIssued=true or &batchId=XYZ
 */
async function getAllIssueCertDataSorted(req, res) {
  try {
    const { batchId, onlyIssued = 'false', includeDuplicates = 'false' } = req.query;
    const data = await gsIssueCertData({ batchId, onlyIssued: String(onlyIssued).toLowerCase() === 'true' });
    // Sort by certificateId (lexicographically, placing empty ids last)
    const sorted = [...data].sort((a, b) => {
      const A = (a.certificateId || '').toString();
      const B = (b.certificateId || '').toString();
      if (!A && !B) return 0;
      if (!A) return 1;
      if (!B) return -1;
      return A.localeCompare(B, undefined, { numeric: true, sensitivity: 'base' });
    });
    // Enrich with batch metadata for UI convenience
    try {
      const ids = [...new Set(sorted.map(r => r.batchId).filter(Boolean))]
      if (ids.length) {
        const batches = await BatchModel.find(
          { batchId: { $in: ids } },
          { batchId: 1, batchName: 1, courseName: 1, startDate: 1, endDate: 1, validity: 1 }
        ).lean()
        const nameMap = new Map(batches.map(b => [b.batchId, b.batchName]))
        const courseMap = new Map(batches.map(b => [b.batchId, b.courseName]))
        const startMap = new Map(batches.map(b => [b.batchId, b.startDate]))
        const endMap = new Map(batches.map(b => [b.batchId, b.endDate]))
        const validityMap = new Map(batches.map(b => [b.batchId, b.validity]))
        for (const row of sorted) {
          row.batchName = nameMap.get(row.batchId) || ''
          row.courseName = courseMap.get(row.batchId) || ''
          row.startDate = startMap.get(row.batchId) || null
          row.endDate = endMap.get(row.batchId) || null
          row.validity = validityMap.get(row.batchId) ?? null
        }
      }
    } catch (e) {
      // non-fatal; continue without names
      warn('Failed to enrich batchName in allIssueData', { err: e?.message })
    }
    // Optionally compute duplicates by certificateId
    let duplicates = undefined;
    if (String(includeDuplicates).toLowerCase() === 'true') {
      const map = new Map();
      for (const row of sorted) {
        const key = (row.certificateId || '').trim();
        if (!key) continue;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(row);
      }
      duplicates = [];
      for (const [key, list] of map.entries()) {
        if (list.length > 1) duplicates.push({ certificateId: key, rows: list });
      }
    }
  return res.status(200).json({ success: true, count: sorted.length, data: sorted, duplicates });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
