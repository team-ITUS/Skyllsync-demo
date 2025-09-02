const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const Certificate = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      default: uuidv4,
      required: true,
      unique: true,
    },

    certificateUrl:{
        type:String,
        required: true,
    },
    certificateFont:{
        type:String,
        required: false,
    },
    certificateName:{
        type:String,
        required: true,
    },

    certificateCode:{
      type:String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const CertificateModel = mongoose.model('certificates', Certificate);

module.exports = {CertificateModel};
