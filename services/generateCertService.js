// Endrosed Institute ITUS MMB
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fontkit = require("fontkit") // Add at the top of your file
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const dotenv = require("dotenv");
const { log, warn, error, info } = require('../utils/logger');

const { BatchModel } = require("../models/batchModel");
const { CertificateModel } = require("../models/certificateModel");
const { BranchModel } = require("../models/branchModel");
const { AccessorModel } = require("../models/accessorModel");
const { IssuedCertificateModel } = require("../models/issuedCertificateModel");
const archiver = require("archiver");
const Studentmodel = require("../models/resisterStudentModel");
dotenv.config();

const BASE_URL = process.env.BASE_URL;

/**
 * GenCertificate - Fills a PDF template with provided data and images.
 * @param {Object} data - Certificate data and assets.
 * @param {string} data.certificateUrl - Path to PDF template.
 * @param {string} data.certificateId
 * @param {string} data.name
 * @param {string} data.courseName
 * @param {string} data.grade
 * @param {string} data.issuedDate
 * @param {string} data.validityDate
 * @param {Buffer|string} data.signature1
 * @param {Buffer|string} data.signature2
 * @param {Buffer|string} data.signature3
 * @param {Buffer|string} data.logoOne
 * @param {Buffer|string} data.logoTwo
 * @param {Buffer|string} data.logoThree
 * @param {Buffer|string} data.logoFour
 * @param {Buffer|string} data.profile_photo
 * @param {string} data.qrData - Data to encode in QR code
 * @returns {Promise<Buffer>} - The filled PDF as a buffer
 */

const endrosedCPdf = async (
  studentDtl,
  certificateUrl,
  courseName,
  adminSign,
  accessorSign,
  certCode,
  issuedOn,
  branchDtl,
  validTill,
  grade,
  meterDive
) => {
  try {
    const pdfTemplate = fs.readFileSync(
      path.join(__dirname, `../${certificateUrl}`)
    );
    const pdfDoc = await PDFDocument.load(pdfTemplate);

    const page = pdfDoc.getPage(0);

    //studentImage
    let image;
    try {
      const imagePath = path.join(__dirname, `../${studentDtl.imagePath}`);
      const imageBytes = fs.readFileSync(imagePath);
      if (studentDtl.imagePath.toLowerCase().endsWith(".png")) {
        image = await pdfDoc.embedPng(imageBytes);
      } else if (
        studentDtl.imagePath.toLowerCase().endsWith(".jpg") ||
        studentDtl.imagePath.toLowerCase().endsWith(".jpeg")
      ) {
        image = await pdfDoc.embedJpg(imageBytes);
      }
    } catch (error) {

    }

    //adminSign
    let adminImage;
    try {
      const adminPath = path.join(__dirname, `../${adminSign}`);
      const adminBytes = fs.readFileSync(adminPath);
      if (adminSign.toLowerCase().endsWith(".png")) {
        adminImage = await pdfDoc.embedPng(adminBytes);
      } else if (
        adminSign.toLowerCase().endsWith(".jpg") ||
        adminSign.toLowerCase().endsWith(".jpeg")
      ) {
        adminImage = await pdfDoc.embedJpg(adminBytes);
      }
    } catch (error) { }

    //accessorSign
    let accessorImage;
    try {
      const accessorPath = path.join(__dirname, `../${accessorSign}`);
      const accessorBytes = fs.readFileSync(accessorPath);
      if (accessorSign.toLowerCase().endsWith(".png")) {
        accessorImage = await pdfDoc.embedPng(accessorBytes);
      } else if (
        accessorSign.toLowerCase().endsWith(".jpg") ||
        accessorSign.toLowerCase().endsWith(".jpeg")
      ) {
        accessorImage = await pdfDoc.embedJpg(accessorBytes);
      }
    } catch (error) { }

    //logo one
    let logoOne;
    try {
      const logoOnePath = path.join(__dirname, `../${branchDtl.logoOne}`);
      const logoOneBytes = fs.readFileSync(logoOnePath);
      if (branchDtl.logoOne.toLowerCase().endsWith(".png")) {
        logoOne = await pdfDoc.embedPng(logoOneBytes);
      } else if (
        branchDtl.logoOne.toLowerCase().endsWith(".jpg") ||
        branchDtl.logoOne.toLowerCase().endsWith(".jpeg")
      ) {
        logoOne = await pdfDoc.embedJpg(logoOneBytes);
      }
    } catch (error) { }

    //logo one
    let logoTwo;
    try {
      const logoTwoPath = path.join(__dirname, `../${branchDtl.logoTwo}`);
      const logoTwoBytes = fs.readFileSync(logoTwoPath);
      if (branchDtl.logoTwo.toLowerCase().endsWith(".png")) {
        logoTwo = await pdfDoc.embedPng(logoTwoBytes);
      } else if (
        branchDtl.logoTwo.toLowerCase().endsWith(".jpg") ||
        branchDtl.logoTwo.toLowerCase().endsWith(".jpeg")
      ) {
        logoTwo = await pdfDoc.embedJpg(logoTwoBytes);
      }
    } catch (error) { }

    // Generate QR Code containing student details or verification URL
    const qrData = `${BASE_URL}/admin/#/verify/${studentDtl?.batchId}/${studentDtl?.studentId}`;
    const qrCodeBuffer = await QRCode.toBuffer(qrData, { type: "png" });

    // Embed QR Code in PDF
    const qrCodeImage = await pdfDoc.embedPng(qrCodeBuffer);

    // Draw the image on the PDF
    if (image) {
      page.drawImage(image, {
        x: 444,
        y: 585,
        width: 120,
        height: 120,
      });
    }

    //certificate code
    page.drawText(certCode, {
      x: 450,
      y: 570,
      size: 12,
      color: rgb(0, 0, 0),
    });

    //grade
    grade && grade != "Not graded" &&
      page.drawText(`Grade: ${grade}`, {
        x: 450,
        y: 558,
        size: 12,
        color: rgb(0, 0, 0),
      });

    //meterDive
    meterDive && meterDive != "NA" &&
      page.drawText(`Marks: ${meterDive}m`, {
        x: 450,
        y: 546,
        size: 12,
        color: rgb(0, 0, 0),
      });

    // Add the student's name
    page.drawText(studentDtl.name, {
      x: 50,
      y: 500,
      size: 24,
      color: rgb(0, 0, 0),
    });

    // Add the course name
    page.drawText(courseName, {
      x: 50,
      y: 400,
      size: 20,
      color: rgb(0, 0, 0),
    });

    //issued date
    page.drawText(issuedOn, {
      x: 100,
      y: 306,
      size: 12,
      color: rgb(0, 0, 0),
    });

    //validity date
    page.drawText(validTill, {
      x: 410,
      y: 306,
      size: 12,
      color: rgb(0, 0, 0),
    });

    //Add admin sign
    if (adminImage) {
      page.drawImage(adminImage, {
        x: 320,
        y: 250,
        width: 120,
        height: 45,
      });
    }

    //Add admin sing
    if (accessorImage) {
      page.drawImage(accessorImage, {
        x: 40,
        y: 250,
        width: 120,
        height: 45,
      });
    }

    //add logoOne
    if (logoOne) {
      page.drawImage(logoOne, {
        x: 150,
        y: 80,
        width: 90,
        height: 35,
      });
    }

    //add logoOne
    if (logoTwo) {
      page.drawImage(logoTwo, {
        x: 260,
        y: 78,
        width: 40,
        height: 40,
      });
    }

    //add QR-Code
    page.drawImage(qrCodeImage, {
      x: 476,
      y: 29,
      width: 90,
      height: 90,
    });

    // Save the modified PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    throw new Error("Failed to generate PDF");
  }
};

const instituteCPdf = async (
  studentDtl,
  certificateUrl,
  courseName,
  adminSign,
  accessorSign,
  certCode,
  issuedOn,
  branchDtl,
  validTill,
  grade,
  meterDive
) => {
  try {
    const pdfTemplate = fs.readFileSync(
      path.join(__dirname, `../${certificateUrl}`)
    );
    const pdfDoc = await PDFDocument.load(pdfTemplate);

    const page = pdfDoc.getPage(0);

    //studentImage
    let image;
    try {
      const imagePath = path.join(__dirname, `../${studentDtl.imagePath}`);
      const imageBytes = fs.readFileSync(imagePath);
      if (studentDtl.imagePath.toLowerCase().endsWith(".png")) {
        image = await pdfDoc.embedPng(imageBytes);
      } else if (
        studentDtl.imagePath.toLowerCase().endsWith(".jpg") ||
        studentDtl.imagePath.toLowerCase().endsWith(".jpeg")
      ) {
        image = await pdfDoc.embedJpg(imageBytes);
      }
    } catch (error) { }

    //adminSign
    let adminImage;
    try {
      const adminPath = path.join(__dirname, `../${adminSign}`);
      const adminBytes = fs.readFileSync(adminPath);
      if (adminSign.toLowerCase().endsWith(".png")) {
        adminImage = await pdfDoc.embedPng(adminBytes);
      } else if (
        adminSign.toLowerCase().endsWith(".jpg") ||
        adminSign.toLowerCase().endsWith(".jpeg")
      ) {
        adminImage = await pdfDoc.embedJpg(adminBytes);
      }
    } catch (error) { }

    //accessorSign
    let accessorImage;
    try {
      const accessorPath = path.join(__dirname, `../${accessorSign}`);
      const accessorBytes = fs.readFileSync(accessorPath);
      if (accessorSign.toLowerCase().endsWith(".png")) {
        accessorImage = await pdfDoc.embedPng(accessorBytes);
      } else if (
        accessorSign.toLowerCase().endsWith(".jpg") ||
        accessorSign.toLowerCase().endsWith(".jpeg")
      ) {
        accessorImage = await pdfDoc.embedJpg(accessorBytes);
      }
    } catch (error) { }

    //logo one
    let logoOne;
    try {
      const logoOnePath = path.join(__dirname, `../${branchDtl.logoOne}`);
      const logoOneBytes = fs.readFileSync(logoOnePath);
      if (branchDtl.logoOne.toLowerCase().endsWith(".png")) {
        logoOne = await pdfDoc.embedPng(logoOneBytes);
      } else if (
        branchDtl.logoOne.toLowerCase().endsWith(".jpg") ||
        branchDtl.logoOne.toLowerCase().endsWith(".jpeg")
      ) {
        logoOne = await pdfDoc.embedJpg(logoOneBytes);
      }
    } catch (error) { }

    //logo one
    let logoTwo;
    try {
      const logoTwoPath = path.join(__dirname, `../${branchDtl.logoTwo}`);
      const logoTwoBytes = fs.readFileSync(logoTwoPath);
      if (branchDtl.logoTwo.toLowerCase().endsWith(".png")) {
        logoTwo = await pdfDoc.embedPng(logoTwoBytes);
      } else if (
        branchDtl.logoTwo.toLowerCase().endsWith(".jpg") ||
        branchDtl.logoTwo.toLowerCase().endsWith(".jpeg")
      ) {
        logoTwo = await pdfDoc.embedJpg(logoTwoBytes);
      }
    } catch (error) { }

    // Generate QR Code containing student details or verification URL
    const qrData = `${BASE_URL}/admin/#/verify/${studentDtl?.batchId}/${studentDtl?.studentId}`;
    const qrCodeBuffer = await QRCode.toBuffer(qrData, { type: "png" });

    // Embed QR Code in PDF
    const qrCodeImage = await pdfDoc.embedPng(qrCodeBuffer);

    // Draw the image on the PDF
    if (image) {
      page.drawImage(image, {
        x: 444,
        y: 585,
        width: 120,
        height: 120,
      });
    }

    //certificate code
    page.drawText(certCode, {
      x: 450,
      y: 570,
      size: 12,
      color: rgb(0, 0, 0),
    });

    //grade
    grade && grade != "Not graded" &&
      page.drawText(`Grade: ${grade}`, {
        x: 450,
        y: 558,
        size: 12,
        color: rgb(0, 0, 0),
      });

    //meterDive
    meterDive && meterDive != "NA" &&
      page.drawText(`Marks: ${meterDive}m`, {
        x: 450,
        y: 546,
        size: 12,
        color: rgb(0, 0, 0),
      });

    // Add the student's name
    page.drawText(studentDtl.name, {
      x: 50,
      y: 500,
      size: 24,
      color: rgb(0, 0, 0),
    });

    // Add the course name
    page.drawText(courseName, {
      x: 50,
      y: 400,
      size: 20,
      color: rgb(0, 0, 0),
    });

    //issued date
    page.drawText(issuedOn, {
      x: 100,
      y: 306,
      size: 12,
      color: rgb(0, 0, 0),
    });

    //validity date
    page.drawText(validTill, {
      x: 410,
      y: 306,
      size: 12,
      color: rgb(0, 0, 0),
    });

    //Add admin sign
    if (adminImage) {
      page.drawImage(adminImage, {
        x: 320,
        y: 250,
        width: 120,
        height: 45,
      });
    }

    //Add admin sing
    if (accessorImage) {
      page.drawImage(accessorImage, {
        x: 40,
        y: 250,
        width: 120,
        height: 45,
      });
    }

    //add logoOne
    if (logoOne) {
      page.drawImage(logoOne, {
        x: 150,
        y: 80,
        width: 90,
        height: 35,
      });
    }

    //add logoOne
    if (logoTwo) {
      page.drawImage(logoTwo, {
        x: 260,
        y: 78,
        width: 40,
        height: 40,
      });
    }

    //add QR-Code
    page.drawImage(qrCodeImage, {
      x: 476,
      y: 29,
      width: 90,
      height: 90,
    });

    // Save the modified PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    throw new Error("Failed to generate PDF");
  }
};

const itusCPdf = async (
  studentDtl,
  certificateUrl,
  courseName,
  adminSign,
  accessorSign,
  certCode,
  issuedOn,
  branchDtl,
  validTill,
  dob,
  grade,
  meterDive
) => {
  try {
    const pdfTemplate = fs.readFileSync(
      path.join(__dirname, `../${certificateUrl}`)
    );
    const pdfDoc = await PDFDocument.load(pdfTemplate);

    const page = pdfDoc.getPage(0);

    //studentImage
    let image;
    try {
      const imagePath = path.join(__dirname, `../${studentDtl.imagePath}`);
      const imageBytes = fs.readFileSync(imagePath);
      if (studentDtl.imagePath.toLowerCase().endsWith(".png")) {
        image = await pdfDoc.embedPng(imageBytes);
      } else if (
        studentDtl.imagePath.toLowerCase().endsWith(".jpg") ||
        studentDtl.imagePath.toLowerCase().endsWith(".jpeg")
      ) {
        image = await pdfDoc.embedJpg(imageBytes);
      }
    } catch (error) { }

    //adminSign
    let adminImage;
    try {
      const adminPath = path.join(__dirname, `../${adminSign}`);
      const adminBytes = fs.readFileSync(adminPath);
      if (adminSign.toLowerCase().endsWith(".png")) {
        adminImage = await pdfDoc.embedPng(adminBytes);
      } else if (
        adminSign.toLowerCase().endsWith(".jpg") ||
        adminSign.toLowerCase().endsWith(".jpeg")
      ) {
        adminImage = await pdfDoc.embedJpg(adminBytes);
      }
    } catch (error) { }

    //accessorSign
    let accessorImage;
    try {
      const accessorPath = path.join(__dirname, `../${accessorSign}`);
      const accessorBytes = fs.readFileSync(accessorPath);
      if (accessorSign.toLowerCase().endsWith(".png")) {
        accessorImage = await pdfDoc.embedPng(accessorBytes);
      } else if (
        accessorSign.toLowerCase().endsWith(".jpg") ||
        accessorSign.toLowerCase().endsWith(".jpeg")
      ) {
        accessorImage = await pdfDoc.embedJpg(accessorBytes);
      }
    } catch (error) { }

    //logo one
    let logoOne;
    try {
      const logoOnePath = path.join(__dirname, `../${branchDtl.logoOne}`);
      const logoOneBytes = fs.readFileSync(logoOnePath);
      if (branchDtl.logoOne.toLowerCase().endsWith(".png")) {
        logoOne = await pdfDoc.embedPng(logoOneBytes);
      } else if (
        branchDtl.logoOne.toLowerCase().endsWith(".jpg") ||
        branchDtl.logoOne.toLowerCase().endsWith(".jpeg")
      ) {
        logoOne = await pdfDoc.embedJpg(logoOneBytes);
      }
    } catch (error) { }

    //logo one
    let logoTwo;
    try {
      const logoTwoPath = path.join(__dirname, `../${branchDtl.logoTwo}`);
      const logoTwoBytes = fs.readFileSync(logoTwoPath);
      if (branchDtl.logoTwo.toLowerCase().endsWith(".png")) {
        logoTwo = await pdfDoc.embedPng(logoTwoBytes);
      } else if (
        branchDtl.logoTwo.toLowerCase().endsWith(".jpg") ||
        branchDtl.logoTwo.toLowerCase().endsWith(".jpeg")
      ) {
        logoTwo = await pdfDoc.embedJpg(logoTwoBytes);
      }
    } catch (error) { }

    //dob
    let age = "";
    if (dob) {
      const birthdate = new Date(dob);
      const today = new Date();

      age = today.getFullYear() - birthdate.getFullYear();
      const monthDifference = today.getMonth() - birthdate.getMonth();
      const dayDifference = today.getDate() - birthdate.getDate();

      if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
        age--;
      }
    }

    // Generate QR Code containing student details or verification URL
    const qrData = `${BASE_URL}/admin/#/verify/${studentDtl?.batchId}/${studentDtl?.studentId}`;
    const qrCodeBuffer = await QRCode.toBuffer(qrData, { type: "png" });

    // Embed QR Code in PDF
    const qrCodeImage = await pdfDoc.embedPng(qrCodeBuffer);

    // Draw the image on the PDF
    if (image) {
      page.drawImage(image, {
        x: 250,
        y: 518,
        width: 95,
        height: 95,
      });
    }

    //certificate code
    page.drawText(certCode, {
      x: 390,
      y: 516,
      size: 10,
      color: rgb(0, 0, 0),
    });

    //meterDive
    meterDive && meterDive != "NA" &&
      page.drawText(`Marks: ${meterDive}m`, {
        x: 390,
        y: 505,
        size: 10,
        color: rgb(0, 0, 0),
      });

    //grade
    grade && grade != "Not graded" &&
      page.drawText(`Grade: ${grade}`, {
        x: 390,
        y: 495,
        size: 10,
        color: rgb(0, 0, 0),
      });

    // Add the student's name
    page.drawText(studentDtl.name, {
      x: 140,
      y: 438,
      size: 20,
      color: rgb(0, 0, 0),
    });

    // Add the course name
    page.drawText(courseName, {
      x: 140,
      y: 310,
      size: 18,
      color: rgb(0, 0, 0),
    });

    //issued date
    page.drawText(issuedOn, {
      x: 120,
      y: 183,
      size: 12,
      color: rgb(0, 0, 0),
    });

    //dob or age
    page.drawText(age.toString(), {
      x: 480,
      y: 398,
      size: 12,
      color: rgb(0, 0, 0),
    });

    //Add admin sign
    if (adminImage) {
      page.drawImage(adminImage, {
        x: 340,
        y: 240,
        width: 110,
        height: 40,
      });
    }

    //Add admin sing
    if (accessorImage) {
      page.drawImage(accessorImage, {
        x: 150,
        y: 242,
        width: 110,
        height: 40,
      });
    }

    //add logoOne
    if (logoOne) {
      page.drawImage(logoOne, {
        x: 200,
        y: 78,
        width: 80,
        height: 30,
      });
    }

    //add logoOne
    if (logoTwo) {
      page.drawImage(logoTwo, {
        x: 300,
        y: 78,
        width: 40,
        height: 40,
      });
    }

    //add QR-Code
    page.drawImage(qrCodeImage, {
      x: 490,
      y: 60,
      width: 60,
      height: 60,
    });

    // Save the modified PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    throw new Error("Failed to generate PDF");
  }
};

const mmbCPdf = async (
  studentDtl,
  certificateUrl,
  courseName,
  adminSign,
  accessorSign,
  certCode,
  issuedOn,
  branchDtl,
  validTill,
  grade,
  meterDive,
) => {
  try {
    const pdfTemplate = fs.readFileSync(
      path.join(__dirname, `../${certificateUrl}`)
    );
    const pdfDoc = await PDFDocument.load(pdfTemplate);

    const page = pdfDoc.getPage(0);

    //studentImage
    let image;
    try {
      const imagePath = path.join(__dirname, `../${studentDtl.imagePath}`);
      const imageBytes = fs.readFileSync(imagePath);
      if (studentDtl.imagePath.toLowerCase().endsWith(".png")) {
        image = await pdfDoc.embedPng(imageBytes);
      } else if (
        studentDtl.imagePath.toLowerCase().endsWith(".jpg") ||
        studentDtl.imagePath.toLowerCase().endsWith(".jpeg")
      ) {
        image = await pdfDoc.embedJpg(imageBytes);
      }
    } catch (error) { }

    //adminSign
    let adminImage;
    try {
      const adminPath = path.join(__dirname, `../${adminSign}`);
      const adminBytes = fs.readFileSync(adminPath);
      if (adminSign.toLowerCase().endsWith(".png")) {
        adminImage = await pdfDoc.embedPng(adminBytes);
      } else if (
        adminSign.toLowerCase().endsWith(".jpg") ||
        adminSign.toLowerCase().endsWith(".jpeg")
      ) {
        adminImage = await pdfDoc.embedJpg(adminBytes);
      }
    } catch (error) { }

    //accessorSign
    let accessorImage;
    try {
      const accessorPath = path.join(__dirname, `../${accessorSign}`);
      const accessorBytes = fs.readFileSync(accessorPath);
      if (accessorSign.toLowerCase().endsWith(".png")) {
        accessorImage = await pdfDoc.embedPng(accessorBytes);
      } else if (
        accessorSign.toLowerCase().endsWith(".jpg") ||
        accessorSign.toLowerCase().endsWith(".jpeg")
      ) {
        accessorImage = await pdfDoc.embedJpg(accessorBytes);
      }
    } catch (error) { }

    //logo one
    let logoOne;
    try {
      const logoOnePath = path.join(__dirname, `../${branchDtl.logoOne}`);
      const logoOneBytes = fs.readFileSync(logoOnePath);
      if (branchDtl.logoOne.toLowerCase().endsWith(".png")) {
        logoOne = await pdfDoc.embedPng(logoOneBytes);
      } else if (
        branchDtl.logoOne.toLowerCase().endsWith(".jpg") ||
        branchDtl.logoOne.toLowerCase().endsWith(".jpeg")
      ) {
        logoOne = await pdfDoc.embedJpg(logoOneBytes);
      }
    } catch (error) { }

    //logo one
    let logoTwo;
    try {
      const logoTwoPath = path.join(__dirname, `../${branchDtl.logoTwo}`);
      const logoTwoBytes = fs.readFileSync(logoTwoPath);
      if (branchDtl.logoTwo.toLowerCase().endsWith(".png")) {
        logoTwo = await pdfDoc.embedPng(logoTwoBytes);
      } else if (
        branchDtl.logoTwo.toLowerCase().endsWith(".jpg") ||
        branchDtl.logoTwo.toLowerCase().endsWith(".jpeg")
      ) {
        logoTwo = await pdfDoc.embedJpg(logoTwoBytes);
      }
    } catch (error) { }

    // Generate QR Code containing student details or verification URL
    const qrData = `${BASE_URL}/admin/#/verify/${studentDtl?.batchId}/${studentDtl?.studentId}`;
    const qrCodeBuffer = await QRCode.toBuffer(qrData, { type: "png" });

    // Embed QR Code in PDF
    const qrCodeImage = await pdfDoc.embedPng(qrCodeBuffer);

    // Draw the image on the PDF
    if (image) {
      page.drawImage(image, {
        x: 449,
        y: 540,
        width: 90,
        height: 90,
      });
    }

    //certificate code
    page.drawText(certCode, {
      x: 448,
      y: 530,
      size: 10,
      color: rgb(0, 0, 0),
    });

    //grade
    grade && grade != "Not graded" &&
      page.drawText(`Grade: ${grade}`, {
        x: 448,
        y: 520,
        size: 10,
        color: rgb(0, 0, 0),
      });

    //meterDive
    meterDive && meterDive != "NA" &&
      page.drawText(`Marks: ${meterDive}m`, {
        x: 448,
        y: 510,
        size: 10,
        color: rgb(0, 0, 0),
      });

    // Add the student's name
    page.drawText(studentDtl.name, {
      x: 60,
      y: 440,
      size: 22,
      color: rgb(0, 0, 0),
    });

    // Add the course name
    page.drawText(courseName, {
      x: 60,
      y: 326,
      size: 18,
      color: rgb(0, 0, 0),
    });

    //issued date
    page.drawText(issuedOn, {
      x: 120,
      y: 270,
      size: 12,
      color: rgb(0, 0, 0),
    });

    //validity date
    page.drawText(validTill, {
      x: 410,
      y: 270,
      size: 12,
      color: rgb(0, 0, 0),
    });

    //Add admin sign
    if (adminImage) {
      page.drawImage(adminImage, {
        x: 400,
        y: 196,
        width: 100,
        height: 40,
      });
    }

    //Add admin sing
    if (accessorImage) {
      page.drawImage(accessorImage, {
        x: 60,
        y: 196,
        width: 100,
        height: 40,
      });
    }

    //add logoOne
    if (logoOne) {
      page.drawImage(logoOne, {
        x: 150,
        y: 70,
        width: 90,
        height: 35,
      });
    }

    //add logoOne
    if (logoTwo) {
      page.drawImage(logoTwo, {
        x: 260,
        y: 70,
        width: 40,
        height: 40,
      });
    }

    //add QR-Code
    page.drawImage(qrCodeImage, {
      x: 390,
      y: 725,
      width: 60,
      height: 60,
    });

    // Save the modified PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    error(`Error generating PDF: ${error}`);
    throw new Error("Failed to generate PDF");
  }
};

async function GenCertificate(data) {
  try {
    // Load the PDF template
    // console.log("Loading PDF Data:", data);
    const pdfTemplate = fs.readFileSync(
      path.isAbsolute(data.certificateUrl)
        ? data.certificateUrl
        : path.join(__dirname, '..', data.certificateUrl)
    );
    const pdfDoc = await PDFDocument.load(pdfTemplate);
    pdfDoc.registerFontkit(fontkit);
    const form = pdfDoc.getForm();

    let customFont;
    if (data.certificateFont) {
      const fontPath = path.isAbsolute(data.certificateFont)
        ? data.certificateFont
        : path.join(__dirname, '..', data.certificateFont);
      if (fs.existsSync(fontPath)) {
        const fontBytes = fs.readFileSync(fontPath);
        customFont = await pdfDoc.embedFont(fontBytes);
      } else {
        // fallback to standard font if not found
        customFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      }
    } else {
      customFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }
    // Helper to fill a text field if it exists
    const fillText = (fieldName, value, font) => {
      try {
        const field = form.getTextField(fieldName);
        field.setText(value);
        if (font) {
          field.updateAppearances(font);
        }
      } catch {
        // If the field doesn't exist, just ignore it
      }
    };
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


    // Reusable image‐embedder
    async function fillImage(fieldName, imgSource) {
      let buffer;
      let mimetype;

      // 1️⃣ Handle string paths
      if (typeof imgSource === 'string') {
        // Resolve absolute vs. relative to project root
        const imgPath = path.isAbsolute(imgSource)
          ? imgSource
          : path.join(__dirname, '..', imgSource);

        // Read file buffer
        try {
          buffer = fs.readFileSync(imgPath);
        } catch (e) {
          error(`Failed to read image file "${imgPath}": ${e.message}`);
          throw new Error(`Required image file "${imgPath}" not found. Please upload the image or check the path.`);

        }
        // Infer mimetype from extension
        const ext = path.extname(imgPath).toLowerCase();
        if (ext === '.png') {
          mimetype = 'image/png';
        } else if (ext === '.jpg' || ext === '.jpeg') {
          mimetype = 'image/jpeg';
        } else {
          error(`Unsupported file extension "${ext}" for image "${imgPath}". Only .png/.jpg allowed.`);
          throw new Error(`Unsupported file extension "${ext}" for image "${imgPath}". Only .png/.jpg allowed.`);
        }
      }
      // 2️⃣ Handle Multer/express-fileupload–style object
      else if (imgSource && imgSource.buffer && imgSource.mimetype) {
        buffer = imgSource.buffer;
        mimetype = imgSource.mimetype;
      }
      else {
        // Nothing to embed
        return;
      }

      // 3️⃣ Embed image into PDF
      let embeddedImage;
      if (mimetype === 'image/png') {
        embeddedImage = await pdfDoc.embedPng(buffer);
      } else if (mimetype?.startsWith('image/')) {
        embeddedImage = await pdfDoc.embedJpg(buffer);
      } else {
      }

      // 4️⃣ Place into form button
      try {
        const btn = form.getButton(fieldName);
        btn.setImage(embeddedImage);
      } catch {
        // swallow error
      }
    }
    const validityDate = new Date(data.issuedDate);
    if (isNaN(validityDate.getTime())) {
      error('Invalid issuedDate provided: ' + data.issuedDate);
      throw new Error("Invalid issuedDate provided. Please check your certificate template or data." + data.issuedDate);
    }

    validityDate.setDate(validityDate.getDate() - 1);
    // add `data.validTill` years
    validityDate.setUTCFullYear(validityDate.getUTCFullYear() + data.validTill);
    // Fill text fields
    fillText('certificateId', data.certificateId, customFont);
    fillText('name', data.studentName, customFont);
    fillText('courseName', data.courseName, customFont);
    fillText('grade', data.grade, customFont);
    fillText('issuedDate', formatDate(data.issuedDate), customFont);
    fillText("validityDate", formatDate(validityDate.toISOString()), customFont);
    fillText('trainerName', data.examinerName, customFont);
    await fillImage("signature3", data.signatures.admin);
    await fillImage('signature1', data.signatures.examiner);
    await fillImage('signature2', data.signatures.admin);
    await fillImage('profile_photo', data.studentImage);
    await fillImage("logoFour", data.logos.logoFour);
    await fillImage("logoThree", data.logos.logoThree);
    await fillImage("logoTwo", data.logos.logoTwo);
    await fillImage("logoOne", data.logos.logoOne);

    // —————— New QR‐Code logic ——————
    // Generate QR Code containing student details or verification URL
    const qrData = `${process.env.BASE_URL || BASE_URL}/admin/#/verify/` +
      `${data.batchId}/${data.studentId}`;

    // Create the PNG buffer
    const qrCodeBuffer = await QRCode.toBuffer(qrData, { type: 'png' });

    // Embed & place it into the qr_code button field
    const qrPngImage = await pdfDoc.embedPng(qrCodeBuffer);
    const qrButton = form.getButton('qr_code');
    if (qrButton) {
      qrButton.setImage(qrPngImage);
    } else {
    }

    // Flatten and save
    form.flatten();
    return await pdfDoc.save();
  } catch (err) {
    error('Failed to generate certificate PDF: ' + err);
    throw new Error('Failed to generate certificate: ' + err.message);
  }
}

async function generateBatchCertificates(batchId, studentIds) {
  // fetch batch-level data
  const batch = await BatchModel.findOne({ batchId });
  if (!batch) throw new Error('Batch not found');

  const certificate = await CertificateModel.findOne({ certificateId: batch.certificateId });
  if (!certificate) throw new Error('Certificate template not found');

  const branch = await BranchModel.findOne({ branchId: batch.branchId });
  if (!branch) throw new Error('Branch data not found');

  const accessor = await AccessorModel.findOne({ accessorId: batch.accessorId });

  // create ZIP archive in memory
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', err => { console.log(err); throw err; });

  const skipped = [];
  // for each student, generate PDF and append
  for (const studentId of studentIds) {
    try {
      const student = await Studentmodel.findOne({ studentId });
      if (!student) throw new Error(`Student ${studentId} not found`);

      const issuedCert = await IssuedCertificateModel.findOne({ batchId, 'studList.studentId': studentId, 'studList.issued': true });
      if (!issuedCert) throw new Error(`Certificate not issued for student ${studentId}`);

      const studData = issuedCert.studList.find(s => s.studentId === studentId);

      const certData = buildCertData(batch, student, studData, certificate, branch, accessor);
      const pdfBytes = await GenCertificate(certData);
      archive.append(Buffer.from(pdfBytes), { name: `${student.name}_${student.mobile}.pdf` });
    } catch (e) {
      const student = await Studentmodel.findOne({ studentId });
      skipped.push(`${student?.name || 'Unknown'} (${student?.mobile || 'No Mobile'}) - ${e.message}`);
    }
  }
  // Add skipped.txt file
  if (skipped.length > 0 || true) {
    const skippedContent = skipped.join('\n');
    archive.append(skippedContent, { name: 'skipped.txt' });
  }

  archive.finalize();
  return archive;
}

function buildCertData(batch, student, studentCert, certificate, branch, examiner) {
  // prepare data like in single PDF
  const validityDate = new Date(studentCert.issuedDate);
  validityDate.setDate(validityDate.getDate() - 1);
  validityDate.setUTCFullYear(validityDate.getUTCFullYear() + batch.validity);

  return {
    studentName: student.name,
    studentImage: student.imagePath,
    courseName: batch.courseName,
    certificateUrl: certificate.certificateUrl,
    certificateFont: certificate.certificateFont,
    issuedDate: studentCert.issuedDate,
    validTill: batch.validity,
    grade: studentCert.grade || '',
    batchId: batch.batchId,
    studentId: student.studentId,
    certificateId: studentCert.certificateId,
    examinerName: (examiner && examiner.accessorName) || '',
    signatures: {
      admin: 'uploads/images/adminSign2025.png',
      trainer: examiner.signature || 'uploads/images/signone.png',
      examiner: examiner.signature || 'uploads/images/signone.png',
    },
    logos: {
      logoOne: branch.logoOne || '',
      logoTwo: branch.logoTwo || '',
      logoThree: branch.logoThree || '',
      logoFour: branch.logoFour || ''
    }
  };
}
async function issueExtraStudentsToBatch(batchId, newStudentIds) {
  try {
    // Find the issued certificate document
    const issuedCert = await IssuedCertificateModel.findOne({ batchId });
    if (!issuedCert) {
      return { success: false, message: "Issued certificate not found for this batch." };
    }

    // Find batch and branch details for certificateId logic
    const batchDtl = await BatchModel.findOne({ batchId }, { branchId: 1 });
    if (!batchDtl) {
      return { success: false, message: "Batch not found." };
    }
    const branchDtl = await BranchModel.findOne(
      { branchId: batchDtl.branchId },
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
    if (!branchDtl) {
      return { success: false, message: "Branch not found." };
    }

    // Prepare for certificateId generation
    let currentNo = branchDtl.currentIndex || 0;
    const year = new Date().getFullYear();
    const month = new Date().toLocaleString("en-US", { month: "short" }).toUpperCase();

    // Get already issued studentIds
    const existingIds = issuedCert.studList.map(s => s.studentId);

    // Prepare new student objects
    const newStudObjs = [];
    for (const studentId of newStudentIds) {
      if (existingIds.includes(studentId)) continue; // skip if already present

      currentNo += 1;
      let newCertId = `${branchDtl.prefixOne}/${branchDtl.prefixTwo}`;
      if (branchDtl.includeMonth) newCertId += `/${month}`;
      if (branchDtl.includeYear) newCertId += `/${year}`;
      newCertId += `/${currentNo}`;

      newStudObjs.push({
        studentId,
        issued: true,
        examinerGiven: true,
        issuedDate: new Date(),
        certificateId: newCertId,
      });
    }

    // if (newStudObjs.length === 0) {
    //   return { success: true, message: "No new students to issue." };
    // }

    // Update the issued certificate document
    issuedCert.studList.push(...newStudObjs);
    await issuedCert.save();

    // Update currentIndex in branch
    await BranchModel.findOneAndUpdate(
      { branchId: branchDtl.branchId },
      { $set: { currentIndex: currentNo } }
    );

    return { success: true, message: "Extra students issued successfully." };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

module.exports = { endrosedCPdf, instituteCPdf, itusCPdf, mmbCPdf, GenCertificate, generateBatchCertificates, issueExtraStudentsToBatch };