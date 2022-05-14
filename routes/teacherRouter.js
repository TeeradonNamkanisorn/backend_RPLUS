const express = require('express');
const User = require('../models/user');
const { v4: uuidv4 } = require('uuid');
const Teacher = require('../models/teacher');
const teacherController = require("../controllers/teacherController");
const teacherRouter = express.Router();




teacherRouter.post('/', teacherController.registerTeacher)

teacherRouter.post("/createCourse", teacherController.createCourse);

teacherRouter.post("/appendChapter", teacherController.appendChapter)

module.exports = teacherRouter;