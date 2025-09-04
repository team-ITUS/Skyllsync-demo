const Studentmodel = require("../models/resisterStudentModel");
const { BatchModel } = require("../models/batchModel");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
const { transporter } = require("../services/sendMailService");
const { StudBatchModel } = require("../models/studBatchModel");
const { IssuedCertificateModel } = require("../models/issuedCertificateModel");
const BatchShareToken = require("../models/batchShareTokenModel");
const { deleteFile } = require("../services/fileUploadService");
const { log, warn, error, info } = require('../utils/logger');
const { isFileAccessible } = require("../utils/validateUploadedFile");
const { searchStudents } = require("../services/searchService");

// Check if Email Exists
exports.checkEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Studentmodel.findOne({ email: email }).select(
      "name email"
    );

    if (user) {
      res.json({
        exists: true,
        name: user.name,
      });
    } else {
      res.json({ exists: false });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Check if Phone Exists
exports.checkPhone = async (req, res) => {
  const { phone } = req.body;
  try {
    const user = await Studentmodel.findOne({ mobile: phone });
    if (user) {
      // If user exists, respond with the userName (profileName in your case)
      res.json({
        exists: true,
        userName: user.name, // Return profileName (or whatever field is used for the name)
        studentId: user.studentId,
      });
    } else {
      // If user does not exist, respond accordingly
      res.json({ exists: false });
    }
  } catch (error) {
    res.status(500).json({ message: "Error checking phone number" });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Studentmodel.find().sort({ createdAt: -1, name: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch all registered students with details
exports.getRegisteredStudentsDetails = async (req, res) => {
  try {
    const students = await Studentmodel.find().sort({ createdAt: -1, name: 1 });

    if (!students) {
      return res
        .status(404)
        .json({ message: "No student available", success: false });
    }

    return res.json({
      message: "Successfully get all students",
      success: true,
      students,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteStudentById = async (req, res) => {
  const { studentId } = req.params;

  try {
    const deletedStudent = await Studentmodel.findOneAndDelete({ studentId });

    if (!deletedStudent) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found!" });
    }

    //remove student from batch
    await BatchModel.updateMany(
      { studentIds: studentId },
      { $pull: { studentIds: studentId } }
    );

    //remove student from studbatch
    await StudBatchModel.deleteMany({ studentId });

    //remove student from issued certificate
    await IssuedCertificateModel.updateMany(
      { "studList.studentId": studentId },
      { $pull: { studList: { studentId } } }
    );

    return res
      .status(200)
      .json({ success: true, message: "Student deleted successfully!" });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// exports.getStudentsByIds = async (req, res) => {
//   try {
//     const { studIdsList } = req.body;

//     if (!studIdsList || studIdsList.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "Student ID list is required", success: false });
//     }

//     const studNameIds = await Studentmodel.find(
//       { studentId: { $in: studIdsList } },
//       "name studentId email mobile"
//     );

//     if (studNameIds.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No students found", success: false });
//     }

//     res.status(200).json({
//       studNameIds,
//       message: "Students retrieved successfully",
//       success: true,
//     });
//   } catch (error) {
//     return res.status(500).json({ message: error.message, success: false });
//   }
// };

exports.getStudentsByIds = async (req, res) => {
  try {
    const { studIdsList } = req.body;
    const { page = 1, limit = 10, search = "" } = req.body;

    if (!studIdsList || studIdsList.length === 0) {
      return res
        .status(400)
        .json({ message: "Student ID list is required", success: false });
    }

    // Fetch students matching IDs and search criteria
    let students = await Studentmodel.find(
      {
        studentId: { $in: studIdsList },
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { mobile: { $regex: search, $options: "i" } },
          { isProfile: { $regex: search, $options: "i" } },
        ],
      },
      "name studentId email mobile isProfile"
    ).sort({ name: 1 });

    const totalStudents = students.length;

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedStudents = students.slice(
      startIndex,
      startIndex + parseInt(limit)
    );

    if (paginatedStudents.length === 0) {
      return res
        .status(404)
        .json({ message: "No students found", success: false });
    }

    return res.status(200).json({
      students: paginatedStudents,
      currentPage: parseInt(page),
      totalStudents,
      totalPages: Math.ceil(totalStudents / limit),
      message: "Students retrieved successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

exports.getRegisteredStud = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      searchTerm,
      dateFrom,
      dateTo,
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    let query = {};

    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
        { mobile: { $regex: searchTerm, $options: "i" } },
      ];
    }

    if (dateFrom && dateTo) {
      query.createdAt = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo),
      };
    }

    const studentDtl = await Studentmodel.find(query)
      .sort({ createdAt: -1, name: 1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const totalStudents = await Studentmodel.countDocuments(query);

    if (!studentDtl.length) {
      return res.status(404).json({
        message: "No Student available",
        success: false,
      });
    }
    
    return res.status(200).json({
      studentDtl,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalStudents / limitNumber),
      totalStudents,
      message: "Successfully retrieved students",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const excelDateToJSDate = (serial) => {
  const utc_days = Math.floor(serial) + 25569;
  const utc_value = utc_days * 86400;
  return new Date(utc_value * 1000);
};

exports.registerMultiple = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ message: "No file uploaded", success: false });
    }

    // Read the file from disk
    const filePath = path.join(
      __dirname,
      "..",
      "uploads/excels",
      file.filename
    );
    const workbook = XLSX.readFile(filePath);

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const students = [];
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];

      if (
        row.name &&
        // row.nickname &&
        row.email &&
        row.dob &&
        row.gender &&
        row.mobile
      ) {
        const dob =
          typeof row.dob === "number"
            ? excelDateToJSDate(row.dob)
            : new Date(row.dob);

        const imageCell = worksheet[`A${rowIndex + 2}`];
        const image = imageCell ? imageCell.v : null;

        const imagePath = path.join(
          __dirname,
          "..",
          "uploads/images",
          `${row.name.replace(/\s/g, "_")}.png`
        );

        if (image) {
          fs.writeFileSync(imagePath, image, { encoding: "base64" });
        }

        const student = {
          name: row.name,
          nickname: row.nickname || "",
          dob: dob, // Use the converted date
          email: row.email || "",
          gender: row.gender || "",
          mobile: row.mobile || "",
          adhaarNo: row.adhaarNo || "",
          imagePath: imagePath, // Store the path of the saved image
        };

        students.push(student);
      }
    }

    if (students.length > 0) {
      // await Studentmodel.insertMany(students);
      return res
        .status(200)
        .json({ message: "Students uploaded successfully", success: true });
    } else {
      return res
        .status(400)
        .json({ message: "No valid student data found", success: false });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

exports.registerStudent = async (req, res) => {
  const {
    name,
    email,
    dob,
    gender,
    mobile,
    occupation,
    qualification,
    address,
    bloodGrp,
  } = req.body;

  try {
    const isMobileExist = await Studentmodel.findOne({ mobile });
    if (isMobileExist) {
      return res
        .status(403)
        .json({ message: "Mobile number already exists", success: false });
    }

    let imagePath;
    if (req.files && req.files.imagePath) {
      const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validMimeTypes.includes(req.files.imagePath[0].mimetype)) {
        return res.status(400).json({
          message: "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
          success: false,
        });
      }
      imagePath =
        req.files.imagePath[0].destination + req.files.imagePath[0].filename;
    }

    let adhaarImagePath;
    if (req.files && req.files.aadharImage) {
      const validMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
      ];
      if (!validMimeTypes.includes(req.files.aadharImage[0].mimetype)) {
        return res.status(400).json({
          message:
            "Invalid file type for Aadhaar. Only JPG, JPEG, PNG, and PDF are allowed.",
          success: false,
        });
      }
      adhaarImagePath =
        req.files.aadharImage[0].destination +
        req.files.aadharImage[0].filename;
    }

    let count = (await Studentmodel.countDocuments()) || 0;

    count = count + 1;

    const newStudent = new Studentmodel({
      name,
      email,
      dob,
      gender,
      mobile,
      imagePath,
      adhaarImage: adhaarImagePath,
      occupation,
      qualification,
      address,
      bloodGrp,
      autoIndex: count,
    });

    const isSave = await newStudent.save();

    // Send email to student
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Your account has been registered",
      html: `
        <p>Hi <strong>${name}</strong>,</p>
        <p><strong>Welcome!</strong></p>
        <p>Thank you for using our service.</p>
        <p>If you did not register an account with us, our staff may have created your account based on your request. This notification is to let you know that your account is now available to use.</p>
        <p><strong>Your details are as follows:</strong></p>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Mobile:</strong> ${mobile}</li>
        </ul>
        <p>Thank you for registering with us!</p>
        <p>Best regards,<br>IRA</p>
      `,
    };

    return res.status(201).json({
      message: "Successfully registered student",
      student: isSave,
      success: true,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email or mobile number already exists", success: false
      });
    } else {
      return res.status(500).json({ message: error, success: false });
    }
  }
};

// Controller: studentByLink
exports.studentByLink = async (req, res) => {
  try {
    const { token } = req.params;
    // 1) Verify token
    const tokenDoc = await BatchShareToken.findOne({
      token,
      expiresAt: { $gt: new Date() }
    });
    if (!tokenDoc) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired link"
      });
    }

    // 2) Verify batch
    if (!tokenDoc.batchId) {
      return res.status(400).json({
        success: false,
        message: "Batch ID missing or invalid in share link"
      });
    }
    const batch = await BatchModel.findOne({ batchId: tokenDoc.batchId });
    if (!batch || batch.byTrainer === "Completed") {
      return res.status(400).json({
        success: false,
        message: "Batch is already completed"
      });
    }

    // 3) Validate required text fields
    const required = ['name','email','dob','gender','mobile'];
    const missing = required.filter(f => !req.body[f]?.toString().trim());
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`
      });
    }

    const {
      name,
      email,
      dob,
      gender,
      mobile,
      occupation = '',
      qualification = '',
      address = '',
      bloodGrp = ''
    } = req.body;

    try {
      // 4) Check existing student by mobile
      const existing = await Studentmodel.findOne({ mobile });
      if (existing?.isProfile === "Completed") {
        if(batch.studentIds.includes(existing.studentId)) {
          return res.status(400).json({
          success: false,
          message: "Can't update an already completed profile"
          });
        } else {
          batch.studentIds.push(existing.studentId);
          await batch.save();
          return res.status(200).json({
            success: true,
            message: "Profile already exists, but not in this batch! Adding to batch.",
            student: existing
          });
        }
        
      }

      // 5) Handle optional uploads
      let imagePath;
      if (req.files?.imagePath?.length > 0) {
        const file = req.files.imagePath[0];
        const mime = file.mimetype;
        if (!["image/jpeg","image/png","image/jpg"].includes(mime)) {
          return res.status(400).json({
            success: false,
            message: "Invalid file type for profile photo. Only JPG, JPEG, PNG allowed."
          });
        }
        const possiblePath = file.destination + file.filename;
        if (!isFileAccessible(possiblePath)) {
          return res.status(400).json({
            success: false,
            message: "Profile photo was not uploaded successfully. Please try again."
          });
        }
        imagePath = possiblePath;
      }

      let adhaarImagePath;
      if (req.files?.aadharImage?.length > 0) {
        const file = req.files.aadharImage[0];
        const mime = file.mimetype;
        if (!["image/jpeg","image/png","image/jpg","application/pdf"].includes(mime)) {
          return res.status(400).json({
            success: false,
            message: "Invalid file type for Aadhaar. Only JPG, JPEG, PNG, PDF allowed."
          });
        }
        const possiblePath = file.destination + file.filename;
        if (!isFileAccessible(possiblePath)) {
          return res.status(400).json({
            success: false,
            message: "Profile photo was not uploaded successfully. Please try again."
          });
        }
        adhaarImagePath = possiblePath;
      }

      // 6) Create or update student
      let student;
      if (!existing) {
        // assign autoIndex
        const count = (await Studentmodel.countDocuments()) + 1;
        student = await Studentmodel.create({
          name,
          email,
          dob,
          gender,
          mobile,
          occupation,
          qualification,
          address,
          bloodGrp,
          imagePath,
          adhaarImage: adhaarImagePath,
          autoIndex: count
        });

        // update batch
        await BatchModel.updateOne(
          { batchId: tokenDoc.batchId },
          { $addToSet: { studentIds: student.studentId } }
        );

        // send welcome email
        await sendWelcomeEmail({ to: email, name, mobile });

      } else {
        // remove old files if replaced
        if (imagePath && existing.imagePath) deleteFile(existing.imagePath);
        if (adhaarImagePath && existing.adhaarImage) deleteFile(existing.adhaarImage);

        // update fields
        existing.name = name;
        existing.email = email;
        existing.dob = dob;
        existing.gender = gender;
        existing.mobile = mobile;
        existing.occupation = occupation;
        existing.qualification = qualification;
        existing.address = address;
        existing.bloodGrp = bloodGrp;
        if (imagePath) existing.imagePath = imagePath;
        if (adhaarImagePath) existing.adhaarImage = adhaarImagePath;

        student = await existing.save();

        // ensure batch has this student
        await BatchModel.updateOne(
          { batchId: tokenDoc.batchId },
          { $addToSet: { studentIds: student.studentId } }
        );
      }

      // 7) Return success
      return res.json({ success: true, student });

    } catch (innerErr) {
      // model/create/update error
      return res.status(500).json({
        success: false,
        message: innerErr.message || 'Server error during student save'
      });
    }

  } catch (err) {
    // token lookup or other top-level error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email or mobile number already exists"
      });
    }
    return res.status(500).json({
      success: false,
      message: err.message || 'Unexpected server error'
    });
  }
};

// helper to send welcome email
async function sendWelcomeEmail({ to, name, mobile }) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject: "Your account has been registered",
    html: `
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your registration is complete! Your mobile: <strong>${mobile}</strong>.</p>
      <p>If you did not sign up, please contact support.</p>
      <p>Thank you!</p>
    `
  };
  // assume you have a preconfigured nodemailer transporter
  await transporter.sendMail(mailOptions);
}

// Controller for importing bulk student data
exports.importStudents = async (req, res) => {
  const students = req.body.students; // Extracting the imported student data
  const failedStud = [];
  const existing = [];
  const validInputs = [];
  try {
    // Loop through each student and save the details
    let count = (await Studentmodel.countDocuments()) || 0;
    for (let student of students) {
      const {
        name,
        email,
        dob,
        gender,
        mobile,
        occupation,
        qualification,
        address,
        bloodGrp,
      } = student;


      if (!name || !email || !dob || !gender || !mobile) {
        failedStud.push({
          studentName: name,
          email: email,
          mobile: mobile,
          reason: "Invalid data.",
        });
        continue;
      }
      
      const isExist = await Studentmodel.findOne({
        $or: [{ email }, { mobile }],
      });

      if (isExist) {
        existing.push({
          studentId: isExist.studentId,
          studentName: name,
          email: email,
          mobile: mobile,
          reason: "Dublicate data.",
        });
        continue;
      }

      count = count + 1;

      // Create a new student record
      const newStudent = new Studentmodel({
        name,
        email,
        dob,
        gender,
        mobile,
        occupation,
        qualification,
        address,
        bloodGrp,
        isProfile: "Rejected",
        autoIndex: count,
      });

      // Save the student
      const isSave = await newStudent.save();
      validInputs.push(isSave);
      // Send email to student
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: "Your account has been successfully registered",
        html: `
          <p>Hi <strong>${name}</strong>,</p>

          <p><strong>Welcome!</strong></p>

          <p>Thank you for using our service.</p>

          <p>If you did not register an account with us, our staff may have created your account based on your request. This notification is to let you know that your account is now available to use.</p>

          <p><strong>Your details are as follows:</strong></p>
          <ul>
            <li><strong>Name:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Mobile:</strong> ${mobile}</li>
          </ul>

          <p>Thank you for registering with us!</p>

          <p>Best regards,<br>IRA</p>
        `,
      };

      // Send email for each student
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          // console.log("Error sending email for student " + name, error);
        } else {
          // console.log("Email sent to " + name + ": " + info.response);
        }
      });
    }

    if (failedStud.length > 0) {
      // Create a workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(failedStud);

      XLSX.utils.book_append_sheet(workbook, worksheet, "Failed Students");

      // Define file path
      const filePath = path.join(
        __dirname,
        "../uploads/excels/failed_students.xlsx"
      );
      XLSX.writeFile(workbook, filePath);

      // Send the Excel file as a response
      return res.download(filePath, "failed_students.xlsx", (err) => {
        if (err) {
          error("If based Error sending Excel file:", err);
          return res
            .status(500)
            .json({ success: false, message: "Error generating Excel file" });
        }
        // Optional: Delete file after sending response
        fs.unlinkSync(filePath);
      });
    }
    return res.status(201).json({
      message: "Successfully imported students and emails sent",
      students: validInputs,
      existingStud: existing,
      success: true,
    });
  } catch (error) {
    // console.log("Catch Wala Error importing students:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

//get single student detail by studentId
exports.getStudById = async (req, res) => {
  try {
    const { studentId } = req.params;

    const studentDtl = await Studentmodel.findOne({ studentId });

    if (!studentDtl) {
      return res
        .status(404)
        .json({ message: "Student not exist", success: false });
    }

    return res.status(200).json({
      studentDtl,
      message: "Successfully get student details",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

exports.updateStudById = async (req, res) => {
  try {
    const { studentId } = req.params;

    let profileImagePath, aadharImagePath;

    if (req.files) {
      if (req.files.profileImage) {
        const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!validMimeTypes.includes(req.files.profileImage[0].mimetype)) {
          return res.status(400).json({
            message:
              "Invalid profile image type. Only JPG, JPEG, and PNG are allowed.",
            success: false,
          });
        }
        profileImagePath =
          req.files.profileImage[0].destination +
          req.files.profileImage[0].filename;
      }

      if (req.files.aadharImage) {
        const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!validMimeTypes.includes(req.files.aadharImage[0].mimetype)) {
          return res.status(400).json({
            message:
              "Invalid aadhar image type. Only JPG, JPEG, and PNG are allowed.",
            success: false,
          });
        }
        aadharImagePath =
          req.files.aadharImage[0].destination +
          req.files.aadharImage[0].filename;
      }
    }

    req.body.imagePath = profileImagePath;
    req.body.adhaarImage = aadharImagePath;

    const updatedStudent = await Studentmodel.findOneAndUpdate(
      { studentId: studentId },
      req.body,
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        message: "Student does not exist for update details",
        success: false,
      });
    }

    return res
      .status(200)
      .json({ message: "Student details updated successfully", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

exports.downloadExcel = async (req, res) => {
  try {
    const filePath = path.join(
      __dirname,
      "../uploads/excels/file-1729337760924.xlsx"
    );
    const fileName = "SampleExcel.xlsx";

    fs.stat(filePath, (err, stats) => {
      if (err) {
        if (err.code === "ENOENT") {
          return res
            .status(404)
            .json({ message: "File not found", success: false });
        }

        return res
          .status(500)
          .json({ message: "Error checking file", success: false });
      }

      res.download(filePath, fileName, (downloadErr) => {
        if (downloadErr) {
          return res
            .status(500)
            .json({ message: "Error downloading file", success: false });
        }
      });
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

exports.searchStudent = async (req, res) => {
  try {
    const { query } = req.query;

    const students = await Studentmodel.find(
      {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
          { mobile: { $regex: query, $options: "i" } },
        ],
      },
      { studentId: 1, name: 1, email: 1, mobile: 1 }
    ).sort({ createdAt: -1, name: 1 });

    return res.status(200).json({
      message: "Successfully get students.",
      success: true,
      data: students,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Student Filter using reusable Search Service
// GET via query params: certificateId, batchName, courseName, branchName, startDate, endDate, page, limit, sortBy, sortOrder
exports.filterStudents = async (req, res) => {
  try {
    const {
      certificateId,
      batchName,
      courseName,
      branchName,
      startDate,
      endDate,
      page,
      limit,
      sortBy,
      sortOrder,
    } = req.query;

    const filters = {};
    if (certificateId) filters.certificateId = String(certificateId);
    if (batchName) filters.batchName = String(batchName);
    if (courseName) filters.courseName = String(courseName);
    if (branchName) filters.branchName = String(branchName);
    if (startDate) filters.startDate = String(startDate);
    if (endDate) filters.endDate = String(endDate);

    const options = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sortBy,
      sortOrder,
    };

    const result = await searchStudents(filters, options);

    return res.status(200).json({
      message: "Successfully filtered students",
      success: true,
      students: result.items,
      totalCount: result.totalCount,
      page: result.page,
      limit: result.limit,
      appliedFilters: result.appliedFilters,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

exports.reuploadProfilePhoto = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        message: "Student ID is required",
        success: false,
      });
    }

    // Find student
    const student = await Studentmodel.findOne({ studentId });
    if (!student) {
      return res.status(404).json({
        message: "Student not found",
        success: false,
      });
    }

    // Validate and process new image
    let newImagePath;
    if (req.files && req.files.imagePath) {
      const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validMimeTypes.includes(req.files.imagePath[0].mimetype)) {
        return res.status(400).json({
          message: "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
          success: false,
        });
      }
      newImagePath =
        req.files.imagePath[0].destination + req.files.imagePath[0].filename;
    } else {
      return res.status(400).json({
        message: "Profile image is required",
        success: false,
      });
    }

    // Delete old image if exists
    if (student.imagePath) {
      deleteFile(student.imagePath);
    }

    // Update student record
    student.imagePath = newImagePath;
    student.isProfile = "Pending";
    await student.save();

    return res.status(200).json({
      message: "Profile photo re-uploaded successfully. Awaiting admin approval.",
      success: true,
      student,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};
