const bcrypt = require("bcrypt");
const { AccessorModel } = require("../models/accessorModel");
const generatePassword = require("../services/generatePassService");
const { StudBatchModel } = require("../models/studBatchModel");
const { transporter } = require("../services/sendMailService");
const { log, warn, error, info } = require('../utils/logger');

const dotenv = require("dotenv");
const { BatchModel } = require("../models/batchModel");

dotenv.config();

const createAccessor = async (req, res) => {
  const { accessorEmail } = req.body;
  try {
    if (!accessorEmail) {
      return res
        .status(400)
        .json({ message: "Email is required", success: false });
    }

    const isExist = await AccessorModel.findOne({ accessorEmail });
    if (isExist) {
      return res
        .status(409)
        .json({ message: "Examiner is already present", success: false });
    }

    const sysGenPassword = generatePassword();

    let accessorProfile, signature;

    if (req.files && req.files.accessorProfile) {
      const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validMimeTypes.includes(req.files.accessorProfile[0].mimetype)) {
        return res.status(400).json({
          message: "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
          success: false,
        });
      }
      accessorProfile =
        req.files.accessorProfile[0].destination + req.files.accessorProfile[0].filename;
    }

    if (req.files && req.files.signature) {
      const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validMimeTypes.includes(req.files.signature[0].mimetype)) {
        return res.status(400).json({
          message: "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
          success: false,
        });
      }
      signature =
        req.files.signature[0].destination + req.files.signature[0].filename;
    }

    const accessorModel = new AccessorModel({
      accessorEmail: accessorEmail,
      accessorMobNo: req.body.accessorMobNo,
      accessorName: req.body.accessorName,
      accessorDob: req.body.accessorDob,
      accessorGender: req.body.accessorGender,
      accessorJoinDate: req.body.accessorJoinDate,
      accessorAddr: req.body.accessorAddr,
      accessorProfile: accessorProfile,
      signature: signature,
      accessorPassword: sysGenPassword,
    });
    //accessorModel.accessorPassword = await bcrypt.hash(sysGenPassword, 10);

    const isSave = await accessorModel.save();

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: accessorEmail,
      subject: "Your account credential",
      text: `Successfully create your account with username: ${accessorEmail} and password: ${sysGenPassword}`,
    };

    if (isSave) {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          // return res.status(500).send({ message: 'Error sending email', error });
        }
      });
    }

    return res
      .status(201)
      .json({ message: "Examiner create successfully.", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const loginAccessor = async (req, res) => {
  try {
    const { accessorEmail, accessorPassword, loginRole } = req.body;

    const accessor = await AccessorModel.findOne({ accessorEmail });

    if (!accessor) {
      return res.status(403).json({
        message: "Invalid email. Please provide valid email",
        success: false,
      });
    }

    if (loginRole === "admin") {
      return res.status(200).json({
        message: "Login successfully",
        success: true,
        accessorName: accessor.accessorName,
        accessorId: accessor.accessorId,
      });
    }

    // const isMatch = await bcrypt.compare(
    //   accessorPassword,
    //   accessor?.accessorPassword
    // );

    if (accessorPassword !== accessor?.accessorPassword) {
      return res.status(403).json({
        message: "Invalid password. Try again",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Login successfully",
      success: true,
      accessorName: accessor.accessorName,
      accessorId: accessor.accessorId,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getAccessorList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 600;
    const searchName = req.query?.searchTerm || "";
    const skip = (page - 1) * limit;

    const filter = {};

    if (searchName) {
      filter.$or = [
        { accessorName: { $regex: searchName, $options: "i" } },
        { accessorMobNo: { $regex: searchName, $options: "i" } },
        { accessorEmail: { $regex: searchName, $options: "i" } },
      ];
    }

    const totalAccessor = await AccessorModel.countDocuments(filter);

    const accessors = await AccessorModel.find(
      filter, // Correctly passing the filter object
      {
        accessorEmail: 1,
        accessorMobNo: 1,
        accessorName: 1,
        accessorDob: 1,
        accessorGender: 1,
        accessorJoinDate: 1,
        accessorProfile: 1,
        accessorId: 1,
      }
    )
      .sort({ entryTime: -1 })
      .skip(skip)
      .limit(limit);

    if (!accessors || accessors.length === 0) {
      return res
        .status(404)
        .json({ message: "Examiner not available", success: false });
    }

    return res.status(200).json({
      message: "Successfully retrieved examiner",
      success: true,
      accessors,
      totalAccessor,
      totalPages: Math.ceil(totalAccessor / limit),
      currentPage: page,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const deleteAccessorById = async (req, res) => {
  try {
    const { accessorId } = req.params;

    const isAssign = await BatchModel.findOne({ accessorId });
    if (isAssign) {
      return res.status(400).json({
        message: "Examiner assigned to batch. Unassign to delete.",
        success: false,
      });
    }

    const deletedAccessor = await AccessorModel.findOneAndDelete({
      accessorId,
    });

    if (!deletedAccessor) {
      return res
        .status(404)
        .json({ message: "Examiner not exist", success: false });
    }

    return res.status(200).json({
      message: "Examiner deleted successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const updateAccessorById = async (req, res) => {
  try {
    const { accessorId } = req.params;

    let accessorProfile, signature;
    if (req.files) {
      if (req.files.accessorProfile) {
        const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!validMimeTypes.includes(req.files.accessorProfile[0].mimetype)) {
          return res.status(400).json({
            message:
              "Invalid profile image type. Only JPG, JPEG, and PNG are allowed.",
            success: false,
          });
        }
        accessorProfile =
          req.files.accessorProfile[0].destination + req.files.accessorProfile[0].filename;
      }

      if (req.files.signature) {
        const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!validMimeTypes.includes(req.files.signature[0].mimetype)) {
          return res.status(400).json({
            message:
              "Invalid profile image type. Only JPG, JPEG, and PNG are allowed.",
            success: false,
          });
        }
        signature =
          req.files.signature[0].destination + req.files.signature[0].filename;
      }
    }

    req.body.accessorProfile = accessorProfile;
    req.body.signature = signature;

    const updatedAccessor = await AccessorModel.findOneAndUpdate(
      { accessorId: accessorId },
      req.body,
      { new: true }
    );

    if (!updatedAccessor) {
      return res.status(404).json({
        message: "Examiner not exist for update details",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Examiner details updated successfully",
      success: true,
    });
  } catch (error) {
    
    error("Error updating examiner:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getAccessorById = async (req, res) => {
  try {
    const { accessorId } = req.params;

    const accessor = await AccessorModel.findOne({ accessorId });

    if (!accessor) {
      return res
        .status(404)
        .json({ message: "Examiner not found", success: false });
    }

    return res.status(200).json({
      accessor,
      message: "Examiner retrieved successfully",
      success: true,
      // accessor,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getMyAccessorList = async (req, res) => {
  try {
    const { studentId } = req.params;

    const studBatch = await StudBatchModel.find({ studentId });
    if (!studBatch || studBatch.length === 0) {
      return res
        .status(404)
        .json({ message: "No Examiner available", success: false });
    }

    const batchIds = studBatch.map((batch) => batch.batchId);

    const accessorIds = await BatchModel.find(
      { batchId: { $in: batchIds } },
      "accessorId"
    );
    if (!accessorIds || accessorIds.length === 0) {
      return res
        .status(404)
        .json({ message: "No Examiner available", success: false });
    }

    const idList = accessorIds.map((accessor) => accessor.accessorId);

    const accessors = await AccessorModel.find({ accessorId: { $in: idList } });
    if (!accessors || accessors.length === 0) {
      return res
        .status(404)
        .json({ message: "No Examiner available", success: false });
    }

    const accessorList = accessors.map((accessor) => ({
      accessorId: accessor.accessorId,
      accessorName: accessor.accessorName,
      accessorProfile: accessor.accessorProfile,
    }));

    return res.status(200).json({
      accessorList,
      message: "Successfully get examiner list",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

module.exports = {
  createAccessor,
  loginAccessor,
  getAccessorList,
  deleteAccessorById,
  updateAccessorById,
  getAccessorById,
  getMyAccessorList,
};
