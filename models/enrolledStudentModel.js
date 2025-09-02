const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const EnrolledStudent = new mongoose.Schema({
  //table unique uuid
  enrollStudentId: {
    type: String,
    default: uuidv4,
    required: false,
  },

  //register studentId
  studentId: {
    type: String,
    required: true,
  },

  studentName: {
    type: String,
    required: true,
  },

  // studentNickName: {
  //   type: String,
  //   required: false,
  // },

  // studentEmail: {
  //   type: String,
  //   required: true,
  // },

  // studentMobNo: {
  //   type: String,
  //   required: true,
  // },

  // studentDob: {
  //   type: Date,
  //   required: true,
  // },

  // studentGender: {
  //   type: String,
  //   enum: ["Male", "Female", "Other"],
  //   required: true,
  // },


  //course id 
  enrolledCourseId: {
    type: String,
    required: true,
  },

  enrolledCourse: {
    type: String,
    required: true,
  },

  enrolledDate: {
    type: Date,
    default: Date.now,
    required: true,
  },

  enrolledBy: {
    type: String,
    default: "student",
    required: false,
  },

  paymentStatus: {
    type: String,
    enum: ["paid", "unpaid"],
    default: "unpaid",
  },

  completeStatus: { 
    type: String,
    enum: ["complete", "incomplete"],
    default: "incomplete",
  },

  isIssued: {
    type: Boolean,
    default: false,
  },

  progress: {
    type: Number,
    default: 0,
  },

  isInBatch: {
    type: Boolean,
    default: false,
  },

  //   studentAddr: {
  //     type: String,
  //     required: false,
  //   },

  entryTime: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const EnrolledStudentModel = mongoose.model(
  "enrolledStudents",
  EnrolledStudent
);

module.exports = { EnrolledStudentModel };


