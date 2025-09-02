const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const Quiz = new mongoose.Schema(
  {
    quizId: {
      type: String,
      default: uuidv4,
      required: true,
      unique: true,
    },

    quizTitle:{
      type: String,
      required: true,
    },

    quizDesc:{
      type: String,
      required: true,
    },

    questionList:[
      {
        questionId: {
          type: String,
          required: true,
        },
        index: {
          type: Number,
          required: true,
        }
      }
    ]

  },
  {
    timestamps: true,
  }
);

const QuizModel = mongoose.model("quizs", Quiz);

module.exports = { QuizModel };



