const express = require('express');

const {addQuiz, getAllQuizList, getQuizDropdown, deleteQuizById} = require('../controllers/quizController');

const quizRouter = express.Router();

quizRouter.post('/addQuiz', addQuiz)// add quize
quizRouter.get('/getAllQuizList', getAllQuizList); // get all quez list
quizRouter.get('/getQuizDropdown', getQuizDropdown);//get quize list as dropdown
quizRouter.delete('/deleteQuizById/:quizId',deleteQuizById);//delete quiz by quizId


module.exports = {quizRouter};