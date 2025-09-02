const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const StudBatch = new mongoose.Schema(
  {
    studeBatchId: {
      type: String,
      default: uuidv4,
      required: true,
      unique: true,
    },

    batchId: {
      type: String,
      required: true,
    },

    courseId: {
      type: String,
    },

    studentId:{
      type:String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const StudBatchModel = mongoose.model('studbatchs', StudBatch);

module.exports = {StudBatchModel};
