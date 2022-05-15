const express = require('express');
const { uuid } = require('uuidv4');
const lessonController = require('../controllers/lessonController');
const Chapter = require('../models/chapter');
const Lesson = require('../models/Lesson');

const lessonRouter = express.Router();

lessonRouter.post("/video-upload", lessonController.verifyLesson)

module.exports = lessonRouter;
