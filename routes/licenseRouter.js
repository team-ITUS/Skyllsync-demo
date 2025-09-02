const express = require("express");
const { createLicense, createBulkLicenses, addLicense, getAllLicenses, getLicenseById, updateLicense, deleteLicense } = require("../controllers/licenseController");
const { addCoursePair, getCoursePairs} = require("../controllers/coursePairController"); // Import if needed
const { upload } = require("../services/fileUploadService");
const licenseRouter = express.Router();

licenseRouter.post("/create", createLicense); // Single license
licenseRouter.post("/createBulk", createBulkLicenses); // Bulk licenses
licenseRouter.post("/addCoursePair", addCoursePair); // Add course pair
licenseRouter.get("/getCoursePairs", getCoursePairs); // Get all course pairs
licenseRouter.post("/add", upload.fields([{ name: 'file', maxCount: 1 }, { name: 'font', maxCount: 1 }, { name: 'signature', maxCount: 1 }]), addLicense); // Add new license
licenseRouter.get("/getAll", getAllLicenses); // Get all licenses
licenseRouter.get("/:licenseId", getLicenseById); // Get license by ID
licenseRouter.put("/:licenseId", upload.fields([{ name: 'file', maxCount: 1 }, { name: 'font', maxCount: 1 }, { name: 'signature', maxCount: 1 }]), updateLicense); // Update license by ID
licenseRouter.delete("/:licenseId", deleteLicense); // Delete license by ID


module.exports = { licenseRouter };