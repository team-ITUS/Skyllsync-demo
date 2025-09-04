const express = require("express");
const {
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
  getLinkCreateDateById
} = require("../controllers/batchController");

const batchRouter = express.Router();

batchRouter.post('/:batchId/upload-multi-photos', uploadMultiPhotos);
batchRouter.put('/:batchId/all-complete-profile', allCompleteProfile);
batchRouter.post("/generate", generateLink); // create enrolled students batch
batchRouter.post("/createBatch", createBatch); // create enrolled students batch
batchRouter.get("/getAllBatch", getAllBatch); //get all batch details(list)
// Support frontend filter queries. Example: GET /batch/search?courseName=React&branch=Delhi&studentName=li
batchRouter.get("/search", searchBatches); // search with query params
// Also allow root GET to support calls to /batch?courseName=...
batchRouter.get("/", getAllBatch);
batchRouter.delete("/deleteBatchById/:batchId", deleteBatchById); //delete batch by batchId
batchRouter.get("/getBatchById/:batchId", getBatchById); //get single batch by batchId
batchRouter.put("/updateBatchById/:batchId", updateBatchById); //update batch by batchId
batchRouter.delete("/removeStudent", removeStudent);//remove student from branch by studentId
batchRouter.put('/updateComplete/:batchId', updateComplete);//update completeBy status by batchId
batchRouter.put('/compByTrainer/:batchId', compByTrainer);//update completeBy status by batchId by trainer
batchRouter.get('/checkTComplete/:batchId',checkTComplete); //check complete by trainer or not
batchRouter.put('/addNewStud',addNewStud);// add new student in existing batch.
batchRouter.patch('/patchProfileAcception', patchProfileAcception);
batchRouter.get('/getBatchStudentPhotos/:batchId', getBatchStudentPhotos);
batchRouter.post('/downloadBatchPhotos', downloadBatchPhotos);
batchRouter.get('/downloadSinglePhoto/:studentId', downloadSinglePhoto);
// Clone batch
batchRouter.post("/cloneBatch", cloneBatch);
batchRouter.get("/getBatchNameById/:batchId", getBatchNameById);
batchRouter.get("/getLinkCreateDateById/:batchId", getLinkCreateDateById);
module.exports = { batchRouter };
