const { BatchModel } = require("../models/batchModel");
const { BranchModel } = require("../models/branchModel");
const { log, warn, error, info } = require('../utils/logger');

const createBranch = async (req, res) => {
  try {
    const { branchName, branchAddress, contactPerson, contactNo, email } =
      req.body;

    const isEmail = await BranchModel.findOne({ email });
    if (isEmail) {
      return res
        .status(400)
        .json({ message: "Email is already exist.", success: false });
    }

    const isMobile = await BranchModel.findOne({ contactNo });
    if (isMobile) {
      return res
        .status(400)
        .json({ message: "Mobile number is already exist.", success: false });
    }
    // Validate required fields
    if (!branchName) {
      return res
        .status(400)
        .json({ message: "Please provide branch name", success: false });
    }

    if (!contactNo) {
      return res
        .status(400)
        .json({ message: "Please provide contact number", success: false });
    }

    if (!email) {
      return res
        .status(400)
        .json({ message: "Please provide email", success: false });
    }

    let logoOne;
    if (req.files && req.files.logoOne) {
      const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validMimeTypes.includes(req.files.logoOne[0].mimetype)) {
        return res.status(400).json({
          message: "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
          success: false,
        });
      }
      logoOne =
        req.files.logoOne[0].destination + req.files.logoOne[0].filename;
    }

    let logoTwo;
    if (req.files && req.files.logoTwo) {
      const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validMimeTypes.includes(req.files.logoTwo[0].mimetype)) {
        return res.status(400).json({
          message: "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
          success: false,
        });
      }
      logoTwo =
        req.files.logoTwo[0].destination + req.files.logoTwo[0].filename;
    }

    let logoThree;
    if (req.files && req.files.logoThree) {
      const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validMimeTypes.includes(req.files.logoThree[0].mimetype)) {
        return res.status(400).json({
          message: "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
          success: false,
        });
      }
      logoThree =
        req.files.logoThree[0].destination + req.files.logoThree[0].filename;
    }

    let logoFour;
    if (req.files && req.files.logoFour) {
      const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validMimeTypes.includes(req.files.logoFour[0].mimetype)) {
        return res.status(400).json({
          message: "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
          success: false,
        });
      }
      logoFour =
        req.files.logoFour[0].destination + req.files.logoFour[0].filename;
    }

    // Check for unique branch name
    const existingBranch = await BranchModel.findOne({ branchName });
    if (existingBranch) {
      return res
        .status(400)
        .json({ message: "Branch name must be unique", success: false });
    }

    // Create a new branch
    const branchModel = new BranchModel({
      branchName,
      branchAddress,
      contactPerson,
      contactNo,
      email,
      prefixOne: req.body?.prefixOne,
      prefixTwo: req.body?.prefixTwo,
      includeMonth: req.body?.includeMonth,
      includeYear: req.body?.includeYear,
      startIndex: req.body?.startIndex,
      currentIndex: req.body?.startIndex,
      logoOne,
      logoTwo,
      logoThree,
      logoFour,
    });

    await branchModel.save();

    return res
      .status(201)
      .json({ message: "Successfully created a branch", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getAllBranches = async (req, res) => {
  try {
    const branchesList = await BranchModel.find(
      {},
      {
        branchId: 1,
        branchName: 1,
        branchAddress: 1,
        contactPerson: 1,
        contactNo: 1,
        email: 1,
        logoOne: 1,
        logoTwo: 1,
        logoThree: 1,
        logoFour: 1,
      }
    );

    if (!branchesList || branchesList.length === 0) {
      return res
        .status(404)
        .json({ message: "Branches not available", success: false });
    }

    return res.status(200).json({
      branchesList,
      message: "Successfully found all branches",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getBranchById = async (req, res) => {
  const { branchId } = req.params;

  try {
    const branch = await BranchModel.findOne({ branchId });

    if (!branch) {
      return res
        .status(404)
        .json({ message: "Branch not found", success: false });
    }

    return res.status(200).json({ branch, success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const updateBranch = async (req, res) => {
  const { branchId } = req.params;
  const { branchName, branchAddress, contactPerson, contactNo, email } =
    req.body;

  try {
    let logoOne;
    if (req.files && req.files.logoOne) {
      const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validMimeTypes.includes(req.files.logoOne[0].mimetype)) {
        return res.status(400).json({
          message: "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
          success: false,
        });
      }
      logoOne =
        req.files.logoOne[0].destination + req.files.logoOne[0].filename;
    }

    let logoTwo;
    if (req.files && req.files.logoTwo) {
      const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validMimeTypes.includes(req.files.logoTwo[0].mimetype)) {
        return res.status(400).json({
          message: "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
          success: false,
        });
      }
      logoTwo =
        req.files.logoTwo[0].destination + req.files.logoTwo[0].filename;
    }

    let logoThree;
    if (req.files && req.files.logoThree) {
      const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validMimeTypes.includes(req.files.logoThree[0].mimetype)) {
        return res.status(400).json({
          message: "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
          success: false,
        });
      }
      logoThree =
        req.files.logoThree[0].destination + req.files.logoThree[0].filename;
    }

    let logoFour;
    if (req.files && req.files.logoFour) {
      const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validMimeTypes.includes(req.files.logoFour[0].mimetype)) {
        return res.status(400).json({
          message: "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
          success: false,
        });
      }
      logoFour =
        req.files.logoFour[0].destination + req.files.logoFour[0].filename;
    }

    const updatedBranch = await BranchModel.findOneAndUpdate(
      { branchId },
      {
        branchName,
        branchAddress,
        contactPerson,
        contactNo,
        email,
        prefixOne: req.body?.prefixOne,
        prefixTwo: req.body?.prefixTwo,
        includeMonth: req.body?.includeMonth,
        includeYear: req.body?.includeYear,
        startIndex: req.body?.startIndex,
        currentIndex: req.body?.startIndex,
        logoOne,
        logoTwo,
        logoThree,
        logoFour,
      },
      { new: true }
    );

    if (!updatedBranch) {
      return res
        .status(404)
        .json({ message: "Branch not found", success: false });
    }

    return res.status(200).json({
      message: "Branch updated successfully",
      success: true,
      // branch: updatedBranch,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const deleteBranch = async (req, res) => {
  const { branchId } = req.params;

  try {
    //check is assing to batch or not
    const isAssign = await BatchModel.findOne({ branchId });
    if (isAssign) {
      return res.status(400).json({
        message: "Branch is assigned to batch. Unassign to delete.",
        success: false,
      });
    }
    const result = await BranchModel.findOneAndDelete({ branchId });

    if (!result) {
      return res
        .status(404)
        .json({ message: "Branch not found.", success: false });
    }

    return res
      .status(200)
      .json({ message: "Branch deleted successfully.", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getBranchList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;

    const searchName = req.query.search || "";

    const skip = Math.max(0, (page - 1) * limit);
    const filter = {};

    if (searchName) {
      filter.$or = [
        { branchName: { $regex: searchName, $options: "i" } },
        { contactNo: { $regex: searchName, $options: "i" } },
        { email: { $regex: searchName, $options: "i" } },
      ];
    }

    const branchesList = await BranchModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-createdAt -updatedAt");

    const totalBranch = await BranchModel.countDocuments(filter);

    if (!branchesList || branchesList.length === 0) {
      return res
        .status(404)
        .json({ message: "Branch not available", success: false });
    }

    return res.status(200).json({
      branchesList,
      currentPage: page,
      totalPages: Math.ceil(totalBranch / limit),
      totalBranch,
      message: "Successfully retrieved branch list",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

module.exports = {
  createBranch,
  getAllBranches,
  deleteBranch,
  getBranchById,
  updateBranch,
  getBranchList,
};
