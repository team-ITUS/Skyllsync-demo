const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const { BatchModel } = require("../models/batchModel");
const Studentmodel = require("../models/resisterStudentModel");
const { AccessorModel } = require("../models/accessorModel");
const { BranchModel } = require("../models/branchModel");
const { AdminModel } = require("../models/adminModel");
const { log, warn, error, info } = require('../utils/logger');

const { CertificateModel } = require("../models/certificateModel");
const { IssuedCertificateModel } = require("../models/issuedCertificateModel");
const { LicensePairConfigModel } = require("../models/licensePairConfigModel");
const {
  GenCertificate,
  generateBatchCertificates
} = require("../services/generateCertService");
const { buffer } = require("stream/consumers");
const archiver = require("archiver");

const generateCertificate = async (req, res) => {
  try {
    const { studentName, courseName, date } = req.body;

    const templatePath = path.join(
      __dirname,
      "..",
      "uploads",
      "pdfs",
      "BigHostCertificate.pdf"
    ); // Make sure you have a template
    const templateBytes = fs.readFileSync(templatePath);

    const pdfDoc = await PDFDocument.load(templateBytes);

    const page = pdfDoc.getPage(0);

    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    page.drawText(studentName, {
      x: 200,
      y: 260,
      size: 25,
      font: font,
      color: rgb(1, 0.55, 0),
    });

    // Add course name
    // page.drawText(courseName, {
    //     x: 250,
    //     y: 250,
    //     size: 24,
    //     font: font,
    //     color: rgb(0, 0, 0),
    // });

    // Add date
    // page.drawText(date, {
    //     x: 250,
    //     y: 200,
    //     size: 20,
    //     font: font,
    //     color: rgb(0, 0, 0),
    // });

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${studentName}-certificate.pdf`
    );

    // Send the PDF bytes to the client
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    res.status(500).send("An error occurred while generating the certificate.");
  }
};

const addCertificate = async (req, res) => {
  try {
    let pdfPath, fontPath;
    if (req.files) {
      if (req.files.file && req.files.file[0]) {
        pdfPath = req.files.file[0].destination + req.files.file[0].filename;
      }
      if (req.files.font && req.files.font[0]) {
        fontPath = req.files.font[0].destination + req.files.font[0].filename;
      }
    }

    const certificateModel = new CertificateModel({
      certificateName: req.body.certificateName,
      certificateCode: req.body.certificateCode,
      certificateUrl: pdfPath,
      certificateFont: fontPath,
    });

    await certificateModel.save();

    return res
      .status(201)
      .json({ message: "Successfully add new certificate", success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

const getCertificateList = async (req, res) => {
  try {
    const certificateList = await CertificateModel.find();

    if (!certificateList || certificateList.length === 0) {
      return res
        .status(404)
        .json({ message: "No certificate available", success: false });
    }
    return res.status(200).json({
      certificateList,
      message: "Successfully get all certificate",
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

const downloadMultCert = async (req, res) => {
  try {
    const { batchId, studentIds } = req.body;

    // Fetch batch-level data ONCE
    const batch = await BatchModel.findOne({ batchId });
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    const certificate = await CertificateModel.findOne({ certificateId: batch.certificateId });
    if (!certificate) return res.status(404).json({ message: "Certificate template not found" });

    const branch = await BranchModel.findOne({ branchId: batch.branchId });
    if (!branch) return res.status(404).json({ message: "Branch data not found" });

    const accessor = await AccessorModel.findOne({ accessorId: batch.accessorId });

    // Prepare ZIP archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="certificates_${batchId}.zip"`);
    archive.pipe(res);

    const skipped = [];

    for (const studentId of studentIds) {
      try {
        const student = await Studentmodel.findOne({ studentId });
        if (!student) throw new Error(`Student ${studentId} not found`);

        const issuedCert = await IssuedCertificateModel.findOne({
          batchId,
          'studList.studentId': studentId,
          'studList.issued': true
        });
        if (!issuedCert) throw new Error(`Certificate not issued for student ${studentId}`);

        const studData = issuedCert.studList.find(s => s.studentId === studentId);
        if (!studData) throw new Error(`Student data not found in issuedCert`);

        // Build certData for service
        const certData = {
          studentName: student.name,
          studentImage: student.imagePath,
          courseName: batch.courseName,
          certificateUrl: certificate.certificateUrl,
          certificateFont: certificate.certificateFont,
          issuedDate: studData.issuedDate,
          validTill: batch.validity,
          grade: studData.grade || '',
          batchId: batch.batchId,
          studentId: student.studentId,
          certificateId: studData.certificateId,
          examinerName: (accessor && accessor.accessorName) || '',
          signatures : {
            admin: process.env.ADMIN_SIGNATURE,
            trainer: accessor.signature,
            examiner: accessor.signature,
            // Add more if needed
          },
          logos: {
            logoOne: branch.logoOne || '',
            logoTwo: branch.logoTwo || '',
            logoThree: branch.logoThree || '',
            logoFour: branch.logoFour || ''
          }
        };

        // Generate PDF
        const pdfBytes = await GenCertificate(certData);
        archive.append(Buffer.from(pdfBytes), { name: `${student.name}_${student.mobile}.pdf` });
      } catch (e) {
        const student = await Studentmodel.findOne({ studentId });
        skipped.push(`${student?.name || 'Unknown'} (${student?.mobile || 'No Mobile'}) - ${e.message}`);
      }
    }

    // Add skipped.txt file
    if (skipped.length > 0) {
      const skippedContent = skipped.join('\n');
      archive.append(skippedContent, { name: 'skipped.txt' });
    }

    await archive.finalize();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downloadCert = async (req, res) => {
  try {
    const { batchId, studentId } = req.body;
    const batch = await BatchModel.findOne({ batchId });
    const student = await Studentmodel.findOne({ studentId });
    const certificate = await CertificateModel.findOne({ certificateId: batch?.certificateId });
    const issuedCert = await IssuedCertificateModel.findOne({
      batchId,
      "studList.studentId": studentId,
      "studList.issued": true,
    });
    const branch = await BranchModel.findOne({ branchId: batch.branchId });
    const examiner = await AccessorModel.findOne({
      accessorId: batch.accessorId,
    });
    if (!batch || !student || !certificate || !branch) {
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
    // Prepare signatures (admin, trainer, examiner, etc.)
    const signatures = {
      admin: process.env.ADMIN_SIGNATURE,
      trainer: examiner.signature,
      examiner: examiner.signature,
      // Add more if needed
    };

    // Prepare logos (up to four)
    const logos = {
      logoOne: branch.logoOne || "",
      logoTwo: branch.logoTwo || "",
      logoThree: branch.logoThree || "",
      logoFour: branch.logoFour || "",
    };
    // Prepare certificate data object
    const certData = {
      studentName: student.name,
      studentImage: student.imagePath,
      courseName: batch.courseName,
      certificateUrl: certificate.certificateUrl,
      issuedDate: studentCert.issuedDate,
      validTill: batch.validity,
      grade: studentCert.grade || "",
      batchId: batch.batchId,
      studentId: student.studentId,
      certificateId: studentCert.certificateId,
      signatures,
      logos,
      examinerName: examiner.accessorName || "",
      certificateFont: certificate.certificateFont,
      // Add any other fields needed by GenCertificate
    };
    // Generate certificate PDF
    const pdfBuffer = await GenCertificate(certData);
    // Send PDF as response
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${student.name}_${student.mobile}.pdf"`,
    });
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }

};

const verify = async (req, res) => {
  try {
    const { batchId, studentId } = req.params;
    const studentDtl = await Studentmodel.findOne(
      { studentId },
      { name: 1, studentId: 1, autoIndex: 1, imagePath: 1, }
    );

    if (!studentDtl) {
      return res
        .status(404)
        .json({ message: "Verification Failed.", success: false });
    }

    const batchDtl = await BatchModel.findOne(
      { batchId },
      {
        validity: 1,
        branch: 1,
        courseName: 1,
        courseId: 1,
        certificateId: 1,
        branchId: 1,
      }
    );

    if (!batchDtl) {
      return res
        .status(404)
        .json({ message: "Verification Failed.", success: false });
    }

    const branchDtl = await BranchModel.findOne(
      { branchId: batchDtl.branchId },
      {
        branchName: 1,
      }
    );

    // Find all batches for this student that are issued
    const issuedCerts = await IssuedCertificateModel.find({
      'studList': { $elemMatch: { studentId: studentId, issued: true } }
    });

    // Determine combinedCourseName: only override with pairName when
    // (1) current courseId is part of a defined pair AND
    // (2) student has completed ALL courseIds in that pair.
    let combinedCourseName = batchDtl.courseName;
    const currentCourseId = batchDtl.courseId;
    if (issuedCerts && issuedCerts.length > 0 && currentCourseId) {
      // Gather all batchIds from student's issued certs
      const issuedBatchIds = issuedCerts.map(c => c.batchId).filter(Boolean);
      if (issuedBatchIds.length) {
        const relatedBatches = await BatchModel.find(
          { batchId: { $in: issuedBatchIds } },
          { courseId: 1 }
        );
        const studentCourseIds = new Set(
          relatedBatches
            .map(b => b.courseId)
            .filter(Boolean)
        );
        if (studentCourseIds.size) {
          const allPairs = await LicensePairConfigModel.find({}, { courseIds: 1, pairName: 1 });
          for (const pair of allPairs) {
            if (!Array.isArray(pair.courseIds) || pair.courseIds.length === 0) continue;
            // Must include the current course AND student must have every courseId in the pair
            const includesCurrent = pair.courseIds.includes(currentCourseId);
            if (!includesCurrent) continue;
            const hasAll = pair.courseIds.every(cid => studentCourseIds.has(cid));
            if (hasAll) {
              combinedCourseName = pair.pairName; // override
              break; // first valid pair is enough per requirement
            }
          }
        }
      }
    }

    const issuedCertDtl = await IssuedCertificateModel.findOne(
      {
        batchId: batchId,
        studList: {
          $elemMatch: { studentId: studentId },
        },
      },
      {
        "studList.$": 1,
        batchId: 1,
        certificateId: 1,
      }
    );
    function formatDate(isoString) {
      if (!isoString) return '';
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return ''; // invalid date

      // Zero-pad the day
      d.setUTCDate(d.getUTCDate() + 1); // This will correctly roll over to next month/year if needed
      const day = String(d.getUTCDate()).padStart(2, '0');

      // Short month name in uppercase
      const month = d
        .toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
        .toUpperCase();

      const year = d.getUTCFullYear();
      return `${day}-${month}-${year}`;
    }

    const issuedDate = issuedCertDtl.studList[0].issuedDate;
    const date = new Date(issuedDate);

    const issuedOn = formatDate(issuedDate);

    let certCode = issuedCertDtl?.studList[0]?.certificateId;

    const validateDate = new Date(issuedDate);
    validateDate.setDate(validateDate.getDate() - 1);
    validateDate.setFullYear(date.getFullYear() + batchDtl.validity);

    const validTill = formatDate(validateDate);

    // checking if student is valid or not
    const testData = {
      studentName: studentDtl?.name,
      courseName: combinedCourseName,
      issuedOn: issuedOn,
      validTill: validTill,
      certCode: certCode,
      studentImg: studentDtl?.imagePath || ""
    };

    if (validateDate < new Date()) {
      return res.status(400).json({
        message: "Certificate is not valid anymore.",
        data: testData,
        success: false,
      });
    }

    return res
      .status(200)
      .json({
        message: "Successfully get data.",
        success: true,
        data: testData,
      });
  } catch (error) {

    return res.status(500).json({ message: error.message, success: false });
  }
};

// Update certificate template
const updateCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    let pdfPath, fontPath;

    // Handle new file uploads if present
    // console.log("Files in request:", req.files);
    if (req.files) {
      if (req.files.file && req.files.file[0]) {
        pdfPath = req.files.file[0].destination + req.files.file[0].filename;
      }
      if (req.files.font && req.files.font[0]) {
        fontPath = req.files.font[0].destination + req.files.font[0].filename;
      }
    }

    // Build update object
    const updateObj = {
      certificateName: req.body.certificateName,
      certificateCode: req.body.certificateCode,
    };
    if (pdfPath) {
      updateObj.certificateUrl = pdfPath;
    } else {
      log("pdfPath is not set or falsy");
    }

    if (fontPath) {
      
      updateObj.certificateFont = fontPath;
    } else {
      log("fontPath is not set or falsy");
    }

    const updated = await CertificateModel.findOneAndUpdate(
      { certificateId },
      updateObj,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Certificate not found", success: false });
    }

    return res.status(200).json({ message: "Certificate updated", success: true, certificate: updated });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Delete certificate template
const deleteCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const deleted = await CertificateModel.findOneAndDelete({ certificateId });
    if (!deleted) {
      return res.status(404).json({ message: "Certificate not found", success: false });
    }
    return res.status(200).json({ message: "Certificate deleted", success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

module.exports = {
  generateCertificate,
  addCertificate,
  updateCertificate,
  deleteCertificate,
  getCertificateList,
  downloadCert,
  downloadMultCert,
  verify,
};
