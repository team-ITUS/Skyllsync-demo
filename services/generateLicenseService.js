const { PDFDocument, StandardFonts } = require("pdf-lib");
const fontkit = require("fontkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const { log, warn, error, info } = require('../utils/logger');

async function GenLicense(data) {
  const pdfTemplate = fs.readFileSync(
    path.isAbsolute(data.licenseUrl)
      ? data.licenseUrl
      : path.join(__dirname, '..', data.licenseUrl)
  );
  const pdfDoc = await PDFDocument.load(pdfTemplate);
  pdfDoc.registerFontkit(fontkit);
  const form = pdfDoc.getForm();

  // Font
  let customFont;
  if (data.licenseFont) {
      const fontPath = path.isAbsolute(data.licenseFont)
        ? data.licenseFont
        : path.join(__dirname, '..', data.licenseFont);
      if (fs.existsSync(fontPath)) {
        const fontBytes = fs.readFileSync(fontPath);
        customFont = await pdfDoc.embedFont(fontBytes);
        log(`Custom font loaded from ${fontPath}`);
      } else {
        // fallback to standard font if not found
        warn(`Custom font file not found at ${fontPath}. Using standard font.`);
        customFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      }
    } else {
      customFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }

  // Helper to fill text fields
  const fillText = (fieldName, value, font) => {
    try {
      const field = form.getTextField(fieldName);
      field.setText(value);
      if (font) field.updateAppearances(font);
    } catch {
      // ignore missing field
      warn(`Field "${fieldName}" not found in PDF form. Batch Id: ${data.batchId}, Student Id: ${data.studentId}`);
    }
  };
  function formatDate(isoString) {
    const d = new Date(isoString);
    // Use UTC so you don’t get shifted by local TZ
    d.setUTCDate(d.getUTCDate() + 1); // This will correctly roll over to next month/year if needed
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = d.getUTCMonth() + 1; // Months are zero-based in JS
    const monthStr = month < 10 ? `0${month}` : month; //
    const year = d.getUTCFullYear();
    return `${day}-${monthStr}-${year}`;
  }
  // Helper to fill images
  async function fillImage(fieldName, imgSource) {
    let buffer, mimetype;
    if (typeof imgSource === 'string') {
      const imgPath = path.isAbsolute(imgSource)
        ? imgSource
        : path.join(__dirname, '..', imgSource);
      if (!fs.existsSync(imgPath)) return;
      buffer = fs.readFileSync(imgPath);
      const ext = path.extname(imgPath).toLowerCase();
      if (ext === '.png') {
        mimetype = 'image/png';
      } else if (ext === '.jpg' || ext === '.jpeg') {
        mimetype = 'image/jpeg';
      } else {
        throw new Error(`Unsupported file extension "${ext}" for image "${imgPath}". Only .png/.jpg allowed.`);
      }
    } else if (imgSource && imgSource.buffer && imgSource.mimetype) {
      buffer = imgSource.buffer;
      mimetype = imgSource.mimetype;
    } else {
      return;
    }

    let embeddedImage;
    if (mimetype === 'image/png') {
      embeddedImage = await pdfDoc.embedPng(buffer);
    } else {
      embeddedImage = await pdfDoc.embedJpg(buffer);
    }
    try {
      const btn = form.getButton(fieldName);
      btn.setImage(embeddedImage);
    } catch {}
  }
  const validityDate = new Date(data.DOI);
  validityDate.setDate(validityDate.getDate() - 1); // add one day to avoid timezone issues
  // add `data.validTill` years
  validityDate.setUTCFullYear(validityDate.getUTCFullYear() + data.validTill);
  // Fill fields
  warn(`Filling certificate for ${data.studentName}, Course: ${data.courseName}, Valid till: ${formatDate(validityDate.toISOString())}`);
  fillText("name", data.studentName, customFont);
  fillText("address", data.address, customFont);
  fillText('certificateId', data.certificateId, customFont);

  // Profile photo
  if (data.studentImage) await fillImage("profile_photo", data.studentImage);
  
  // Use pairNo array from model to determine field indexes
  if (data.pairNo) {
    data.pairNo.forEach((inx, i) => {

        fillText(`DOI_${inx}`, formatDate(data.DOI), customFont);
        fillText(`valid_till_${inx}`, formatDate(validityDate.toISOString()), customFont);
        fillText(`courseName`, data.courseName, customFont);

    });
  } else {
    fillText("DOI_1", formatDate(data.DOI), customFont);
    fillText("valid_till_1", formatDate(validityDate.toISOString()), customFont);
    fillText("courseName", data.courseName, customFont);
  }
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
    warn('QR code button field not found in PDF form.');
  }

  form.flatten();
  return await pdfDoc.save();
}

module.exports = { GenLicense };