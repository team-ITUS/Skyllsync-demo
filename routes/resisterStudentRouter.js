const express = require("express");
// const router = express.Router();
const { upload } = require("../services/fileUploadService");
const {
  checkEmail,
  checkPhone,
  registerStudent,
  getAllStudents,
  getRegisteredStudentsDetails,
  deleteStudentById,
  getStudentsByIds,
  getRegisteredStud,
  registerMultiple,
  importStudents,
  getStudById,
  updateStudById,
  downloadExcel,
  searchStudent,
  filterStudents,
  studentByLink,
  reuploadProfilePhoto
} = require("../controllers/resisterStudentController");

const studentRouter = express.Router();

// Define Routes
studentRouter.post("/check-email", checkEmail);
studentRouter.post("/check-phone", checkPhone);
studentRouter.post(
  "/submit/:token",
  upload.fields([
    { name: "imagePath", maxCount: 1 },
    { name: "aadharImage", maxCount: 1 },
  ]), 
  studentByLink); // For student registration via link
studentRouter.post(
  "/register",
  upload.fields([
    { name: "imagePath", maxCount: 1 },
    { name: "aadharImage", maxCount: 1 },
  ]),
  registerStudent
);
studentRouter.get("/students", getAllStudents);
studentRouter.post("/getStudentsByIds", getStudentsByIds);

// Route to get all registered students details
studentRouter.get("/registered-students", getRegisteredStudentsDetails);

// Define the delete route
studentRouter.delete("/delete-student/:studentId", deleteStudentById);

//add SL: 18/10/2024
studentRouter.get("/getRegisteredStud", getRegisteredStud);

studentRouter.post(
  "/registerMultiple",
  upload.single("file"),
  registerMultiple
);

studentRouter.post("/import", importStudents);
studentRouter.get('/downloadExcel', downloadExcel);
studentRouter.get("/getStudById/:studentId", getStudById); // get single student by studentId
// studentRouter.put('/updateStudById/:studentId',upload.file("file"),updateStudById); //update student by studentId

studentRouter.put(
  "/updateStudById/:studentId",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "aadharImage", maxCount: 1 },
  ]),
  updateStudById
);

studentRouter.put(
  "/reupload-profile-photo/:studentId",
  upload.fields([{ name: "imagePath", maxCount: 1 }]),
  reuploadProfilePhoto
);

studentRouter.get('/searchStudent',searchStudent);//search student
// Student filter (reusable search service)
studentRouter.get('/filter-students', filterStudents);

module.exports = { studentRouter };
