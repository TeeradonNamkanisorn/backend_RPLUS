const express = require('express');
const User = require('../models2/user');
const { v4: uuidv4 } = require('uuid');
const Teacher = require('../models2/teacher');
const teacherController = require("../controllers/teacherController");
const jwtAuthenticator = require('../middlewares/jwtAuthenticator');
// const teacherJwtValidationMW = require('../middlewares/teacherJwtValidationMW');
const teacherRouter = express.Router();




teacherRouter.post('/', teacherController.registerTeacher);

teacherRouter.get('/courses', jwtAuthenticator("teacher"), teacherController.getAllCourses);





module.exports = teacherRouter;