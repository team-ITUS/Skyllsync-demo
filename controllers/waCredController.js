const { WACREDModel } = require("../models/waCredModel");
const { log, warn, error, info } = require('../utils/logger');

const updateCred = async (req, res) => {
  try {
    const { waUuid, apiUrl, token, instanceId } = req.body;

    const waCred = await WACREDModel.findOneAndUpdate(
      { waUuid },
      {
        $set: {
          apiUrl,
          token,
          instanceId,
        },
      },
      { new: true }
    );

    if (!waCred) {
      return res
        .status(404)
        .json({ message: "Failed to update details", success: false });
    }

    return res
      .status(200)
      .json({ message: "Detail updated successfully", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getCredDtl = async (req, res) => {
  try {
    const credDtl = await WACREDModel.findOne();

    if (!credDtl) {
      return res
        .status(404)
        .json({ message: "Detail not available", success: false });
    }

    return res
      .status(200)
      .json({
        message: "Detail get successfully",
        success: true,
        data: credDtl,
      });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

module.exports = { updateCred, getCredDtl };
