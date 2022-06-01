const express = require('express');
const Chapter = require('../models2/chapter');
const { v4: uuidv4 } = require('uuid');
const Course = require('../models2/course');
const chapterController = require('../controllers/chapterController');
const jwtAuthenticator = require('../middlewares/jwtAuthenticator');

const chapterRouter = express.Router();

chapterRouter.post("/appendChapter", jwtAuthenticator("teacher"), chapterController.appendChapter);

chapterRouter.post('/insertChapter', jwtAuthenticator("teacher"), chapterController.insertChapterByIndex);

chapterRouter.get('/:courseId', jwtAuthenticator("teacher"), chapterController.getAllChapters);

module.exports = chapterRouter;
