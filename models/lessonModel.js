const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const LessonSchema = new mongoose.Schema({
  lessonId: {
    type: String,
    default: uuidv4,
    required: true,
    unique: true,
  },

  courseId:{
    type:String,
    required:true
  },

  sessionId: {
    type: String,
    required: true,
  },

  quizId:{
    type: String,
  },

  lessonName: {
    type: String,
    required: true,
  },

  textNote: {
    type: String,
    required: false,
  },

  videoUrl: {
    type: String,
    required: false,
  },

  attachment:{
    type: String,
    required: false,
  },

  lessonType:{
    type: String,
    required: true,
  },

  entryTime: {
    type: Date,
    default: Date.now,
  },
});

const LessonModel = mongoose.model("lessons", LessonSchema);
module.exports = { LessonModel };
