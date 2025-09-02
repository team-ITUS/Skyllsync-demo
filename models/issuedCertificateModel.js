const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const IssuedCertificate = new mongoose.Schema(
  {
    issuedCertificateId: {
      type: String,
      default: uuidv4,
      required: true,
      unique: true,
    },

    batchId: {
      type: String,
      required: true,
      unique: true,
    },

    studList: [
      {
        studentId: {
          type: String,
          required: true,
        },
        grade: {
          type: String,
        },
        meterDive:{
          type:String,
        },
        issued: {
          type: Boolean,
          default: false,
        },
        issuedDate: {
          type: Date
        }, 
        certificateId:{
          type:String,
        },
        examinerGiven:{
          type:Boolean,
          default:false,
        }
      },
    ],
  },
  {
    timestamps: true,
  }
);

const IssuedCertificateModel = mongoose.model(
  "IssuedCertificates",
  IssuedCertificate
);

module.exports = { IssuedCertificateModel };
