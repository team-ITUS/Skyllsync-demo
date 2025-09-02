const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const Trainer = new mongoose.Schema({
  trainerId: {
    type: String,
    default : uuidv4,
    unique: true,
    required: true,
  },

  trainerEmail: {
    type: String,
    required: true,
  },

  trainerMobNo: {
    type: String,
    required: true,
  },

  trainerName: {
    type: String,
    required: true,
  },

  trainerDob: {
    type: Date,
    required: true,
  },

  trainerGender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },

  trainerJoinDate: {
    type: Date,
    required: true,
  },

  trainerEdu: {
    type: String,
    required: true,
  },

  // trainerCourse: {
  //   type: String,
  //   required: true,
  // },

  trainerPassword: {
    type: String,
    required: true,
  },

  roleId: {
    type: Number,
    default: 3,
    required: false,
  },

  role:{
    type:String,
    default:"trainer"
  },

  trainerAddr: {
    type: String,
    required: false,
  },

  trainerProfile: {
    type: String,
    required: false,
  },

  entryTime:{
    type: Date,
    default: Date.now, 
    required: true
  }

});

const TrainerModel = mongoose.model("trainers", Trainer);

module.exports = { TrainerModel };
