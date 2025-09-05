const { BatchModel } = require("../models/batchModel");
const { StudBatchModel } = require("../models/studBatchModel");
const Studentmodel = require("../models/resisterStudentModel");
const { IssuedCertificateModel } = require("../models/issuedCertificateModel");
const BatchShareToken = require("../models/batchShareTokenModel");
const { v4: uuidv4 } = require("uuid");
const { deleteFile, 
  uploadPhotosFromZip 
} = require('../services/fileUploadService');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const { issueExtraStudentsToBatch } = require("../services/generateCertService");
const { log, warn, error, info } = require('../utils/logger');
const multer = require('multer');
const { completeBatchByTrainer } = require("../services/batchService");

// configure multer to accept a single ZIP file called "photosZip"
const zipUpload = multer({ storage: multer.memoryStorage() }).single('photosZip');

const uploadMultiPhotos = [
  zipUpload,
  async (req, res) => {
    try {
      const { batchId } = req.params;
      const batch = await BatchModel.findOne({ batchId });
      if (!batch) {
        return res.status(404).json({ success: false, message: 'Batch not found' });
      }

      const { processedStudentIds, missingInDb, missingInBatch } =
        await uploadPhotosFromZip(req.file.buffer, batch.studentIds);

      res.json({
        success: true,
        processedStudentIds,
        missingInDb,
        missingInBatch,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
];

const allCompleteProfile = async (req, res) => {
  try {
    const { batchId } = req.params;
    // 1️⃣ fetch batch
    const batch = await BatchModel.findOne({ batchId });
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    // 2️⃣ update all students in batch.studentIds except those with isProfile === "Rejected"
    const result = await Studentmodel.updateMany(
      {
        studentId: { $in: batch.studentIds },
        $or: [
          { isProfile: { $exists: false } },
          { isProfile: { $ne: 'Rejected' } }
        ]
      },
      { $set: { isProfile: 'Completed' } }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} profiles marked Completed (Except Rejected)`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


const createBatch = async (req, res) => {
  try {
    const { courseId, trainerId, batchName, studentList, selectedAssessments } =
      req.body;
    // console.log(studentList, "studentList in createBatch");
    const studentIds = studentList.map((student) => student.studentId);

    const newBatch = new BatchModel({
      validity: req.body.validity,
      batchName,
      branch: req.body.branch,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      trainerId,
      trainerName: req.body.trainerName,
      accessorId: req.body.accessorId,
      accessorName: req.body.accessorName,
      courseId,
      courseName: req.body.courseName,
      certificateId: req.body.certificateId,
      courseCat: req.body.courseCat,
      studentIds,
      branchId: req.body.branchId,
      licenseId: req.body.licenseId,
      "assessment.grade": selectedAssessments?.grade,
      "assessment.meterDive": selectedAssessments?.meterDive,
    });

    const isSave = await newBatch.save();

    const studBatchPromises = studentIds.map((studentId) => {
      return new StudBatchModel({
        batchId: isSave.batchId,
        studentId,
        courseId,
      }).save();
    });

    await Promise.all(studBatchPromises);

    res.status(201).json({
      message: "Batch created successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getAllBatch = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      uuid,
      searchName,
      dateFrom,
      dateTo,
      statusFilter,
      // new filter params
      courseName,
      batchName,
      date,
      certificateId,
      branch,
      studentName,
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    let query = { deleteStatus: "active" };

    if (role === "accessor") {
      if (!uuid) {
        return res.status(400).json({
          message: "UUID is required for accessor role",
          success: false,
        });
      }
      query.accessorId = uuid;
    } else if (role === "trainer") {
      if (!uuid) {
        return res.status(400).json({
          message: "UUID is required for trainer role",
          success: false,
        });
      }
      query.trainerId = uuid;
    }

    if (searchName) {
      query.$or = [
        { batchName: { $regex: searchName, $options: "i" } },
        { courseName: { $regex: searchName, $options: "i" } },
        { accessorName: { $regex: searchName, $options: "i" } },
        { trainerName: { $regex: searchName, $options: "i" } },
      ];
    }

    // Apply explicit filters (AND semantics)
    if (courseName) {
      query.courseName = { $regex: courseName, $options: "i" };
    }
    if (batchName) {
      query.batchName = { $regex: batchName, $options: "i" };
    }
    if (certificateId) {
      query.certificateId = { $regex: certificateId, $options: "i" };
    }
    if (branch) {
      query.branch = { $regex: branch, $options: "i" };
    }

    // date filter: if single date provided, match batches where startDate <= date <= endDate
    if (date) {
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        query.startDate = { $lte: d };
        query.endDate = { $gte: d };
      }
    } else if (dateFrom && dateTo) {
      query.startDate = { $gte: new Date(dateFrom) };
      query.endDate = { $lte: new Date(dateTo) };
    }

    if (statusFilter === "completed") {
      query.status = "Completed";
    } else if (statusFilter === "ongoing") {
      query.status = "On-Going";
    } else if (statusFilter === "comingsoon") {
      query.status = "Coming Soon";
    }

    // If studentName filter is present, find matching studentIds first and add to query
    if (studentName) {
      try {
        const matchingStudents = await Studentmodel.find(
          { name: { $regex: studentName, $options: "i" } },
          { studentId: 1 }
        );
        const studentIds = matchingStudents.map((s) => s.studentId);
        if (studentIds.length === 0) {
          // No students match - return empty result
          return res.status(200).json({ allBatchDtl: [], currentPage: 1, totalPages: 0, totalBatches: 0, message: "No batch available", success: true });
        }
        // match batches that have any of these studentIds in their studentIds array
        query.studentIds = { $in: studentIds };
      } catch (err) {
        console.error('Error searching students for studentName filter', err);
      }
    }

    const allBatchDtl = await BatchModel.find(query)
      .sort({ updatedAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const totalBatches = await BatchModel.countDocuments(query);

    if (!allBatchDtl.length) {
      return res.status(404).json({
        message: "No batch available",
        success: false,
      });
    }

    return res.status(200).json({
      allBatchDtl,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalBatches / limitNumber),
      totalBatches,
      message: "Successfully retrieved all batch details",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

/**
 * searchBatches
 * Accepts query params:
 *  page, limit,
 *  studentName, batchName, courseName, branch,
 *  batchStart, batchEnd, certificateId
 * Builds a dynamic AND query applying only provided filters.
 * Supports pagination and returns appliedFilters metadata.
 */
const searchBatches = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      studentName,
      batchName,
      courseName,
      branch,
      batchStart,
      batchEnd,
      certificateId,
      role,
      uuid,
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);

    const query = { deleteStatus: 'active' };

    // role scoping (reuse existing logic)
    if (role === 'accessor') {
      if (!uuid) return res.status(400).json({ message: 'UUID is required for accessor role', success: false });
      query.accessorId = uuid;
    } else if (role === 'trainer') {
      if (!uuid) return res.status(400).json({ message: 'UUID is required for trainer role', success: false });
      query.trainerId = uuid;
    }

    const appliedFilters = {};

    if (batchName) {
      query.batchName = { $regex: batchName, $options: 'i' };
      appliedFilters.batchName = batchName;
    }
    if (courseName) {
      query.courseName = { $regex: courseName, $options: 'i' };
      appliedFilters.courseName = courseName;
    }
    if (branch) {
      query.branch = { $regex: branch, $options: 'i' };
      appliedFilters.branch = branch;
    }

    // date range: overlap logic
    if (batchStart || batchEnd) {
      const start = batchStart ? new Date(batchStart) : null;
      const end = batchEnd ? new Date(batchEnd) : null;
      if (start && isNaN(start.getTime())) return res.status(400).json({ message: 'Invalid batchStart', success: false });
      if (end && isNaN(end.getTime())) return res.status(400).json({ message: 'Invalid batchEnd', success: false });
      // overlap: batch.startDate <= end && batch.endDate >= start
      if (start && end) {
        query.$and = query.$and || [];
        query.$and.push({ startDate: { $lte: end } }, { endDate: { $gte: start } });
        appliedFilters.batchStart = batchStart;
        appliedFilters.batchEnd = batchEnd;
      } else if (start) {
        query.endDate = { $gte: start };
        appliedFilters.batchStart = batchStart;
      } else if (end) {
        query.startDate = { $lte: end };
        appliedFilters.batchEnd = batchEnd;
      }
    }

    // studentName -> find studentIds
    if (studentName) {
      const students = await Studentmodel.find({ name: { $regex: studentName, $options: 'i' } }, { studentId: 1 });
      const studentIds = students.map((s) => s.studentId);
      if (!studentIds.length) {
        return res.status(200).json({ items: [], allBatchDtl: [], totalItems: 0, totalBatches: 0, page: pageNumber, limit: limitNumber, appliedFilters: { studentName }, success: true });
      }
      // batches that contain any of these studentIds
      query.studentIds = { $in: studentIds };
      appliedFilters.studentName = studentName;
    }

    // certificateId -> find batches via IssuedCertificateModel entries
    if (certificateId) {
      const issued = await IssuedCertificateModel.find({ 'studList.certificateId': { $regex: certificateId, $options: 'i' } }, { batchId: 1 });
      const batchIds = issued.map((i) => i.batchId).filter(Boolean);
      if (!batchIds.length) {
        return res.status(200).json({ items: [], allBatchDtl: [], totalItems: 0, totalBatches: 0, page: pageNumber, limit: limitNumber, appliedFilters: { certificateId }, success: true });
      }
      query.batchId = { $in: batchIds };
      appliedFilters.certificateId = certificateId;
    }

    // execute query with pagination
    const totalItems = await BatchModel.countDocuments(query);
    const items = await BatchModel.find(query).sort({ updatedAt: -1 }).skip((pageNumber - 1) * limitNumber).limit(limitNumber);

  return res.status(200).json({ items, allBatchDtl: items, totalItems, totalBatches: totalItems, page: pageNumber, limit: limitNumber, totalPages: Math.ceil(totalItems / limitNumber), appliedFilters, success: true });
  } catch (err) {
    console.error('searchBatches error', err);
    return res.status(500).json({ message: err.message, success: false });
  }
};

const deleteBatchById = async (req, res) => {
  try {
    const { batchId } = req.params;

    if (!batchId) {
      return res
        .status(400)
        .json({ message: "Batch Id is require", success: false });
    }

    //check batch is completed or not by admin
    const batchDtl = await BatchModel.findOne({ batchId });

    if (batchDtl?.byAdmin === "Completed") {
      return res.status(400).json({
        message: "Batch is completed by admin. Cannot delete.",
        success: false,
      });
    }

    // const isDelete = await BatchModel.findOneAndDelete({ batchId });
    const isDelete = await BatchModel.findOneAndUpdate(
      { batchId },
      { $set: { deleteStatus: "deleted" } },
      { new: true }
    );

    if (!isDelete) {
      return res
        .status(404)
        .json({ message: "Batch not exist", success: false });
    }

    await StudBatchModel.deleteMany({ batchId });

    return res.status(200).json({
      message: "Batch deleted successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getBatchById = async (req, res) => {
  try {
    const { batchId } = req.params;

    const batchDtl = await BatchModel.findOne({ batchId });

    if (!batchDtl) {
      return res
        .status(404)
        .json({ message: "Batch not available", success: false });
    }

    const studentDetails = await Studentmodel.find({
      studentId: { $in: batchDtl.studentIds },
    });

    const studentMap = studentDetails.reduce((acc, student) => {
      acc[student.studentId] = student.name;
      return acc;
    }, {});

    const transformedBatchDtl = {
      ...batchDtl._doc,
      studentIds: batchDtl.studentIds.map((studentId) => ({
        studentId,
        studentName: studentMap[studentId] || "Unknown",
      })),
    };

    return res.status(200).json({
      batchDtl: transformedBatchDtl,
      message: "Successfully get batch details",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const updateBatchById = async (req, res) => {
  try {
    const { batchId } = req.params;
    const updateData = req.body;
    const { selectedAssessments } = req.body;

    // Remove fields that are empty or blank from the request body
    Object.keys(updateData).forEach((key) => {
      if (
        updateData[key] === "" ||
        updateData[key] === null ||
        updateData[key] === undefined
      ) {
        delete updateData[key];
      }
    });

    // Perform the update operation
    const updatedBatch = await BatchModel.findOneAndUpdate(
      { batchId: batchId },
      {
        $set: {
          ...updateData,
          "assessment.grade": selectedAssessments?.grade,
          "assessment.meterDive": selectedAssessments?.meterDive,
        },
      },
      { new: true }
    );

    if (!updatedBatch) {
      return res
        .status(404)
        .json({ message: "Batch not available", success: false });
    }
    if( updatedBatch.byAdmin === "Completed") {
      const result = await issueExtraStudentsToBatch(batchId, updateData.studentIds || []);
      if(result.success === false && updatedBatch.byAdmin === "Completed") {
        return res.status(400).json({
          message: result.message || "Failed to Issue Extra Students to Existing batch",
          success: false,
        });
      }
    }
    return res.status(200).json({
      message: "Successfully updated batch",
      success: true,
      updatedBatch,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const removeStudent = async (req, res) => {
  const { studentId, batchId } = req.body;

  try {
    const isBatchPresent = await BatchModel.findOne({ batchId });
    if (!isBatchPresent) {
      return res
        .status(404)
        .json({ message: "Batch not exist", success: false });
    }

    //check batch is completed or not
    if (isBatchPresent?.byAdmin === "Completed") {
      return res.status(400).json({
        message: "Batch is completed by admin. Cannot remove.",
        success: false,
      });
    }

    //remove student from batch
    const updatedBatch = await BatchModel.findOneAndUpdate(
      { batchId },
      { $pull: { studentIds: studentId } },
      { new: true }
    );

    if (!updatedBatch) {
      return res.status(400).json({
        message: "Failed to remove student from batch",
        success: false,
      });
    }

    //remove student from studbatch
    await StudBatchModel.deleteMany({ studentId, batchId });

    //remove student from issued certificate
    await IssuedCertificateModel.updateOne(
      { batchId, "studList.studentId": studentId },
      { $pull: { studList: { studentId } } }
    );

    return res
      .status(200)
      .json({ message: "Student removed from batch", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const updateComplete = async (req, res) => {
  try {
    const { role } = req.body;
    const { batchId } = req.params;

    if (!role) {
      return res
        .status(400)
        .json({ message: "User role is required", success: false });
    }

    if (!batchId) {
      return res
        .status(400)
        .json({ message: "Batch Id is required", success: false });
    }

    const batch = await BatchModel.findOne({ batchId }, { completedBy: 1 });

    if (batch.completedBy) {
      return res.status(403).json({
        message: "Batch is already assign to examiner",
        success: false,
      });
    }

    const isUpdate = await BatchModel.findOneAndUpdate(
      { batchId },
      {
        $set: { completedBy: role, compDate: new Date(), status: "Completed" },
      },
      { new: true }
    );

    if (!isUpdate) {
      return res
        .status(404)
        .json({ message: "Fail to assign batch", success: false });
    }

    let studentIds = isUpdate.studentIds || [];

    const studList = studentIds.map((studentId) => ({
      studentId,
      grade: "",
      issued: false,
    }));

    const issuedCertificate = new IssuedCertificateModel({
      batchId,
      studList,
    });

    await issuedCertificate.save();

    return res
      .status(200)
      .json({ message: "Batch assign to examiner", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

//batch complete by trainer
const compByTrainer = async (req, res) => {
  try {
    const { batchId } = req.params;
    const result = await completeBatchByTrainer(batchId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

//check complete by trainer or not
const checkTComplete = async (req, res) => {
  try {
    const { batchId } = req.params;

    const batchDtl = await BatchModel.findOne({ batchId });

    if (!batchDtl) {
      return res
        .status(404)
        .json({ message: "Batch details not found.", success: false });
    }

    if (batchDtl?.byTrainer === "Completed") {
      return res.status(400).json({
        message: "Batch is completed by trainer. You can not update it.",
        success: false,
      });
    }

    return res
      .status(200)
      .json({ message: "You can update it.", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

//add new student in existing batch
const addNewStud = async (req, res) => {
  try {
    const { batchId, studentIds } = req.body;

    const isExist = await BatchModel.findOne({ batchId });

    if (!isExist) {
      return res
        .status(404)
        .json({ message: "Failed to add student.", success: false });
    }

    // Merge existing and new student IDs while removing duplicates
    const updatedStudentIds = Array.from(
      new Set([...isExist?.studentIds, ...studentIds])
    );

    // Update batch in the database
    const updatedBatch = await BatchModel.findOneAndUpdate(
      { batchId },
      { $set: { studentIds: updatedStudentIds } },
      { new: true } // Returns the updated document
    );

    if (!updatedBatch) {
      return res
        .status(400)
        .json({ message: "Failed to add student.", success: false });
    }

    return res
      .status(200)
      .json({ message: "Student added successfully.", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Admin: Generate share token for a batch
const generateLink = async (req, res) => {
  const { batchId } = req.body;
  if (!batchId)
    return res.status(400).json({ success: false, message: "Batch ID required" });
    const batch = await BatchModel.findOne({ batchId });
    const batchName = batch?.batchName || "Unknown Batch";
    const expiresAt = batch?.endDate ? new Date(batch.endDate) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // Use batch endDate if available, else default to 7 days
    const token = uuidv4();

  await BatchShareToken.create({ token, batchId, expiresAt });
  res.json({ success: true, shareUrl: `${process.env.FRONTEND_URL}/admin/#/share/${token}/${batchName}` });
  // res.json({ success: true, shareUrl: `${process.env.FRONTEND_URL}/#/share/${token}/${batchName}` });
};

const getBatchStudentPhotos = async (req, res) => {
  try {
    const { batchId } = req.params;

    if (!batchId) {
      return res.status(400).json({
        message: "Batch ID is required",
        success: false,
      });
    }

    const batch = await BatchModel.findOne({ batchId });
    if (!batch) {
      return res.status(404).json({
        message: "Batch not found",
        success: false,
      });
    }

    const students = await Studentmodel.find({
      studentId: { $in: batch.studentIds },
    }).sort({ name: 1 });
    if (!students || students.length === 0) {
      return res.status(404).json({
        message: "No students found in this batch",
        success: false,
      });
    }
    let rejectedCount = 0;
    let uploadedCount = 0;

    students.forEach(student => {
      if (student.isProfile === 'Rejected') {
        rejectedCount++;
      } else {
        uploadedCount++;
      }
    });
    const studentPhotos = students.map((student) => ({
      studentId: student.studentId,
      studentName: student.name,
      imagePath: student.imagePath != null ? `${process.env.BASE_URL}/${student.imagePath}`: null,
      isProfile: student.isProfile,
    }));

    return res.status(200).json({
      message: "Successfully retrieved student photos",
      success: true,
      students: studentPhotos,
      rejectedCount,
      uploadedCount,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const patchProfileAcception = async (req, res) => {
  try {
  const { studentId, isProfile } = req.body;
  if (!studentId ) {
    return res.status(400).json({
      message: "Student ID is required",
      success: false,
    });
  }
    const stu = await Studentmodel.findOne({ studentId});
    if (!stu) {
      return res.status(404).json({
        message: "Student not found in this batch",
        success: false,
      });
    }

    if( isProfile === undefined || isProfile === null) {
      return res.status(400).json({
        message: "isProfile field is required",
        success: false,
      });
    }

    if(isProfile == "Completed") {
      stu.isProfile = isProfile;
    } else if (isProfile == "Rejected") {
      stu.isProfile = isProfile;
      if (stu.imagePath) {
        deleteFile(stu.imagePath);
        stu.imagePath = null;
      }
      // if (stu.adhaarImage) {
      //   deleteFile(stu.adhaarImage);
      //   stu.adhaarImage = null;
      // }
    }
    await stu.save();

    return res.status(200).json({
      message: "Batch photo acceptance successfully",
      success: true
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
}

const downloadBatchPhotos = async (req, res) => {
  try {
    const { batchId } = req.body;
    // Fetch batch
    const batch = await BatchModel.findOne({ batchId });
    if (!batch) {
      return res.status(404).json({ message: "Batch not found", success: false });
    }

    // Fetch students
    const students = await Studentmodel.find({ studentId: { $in: batch.studentIds } }).sort({ name: 1 });
    if (!students || students.length === 0) {
      return res.status(404).json({ message: "No students found for provided IDs", success: false });
    }

    // Prepare ZIP stream
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${batch.batchName || batchId}_profile_photos.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    let added = 0;
    for (const student of students) {
      if (student.imagePath) {
        let filePath = student.imagePath;
        // If imagePath is a URL, convert to local path
        if (filePath.startsWith('http')) {
          try {
            const url = new URL(filePath);
            filePath = path.join(__dirname, '..', url.pathname);
          } catch {
            continue;
          }
        } else {
          filePath = path.join(__dirname, '..', filePath);
        }
        if (fs.existsSync(filePath)) {
          const ext = path.extname(filePath);
          const fileName = `${student.name?.replace(/\s+/g, '_') || 'student'}_${student.mobile || student.studentId}${ext}`;
          archive.file(filePath, { name: fileName });
          added++;
        }
      }
    }

    if (added === 0) {
      archive.abort();
      return res.status(404).json({ message: "No profile photos found for selected students.", success: false });
    }

    archive.finalize();

    archive.on('error', (err) => {
      res.status(500).send({ message: 'Error creating zip', error: err.message });
    });
  } catch (err) {
    res.status(500).json({ message: err.message, success: false });
  }
};

// Clone batch controller
const cloneBatch = async (req, res) => {
  try {
    const { batchId } = req.body;
    if (!batchId) {
      return res.status(400).json({ message: "Batch Id is required", success: false });
    }
    // Find the original batch
    const originalBatch = await BatchModel.findOne({ batchId });
    if (!originalBatch) {
      return res.status(404).json({ message: "Original batch not found", success: false });
    }
    // Generate new batchId
    const newBatchId = uuidv4();
    // Clone batch data (excluding _id, batchId, timestamps)
    const batchData = { ...originalBatch._doc };
    delete batchData._id;
    delete batchData.batchId;
    delete batchData.createdAt;
    delete batchData.updatedAt;
    batchData.batchId = newBatchId;
    // Create new batch
    const clonedBatch = new BatchModel(batchData);
    await clonedBatch.save();
    // Clone StudBatchModel entries
    const studBatchEntries = await StudBatchModel.find({ batchId });
    for (const entry of studBatchEntries) {
      const newEntry = new StudBatchModel({
        ...entry._doc,
        _id: undefined,
        batchId: newBatchId
      });
      await newEntry.save();
    }
    // Clone IssuedCertificateModel for the batch
    const issuedCert = await IssuedCertificateModel.findOne({ batchId });
    let clonedIssuedCert = null;
    if (issuedCert) {
      const issuedCertData = { ...issuedCert._doc };
      delete issuedCertData._id;
      delete issuedCertData.issuedCertificateId;
      delete issuedCertData.createdAt;
      delete issuedCertData.updatedAt;
      issuedCertData.batchId = newBatchId;
      // Generate new issuedCertificateId
      issuedCertData.issuedCertificateId = uuidv4();
      clonedIssuedCert = new IssuedCertificateModel(issuedCertData);
      await clonedIssuedCert.save();
    }
    // You may also want to clone BatchShareToken if you use share links, but usually tokens should be unique per batch.
    // If you have other batch-related entities (e.g., logs, custom configs), consider cloning them as well for full duplication.
    return res.status(201).json({
      message: "Batch cloned successfully",
      success: true,
      newBatchId,
      clonedBatch,
      clonedIssuedCert
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getBatchNameById = async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await BatchModel.findOne({ batchId });
    if (!batch) {
      return res.status(404).json({ message: "Batch not found", success: false });
    }
    res.status(200).json({ message: "Batch found", success: true, batchName: batch.batchName });

  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

const getLinkCreateDateById = async (req,res) =>{
  try{
    const { batchId}= req.params;
    const batchToken =await BatchShareToken.findOne({batchId});
    if (!batchToken){
      return res.status(404).json({message:"Batch not found", success:false});
    }
    res.status(200).json({message:"Batch found",success:true, createdAt:batchToken.createdAt});
  }catch(error){
    res.status(500).json({message:error.message, success:false});
  }
};

const downloadSinglePhoto = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required", success: false });
    }

    const student = await Studentmodel.findOne({ studentId });
    if (!student || !student.imagePath) {
      return res.status(404).json({ message: "Student not found or image not available", success: false });
    }

    let filePath = student.imagePath;

    // If stored as absolute URL, convert to local path
    if (typeof filePath === 'string' && filePath.startsWith('http')) {
      try {
        const url = new URL(filePath);
        filePath = url.pathname; // e.g. /uploads/images/xxx.jpg
        // remove leading slash if present when joining
        if (filePath.startsWith('/')) filePath = filePath.slice(1);
        filePath = path.join(__dirname, '..', filePath);
      } catch (err) {
        return res.status(400).json({ message: 'Invalid image URL stored for student', success: false });
      }
    } else {
      // imagePath is likely a relative path like 'uploads/images/xxx.jpg' or just 'images/xxx.jpg'
      if (filePath.startsWith('/')) filePath = filePath.slice(1);
      filePath = path.join(__dirname, '..', filePath);
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Image file not found on server', success: false });
    }

    const ext = path.extname(filePath) || '';
    const safeName = (student.name || student.studentId || 'student').toString().replace(/\s+/g, '_');
    const filename = `${safeName}${ext}`;

    // Set headers to force download
    const lowerExt = ext.toLowerCase();
    let contentType = 'application/octet-stream';
    if (['.jpg', '.jpeg'].includes(lowerExt)) contentType = 'image/jpeg';
    else if (['.png'].includes(lowerExt)) contentType = 'image/png';
    else if (['.gif'].includes(lowerExt)) contentType = 'image/gif';
    else if (['.webp'].includes(lowerExt)) contentType = 'image/webp';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const readStream = fs.createReadStream(filePath);
    readStream.on('error', (err) => {
      return res.status(500).json({ message: 'Error reading image file', error: err.message, success: false });
    });
    readStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Return array of batch names where the provided studentId is enrolled
const getBatchNamesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!studentId) {
      return res.status(400).json({ success: false, message: 'studentId param is required' });
    }
      // Use model static helper if available - return array of objects with ids and names
      if (typeof BatchModel.getBatchNamesByID === 'function') {
        const batches = await BatchModel.getBatchNamesByID(studentId);
        return res.status(200).json({ success: true, message: 'Batch list retrieved', enrolledBatches: batches });
      }
      // Fallback: query batches containing studentId and return objects
      const batches = await BatchModel.find({ studentIds: studentId, deleteStatus: { $ne: 'deleted' } }, { batchId: 1, batchName: 1 });
      const mapped = batches.map((b) => ({ _id: b._id, batchId: b.batchId, batchName: b.batchName }));
      return res.status(200).json({ success: true, message: 'Batch list retrieved', enrolledBatches: mapped });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

module.exports = {
  generateLink,
  createBatch,
  getAllBatch,
  searchBatches,
  deleteBatchById,
  getBatchById,
  updateBatchById,
  removeStudent,
  updateComplete,
  compByTrainer,
  checkTComplete,
  addNewStud,
  patchProfileAcception,
  getBatchStudentPhotos,
  downloadBatchPhotos,
  downloadSinglePhoto,
  uploadMultiPhotos,
  allCompleteProfile,
  cloneBatch,
  getBatchNameById,
  getLinkCreateDateById,
  getBatchNamesByStudent
};
