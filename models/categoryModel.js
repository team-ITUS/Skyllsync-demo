const mongoose = require('mongoose');
const {v4:uuidv4} = require('uuid');

const CategorySchema = new mongoose.Schema({
  catId: {
    type: String, 
    required: true,
    unique: true,
    default:uuidv4,
  },
  catName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  entryTime:{
    type : Date,
    default: Date.now(),
    required: true,
  }
});

const CategoryModel = mongoose.model('categorys', CategorySchema);

module.exports = {CategoryModel};
