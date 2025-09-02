const { EnrolledStudentModel } = require("../models/enrolledStudentModel");
const { transporter } = require("../services/sendMailService");
const StudentModel = require('../models/resisterStudentModel');
const { log, warn, error, info } = require('../utils/logger');

const dotenv = require("dotenv");

dotenv.config();

const enrolledStudent = async (req, res) => {
  const { studentMobNo, studentEmail, enrolledBy } = req.body;
  try {
    if (!studentMobNo) {
      return res
        .status(400)
        .json({ message: "Mobile number is required", success: false });
    }

    if (!studentEmail) {
      return res
        .status(400)
        .json({ message: "Email is required", success: false });
    }

    const enrolledStudentModel = new EnrolledStudentModel({
      studentName: req.body.studentName,
      studentNickName: req.body.studentNickName,
      studentEmail: studentEmail,
      studentMobNo: studentMobNo,
      studentDob: req.body.studentDob,
      studentGender: req.body.studentGender,
      enrolledCourse: req.body.enrolledCourse,
      enrolledCourseId: req.body.enrolledCourseId,
      enrolledDate: req.body.enrolledDate,
      enrolledBy: enrolledBy ? "admin" : "student",
    });

    const isSave = await enrolledStudentModel.save();

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: studentEmail,
      subject: `${req.body.enrolledCourse} enrollement`,
      text: `You have successfully enrolled for ${req.body.enrolledCourse} 
                   by using using your mobile number ${studentMobNo} you can login`,
    };

    if (isSave) {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          // return res.status(500).send({ message: 'Error sending email', error });
        }
      });
    }

    return res
      .status(201)
      .json({ message: "Student successfully enrolled", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const enrollMultipleStd = async (req, res)=>{
  try {
    const {courseId, courseName, studentList} = req.body;

    if(!courseId){
      return res.status(400).json({ message: "Course Id is required", success:false });
    }

    if (!studentList || studentList.length === 0) {
      return res.status(400).json({ message: "No students to enroll", success:false });
    }

    const enrollments = studentList.map(student => ({
      studentId: student.studentId,
      studentName: student.studentName,
      enrolledCourseId: courseId,
      enrolledCourse: courseName,
      enrolledBy:"admin"
    }));

    await EnrolledStudentModel.insertMany(enrollments);

    return res.status(200).json({
      message: "Students enrolled successfully",
      success: true,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getEnrolledStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const totalStudents = await EnrolledStudentModel.countDocuments();

    const students = await EnrolledStudentModel.find(
      {},
      {
        studentName: 1,
        studentNickName: 1,
        studentEmail: 1,
        studentMobNo: 1,
        studentGender: 1,
        enrolledCourse: 1,
        enrolledCourseId: 1,
        studentId:1,
        enrolledDate: 1,
        paymentStatus:1,
        completeStatus:1,
        isIssued:1,
        progress:1,
      }
    )
      .skip(skip)
      .limit(limit);

    if (!students || students.length === 0) {
      return res
        .status(404)
        .json({ message: "Students not available", success: false });
    }

    return res.status(200).json({
      message: "Successfully retrieved all students",
      success: true,
      students,
      totalStudents,
      totalPages: Math.ceil(totalStudents / limit),
      currentPage: page,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};


const deleteStudentById = async (req,res)=>{
  try {
      const { studentId } = req.params;

      const deletedStudent = await EnrolledStudentModel.findOneAndDelete({studentId});

      if(!deletedStudent){
          return res.status(404).json({message: "Student not exist", success: false})
      }

      return res.status(200).json({
          message: "Student deleted successfully",
          success: true
      });
  } catch (error) {
      return res.status(500).json({ message: error.message, success: false });
  }
}

const getAllStudWithCors = async (req, res) => {
  try {
    
    const page = parseInt(req.query.page) || 1;  
    const limit = parseInt(req.query.limit) || 15; 
    // const getAll = req.query.getAll; 
    const skip = (page - 1) * limit;  

    const studentDetails = await StudentModel.aggregate([
      {
        $lookup: {
          from: 'enrolledstudents', 
          localField: 'studentId', 
          foreignField: 'studentId', 
          as: 'enrolledCourses'  
        }
      },
      {
        $unwind: {
          path: "$enrolledCourses"
        }
      },
      {
        $project: {
          _id: "$studentId",
          studentId: "$studentId",
          name: "$name",
          nickname: "$nickname",
          dob: "$dob",
          gender: "$gender",
          email: "$email",
          mobile: "$mobile",
          enrolledCourseId: "$enrolledCourses.enrolledCourseId",
          enrolledCourse: "$enrolledCourses.enrolledCourse",
          paymentStatus: "$enrolledCourses.paymentStatus",
          completeStatus: "$enrolledCourses.completeStatus",
          isIssued: "$enrolledCourses.isIssued",
          progress: "$enrolledCourses.progress",  
          enrolledDate: "$enrolledCourses.enrolledDate",
          isInBatch: "$enrolledCourses.isInBatch"
        }
      },
      { $skip: skip },  
      { $limit: limit } 
    ]);

   
    const totalStudents = await StudentModel.countDocuments();
    

    if (!studentDetails || studentDetails.length === 0) {
      return res.status(404).json({ message: "No students found", success:false });
    }

   
    return res.status(200).json({
      studentDetails,
      currentPage: page,
      totalPages: Math.ceil(totalStudents / limit),
      totalStudents,
      message:"Successfully get all enrolled students",
      success: true,
    });
  } catch (error) {
   
    return res.status(500).json({ message: error.message, success: false });
  }
};


module.exports = { enrolledStudent, enrollMultipleStd, getEnrolledStudents, deleteStudentById, getAllStudWithCors };
