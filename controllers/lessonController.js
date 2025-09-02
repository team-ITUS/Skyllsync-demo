const { LessonModel } = require("../models/lessonModel");
const {SessionModel} = require('../models/sessionModel');
const { log, warn, error, info } = require('../utils/logger');

const createLesson = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res
        .status(400)
        .json({ message: "Please select session", success: false });
    }

    const isPresent = await SessionModel.findOne({sessionId});

    if (!isPresent) {
      return res
        .status(404)
        .json({ message: "Session not available", success: false });
    }

    let imagePath;
    if (req.file) {
      const validMimeTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
      if (!validMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          message: "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
          success: false,
        });
      }

      imagePath = req.file.destination + req.file.filename;
    }

    const lessonModel = new LessonModel({
        sessionId: sessionId, 
        lessonName: req.body.lessonName,
        textNote: req.body.textNote,
        videoUrl: req.body.videoUrl,
        lessonType: req.body.type,
        attachment: imagePath,
        courseId: req.body.courseId,
        quizId: req.body.quizId,
    });

    const isSave = await lessonModel.save();

    if (isSave) {
      await SessionModel.findOneAndUpdate(
        { sessionId: sessionId },
        { noOfLessons: isPresent.noOfLessons + 1 },
        { new: true } 
      );
    }

    return res.status(201).json({ message: "Add lesson successfully.", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const deleteLessonById = async (req, res)=>{
  try {
    const {lessonId} = req.params;

    if(!lessonId){
      return res.status(400).json({message:"Lesson Id is required", success:false});
    }

    const isDelete = await LessonModel.findOneAndDelete({lessonId});

    if(!isDelete){
      return res.status(404).json({message:"Lesson not available", success: false});
    }

    return res.status(200).json({message:"Lesson deleted successfully", success: true});
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
}


const updateLessonById = async (req, res)=>{
  try {
    const {lessonId} = req.params;
    const newData = req.body;
    if(!lessonId){
      return res.status(400).json({message:"Lesson Id is require", success: false});
    }

    const isUpdate = await LessonModel.findOneAndUpdate(
      {lessonId: lessonId},
      {$set: newData},
      {new: true},
    );

    if(!isUpdate){
      return res.status(404).json({message: "Lesson not available", success: false});
    }

    return res.status(200).json({message:"Lesson update successfully", success: true});
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
}

const getLessonById = async (req, res)=>{
  try {
    const {lessonId} = req.params;

    if(!lessonId){
      return res.status(400).json({message:"Lesson Id is require", success:false});
    }

    const lessonDtl = await LessonModel.findOne({lessonId});

    if(!lessonDtl){
      return res.status(404).json({message: "Lesson not available", success: false});
    }

    return res.status(200).json({lessonDtl, message:"Successfully get lesson details", success: true});
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
}

module.exports = { createLesson, deleteLessonById, updateLessonById, getLessonById };
