const express = require('express');

const { v4: uuidv4 } = require('uuid');

const chapterController = require('../controllers/chapterController');
const jwtAuthenticator = require('../middlewares/jwtAuthenticator');

const chapterRouter = express.Router();

chapterRouter.post("/appendChapter", jwtAuthenticator("teacher"), chapterController.appendChapter);

chapterRouter.post('/insertChapter', jwtAuthenticator("teacher"), chapterController.insertChapterByIndex);

chapterRouter.delete('/:chapterId', jwtAuthenticator("teacher"), chapterController.deleteChapter);
// chapterRouter.get('/:courseId', jwtAuthenticator("teacher"), chapterController.getAllChapters);

module.exports = chapterRouter;
