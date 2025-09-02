const { Schema, model } = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Define User Schema and Model
const userSchema = new Schema(
  {
    studentId: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true,
    },

    name: {
      type: String,
    },

    nickname: {
      type: String,
    },

    email: {
      type: String,
      unique: true,
    },

    dob: {
      type: Date,
    },

    gender: {
      type: String,
    },

    mobile: {
      type: String,
      unique: true,
      required: true,
    },

    registedDate: {
      type: Date,
      default: Date.now,
    },

    imagePath: {
      type: String,
    },

    adhaarImage: {
      type: String,
    },

    occupation: {
      type: String,
      required: true,
    },

    qualification: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    bloodGrp: {
      type: String,
      required: true,
    },
    isProfile: {
      type: String,
      default: "Pending",
    },
    autoIndex :{
      type:Number,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

const Studentmodel = model("Studentregister", userSchema);

module.exports = Studentmodel;
