const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const Branch = new mongoose.Schema(
  {
    branchId: {
      type: String,
      default: uuidv4,
      required: true,
      unique: true,
    },
    branchName: {
      type: String,
      required: true,
      unique: true,
    },
    branchAddress: {
      type: String,
      required: true,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    contactNo: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },

    prefixOne: {
      type: String,
      required: true,
    },


    prefixTwo: {
      type: String,
      required: true,
    },

    includeMonth: {
      type: Boolean,
      required: true,
    },

    includeYear: {
      type: Boolean,
      required: true,
    },

    startIndex:{
      type: Number,
      require:true,
    },

    currentIndex:{
      type: Number,
      require:true,
      default:0,
    },

    logoOne: {
      type: String,
    },

    logoTwo: {
      type: String,
    },

    logoThree: {
      type: String,
    },

    logoFour: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
const BranchModel = mongoose.model("branches", Branch);

module.exports = { BranchModel };
