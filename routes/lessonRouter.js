const express = require('express');
const { uuid } = require('uuidv4');
const lessonController = require('../controllers/lessonController');
const {uploadVideoToCloudMW}= require('../utils/cloudinary');
const uploadLocal = require('../utils/uploadLocal');
const jwtAuthenticator = require('../middlewares/jwtAuthenticator');


const lessonRouter = express.Router();

lessonRouter.post("/video", jwtAuthenticator("teacher"), uploadLocal.single("lessonVideo"),lessonController.verifyLesson, uploadVideoToCloudMW, lessonController.appendVideoLesson);

lessonRouter.delete('/video/:lessonId', jwtAuthenticator("teacher"), lessonController.deleteVideoLesson);

lessonRouter.put('/video/:lessonId', jwtAuthenticator("teacher"), uploadLocal.single("lessonVideo"), lessonController.verifyUpdateLesson, uploadVideoToCloudMW, lessonController.updateVideoLesson);

lessonRouter.patch('/swapIndex', lessonController.swapLesson);
module.exports = lessonRouter;
