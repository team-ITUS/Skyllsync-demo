const { create } = require("archiver");
const mongoose = require("mongoose");

const BatchShareTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  batchId: { type: String, required: true },
  expiresAt: { type: Date, required: true }, // Optional: for token expiry
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BatchShareToken", BatchShareTokenSchema);