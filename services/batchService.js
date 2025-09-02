// services/batchService.js

const { BatchModel } = require("../models/batchModel");
const { IssuedCertificateModel } = require("../models/issuedCertificateModel");

async function completeBatchByTrainer(batchId) {
  if (!batchId) {
    throw new Error("Batch Id is required.");
  }

  // 1. Update batch
  const isUpdate = await BatchModel.findOneAndUpdate(
    { batchId },
    { $set: { byTrainer: "Completed", compDate: new Date() } },
    { new: true }
  );

  if (!isUpdate) {
    throw new Error("Fail to assign batch.");
  }

  // 2. Prepare student list
  const studentIds = isUpdate.studentIds || [];
  if( studentIds.length <= 0) {
    throw new Error("Batch Is Empty Right now! Add Students First.");
  }

  const studList = studentIds.map((studentId) => ({
    studentId,
    grade: "",
    issued: false,
  }));

  // 3. Save to IssuedCertificateModel
  const issuedCertificate = new IssuedCertificateModel({
    batchId,
    studList,
  });

  await issuedCertificate.save();

  return { message: "Batch assign to examiner", success: true };
}

module.exports = {
  completeBatchByTrainer,
};
