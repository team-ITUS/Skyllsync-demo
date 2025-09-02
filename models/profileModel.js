// models/Image.js
const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  imagePath: {
    type: String,
    required: true,
  },
 
  logoPath: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Profile', imageSchema);