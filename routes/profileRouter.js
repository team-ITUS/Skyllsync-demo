// routes/imageRoutes.js
const express = require('express');
const { uploadImage ,getImage,uploadLogo,getLogo} = require('../controllers/profileController');
const { upload } = require("../services/fileUploadService");

const profileRouter = express.Router();

// Route to upload an image
profileRouter.post('/upload-image', upload.single('image'), uploadImage);
// Route to get all uploaded images
profileRouter.get('/get-image', getImage);

// Route to upload an logo
profileRouter.post('/upload-logo', upload.single('logo'), uploadLogo);
// Route to get all uploaded logo
profileRouter.get('/get-logo', getLogo);

module.exports = {profileRouter};