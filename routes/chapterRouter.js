const express = require('express');
const Chapter = require('../models/chapter');
const { v4: uuidv4 } = require('uuid');
const Course = require('../models/course');
const chapterController = require('../controllers/chapterController');

const chapterRouter = express.Router();

chapterRouter.post("/appendChapter", chapterController.appendChapter);

chapterRouter.post('/insertChapter', chapterController.insertChapterByIndex);

module.exports = chapterRouter;
