const bcrypt = require("bcrypt");
const { TrainerModel } = require("../models/trainerModel");
const generatePassword = require("../services/generatePassService");
const { StudBatchModel } = require("../models/studBatchModel");
const { transporter } = require("../services/sendMailService");
const { BatchModel } = require("../models/batchModel");
const { log, warn, error, info } = require('../utils/logger');

const dotenv = require("dotenv");

dotenv.config();

const createTrainer = async (req, res) => {
  const { trainerEmail } = req.body;
  try {
    if (!trainerEmail) {
      return res
        .status(400)
        .json({ message: "Email is required", success: false });
    }

    const isExist = await TrainerModel.findOne({ trainerEmail });
    if (isExist) {
      return res
        .status(409)
        .json({ message: "Trainer is already present", success: false });
    }

    const sysGenPassword = generatePassword();

    let imagePath;
    if (req.file) {
      const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          message: "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
          success: false,
        });
      }

      imagePath = req.file.destination + req.file.filename;
    }

    const trainerModel = new TrainerModel({
      trainerEmail: trainerEmail,
      trainerMobNo: req.body.trainerMobNo,
      trainerName: req.body.trainerName,
      trainerDob: req.body.trainerDob,
      trainerGender: req.body.trainerGender,
      trainerJoinDate: req.body.trainerJoinDate,
      trainerEdu: req.body.trainerEdu,
      // trainerCourse: req.body.trainerCourse,
      trainerAddr: req.body.trainerAddr,
      trainerProfile: imagePath,
      trainerPassword: sysGenPassword,
    });
    // trainerModel.trainerPassword = await bcrypt.hash(sysGenPassword, 10);

    const isSave = await trainerModel.save();

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: trainerEmail,
      subject: "Your account credential",
      text: `Successfully create your account with username: ${trainerEmail} and password: ${sysGenPassword}`,
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
      .json({ message: "Trainer create successfully.", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const loginTrainer = async (req, res) => {
  try {
    const { trainerEmail, trainerPassword } = req.body;

    // Find the trainer by email
    const trainer = await TrainerModel.findOne({ trainerEmail });

    // Check if the trainer exists
    if (!trainer) {
      return res.status(403).json({
        message: "Invalid email. Please provide valid email",
        success: false,
      });
    }

    // Compare the provided password with the stored hashed password
    // const isMatch = await bcrypt.compare(
    //   trainerPassword,
    //   trainer?.trainerPassword
    // );

    // Check if the password matches
    if (trainerPassword !== trainer?.trainerPassword) {
      return res.status(403).json({
        message: "Invalid password. Try again",
        success: false,
      });
    }

    // If successful, return success response with trainerName
    return res.status(200).json({
      message: "Login successfully",
      success: true,
      trainerName: trainer.trainerName,
      trainerId: trainer.trainerId,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getTrainerList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 600;
    const searchName = req.query?.searchTerm || "";
    const skip = (page - 1) * limit;

    const query = {};

    if (searchName) {
      query.$or = [
        { trainerName: { $regex: searchName, $options: "i" } },
        { trainerMobNo: { $regex: searchName, $options: "i" } },
        { trainerEmail: { $regex: searchName, $options: "i" } },
      ];
    }

    const totalTrainers = await TrainerModel.countDocuments(query);

    const trainers = await TrainerModel.find(query, {
      trainerEmail: 1,
      trainerMobNo: 1,
      trainerName: 1,
      trainerDob: 1,
      trainerGender: 1,
      trainerJoinDate: 1,
      trainerCourse: 1,
      trainerProfile: 1,
      trainerId: 1,
    })
      .sort({ entryTime: -1 })
      .skip(skip)
      .limit(limit);

    if (!trainers || trainers.length === 0) {
      return res
        .status(404)
        .json({ message: "Trainers not available", success: false });
    }

    return res.status(200).json({
      message: "Successfully retrieved trainers",
      success: true,
      trainers,
      totalTrainers,
      totalPages: Math.ceil(totalTrainers / limit),
      currentPage: page,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const deleteTrainerById = async (req, res) => {
  try {
    const { trainerId } = req.params;

    const isAssign = await BatchModel.findOne({ trainerId });
    if (isAssign) {
      return res
        .status(400)
        .json({
          message: "Trainer assigned to batches. Unassign to delete.",
          success: false,
        });
    }

    const deletedTrainer = await TrainerModel.findOneAndDelete({ trainerId });

    if (!deletedTrainer) {
      return res
        .status(404)
        .json({ message: "Trainer not exist", success: false });
    }

    return res.status(200).json({
      message: "Trainer deleted successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const updateTrainerById = async (req, res) => {
  try {
    const { trainerId } = req.params;

    let imagePath;
    if (req.file) {
      const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          message: "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
          success: false,
        });
      }

      imagePath = req.file.destination + req.file.filename;
    }

    req.body.trainerProfile = imagePath;

    const updatedTrainer = await TrainerModel.findOneAndUpdate(
      { trainerId: trainerId },
      req.body,
      { new: true }
    );

    if (!updatedTrainer) {
      return res.status(404).json({
        message: "Trainer not exist for update details",
        success: false,
      });
    }

    return res
      .status(200)
      .json({ message: "Trainer details updated successfully", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getTrainerDropdown = async (req, res) => {
  try {
    const trainers = await TrainerModel.find(
      {},
      {
        trainerName: 1,
        trainerId: 1,
        trainerMobNo: 1,
      }
    );

    if (!trainers) {
      return res
        .status(404)
        .json({ message: "Trainers not available", success: false });
    }

    return res
      .status(200)
      .json({
        trainers,
        message: "Successfully find all trainers",
        success: true,
      });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// //get single trainer by trainerId
// const getTrainerById = async (req, res)=>{
//   try {
//     const {trainerId} = req.params;

//     if (!trainerId) {
//       return res
//         .status(400)
//         .json({ message: "Trainer Id is require", success: false });
//     }

//     const trainer = await TrainerModel.findOne(
//       {trainerId},
//       {
//         trainerEmail: 1,
//         trainerMobNo: 1,
//         trainerName: 1,
//         trainerDob: 1,
//         trainerGender: 1,
//         trainerJoinDate: 1,
//         trainerCourse: 1,
//         trainerProfile: 1,
//         trainerId: 1,
//       }
//     );

//     if(!trainer){
//       return res.status(404).json({message:"Trainer not found", success: false});
//     }

//     return res.status(200).json({trainer, message:"Successfully get trainer details", success:true});

//   } catch (error) {
//     return res.status(500).json({ message: error.message, success: false });
//   }
// }

const getTrainerById = async (req, res) => {
  try {
    const { trainerId } = req.params;

    const trainer = await TrainerModel.findOne({ trainerId });

    if (!trainer) {
      return res
        .status(404)
        .json({ message: "Trainer not found", success: false });
    }

    return res.status(200).json({
      message: "Trainer retrieved successfully",
      success: true,
      trainer,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getMyTrainerList = async (req, res) => {
  try {
    const { studentId } = req.params;

    const studBatch = await StudBatchModel.find({ studentId });
    if (!studBatch || studBatch.length === 0) {
      return res
        .status(404)
        .json({ message: "No Trainer available", success: false });
    }

    const batchIds = studBatch.map((batch) => batch.batchId);

    const trainerIds = await BatchModel.find(
      { batchId: { $in: batchIds } },
      "trainerId"
    );
    if (!trainerIds || trainerIds.length === 0) {
      return res
        .status(404)
        .json({ message: "No Trainer available", success: false });
    }

    const idList = trainerIds.map((trainer) => trainer.trainerId); //

    const trainers = await TrainerModel.find({ trainerId: { $in: idList } });
    if (!trainers || trainers.length === 0) {
      return res
        .status(404)
        .json({ message: "No Trainer available", success: false });
    }

    const trainerList = trainers.map((trainer) => ({
      trainerId: trainer.trainerId,
      trainerName: trainer.trainerName,
      trainerProfile: trainer.trainerProfile,
    }));

    return res
      .status(200)
      .json({
        trainerList,
        message: "Successfully get trainer list",
        success: true,
      });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getMyTrainer = async (req, res) => {
  try {
    const { courseId, studentId } = req.query;

    if (!courseId) {
      return res
        .status(400)
        .json({ message: "Course Id required", success: false });
    }

    if (!studentId) {
      return res
        .status(400)
        .json({ message: "Student Id required", success: false });
    }

    const batch = await BatchModel.findOne({
      courseId: courseId,
      studentIds: studentId,
    });

    if (!batch) {
      return res
        .status(404)
        .json({ message: "Trainer not available", success: false });
    }

    const trainerId = batch.trainerId;
    const trainerDtl = await TrainerModel.findOne(
      { trainerId },
      {
        trainerId: 1,
        trainerName: 1,
        trainerEmail: 1,
        trainerMobNo: 1,
        trainerEdu: 1,
        trainerProfile: 1,
      }
    );

    if (!trainerDtl) {
      return res
        .status(404)
        .json({ message: "Trainer not available", success: false });
    }

    return res
      .status(200)
      .json({ trainerDtl, message: "Successfully get trainer", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

module.exports = {
  createTrainer,
  loginTrainer,
  getTrainerList,
  deleteTrainerById,
  updateTrainerById,
  getTrainerDropdown,
  // getTrainerById,
  getTrainerById,
  getMyTrainerList,
  getMyTrainer,
};
