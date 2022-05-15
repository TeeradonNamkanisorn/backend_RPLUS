const express = require('express');
const { uuid } = require('uuidv4');
const lessonController = require('../controllers/lessonController');
const uploadToCloud = require('../middlewares/uploadToCloudMW');
const Chapter = require('../models/chapter');
const Lesson = require('../models/Lesson');
const uploadLocal = require('../utils/uploadLocal');


const lessonRouter = express.Router();

lessonRouter.post("/video-upload", lessonController.verifyLesson, uploadLocal.single("file"), uploadToCloud);

module.exports = lessonRouter;
