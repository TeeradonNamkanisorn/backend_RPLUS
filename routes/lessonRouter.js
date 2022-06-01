const express = require('express');
const { uuid } = require('uuidv4');
const lessonController = require('../controllers/lessonController');
const {uploadVideoToCloudMW}= require('../utils/cloudinary');
const Chapter = require('../models2/chapter');
const Lesson = require('../models2/Lesson');
const uploadLocal = require('../utils/uploadLocal');
const jwtAuthenticator = require('../middlewares/jwtAuthenticator');


const lessonRouter = express.Router();

lessonRouter.post("/video", jwtAuthenticator("teacher"), uploadLocal.single("lessonVideo"),lessonController.verifyLesson, uploadVideoToCloudMW, lessonController.appendVideoLesson);

module.exports = lessonRouter;
