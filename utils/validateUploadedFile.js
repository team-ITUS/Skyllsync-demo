// utils/validateUploadedFile.js
const fs = require('fs');

function isFileAccessible(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).size > 0;
  } catch (e) {
    return false;
  }
}

module.exports = { isFileAccessible };