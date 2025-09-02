const express = require('express');
const {addQuestion, getQuesListById, submitAnswer, deleteQuesById} = require('../controllers/questionController');

const questionRouter = express.Router();

questionRouter.post('/addQuestion',addQuestion);// add question under quiz
questionRouter.get('/getQuesListById/:quizId', getQuesListById);// get question list by quizId
questionRouter.post('/submitAnswer', submitAnswer);//submit quiz answer
questionRouter.delete('/deleteQuesById/:questionId',deleteQuesById);//delete question by questionId

module.exports = {questionRouter};