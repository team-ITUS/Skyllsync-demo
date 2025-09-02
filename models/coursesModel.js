const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const Courses = new mongoose.Schema({
  courseId: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true,
  },

  courseName: {
    type: String,
    required: true,
  },

  courseDesc: {
    type: String,
    required: false,
  },

  creatorName: {
    type: String,
    required: true,
  },

  catId: {
    type: String,
    required: true,
  },

  creatorId: {
    type: String,
    required: true,
  },

  createDate: {
    type: Date,
    required: true,
  },

  status: {
    type: String,
    enum: ["active", "inactive", "unapprove"],
    default: "unapprove",
    required: true,
  },

  noOfLectures: {
    type: Number,
    default: 0,
    required: true,
  },

  courseLevel: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner",
    required: true,
  },

  courseCategory: {
    type: String,
    required: true,
  },

  courseThumbnail: {
    type: String,
    required: false,
  },

  entryTime: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const CoursesModel = mongoose.model("Courses", Courses);

module.exports = { CoursesModel };
