const express = require('express');
const authController = require('../controllers/authController');
const jwtAuthenticator = require('../middlewares/jwtAuthenticator');
const teacherController = require('../controllers/teacherController');

const userRouter = express.Router();

userRouter.post('/login', authController.loginUser);
userRouter.get('/', jwtAuthenticator(), authController.getUser);
userRouter.post('/teacher', authController.registerTeacher);
userRouter.post('/student', authController.registerStudent);

module.exports = userRouter;
