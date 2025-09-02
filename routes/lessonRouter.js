const express = require('express');
const {createLesson, deleteLessonById, updateLessonById, getLessonById} = require('../controllers/lessonController');
const { upload } = require('../services/fileUploadService');

const lessonRouter = express.Router();

lessonRouter.post('/createLesson', upload.single('file') ,createLesson);//create lesson
lessonRouter.delete('/deleteLessonById/:lessonId', deleteLessonById);// delete lesson by lessonId
lessonRouter.put('/updateLessonById/:lessonId', updateLessonById);//update lesson by lessonId
lessonRouter.get('/getLessonById/:lessonId', getLessonById);// get session by sessionId

module.exports = {lessonRouter};