const multer = require('multer');
// const unzipper = require('unzipper');
const { log, warn, error, info } = require('../utils/logger');
const Studentmodel = require('../models/resisterStudentModel');
const extract = require('extract-zip');
const os = require('os');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, 'uploads/images/');
    } else if (file.mimetype.startsWith('video/')) {
      cb(null, 'uploads/videos/');
    } else if (file.mimetype === 'application/pdf') {
      cb(null, 'uploads/pdfs/');
    } else if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel'
    ) {
      cb(null, 'uploads/excels/');
    } else if (
      file.mimetype === 'font/ttf' ||
      file.mimetype === 'font/otf' ||
      file.mimetype === 'application/x-font-ttf' ||
      file.mimetype === 'application/x-font-opentype' ||
      file.mimetype === 'application/font-sfnt'
    ) {
      cb(null, 'uploads/fonts/');
    } else {
      cb(null, 'uploads/others/');
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

async function uploadPhotosFromZip(zipBuffer, batchStudentIds = []) {
  const tmpDir = path.join(os.tmpdir(), 'photo-upload-' + crypto.randomUUID());
  fs.mkdirSync(tmpDir, { recursive: true });

  const tmpZipPath = path.join(tmpDir, 'upload.zip');
  fs.writeFileSync(tmpZipPath, zipBuffer);

  // Extract zip
  await extract(tmpZipPath, { dir: tmpDir });

  const files = fs.readdirSync(tmpDir).filter(f => f !== 'upload.zip');

  const processedStudentIds = [];
  const missingInBatch = [];
  const missingInDb = [];

  for (let fileName of files) {
    const fullPath = path.join(tmpDir, fileName);
    const match = fileName.match(/(\d{10})/);
    if (!match) continue;

    const mobile = match[1];
    const student = await Studentmodel.findOne({ mobile });
    if (!student) {
      missingInDb.push(mobile);
      continue;
    }
    if (!batchStudentIds.includes(student.studentId)) {
      missingInBatch.push(student.studentId);
      continue;
    }

    const ext = path.extname(fileName).toLowerCase();
    const destName = `${student.studentId}${ext}`;
    const destDir = path.join(__dirname, '..', 'uploads', 'images');
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const destPath = path.join(destDir, destName);
    fs.copyFileSync(fullPath, destPath);

    const oldPath = student.imagePath;
    student.imagePath = `uploads/images/${destName}`;
    student.isProfile = "Pending";
    await student.save();
    deleteFile(oldPath);
    processedStudentIds.push(student.studentId);
    info(`Processed student ${student.studentId} with image ${destName}`);
  }

  fs.rmSync(tmpDir, { recursive: true, force: true });

  return { processedStudentIds, missingInDb, missingInBatch };
}

const upload = multer({
  storage: storage,
  limits: {  fileSize: 12 * 1024 * 1024 }, // 50MB file size limit
  fileFilter: function (req, file, cb) {
    const allowedFileTypes = /jpeg|jpg|png|mp4|avi|mkv|pdf|webp|xlsx|xls|ttf|otf/; // Add ttf and otf
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());

    const isExcel = file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                    file.mimetype === 'application/vnd.ms-excel';

    const isFont = file.mimetype.startsWith('font/') ||
                    file.mimetype === 'font/ttf' ||
                    file.mimetype === 'font/otf' ||
                   file.mimetype === 'application/x-font-ttf' ||
                   file.mimetype === 'application/octet-stream' ||
                   file.mimetype === 'application/x-font-opentype' ||
                   file.mimetype === 'application/font-sfnt';

    const mimeType = allowedFileTypes.test(file.mimetype) || isExcel || isFont;
    // console.log('File type:', file.mimetype, 'Extension:', path.extname(file.originalname).toLowerCase(), 'Allowed:', mimeType);
    if (extname && mimeType) {
      return cb(null, true);
    } else {
      cb('Error: Unsupported file format!');
    }
  }
});

const deleteFile = (relativePath) => {
  if (!relativePath) return;
  const fullPath = path.join(__dirname, '..', relativePath);
  error("Deleting file at path:", fullPath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

module.exports = { upload, deleteFile, 
  uploadPhotosFromZip
 };
