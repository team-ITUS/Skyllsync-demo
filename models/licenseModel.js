const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const LicenseSchema = new mongoose.Schema({
  licenseId: { type: String, default: uuidv4, unique: true },
  licenseName: { type: String, required: true }, // e.g., "License for Course 1"
  licenseUrl: { type: String, required: true }, // PDF template path
  licenseFont: { type: String, required: false },
  signature: { type: String, required: true }, // Font path
  createdAt: { type: Date, default: Date.now }
});

const LicenseModel = mongoose.model("License", LicenseSchema);
module.exports = { LicenseModel };