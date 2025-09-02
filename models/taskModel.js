const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const Task = new mongoose.Schema(
  {
    taskId: {
      type: String,
      default: uuidv4,
      required: true,
      unique: true,
    },

    taskTitle: {
      type: String,
      required: true,
    },

    taskDesc: {
      type: String,
    },

    status: {
      type: String,
      required: true,
      enum: ["pending", "completed"],
    },

    startDate: {
      type: Date,
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    trainerId: {
      type: String,
      required: true,
    },

    trainerName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const TaskModel = mongoose.model("tasks", Task);

module.exports = { TaskModel };
