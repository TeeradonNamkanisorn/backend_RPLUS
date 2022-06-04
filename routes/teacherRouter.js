const express = require('express');
const { v4: uuidv4 } = require('uuid');
const teacherController = require("../controllers/teacherController");
const jwtAuthenticator = require('../middlewares/jwtAuthenticator');
const authContoller = require('../controllers/authController');
// const teacherJwtValidationMW = require('../middlewares/teacherJwtValidationMW');
const teacherRouter = express.Router();




teacherRouter.post('/', authContoller.registerTeacher);

teacherRouter.get('/courses', jwtAuthenticator("teacher"), teacherController.getAllCourses);





module.exports = teacherRouter;