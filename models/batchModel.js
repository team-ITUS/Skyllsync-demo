const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const Batch = new mongoose.Schema(
  {
    batchId: {
      type: String,
      default: uuidv4,
      required: true,
      unique: true,
    },

    validity:{
      type: Number,
      required: true,
    },

    batchName:{
      type: String,
      required: true,
    },

    branch:{
      type: String,
      required: true,
    },

    branchId:{
      type:String,
      required: true
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    trainerName: {
      type: String,
      required: true,
    },

    trainerId: {
      type: String,
      required: true,
    },

    accessorName:{
      type:String,
      required:true,
    },

    accessorId:{
      type:String,
      required:true,
    },

    courseName: {
      type: String,
      required: true,
    },

    courseId: {
      type: String,
      required: true,
    },

    certificateId:{
      type: String,
      required:true,
    },

    licenseId:{
      type: String,
      default: "no license",
      required:false,
    },

    courseCat: {
      type: String,
    },

    studentIds: [{
      type: String,
      required: true
    }],

    progress:{
      type:Number,
      default:0,
    },

    completedBy:{
      type:String,
    },

    deleteStatus:{
      type: String,
      default: 'active',
    }, 

    status:{
      type:String,
      enum:['Coming Soon','On-Going', 'Completed'],
      default:'Coming Soon'
    },

    compDate: {
      type: Date,
    },

    byAdmin:{
      type:String,
      enum:["Pending", "Completed"],
      default:"Pending"
    },

    byExaminer:{
      type:String,
      enum:["Pending", "Completed"],
      default:"Pending"
    },

    byTrainer:{
      type:String,
      enum:["Pending", "Completed"],
      default:"Pending"
    },

    assessment:{
      grade:{
        type:Boolean,
        default:false,
      },
      meterDive:{
        type:Boolean,
        default:false,
      }
    }

  },
  {
    timestamps: true,
  }
);

// Static helper: get batch names where a given studentId is present in studentIds array
Batch.statics.getBatchNamesByID = async function (studentId) {
  if (!studentId) return [];
  // exclude deleted batches
  const batches = await this.find({ studentIds: studentId, deleteStatus: { $ne: 'deleted' } }, { batchId: 1, batchName: 1 });
  // return objects so frontend can use batchId for navigation
  return batches.map((b) => ({ _id: b._id, batchId: b.batchId, batchName: b.batchName }));
};

const BatchModel = mongoose.model("batchs", Batch);

module.exports = { BatchModel };


