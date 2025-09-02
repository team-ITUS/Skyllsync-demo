// controllers/imageController.js
const Profile = require('../models/profileModel');
const { log, warn, error, info } = require('../utils/logger');

const uploadImage = async (req, res) => {
    try {
      const imagePath = req.file ? req.file.path : null;
  
      if (!imagePath) {
        return res.status(400).json({ message: 'No image file provided' });
      }
  
      // Check if an existing profile exists
      const existingProfile = await Profile.findOne();
  
      if (existingProfile) {
        // If a profile exists, update the image path
        existingProfile.imagePath = imagePath;
        await existingProfile.save();
        return res.status(200).json({ message: 'Image updated successfully', image: existingProfile });
      } else {
        // If no profile exists, create a new one
        const newImage = new Profile({ imagePath });
        await newImage.save();
        return res.status(201).json({ message: 'Image uploaded successfully', image: newImage });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error uploading image', error });
    }
  };

const getImage = async (req, res) => {
    try {
      const images = await Profile.find({}, 'imagePath'); // Retrieves only the imagePath field for each document
      res.status(200).json({ message: 'Images retrieved successfully', images });
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving images', error });
    }
  };

 // Upload logo
const uploadLogo = async (req, res) => {
    try {
      const logoPath = req.file ? req.file.path : null;

      if (!logoPath) {
        return res.status(400).json({ message: 'No logo file provided' });
      }

      // Check if an existing profile exists
      const existingProfile = await Profile.findOne();

      if (existingProfile) {
        // If a profile exists, update only the logo path
        existingProfile.logoPath = logoPath;
        await existingProfile.save();
        return res.status(200).json({ message: 'Logo updated successfully', logo: existingProfile });
      } else {
        // If no profile exists, create a new one
        const newProfile = new Profile({ logoPath });
        await newProfile.save();
        return res.status(201).json({ message: 'Logo uploaded successfully', logo: newProfile });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error uploading logo', error });
    }
};

// Retrieve logo
const getLogo = async (req, res) => {
    try {
      const logos = await Profile.find({}, 'logoPath'); // Retrieve only logoPath
      res.status(200).json({ message: 'Logos retrieved successfully', logos });
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving logos', error });
    }
};

module.exports = { uploadImage ,getImage,uploadLogo ,getLogo};
