const express = require('express');
const Chapter = require('../models/chapter');
const { v4: uuidv4 } = require('uuid');
const Course = require('../models/course');
const chapterController = require('../controllers/chapterController');
const jwtAuthenticator = require('../middlewares/jwtAuthenticator');

const chapterRouter = express.Router();

chapterRouter.post("/appendChapter", jwtAuthenticator("teacher"), chapterController.appendChapter);

chapterRouter.post('/insertChapter', jwtAuthenticator("teacher"), chapterController.insertChapterByIndex);

module.exports = chapterRouter;
