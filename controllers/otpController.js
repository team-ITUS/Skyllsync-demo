const { OTPModel } = require("../models/otpModel");
const crypto = require("crypto");
const { log, warn, error, info } = require('../utils/logger');

const Studentmodel = require("../models/resisterStudentModel");
const { transporter } = require("../services/sendMailService");

const { sendWAMsg } = require("../services/sendMsgService");
const { default: axios } = require("axios");

//send otp on  whatapp at the time of registration
const sendOTP = async (req, res) => {
  try {
    const { mobileNo } = req.body;

    const isExist = await Studentmodel.findOne({ mobile: mobileNo });
    if (!isExist) {
      return res.status(404).json({
        message: "Student not exist. Please register.",
        success: false,
      });
    }
    // Generate OTP
    const otp = crypto.randomInt(100000, 999999);
    const expiry = Date.now() + 10 * 60 * 1000;
    const response = await axios.post(`http://sms1.powerstext.in/http-tokenkeyapi.php?authentic-key=${process.env.sms_auth_key}&senderid=TEXTOO&route=1&number=${mobileNo}&message=Dear Customer Your Login otp is Skyllsync ${otp} Text2&templateid=1607100000000349121`);

    const newOtpModel = new OTPModel({
      mobileNo,
      otp,
      expiry,
    });

    await newOtpModel.save();

     return res
        .status(200)
        .json({ message: "OTP send successfully.", success: true });

  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const varifyOTP = async (req, res) => {
  try {
    const { mobileNo, otp } = req.body;
    const record = await OTPModel.findOne({ mobileNo, otp });

    if (record==null) {
      return res.status(400).json({ message: "Invalid OTP.", success: false });
    }

    if (record.expiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired.", success: false });
    }

    await OTPModel.findOneAndDelete({ mobileNo, otp });
    const user = await Studentmodel.findOne({ mobile: mobileNo });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Failed to verify OTP.", success: false });
    }

    return res
      .status(200)
      .json({ userName: user.name, studentId: user.studentId, success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const sendMailOTP = async (req, res) => {
  try {
    const { email } = req.body;

    //check email exist or not
    const isExist = await Studentmodel.findOne({ email }, {name:1});
    if (!isExist) {
      return res.status(404).json({
        message: "Student not exist. Please register.",
        success: false,
      });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999);
    const expiry = Date.now() + 10 * 60 * 1000;

    const newOtpModel = new OTPModel({
      mobileNo: email,
      otp,
      expiry,
    });

    await newOtpModel.save();

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "OTP For Login",
      html: `
        <p>Hi <strong>${isExist?.name}</strong>,</p>

        <p>Your One Time Password (OTP) for Login is ${otp}</p>

        <p>Please do not share with anyone.</p>
      `,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({
          message: "Failed to send OTP. Please try again.",
          success: false,
        });
      } else {
        return res.status(200).json({
          message: "OTP sent successfully.",
          success: true,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const varifyMailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await OTPModel.findOne({ mobileNo: email, otp });

    if (!record) {
      return res.status(400).json({ message: "Invalid OTP.", success: false });
    }

    if (record.expiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired.", success: false });
    }

    await OTPModel.findOneAndDelete({ mobileNo: email, otp });

    //find user details
    const user = await Studentmodel.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Failed to verify OTP.", success: false });
    }

    const userData = {
      exists: true,
      userName: user.name,
      studentId: user.studentId,
      phone: user.mobile,
    };

    return res
      .status(200)
      .json({
        message: "OTP verified successfully.",
        success: true,
        data: userData,
      });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

module.exports = { sendOTP, varifyOTP, sendMailOTP, varifyMailOTP };
