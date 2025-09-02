const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const OTP = new mongoose.Schema({
  otpUuid: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true,
  },

  mobileNo: {
    type: String,
    required: true,
  },

  otp: {
    type: Number,
    required: true,
  },

  expiry: {
    type: Date,
    required: true,
  },
}, {
    timestamps:true,
});

const OTPModel = mongoose.model('otps', OTP)

module.exports = {OTPModel};
