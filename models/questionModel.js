const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const Question = new mongoose.Schema(
  {
    questionId: {
      type: String,
      default: uuidv4,
      required: true,
      unique: true,
    },

    quizId:{
      type:String,
      required:true,
    },

    questionType:{
        type:String,
        required:true,
    },

    questionTitle:{
        type:String,
        required:true,
    },

    optionOne:{
        type:String,
    },

    optionTwo:{
        type:String,
    },

    optionThree:{
        type:String,
    },

    optionFour:{
        type:String,
    },

    answer:{
        type:String,
        enum:['A', 'B', 'C', 'D'],
        required: true
    } 
  },
  {
    timestamps: true,
  }
);

const QuestionModel = mongoose.model('questions',Question);

module.exports = {QuestionModel};

// quizAndQuen = [
//   {quizId:"", questionType:"", questionTitle:"", optionOne:"", optionTwo:"", optionThree:"", optionFour:"", answer:""},
//   {quizId:"", questionType:"", questionTitle:"", optionOne:"", optionTwo:"", optionThree:"", optionFour:"", answer:""},
//   {quizId:"", questionType:"", questionTitle:"", optionOne:"", optionTwo:"", optionThree:"", optionFour:"", answer:""},
// ]
