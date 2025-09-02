const { QuestionModel } = require("../models/questionModel");
const { QuizModel } = require("../models/quizModel");
const { log, warn, error, info } = require('../utils/logger');

const addQuestion = async (req, res) => {
  try {
    const {
      quizId,
      questionType,
      questionTitle,
      optionOne,
      optionTwo,
      optionThree,
      optionFour,
      answer,
    } = req.body;

    if (!quizId) {
      return res
        .status(400)
        .json({ message: "Quiz Id is required", success: false });
    }

    if (!questionType) {
      return res
        .status(400)
        .json({ message: "Question type is required", success: false });
    }

    if (!questionTitle) {
      return res
        .status(400)
        .json({ message: "Question title is required", success: false });
    }

    if (questionType === "MCQ") {
      if (!optionOne || !optionTwo || !optionThree || !optionFour) {
        return res.status(400).json({
          message: "All options must be provided for MCQ type",
          success: false,
        });
      }
    }

    const newQuestion = new QuestionModel({
      quizId,
      questionType,
      questionTitle,
      optionOne: questionType === "MCQ" ? optionOne : "True",
      optionTwo: questionType === "MCQ" ? optionTwo : "False",
      optionThree: questionType === "MCQ" ? optionThree : "",
      optionFour: questionType === "MCQ" ? optionFour : "",
      answer,
    });

    const isSaved = await newQuestion.save();

    if (isSaved) {
      const quiz = await QuizModel.findOne({ quizId });

      if (!quiz) {
        return res
          .status(404)
          .json({ message: "Quiz not found", success: false });
      }

      const newIndex = quiz.questionList.length + 1;

      quiz.questionList.push({
        questionId: isSaved.questionId,
        index: newIndex,
      });

      await quiz.save();
    }

    return res.status(201).json({
      message: "Question added successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getQuesListById = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await QuizModel.findOne({ quizId });
    if (!quiz) {
      return res
        .status(404)
        .json({ message: "Quiz not found", success: false });
    }

    const questionIds = quiz.questionList.map((q) => q.questionId);

    const questions = await QuestionModel.find({
      questionId: { $in: questionIds },
    });

    if (!questions || questions.length === 0) {
      return res
        .status(404)
        .json({ message: "No question available", success: false });
    }

    const formattedData = questions.map((question) => {
      const indexObj = quiz.questionList.find(
        (q) => q.questionId === question.questionId
      );
      return {
        questionId: question.questionId,
        index: indexObj ? indexObj.index : null,
        questionType: question.questionType,
        questionTitle: question.questionTitle,
        optionOne: question.optionOne,
        optionTwo: question.optionTwo,
        optionThree: question.optionThree,
        optionFour: question.optionFour,
        answer: question.answer,
      };
    });

    formattedData.sort((a, b) => a.index - b.index);

    return res
      .status(200)
      .json({
        questionList: formattedData,
        message: "Successfully get questions",
        success: true,
      });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const submitAnswer = async (req, res) =>  {
  try {
    const { quizId, answers } = req.body;

    const questions = await QuestionModel.find({ quizId });

    if (!questions.length) {
      return res.status(404).json({ success: false, message: 'No questions found for this quiz' });
    }

    let correctCount = 0;
    let totalQuestions = questions.length;
    let detailedResults = [];

    questions.forEach((question) => {
      const userAnswer = answers[question.questionId]; 
      const correctAnswer = question.answer; 

      if (userAnswer && userAnswer === correctAnswer) {
        correctCount++;
        detailedResults.push({
          questionId: question.questionId,
          isCorrect: true,
          userAnswer,
          correctAnswer,
          questionTitle: question.questionTitle
        });
      } else {
        detailedResults.push({
          questionId: question.questionId,
          isCorrect: false,
          userAnswer,
          correctAnswer,
          questionTitle: question.questionTitle
        });
      }
    });

    const scorePercentage = ((correctCount / totalQuestions) * 100).toFixed(2);

    res.status(200).json({
      success: true,
      totalQuestions,
      correctCount,
      scorePercentage,
      detailedResults,
      message:"Successfully submit answers",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const deleteQuesById = async (req, res)=>{
  try {
    const {questionId} = req.params;

    const isDelete = await QuestionModel.findOneAndDelete({questionId});

    if(!isDelete){
      return res.status(404).json({message:"Question not found", success: false});
    }

    return res.status(200).json({message:"Question delete successfully", success: true});
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
}

module.exports = { addQuestion, getQuesListById, submitAnswer, deleteQuesById };
