const express = require('express');
const authController = require('../controllers/authController');
const jwtAuthenticator = require('../middlewares/jwtAuthenticator');
const teacherController = require('../controllers/teacherController');
const uploadLocal = require('../utils/uploadLocal');

const userRouter = express.Router();

//auth is either for authenthication or common route 
userRouter.post('/login', authController.loginUser);
userRouter.get('/', jwtAuthenticator(), authController.getUser);
userRouter.post('/teacher', authController.registerTeacher);
userRouter.post('/student', authController.registerStudent);

//Handling update for both student and teacher.
userRouter.patch('/', uploadLocal.single('profilePic'), jwtAuthenticator(),authController.updateProfile);
module.exports = userRouter;
