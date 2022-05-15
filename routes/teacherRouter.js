const express = require('express');
const User = require('../models/user');
const { v4: uuidv4 } = require('uuid');
const Teacher = require('../models/teacher');
const teacherController = require("../controllers/teacherController");
// const teacherJwtValidationMW = require('../middlewares/teacherJwtValidationMW');
const teacherRouter = express.Router();




teacherRouter.post('/', teacherController.registerTeacher)

teacherRouter.post("/createCourse", teacherController.createCourse);

teacherRouter.post("/appendChapter", teacherController.appendChapter);

teacherRouter.post('/insertChapter', teacherController.insertChapterByIndex);

teacherRouter.post('/appendLesson', teacherController.appendLesson)

module.exports = teacherRouter;