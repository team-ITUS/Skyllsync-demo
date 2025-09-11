const dotenv = require("dotenv");
const axios = require("axios");
// const { verifyRecaptcha } = require('../services/recaptchaService');
const { log, warn, error, info } = require('../utils/logger');

const { AdminModel } = require("../models/adminModel");
const { CoursesModel } = require("../models/coursesModel");
const Studentmodel = require("../models/resisterStudentModel");
const { AccessorModel } = require("../models/accessorModel");
const { TrainerModel } = require("../models/trainerModel");
const { BatchModel } = require("../models/batchModel");
const { CertificateModel } = require("../models/certificateModel");
const { BranchModel } = require("../models/branchModel");
const { getMenuSubmenu } = require("../services/getMenuSubmenuService");


dotenv.config();

const adminLogin = async (req, res) => {
  try {
    const { adminName, adminPassword } = req.body;

    if (!adminName) {
      return res
        .status(400)
        .json({ message: "Admin name is required", success: false });
    }
    if (!adminPassword) {
      return res
        .status(400)
        .json({ message: "Admin password is required", success: false });
    }

    const admin = await AdminModel.findOne({ adminName });
    if (!admin) {
      return res
        .status(403)
        .json({ message: "Admin not exist", success: false });
    }

    if (admin?.adminPassword !== adminPassword) {
      return res
        .status(403)
        .json({ message: "Invalid password", success: false });
    }

    return res.status(200).json({
      admin,
      isAdminLogin: true,
      message: "Login success",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getAllCourseDtl = async (req, res) => {
  try {
    const courseDtl = await CoursesModel.find();

    if (!courseDtl) {
      return res
        .status(404)
        .json({ message: "Courses not available", success: false });
    }

    return res.status(200).json({
      courseDtl,
      message: "Successfully find all courses",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getUnApprovedCourses = async (req, res) => {
  try {
    const courseDtl = await CoursesModel.find({ status: "unapprove" });

    if (!courseDtl) {
      return res
        .status(404)
        .json({ message: "Courses not available", success: false });
    }

    return res.status(200).json({
      courseDtl,
      message: "Successfully find all courses",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

//requestFor==> ( 1=unapprove,   2=active,    3=inactive/delete )
const updateCourseStatus = async (req, res) => {
  const { courseId, requestFor } = req.body;
  let status;
  try {
    switch (requestFor) {
      case 2:
        status = "active";
        break;

      case 3:
        status = "inactive";
        break;

      default:
        return res
          .status(403)
          .json({ message: "Invalid request", success: false });
    }

    const isUpdate = await CoursesModel.findOneAndUpdate(
      { courseId: courseId },
      { status: status },
      { new: true }
    );

    if (!isUpdate) {
      return res
        .status(404)
        .json({ message: "Unable to process your request", success: false });
    }

    return res
      .status(200)
      .json({ message: "Successfully update your request", success: false });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};


// const token ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJjWlJXRU1wSTVRbHFXc3NtdHl6cFhrWnJXWUZnaXRhTyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzMxOTkyMDU3fQ.U50FCVt8rImwjEFJ0ZXvkxgdaQqVFLUdf7t0gYl7dx4";
// const apiKey ="EAAGrDXCiMy0BOzBE9dUPixPLZBqT23ErZCjT9vkUzfdczvBD154sGZBDFGLhA85wb7FHADVVDduBjI9HUw21uMILE6tOt6RaUorZARIk6953HJmnwArnvTDAF3Qimg42s93tRANTw1FkrHLkzaEZBQqPCHvz79PVgxVvY1oiehkuMB7XOHlBCfaYazdr8j2KYzgZDZD";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJMOGhCYTBGMThEak9nSmM5V2J4MUZtMUd1YkcwZHlBeCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzMzODA5MTE0fQ.Mltp4vBmSuBEnDB3fnMPqYIYlsmAqxqwgeFa39rRHG0";
const apiKey = "EAAGrDXCiMy0BO0sEPHoV8ZA9mXX76ZAuHaMnoZB2YqVVZAB2GW8Bjl9ZB8k38Ru7l9jPwPpKZA81zKVl7GhclGdm38dLPg2o7Tg7ZCeG1QbAyt8jtOSdSTJ4MJTrknNHzTKyTKAmExtQQFCQeH23hiCEGZBnByzzRZAbWk5T05tC6QiFHg1ZAvaAX1DZC2DayMyzdyDzAZDZD";

const sendMessageToWA = async (req, res) => {
  const { sendTo } = req.body;

  const apiUrl = "https://app.wachatapi.com/api/v1/send_templet";

  try {
    const response = await axios.post(
      apiUrl,
      {
        sendTo: "8806518367",
        templetName: "birthday_greeting",
        exampleArr: ["John"], // Include example array
        token,
        mediaUri: null, // Optional media URI
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );


    // Send a successful response
    return res.status(200).json({
      success: response.data.success,
      metaResponse: response.data.metaResponse,
    });
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: "Failed to send template message",
      error: error.response ? error.response.data : error.message,
    });
  }
};

//admin dashboard details
const getAdminDBDtl = async (req, res) => {
  try {
    let noOfStudent = await Studentmodel.countDocuments();
    let noOfAccessor = await AccessorModel.countDocuments();
    let noOfTrainer = await TrainerModel.countDocuments();
    let noOfCourse = await CoursesModel.countDocuments();
    let noOfBatch = await BatchModel.countDocuments();
    let noOfCertificate = await CertificateModel.countDocuments();
    let noOfBranch = await BranchModel.countDocuments();

    let adminDBDtl = {
      noOfStudent: noOfStudent,
      noOfAccessor: noOfAccessor,
      noOfTrainer: noOfTrainer,
      noOfCourse: noOfCourse,
      noOfBatch: noOfBatch,
      noOfCertificate: noOfCertificate,
      noOfBranch: noOfBranch,
    };

    return res.status(200).json({
      adminDBDtl,
      message: "Successfully get dashboard details",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const commonLogIn = async (req, res) => {
  try {
    const { userName, password, loginRole, 
      // recaptchaToken 
    } = req.body;
    let apiMessage = "";

    // 1. Verify reCAPTCHA token
    // if (!recaptchaToken) {
    //   warn('No recaptchaToken received in commonLogIn', { userName });
    // }
    // const recaptchaResult = await verifyRecaptcha(recaptchaToken, req.ip);

    // info('reCAPTCHA result in commonLogIn', recaptchaResult);

    // if (!recaptchaResult) {
    //   error('reCAPTCHA result is null in commonLogIn', { userName });
    //   return res.status(403).json({
    //     message: "reCAPTCHA verification failed (null result).",
    //     success: false,
    //   });
    // }

    // if (!recaptchaResult.success) {
    //   warn('reCAPTCHA success is false in commonLogIn', recaptchaResult);
    //   return res.status(403).json({
    //     message: "reCAPTCHA verification failed.",
    //     success: false,
    //     errorCodes: recaptchaResult.errorCodes,
    //   });
    // }

    // if (recaptchaResult.score < 0.5) {
    //   warn('reCAPTCHA score too low in commonLogIn', recaptchaResult);
    //   return res.status(403).json({
    //     message: "reCAPTCHA score too low.",
    //     success: false,
    //     errorCodes: recaptchaResult.errorCodes,
    //   });
    // }

    try {
      const admin = await axios.post(`${process.env.BASE_URL}/admin/adminLogin`, {
        adminName: userName,
        adminPassword: password,
      });

  const roleId = 1; // keep UI parity (menus) with Admin
  const role = 'admin';
      const menuDtl = await getMenuSubmenu(roleId);

      return res.status(200).json({
        menuDtl,
  roleId,
  role,
        message: admin.data.message,
        success: true,
        profileName: userName,
      });
    } catch (adminError) {
      apiMessage = adminError.response?.data?.message;
      warn("[commonLogIn] Admin login failed:", apiMessage);
    }

    try {
      const accessor = await axios.post(`${process.env.BASE_URL}/accessor/loginAccessor`, {
        accessorEmail: userName,
        accessorPassword: password,
        loginRole: loginRole,
      });

      const menuDtl = await getMenuSubmenu(2);
      let roleId = 2;
      let role = "accessor";

      return res.status(200).json({
        menuDtl,
        roleId,
        role,
        message: accessor.data.message,
        success: true,
        profileName: accessor.data.accessorName,
        uuid: accessor.data.accessorId,
      });
    } catch (accessorError) {
      apiMessage = accessorError.response?.data?.message;
      warn("[commonLogIn] Accessor login failed:", apiMessage);
    }

    try {
      const trainer = await axios.post(`${process.env.BASE_URL}/trainer/loginTrainer`, {
        trainerEmail: userName,
        trainerPassword: password,
      });

      const menuDtl = await getMenuSubmenu(3);
      let roleId = 3;
      let role = "trainer";

      return res.status(200).json({
        menuDtl,
        roleId,
        role,
        message: trainer.data.message,
        success: true,
        profileName: trainer.data.trainerName,
        uuid: trainer.data.trainerId,
      });
    } catch (error) {
      warn("[commonLogIn] Trainer login failed:", error?.response?.data?.message);
      return res
        .status(404)
        .json({ message: "Invalid username or password", success: false });
    }
  } catch (error) {
    error("[commonLogIn] Error:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getAdminDtl = async (req, res) => {
  try {
    const adminDtl = await AdminModel.findOne(
      {},
      {
        adminName: 1,
        profile: 1,
        signature: 1,
        userName: 1,
        adminPassword:1,
      }
    );

    if (!adminDtl) {
      return res
        .status(404)
        .json({ message: "Admin detail not availabe", success: false });
    }

    return res.status(200).json({
      adminDtl,
      message: "Successfully get admin detail",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const updateAdminDtl = async (req, res) => {
  const { userName, adminPassword } = req.body;

  const adminDataToUpdate = {};

  if (userName && userName.trim()) {
    adminDataToUpdate.userName = userName;
  }

  if (adminPassword && adminPassword.trim()) {
    adminDataToUpdate.adminPassword = adminPassword;
  }

  let profile, signature;
  if (req.files) {
    if (req.files.profile) {
      const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validMimeTypes.includes(req.files.profile[0].mimetype)) {
        return res.status(400).json({
          message:
            "Invalid profile image type. Only JPG, JPEG, and PNG are allowed.",
          success: false,
        });
      }
      profile =
        req.files.profile[0].destination + req.files.profile[0].filename;
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

  adminDataToUpdate.profile = profile;
  adminDataToUpdate.signature = signature;

  if (Object.keys(adminDataToUpdate).length === 0) {
    return res
      .status(400)
      .json({ message: "No valid fields to update", success: false });
  }

  const updateAdmin = await AdminModel.findOneAndUpdate(
    {},
    { $set: adminDataToUpdate },
    { new: true }
  );

  if (!updateAdmin) {
    return res
      .status(404)
      .json({ message: "Admin detail not available", success: false });
  }

  return res
    .status(200)
    .json({ message: "Successfully updated admin detail", success: true });
};

module.exports = {
  adminLogin,
  getAllCourseDtl,
  getUnApprovedCourses,
  updateCourseStatus,
  sendMessageToWA,
  getAdminDBDtl,
  commonLogIn,
  getAdminDtl,
  updateAdminDtl,
};

