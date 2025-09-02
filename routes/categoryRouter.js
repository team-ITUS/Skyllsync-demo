const express = require('express');
const {createCategory, getCatDropdown} = require('../controllers/categoryController');

const categoryRouter = express.Router();

categoryRouter.post('/createCategory', createCategory);//create category
categoryRouter.get('/getCatDropdown',getCatDropdown);//create category dropdown list

module.exports = {categoryRouter};