const mongoose = require("mongoose");

const LicensePairConfigSchema = new mongoose.Schema({
  pairName: { type: String, required: true },
  pairNo: { type: Array, required: false },
  courseIds: [{ type: String, required: true }], // e.g., ["course1Id", "course2Id"]
});

const LicensePairConfigModel = mongoose.model('LicensePairConfig', LicensePairConfigSchema);
module.exports = { LicensePairConfigModel };