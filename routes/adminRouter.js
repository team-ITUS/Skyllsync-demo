const express = require("express");

const {
  adminLogin,
  getAllCourseDtl,
  getUnApprovedCourses,
  updateCourseStatus,
  sendMessageToWA,
  getAdminDBDtl,
  commonLogIn,
  getAdminDtl,
  updateAdminDtl,
} = require("../controllers/adminController");

const { createAccessor } = require("../controllers/accessorController");
const { createTrainer } = require("../controllers/trainerController");

const {
  enrolledStudent,
  getEnrolledStudents,
  deleteStudentById,
} = require("../controllers/enrolledStudentController");

const { upload } = require("../services/fileUploadService");

const adminRouter = express.Router();

adminRouter.post("/adminLogin", adminLogin); //admin login
adminRouter.post(
  "/createAccessor",
  upload.fields([
    { name: "imagePath", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  createAccessor
); //create accessor**
adminRouter.post("/createTrainer", upload.single("file"), createTrainer); //create trainer**
adminRouter.post("/enrolledStudent", enrolledStudent); // admin can direct enrolled student
adminRouter.get("/getAllCourseDtl", getAllCourseDtl); // get all coures detail for admin
adminRouter.get("/getUnApprovedCourses", getUnApprovedCourses); //get unapprove courses detail for admin
adminRouter.put("/updateCourseStatus", updateCourseStatus); // unapprove/active/inactive course by admin
adminRouter.get("/getEnrolledStudents", getEnrolledStudents); //get all enrolled students
adminRouter.delete("/deleteStudentById/:studentId", deleteStudentById); //delete student by studentId
adminRouter.get("/getAdminDBDtl", getAdminDBDtl); //get admin dashboard details
adminRouter.get("/getAdminDtl", getAdminDtl); //get admin detail for profile-setting
adminRouter.put(
  "/updateAdminDtl",
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  updateAdminDtl
);

//common login
adminRouter.post("/commonLogIn", commonLogIn);

adminRouter.post("/sendMessageToWA", sendMessageToWA); //send whatapp message

module.exports = { adminRouter };
