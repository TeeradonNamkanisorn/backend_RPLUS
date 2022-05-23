const express = require('express');
const userController = require('../controllers/userController');
const jwtAuthenticator = require('../middlewares/jwtAuthenticator');

const userRouter = express.Router();

userRouter.post('/login', userController.loginUser);
userRouter.get('/', jwtAuthenticator(), userController.getUser);

module.exports = userRouter;
//