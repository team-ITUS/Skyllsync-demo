const express = require("express");
const { upload } = require("../services/fileUploadService");
const {
  createBranch,
  getAllBranches,
  deleteBranch,
  getBranchById,
  updateBranch,
  getBranchList,
} = require("../controllers/branchController"); // Adjust the path accordingly
const branchRouter = express.Router();

// Route to get all branches
branchRouter.get("/getAllBranches", getAllBranches);

// Route to create a new branch
branchRouter.post(
  "/createBranch",
  upload.fields([
    { name: "logoOne", maxCount: 1 },
    { name: "logoTwo", maxCount: 1 },
    { name: "logoThree", maxCount: 1 },
    { name: "logoFour", maxCount: 1 },
  ]),
  createBranch
);

// Route to delete a branch by ID
branchRouter.delete("/deleteBranch/:branchId", deleteBranch); //delete branch by branch id

branchRouter.get("/getBranch/:branchId", getBranchById);

branchRouter.put(
  "/updateBranch/:branchId",
  upload.fields([
    { name: "logoOne", maxCount: 1 },
    { name: "logoTwo", maxCount: 1 },
    { name: "logoThree", maxCount: 1 },
    { name: "logoFour", maxCount: 1 },
  ]),
  updateBranch
);

branchRouter.get("/getBranchList", getBranchList);



module.exports = { branchRouter };
