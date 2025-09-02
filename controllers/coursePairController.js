const { LicensePairConfigModel } = require("../models/licensePairConfigModel");
const { log, warn, error, info } = require('../utils/logger');

// Add a new course pair
exports.addCoursePair = async (req, res) => {
  try {
    const { pairName, courseIds } = req.body;
    if (!pairName || !Array.isArray(courseIds) || courseIds.length < 2) {
      return res.status(400).json({ message: "Invalid input", success: false });
    }
    const pair = new LicensePairConfigModel({ pairName, courseIds });
    await pair.save();
    res.status(201).json({ message: "Pair added", success: true, pair });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Get all course pairs
exports.getCoursePairs = async (req, res) => {
  try {
    const pairs = await LicensePairConfigModel.find();
    res.status(200).json({ success: true, pairs });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};