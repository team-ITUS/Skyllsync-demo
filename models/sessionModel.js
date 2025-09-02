const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const SessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    default: uuidv4,
    required: true,
    unique: true,
  },

  courseId: {
    type: String,
    required: true,
  },

  sessionName: {
    type: String,
    required: true,
  },

  sessionDesc: {
    type: String,
    required: false,
  },

  noOfLessons: {
    type: Number,
    default: 0,
    required: true,
  },

  entryTime: {
    type: Date,
    default: Date.now,
  },
});

const SessionModel = mongoose.model("sessions", SessionSchema);
module.exports = { SessionModel };
