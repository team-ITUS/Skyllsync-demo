const { CoursesModel } = require("../models/coursesModel");
const { SessionModel } = require("../models/sessionModel");
const { LessonModel } = require("../models/lessonModel");
const { BatchModel } = require("../models/batchModel");
const {StudBatchModel} = require('../models/studBatchModel');
const {QuizModel} = require('../models/quizModel');
const { log, warn, error, info } = require('../utils/logger');

//create course
const createCourse = async (req, res) => {
  const { courseName, creatorId } = req.body;
  try {
    if (!courseName) {
      return res
        .status(400)
        .json({ message: "Please provide course name", success: false });
    }

    if (!creatorId) {
      return res
        .status(400)
        .json({ message: "Creator name not available", success: false });
    }

    let imagePath;
    if (req.file) {
      const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          message: "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
          success: false,
        });
      }

      imagePath = req.file.destination + req.file.filename;
    }

    const coursesModel = new CoursesModel({
      courseName: courseName,
      courseDesc: req.body.courseDesc,
      creatorName: req.body.creatorName,
      creatorId: req.body.creatorId,
      createDate: req.body.createDate,
      courseLevel: req.body.courseLevel,
      courseCategory: req.body.courseCategory,
      catId: req.body.catId,
      courseThumbnail: imagePath,
    });

    await coursesModel.save();

    return res
      .status(201)
      .json({ message: "Successfully created a course", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

//get all courses
const getAllCourses = async (req, res) => {
  try {
    
    const coursesList = await CoursesModel.find(
      {},
      {
        courseName: 1,
        courseDesc: 1,
        creatorName: 1,
        creatorId: 1,
        createDate: 1,
        courseLevel: 1,
        courseCategory: 1,
        noOfLectures: 1,
        catId: 1,
        courseThumbnail: 1,
        courseId: 1,
      }
    ).sort({createDate : -1});

    if (!coursesList) {
      return res
        .status(404)
        .json({ message: "Courses not available", success: false });
    }

    return res.status(200).json({
      coursesList,
      message: "Successfully found all courses",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

//get full course detail(course->session->lesson)
const getFullCourseDtl = async (req, res) => {
  try {
    const courses = await CoursesModel.aggregate([
      {
        $lookup: {
          from: "sessions", // Lookup sessions
          localField: "courseId", // Match courseId from Courses collection
          foreignField: "courseId", // Match courseId from Sessions collection
          as: "sessions", // Output the result as 'sessions'
        },
      },
      {
        $lookup: {
          from: "lessons", // Lookup lessons
          localField: "sessions.sessionId", // Match sessionId from sessions
          foreignField: "sessionId", // Match sessionId from lessons
          as: "lessons", // Output the result as 'lessons'
        },
      },
      {
        $addFields: {
          // Add lessons to corresponding sessions
          sessions: {
            $map: {
              input: "$sessions",
              as: "session",
              in: {
                sessionName: "$$session.sessionName",
                sessionDesc: "$$session.sessionDesc",
                noOfLessons: "$$session.noOfLessons",
                entryTime: "$$session.entryTime",
                lessons: {
                  $filter: {
                    input: "$lessons", // Filter lessons matching sessionId
                    as: "lesson",
                    cond: {
                      $eq: ["$$lesson.sessionId", "$$session.sessionId"],
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $sort: { createDate: -1 }, // Sort courses by createDate (latest first)
      },
      {
        $addFields: {
          // Sort sessions by entryTime (oldest first)
          sessions: {
            $sortArray: { input: "$sessions", sortBy: { entryTime: 1 } },
          },
        },
      },
      {
        $project: {
          courseName: 1,
          courseDesc: 1,
          creatorName: 1,
          noOfLectures: 1,
          courseLevel: 1,
          courseCategory: 1,
          courseThumbnail: 1,
          createDate: 1,
          sessions: {
            sessionName: 1,
            sessionDesc: 1,
            noOfLessons: 1,
            lessons: {
              lessonName: 1,
              textNote: 1,
              videoUrl: 1,
              attachment: 1,
            },
          },
        },
      },
    ]);

    return res.status(200).json({
      message: "Successfully get all course details",
      success: true,
      data: courses,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

//update course by courseId
const updateCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const updateData = req.body;

    if (!courseId) {
      return res
        .status(400)
        .json({ message: "Course Id is require", success: false });
    }

    let imagePath;
    if (req.file) {
      const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          message: "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
          success: false,
        });
      }

      imagePath = req.file.destination + req.file.filename;
    }

    updateData.courseThumbnail = imagePath;

    const updatedCourse = await CoursesModel.findOneAndUpdate(
      { courseId: courseId },
      { $set: updateData },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course updated successfully!",
      updatedCourse,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

//get single course detail by courseId

const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res
        .status(400)
        .json({ message: "Course Id is require", success: false });
    }

    const course = await CoursesModel.findOne(
      { courseId },
      {
        courseName: 1,
        courseDesc: 1,
        creatorName: 1,
        creatorId: 1,
        createDate: 1,
        courseLevel: 1,
        courseCategory: 1,
        noOfLectures: 1,
        catId: 1,
        courseThumbnail: 1,
      }
    );

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found", success: false });
    }

    return res
      .status(200)
      .json({
        course,
        message: "Successfully get course details",
        success: true,
      });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getFullCourseDtlById = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res
        .status(400)
        .json({ message: "Course Id is require", success: false });
    }

    const course = await CoursesModel.findOne({ courseId });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const sessions = await SessionModel.find({ courseId });

    const sessionWithLessons = await Promise.all(
      sessions.map(async (session) => {
        const lessons = await LessonModel.find({
          sessionId: session.sessionId,
        });
        return {
          ...session.toObject(),
          lessons,
        };
      })
    );

    res.status(200).json({
      success: true,
      course,
      sessions: sessionWithLessons,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};


const deleteCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res
        .status(400)
        .json({ message: "Course Id is require", success: false });
    }

    const batches = await BatchModel.find({ courseId });
    const currentDate = new Date();
    const onGoingBatches = batches.some(
      (batch) => new Date(batch.endDate > currentDate)
    );

    if (onGoingBatches) {
      return res
        .status(400)
        .json({
          message: "Course assigned to batches. Unassign to delete.",
          success: false,
        });
    }

    const isDelete = await CoursesModel.findOneAndDelete({ courseId });

    if (!isDelete) {
      return res
        .status(404)
        .json({ message: "Course not available", success: false });
    }

    await SessionModel.deleteMany({ courseId });
    await LessonModel.deleteMany({ courseId });

    return res
      .status(200)
      .json({ message: "Course deleted successfully", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getMyCourseList = async (req, res) => {
  try {
    const {studentId} = req.params;
    const studBatch = await StudBatchModel.find({studentId});

    if (!studBatch || studBatch.length === 0) {
      return res.status(404).json({ message: "No courses available", success: false });
    }

    const courseIds = studBatch.map((batch) => batch.courseId);

    const courses = await CoursesModel.find({courseId : {$in: courseIds}});

    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: "No course available", success: false });
    }

    const courseList = courses.map((course) => ({
      courseId: course.courseId,
      courseName: course.courseName,
      courseDesc: course.courseDesc,
      courseCategory: course.courseCategory,
      courseThumbnail: course.courseThumbnail,
    }));

    return res.status(200).json({courseList, message:"Successfully get course list", success: true});
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getAllCourseList = async (req, res) => {
  
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;

    const status = req.query.status;
    const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : null;
    const toDate = req.query.toDate ? new Date(req.query.toDate) : null;
    const searchName = req.query.search || ''; 

    if (toDate) {
      toDate.setDate(toDate.getDate() + 1); 
    }

    const skip = Math.max(0, (page - 1) * limit);

    const filter = {};

    if(status){
      filter.courseLevel = status;
    }

    if (fromDate && toDate) {
      filter.createDate = { $gte: fromDate, $lte: toDate };
    }
  
    if (searchName) {
      filter.$or = [
        { courseName: { $regex: searchName, $options: 'i' } }, 
        { creatorName: { $regex: searchName, $options: 'i' } } 
      ];
    }

    const coursesList = await CoursesModel.find(filter)
    .sort({entryTime:-1})
    .skip(skip)
    .limit(limit)
    .select('-createdAt -updatedAt')

    const totalCourse = await CoursesModel.countDocuments(filter);

    if (!coursesList || coursesList.length === 0) {
      return res
        .status(404)
        .json({ message: "Course not available", success: false });
    }

    return res.status(200).json({
      coursesList,
      currentPage: page,
      totalPages: Math.ceil(totalCourse / limit),
      totalCourse,
      message: "Successfully found all courses",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getFullCourseDtl,
  updateCourseById,
  getCourseById,
  getFullCourseDtlById,
  deleteCourseById,
  getMyCourseList,
  getAllCourseList,
};

