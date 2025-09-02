const { LicenseModel } = require("../models/licenseModel");
const { GenLicense } = require("../services/generateLicenseService");
const archiver = require("archiver");
const fs = require("fs");
const path = require("path");
const { BatchModel } = require("../models/batchModel");
const Studentmodel = require("../models/resisterStudentModel");
const { IssuedCertificateModel } = require("../models/issuedCertificateModel");
const { LicensePairConfigModel } = require("../models/licensePairConfigModel");
const { log, warn, error, info } = require('../utils/logger');

// Single License Generation
exports.createLicense = async (req, res) => {
  try {
    const {
      batchId, studentId
    } = req.body;
    const batch = await BatchModel.findOne({ batchId });
    const student = await Studentmodel.findOne({ studentId });
    const license = await LicenseModel.findOne({ licenseId: batch?.licenseId });
    const issuedCert = await IssuedCertificateModel.findOne({
      batchId,
      "studList.studentId": studentId,
      "studList.issued": true,
    });
    if (!batch || !student || !license) {
      return res
        .status(404)
        .json({ message: "Data not found", success: false });
    }
    if (!issuedCert) {
      return res.status(404).json({ message: "Certificate not issued yet.", success: false });
    }
    const studentCert = issuedCert.studList.find(
      (stud) => stud.studentId === studentId
    );

    if (!studentCert || !studentCert.issued) {
      return res.status(404).json({ message: "Certificate not issued for this student.", success: false });
    }

    const studentBatches = await BatchModel.find({ studentIds: studentId });

    const coursePairs = await LicensePairConfigModel.find();

    const studentCourseIds = new Set(studentBatches.map(b => b.courseId));

    let matchedPairName = null;
    let courseCount = 0;
    let pairNo = null;
    for (const pair of coursePairs) {
      if (pair.courseIds.every(cid => studentCourseIds.has(cid))) {
        matchedPairName = pair.pairName;
        courseCount = pair.courseIds.length;
        pairNo = pair.pairNo; // Get the pairNo from the matched pair
        break;
      }
    }

    let courseName;
    if (matchedPairName) {
      courseName = matchedPairName;
    } else {
      courseName = batch.courseName;
    }

    const licenseData = {
      studentName: student.name,
      address: student.address || "Not provided",
      studentImage: student.imagePath,
      courseName, // This is now the pair name or individual course(s)
      licenseUrl: license.licenseUrl,
      signature: license.signature,
      DOI: studentCert.issuedDate,
      validTill: batch.validity,
      certificateId: studentCert.certificateId,
      certificateFont: license.licenseFont,
      courseCount: 2,
      batchId,
      studentId,
      pairNo
    };
    
    warn("Generating license with data:", licenseData.courseName, licenseData.DOI);
    const pdfBytes = await GenLicense(licenseData);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${student.name.replace(/\s+/g, "_")}_license.pdf"`,
    });
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Bulk License Generation
exports.createBulkLicenses = async (req, res) => {
  try {
    const { batchId, studentIds } = req.body;
    if (!batchId || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: "batchId and studentIds are required", success: false });
    }

    const batch = await BatchModel.findOne({ batchId });
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    const license = await LicenseModel.findOne({ licenseId: batch.licenseId });
    if (!license) return res.status(404).json({ message: "License template not found" });

    const coursePairs = await LicensePairConfigModel.find();

    const archive = archiver("zip", { zlib: { level: 9 } });
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="licenses_${batchId}.zip"`);
    archive.pipe(res);

    const skipped = [];
    // const pdfBuffers = [];

    for (const studentId of studentIds) {
      try {
        const student = await Studentmodel.findOne({ studentId });
        if (!student) throw new Error(`Student ${studentId} not found`);

        const issuedCert = await IssuedCertificateModel.findOne({
          batchId,
          "studList.studentId": studentId,
          "studList.issued": true,
        });
        if (!issuedCert) {
          throw new Error("Certificate not issued yet.");
        }
        const studentCert = issuedCert.studList.find(
          (stud) => stud.studentId === studentId
        );

        if (!studentCert || !studentCert.issued) {
          throw new Error("Certificate not issued for this student.");
        }
        // Find all batches for this student to check for course pairs
        const studentBatches = await BatchModel.find({ studentIds: studentId });
        const studentCourseIds = new Set(studentBatches.map(b => b.courseId));

        // Find matching course pair
        let matchedPairName = null;
        let courseCount = 0;
        for (const pair of coursePairs) {
          if (pair.courseIds.every(cid => studentCourseIds.has(cid))) {
            matchedPairName = pair.pairName;
            courseCount = pair.courseIds.length;
            break;
          }
        }

        let courseName;
        if (matchedPairName) {
          courseName = matchedPairName;
        } else {
          courseName = batch.courseName;
          courseCount = 1;
        }

        // Prepare license data for GenLicense
        const licenseData = {
          studentName: student.name,
          address: student.address || "Not provided",
          studentImage: student.imagePath,
          courseName,
          licenseUrl: license.licenseUrl,
          signature: license.signature,
          DOI: batch.DOI || batch.createdAt,
          validTill: batch.validity,
          certificateId: studentCert.certificateId,
          certificateFont: license.licenseFont,
          courseCount,
          batchId,
          studentId,
        };
        // console.log(licenseData);
        const pdfBytes = await GenLicense(licenseData);
        const fileName = `${student.name.replace(/\s+/g, "_")}_license.pdf`;
        archive.append(Buffer.from(pdfBytes), { name: fileName });
      } catch (e) {
        skipped.push(`StudentId ${studentId}: ${e.message}`);
      }
    }
    
    if (skipped.length > 0) {
      archive.append(skipped.join('\n'), { name: "skipped.txt" });
    }

    // Merge all PDFs into one using pdf-lib
    // const { PDFDocument } = require('pdf-lib');
    // const mergedPdf = await PDFDocument.create();
    // for (const buffer of pdfBuffers) {
    //   try {
    //     const pdf = await PDFDocument.load(buffer);
    //     const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    //     copiedPages.forEach((page) => mergedPdf.addPage(page));
    //   } catch (err) {
    //     skipped.push(`PDF merge error: ${err.message}`);
    //   }
    // }
    await archive.finalize();
    // const mergedBytes = await mergedPdf.save();
    // res.setHeader("Content-Type", "application/pdf");
    // res.setHeader("Content-Disposition", `attachment; filename=licenses_${batchId}_merged.pdf`);
    // return res.send(Buffer.from(mergedBytes));
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Get all licenses
exports.getAllLicenses = async (req, res) => {
  try {
    const licenses = await LicenseModel.find();
    res.status(200).json({ success: true, licenses });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Get license by ID
exports.getLicenseById = async (req, res) => {
  try {
    const { licenseId } = req.params;
    const license = await LicenseModel.findOne({ licenseId });
    if (!license) {
      return res.status(404).json({ message: "License not found", success: false });
    }
    res.status(200).json({ success: true, license });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Update license by ID
exports.updateLicense = async (req, res) => {
  try {
    const { licenseId } = req.params;
    let pdfPath, fontPath, signaturePath;

    // Handle new file uploads if present
    // console.log("Files in request:", req.files);
    if (req.files) {
      if (req.files.file && req.files.file[0]) {
        pdfPath = req.files.file[0].destination + req.files.file[0].filename;
      }
      if (req.files.font && req.files.font[0]) {
        fontPath = req.files.font[0].destination + req.files.font[0].filename;
      }
      if (req.files.signature && req.files.signature[0]) {
        signaturePath = req.files.signature[0].destination + req.files.signature[0].filename;
      }
    }

    // Build update object
    const updateObj = {
      licenseName: req.body.licenseName,
    };
    if (pdfPath) {
      // console.log("pdfPath is set:", pdfPath);
      updateObj.licenseUrl = pdfPath;
    } else {
      log("pdfPath is not set or falsy");
    }

    if (fontPath) {
      // console.log("fontPath is set:", fontPath);
      updateObj.licenseFont = fontPath;
    } else {
      log("fontPath is not set or falsy");
    }

    if (signaturePath) {
      // console.log("signaturePath is set:", signaturePath);
      updateObj.signature = signaturePath;
    } else {
      log("signaturePath is not set or falsy");
    }

    const license = await LicenseModel.findOneAndUpdate(
      { licenseId },
      updateObj,
      { new: true }
    );
    if (!license) {
      return res.status(404).json({ message: "License not found", success: false });
    }
    res.status(200).json({ success: true, license });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Delete license by ID
exports.deleteLicense = async (req, res) => {
  try {
    const { licenseId } = req.params;
    const license = await LicenseModel.findOneAndDelete({ licenseId });
    if (!license) {
      return res.status(404).json({ message: "License not found", success: false });
    }
    res.status(200).json({ success: true, message: "License deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Add new license
exports.addLicense = async (req, res) => {
  try {
    let pdfPath, fontPath, signaturePath;
    if (req.files) {
      if (req.files.file && req.files.file[0]) {
        pdfPath = req.files.file[0].destination + req.files.file[0].filename;
      }
      if (req.files.font && req.files.font[0]) {
        fontPath = req.files.font[0].destination + req.files.font[0].filename;
      }
      if (req.files.signature && req.files.signature[0]) {
        signaturePath = req.files.signature[0].destination + req.files.signature[0].filename;
      }
    }
    // console.log(pdfPath, fontPath, signaturePath);
    const licenseModel = new LicenseModel({
      licenseName: req.body.licenseName,
      licenseUrl: pdfPath,
      licenseFont: fontPath,
      signature: signaturePath,
    });

    await licenseModel.save();

    return res
      .status(201)
      .json({ message: "Successfully add new license", success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Returns: { courseId: batch, ... }
async function getStudentCoursesInBatches(studentId) {
  const batches = await BatchModel.find({ studentIds: studentId });
  const courseMap = {};
  batches.forEach(batch => {
    courseMap[batch.courseId] = batch;
  });
  return courseMap;
}