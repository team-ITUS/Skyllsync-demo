const express = require("express");
const { upload } = require("../services/fileUploadService");
const {
  createCourse,
  getAllCourses,
  getFullCourseDtl,
  updateCourseById,
  getCourseById,
  getFullCourseDtlById,
  deleteCourseById,
  getMyCourseList,
  getAllCourseList,
} = require("../controllers/courseController");

const courseRouter = express.Router();

courseRouter.post("/createCourse", upload.single("file"), createCourse); //create coures
courseRouter.get("/getAllCourses", getAllCourses); //get all courses list
courseRouter.get("/getFullCourseDtl", getFullCourseDtl); //get full course detail(course->session->lesson)
courseRouter.put(
  "/updateCourseById/:courseId",
  upload.single("file"),
  updateCourseById
); //update course detail by courseId
courseRouter.get("/getCourseById/:courseId", getCourseById); //get single course by courseId
courseRouter.get("/getFullCourseDtlById/:courseId", getFullCourseDtlById); // get full course detail of single course by courseId
courseRouter.delete("/deleteCourseById/:courseId", deleteCourseById); // course delete by courseId

courseRouter.get("/getMyCourseList/:studentId", getMyCourseList); //get student assign course list
courseRouter.get("/getAllCourseList", getAllCourseList); //get student assign course list

module.exports = { courseRouter };
