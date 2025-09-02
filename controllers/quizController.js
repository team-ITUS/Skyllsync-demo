const { CoursesModel } = require("../models/coursesModel");
const { LessonModel } = require("../models/lessonModel");
const { QuestionModel } = require("../models/questionModel");
const { QuizModel } = require("../models/quizModel");
const { log, warn, error, info } = require('../utils/logger');

const addQuiz = async (req, res) => {
  try {
    const { quizTitle } = req.body;

    if (!quizTitle) {
      return res
        .status(400)
        .json({ message: "Title is required", success: false });
    }

    const quizModel = new QuizModel({
      quizTitle: quizTitle,
      quizDesc: req.body.quizDesc,
    });

    await quizModel.save();

    return res
      .status(201)
      .json({ message: "Quiz added successfully", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getAllQuizList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const totalQuiz = await QuizModel.countDocuments();
    const quizData = await QuizModel.find({})
      .sort({createdAt:-1})
      .skip(skip)
      .limit(limit)
      .select("quizId quizTitle quizDesc questionList");

    if (!quizData || quizData.length === 0) {
      return res
        .status(404)
        .json({ message: "No quiz available", success: false });
    }

    const quizList = quizData.map((quiz) => ({
      quizId: quiz.quizId,
      quizTitle: quiz.quizTitle,
      quizDesc: quiz.quizDesc,
      lengthOfQuestionList: quiz.questionList.length,
    }));

    return res.status(200).json({
      quizList,
      currentPage: page,
      totalPages: Math.ceil(totalQuiz / limit),
      totalQuiz,
      message: "Successfully get quiz list",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getQuizDropdown = async (req, res) => {
  try {
    const quizList = await QuizModel.find({}).select("quizId quizTitle");

    if (!quizList || quizList.length === 0) {
      return res
        .status(404)
        .json({ message: "No quiz available", success: false });
    }

    return res
      .status(200)
      .json({ quizList, message: "Successfully get quiz list", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const deleteQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;

    const isPresent = await QuizModel.findOne({quizId});
    if(!isPresent){
      return res.status(404).json({message:"Quiz not available", success: false});
    }

    const lessonDtl = await LessonModel.findOne({ quizId }, { courseId: 1 });

    let courseName = "";
    if (lessonDtl) {
      const courseDtl = await CoursesModel.findOne(
        {
          courseId: lessonDtl.courseId,
        },
        {
          courseName: 1,
        }
      );

      courseName = courseDtl.courseName;

      return res.status(400).json({message:`Quiz is assigned to ${courseName}. Unassign to delete`, success: false});
    }

    const isDelQuiz = await QuizModel.findOneAndDelete({quizId});
    if(!isDelQuiz){
      return res.status(404).json({message:"Quiz not available", success: false});
    }

    await QuestionModel.deleteMany({quizId});

    return res.status(200).json({message:"Quiz delete successfully", success: true});

  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

module.exports = { addQuiz, getAllQuizList, getQuizDropdown, deleteQuizById };
