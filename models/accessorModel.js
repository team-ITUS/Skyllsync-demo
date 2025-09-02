const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const Accessor = new mongoose.Schema({
  accessorId: {
    type: String,
    default : uuidv4,
    unique: true,
    required: true,
  },

  accessorEmail: {
    type: String,
    required: true,
  },

  accessorMobNo: {
    type: String,
    required: true,
  },

  accessorName: {
    type: String,
    required: true,
  },

  accessorDob: {
    type: Date,
    required: true,
  },

  accessorGender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },

  accessorJoinDate: {
    type: Date,
    required: true,
  },

  accessorPassword: {
    type: String,
    required: true,
  },

  roleId: {
    type: Number,
    default: 2,
    required: false,
  },

  role:{
    type:String,
    default:"accessor",
  },

  accessorAddr: {
    type: String,
    required: false,
  },

  accessorProfile: {
    type: String,
    required: false,
  },

  signature:{
    type:String
  },

  entryTime:{
    type: Date,
    default: Date.now, 
    required: true
  }

});

const AccessorModel = mongoose.model("accessors", Accessor);

module.exports = { AccessorModel };
