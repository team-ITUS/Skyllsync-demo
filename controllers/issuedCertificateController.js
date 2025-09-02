const { IssuedCertificateModel } = require("../models/issuedCertificateModel");
const { BatchModel } = require("../models/batchModel");
const { log, warn, error, info } = require('../utils/logger');

const StudentModel = require("../models/resisterStudentModel");
const { BranchModel } = require("../models/branchModel");
const { completeBatchByTrainer } = require("../services/batchService");

const getExportableData = async (req, res) => {
  try {
    const { batchId } = req.params;

    const issuedCertificate = await IssuedCertificateModel.findOne({ batchId });
    if (!issuedCertificate) {
      return res
        .status(404)
        .json({ message: "Issued certificate not found", success: false });
    }

    //find batch details
    const batchDtl = await BatchModel.findOne({ batchId }, { assessment: 1 });

    const studentIds = issuedCertificate?.studList.map((stud) => stud.studentId);

    const students = await StudentModel.find(
      { studentId: { $in: studentIds } },
    ).sort({ name: 1 });

    const exportableData = issuedCertificate.studList.map((stud) => {
      const student = students.find((s) => s.studentId === stud.studentId);
      const matchedCertificateId = issuedCertificate?.studList.find(
        stud => stud?.studentId === student.studentId
      )?.certificateId;
      return {
        ...stud.toObject(),
        ...student.toObject(),
        certificateId: matchedCertificateId
      };
    });

    return res.status(200).json({
      exportableData,
      message: "Successfully get details",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
}

const getExaminDtlById = async (req, res) => {
  try {
    const { batchId } = req.params;

    const issuedCertificateCheck = await IssuedCertificateModel.findOne({ batchId });

    if (!issuedCertificateCheck) {
      try {
        const result = await completeBatchByTrainer(batchId);
      } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
      }
    }
    const issuedCertificate = await IssuedCertificateModel.findOne({ batchId });
    if (!issuedCertificate) {
      return res
        .status(404)
        .json({ message: "Issued certificate not found", success: false });
    }

    //find batch details
    const batchDtl = await BatchModel.findOne({ batchId }, { assessment: 1 });

    const studentIds = issuedCertificate?.studList.map((stud) => stud.studentId);

    const students = await StudentModel.find(
      { studentId: { $in: studentIds } },
      "studentId name email imagePath mobile isProfile"
    ).sort({ name: 1 });

    const studListWithNames = issuedCertificate.studList.map((stud) => {
      const student = students.find((s) => s.studentId === stud.studentId);
      const matchedCertificateId = issuedCertificate?.studList.find(
        stud => stud?.studentId === student.studentId
      )?.certificateId;
      const matchedIssuedDate = issuedCertificate?.studList.find(
        stud => stud?.studentId === student.studentId
      )?.issuedDate;
      return {
        ...stud.toObject(),
        studentName: student ? student.name : "N/A",
        studentEmail: student ? student.email : "N/A",
        imagePath: student ? student.imagePath : "N/A",
        mobile: student ? student.mobile : "N/A",
        isProfile: student ? student.isProfile : "Pending",
        certificateId: matchedCertificateId,
        issuedDate: matchedIssuedDate,
      };
    });

    const issuedData = {
      ...issuedCertificate.toObject(),
      studList: studListWithNames,
      assessment: batchDtl?.assessment,
    };

    return res.status(200).json({
      issuedData,
      message: "Successfully get details",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const updateExaminById = async (req, res) => {
  try {
    const { issuedCertificateId } = req.params;
    const { selectedData, role } = req.body;

    const year = new Date().getFullYear();
    const month = new Date()
      .toLocaleString("en-US", { month: "short" })
      .toUpperCase();

    //current number of certificate
    let currentNo;
    let branchDtl;
    let batchDtl;

    //find batchId from issuedCertificateId
    const issuedDtl = await IssuedCertificateModel.findOne(
      { issuedCertificateId },
      { batchId: 1 }
    );

    //find branchId from batch
    batchDtl = await BatchModel.findOne(
      { batchId: issuedDtl?.batchId },
      { branchId: 1, batchId: 1, endDate: 1 }
    );

    if (role === "admin") {
      //find startIndex from branch
      branchDtl = await BranchModel.findOne(
        { branchId: batchDtl?.branchId },
        {
          prefixOne: 1,
          prefixTwo: 1,
          startIndex: 1,
          currentIndex: 1,
          includeMonth: 1,
          includeYear: 1,
          branchId: 1,
        }
      );

      currentNo = branchDtl?.currentIndex || 0;
    }

    for (const { studentId, grade, meterDive } of selectedData) {
      const updateFields = {
        "studList.$.grade": grade,
        "studList.$.meterDive": meterDive,
        "studList.$.examinerGiven": true,
      };

      // If role is 'admin', set issued to true
      if (role === "admin") {
        updateFields["studList.$.issued"] = true;
        updateFields["studList.$.issuedDate"] = batchDtl.endDate;

        //check certificate already issued or not
        const isAssigned = await IssuedCertificateModel.findOne(
          {
            issuedCertificateId,
            "studList.studentId": studentId,
          },
          { "studList.$": 1 }
        );

        if (isAssigned?.studList[0]?.issued === false) {
          //add certificate id
          currentNo = currentNo + 1;
          let newId = `${branchDtl?.prefixOne}`;
          if (branchDtl?.prefixTwo.length > 0) {
            newId = `${newId}/${branchDtl?.prefixTwo}`;
          }
          if (branchDtl?.includeMonth === true) {
            newId = `${newId}/${month}`;
          }
          if (branchDtl?.includeYear === true) {
            newId = `${newId}/${year}`;
          }
          currentNoWithZeros = currentNo.toString().padStart(4, "0");
          newId = `${newId}/${currentNoWithZeros}`;
          updateFields["studList.$.certificateId"] = newId;

          //update currentIndex in branch
          await BranchModel.findOneAndUpdate(
            { branchId: branchDtl?.branchId },
            { $set: { currentIndex: currentNo } }
          );
        }
      }

      const updateResult = await IssuedCertificateModel.updateOne(
        { issuedCertificateId, "studList.studentId": studentId },
        { $set: updateFields }
      );

      if (updateResult.matchedCount === 0) {
        return res.status(404).json({
          message: "Fail to process your request",
          success: false,
        });
      }

      if (updateResult.modifiedCount === 0) {
        return res.status(400).json({
          message: "Fail to process your request",
          success: false,
        });
      }
    }

    if (role === "accessor") {
      //if value get that mean there is some student that not assing grade or meterDive by examiner.
      const isAllDone = await IssuedCertificateModel.findOne(
        {
          issuedCertificateId,
          "studList.examinerGiven": false,
        },
        { "studList.$": 1 }
      );

      if (isAllDone == null) {
        const w = await BatchModel.findOneAndUpdate(
          { batchId: batchDtl?.batchId },
          { $set: { byExaminer: "Completed" } },
          { new: true }
        );
      }
    } else if (role === "admin") {
      //if value get that mean not complete by admin
      const isAllDone = await IssuedCertificateModel.findOne(
        {
          issuedCertificateId,
          "studList.issued": false,
        },
        { "studList.$": 1 }
      );
      if (isAllDone == null) {
        await BatchModel.findOneAndUpdate(
          { batchId: batchDtl?.batchId },
          { $set: { byAdmin: "Completed" } },
          { new: true }
        );
      }
    }

    return res.status(200).json({
      message: "Process Completed.",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getMyCertList = async (req, res) => {
  try {
    const { studentId } = req.params;

    const batches = await IssuedCertificateModel.find(
      {
        studList: { $elemMatch: { studentId: studentId, issued: true } },
      },
      { batchId: 1, _id: 0 }
    );

    const batchIds = batches.map((batch) => batch.batchId);

    if (batchIds.length === 0) {
      return res.status(404).json({
        message: "Certificate not available",
        success: false,
      });
    }

    const courseDetails = await BatchModel.find(
      { batchId: { $in: batchIds } },
      { courseName: 1, courseId: 1, batchId: 1, _id: 0 }
    );

    const certificateList = courseDetails.map((course) => ({
      batchId: course.batchId,
      courseId: course.courseId,
      courseName: course.courseName,
    }));

    if (!certificateList || certificateList.length === 0) {
      return res.status(404).json({
        message: "Certificate not available",
        success: false,
      });
    }

    return res.status(200).json({
      certificateList,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const isIssuedCert = async (req, res) => {
  try {
    const { studentId, batchId } = req.body;

    const certificate = await IssuedCertificateModel.findOne({
      batchId: batchId,
      "studList.studentId": studentId,
      "studList.issued": true,
    });

    if (!certificate) {
      return res.status(404).json({
        message: "Certificate not issued yet.",
        success: false,
      });
    }

    // Filter to get only the student that matches the criteria
    const studentData = certificate.studList.find(
      (stud) => stud.studentId === studentId && stud.issued === true
    );

    if (!studentData) {
      return res.status(404).json({
        message: "Certificate not issued yet.",
        success: false,
      });
    }

    return res
      .status(200)
      .json({ message: "Certificate is issued to student.", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Increment certificateId and update issuedDate for a batch
const certIdIncrementor = async (req, res) => {
  try {
    const { batchId } = req.body;
    const { old_cert_id, old_start_id, new_cert_prefix, start_number, new_issued_date } = req.body;
    const issuedCertificate = await IssuedCertificateModel.findOne({ batchId });
    if (!issuedCertificate) {
      return res.status(404).json({ message: `No document found with batchId=${batchId}`, success: false });
    }

    let counter = start_number;
    let old_counter = old_start_id;
    let modified = false;
    for (let student of issuedCertificate.studList) {
      if (student.issued === true) {
        // console.log(`Comparing with: ${old_cert_id}${old_counter}`);
        if (student.certificateId) {
          // console.log(`Updating to: ${new_cert_prefix}${counter}`);
          student.certificateId = `${new_cert_prefix}${counter}`;
          counter++;
          old_counter++;
          modified = true;
        }
        // Always update issuedDate if provided
        if (new_issued_date) {
          student.issuedDate = new_issued_date;
          modified = true;
        }
      }
    }

    if (!modified) {
      return res.status(400).json({ message: `No studList entry matched for update.`, success: false });
    }

    const result = await IssuedCertificateModel.updateOne(
      { _id: issuedCertificate._id },
      { $set: { studList: issuedCertificate.studList } }
    );
    return res.status(200).json({
      message: `Updated certificateId and issuedDate for batchId=${batchId}`,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Delete issued certificate document by batchId
const deleteIssuedCertificateByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    if (!batchId) {
      return res.status(400).json({ message: 'batchId is required', success: false });
    }

    const deleted = await IssuedCertificateModel.findOneAndDelete({ batchId });
    if (!deleted) {
      return res.status(404).json({ message: 'Issued certificate not found for this batch', success: false });
    }
    // also in batch toggle Completed to pending
    await BatchModel.updateOne({ batchId: batchId }, { byAdmin: 'Pending', byExaminer: 'Pending', byTrainer: 'Pending' });

    return res.status(200).json({
      message: 'Issued certificate deleted successfully',
      success: true,
      batchId,
      issuedCertificateId: deleted.issuedCertificateId,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message, success: false });
  }
};

module.exports = {
  getExaminDtlById,
  updateExaminById,
  getMyCertList,
  isIssuedCert,
  getExportableData,
  certIdIncrementor,
  deleteIssuedCertificateByBatch,
};
