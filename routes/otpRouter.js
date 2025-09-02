const express = require("express");
const {
  sendOTP,
  varifyOTP,
  sendMailOTP,
   varifyMailOTP,
} = require("../controllers/otpController");

const otpRouter = express.Router();

otpRouter.post("/sendOTP", sendOTP); //email or mobile varification send otp when register
otpRouter.post("/verifyOTP", varifyOTP); //varify otp
otpRouter.post('/sendMailOTP', sendMailOTP);//send email otp
otpRouter.post('/varifyMailOTP',varifyMailOTP);//varify email otp

module.exports = { otpRouter };
