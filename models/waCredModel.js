const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const WACRED = new mongoose.Schema(
  {
    waUuid: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true,
    },

    apiUrl: {
      type: String,
      required: true,
    },

    token: {
      type: String,
      required: true,
    },

    instanceId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const WACREDModel = mongoose.model("wacreds", WACRED);

module.exports = { WACREDModel };
