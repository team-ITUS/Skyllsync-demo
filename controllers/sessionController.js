const { SessionModel } = require("../models/sessionModel");
const { CoursesModel } = require("../models/coursesModel");
const {LessonModel} = require('../models/lessonModel');
const { log, warn, error, info } = require('../utils/logger');

const createSession = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res
        .status(400)
        .json({ message: "courseId required", success: false });
    }

    const isPresent = await CoursesModel.findOne({ courseId });

    if (!isPresent) {
      return res
        .status(404)
        .json({ message: "Course not available", success: false });
    }

    const sessionModel = new SessionModel({
      courseId: req.body.courseId,
      sessionName: req.body.sessionName,
      sessionDesc: req.body.sessionDesc,
    });

    const isSave = await sessionModel.save();

    if (isSave) {
      await CoursesModel.findOneAndUpdate(
        { courseId: courseId },
        { noOfLectures: isPresent.noOfLectures + 1 },
        { new: true }
      );
    }

    return res
      .status(201)
      .json({
        sessionId: isSave.sessionId,
        message: "Session created successfully",
        success: true,
      });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const deleteSessionById = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ message: "Session Id is require", success: false });
    }

    const isDelete = await SessionModel.findOneAndDelete({sessionId});

    if(!isDelete){
      return res.status(404).json({ message: "Session not available", success: false }); 
    }
    
    const lessDelete = await LessonModel.deleteMany({sessionId});

    return res.status(200).json({message: "Session deleted successfully", success:true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const updateSessionById = async (req, res)=>{
  try {
    const {sessionId} = req.params;
    const newData = req.body;

    if(!sessionId){
      return res.status(400).json({message:"Session Id is require", success: false});
    }

    const isUpdate = await SessionModel.findOneAndUpdate(
      {sessionId: sessionId},
      {$set: newData},
      {new: true},
    );

    if(!isUpdate){
      return res.status(404).json({message: "Session not available", success: false});
    }

    return res.status(200).json({isUpdate, message:"Session update successfully", success: true});
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
}

const getSessionById = async (req, res)=>{
  try {
    const {sessionId} = req.params;

    if(!sessionId){
      return res.status(400).json({message:"Session Id is require", success: false});
    }

    const sessionDtl = await SessionModel.findOne({sessionId});

    if(!sessionDtl){
      return res.status(404).json({message:"Session detail not available", success:false});
    }

    return res.status(200).json({sessionDtl, message:"Successfully find session details", success: true});
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
}

const getlessonOfSession = async (req, res)=>{
  try {
    const {sessionId} = req.params;

    const lessonList = await LessonModel.find({sessionId});

    if(!lessonList || lessonList.length === 0){
      return res.status(404).json({message:"Lesson not available", success: false});
    }

    return res.status(200).json({lessonList, message:"Successfully get all lessons", success: true});
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
}

module.exports = { createSession, deleteSessionById, updateSessionById, getSessionById, getlessonOfSession };
