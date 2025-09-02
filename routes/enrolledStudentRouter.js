const express = require('express');
const {enrollMultipleStd, getAllStudWithCors} = require('../controllers/enrolledStudentController');

const enrollStudentRouter = express.Router();

enrollStudentRouter.post('/enrollMultipleStd',enrollMultipleStd);
enrollStudentRouter.get('/getAllStudWithCors', getAllStudWithCors);


module.exports = {enrollStudentRouter};