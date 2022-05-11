const express = require('express');
const User = require('../models/user');
const { v4: uuidv4 } = require('uuid');
const Teacher = require('../models/teacher');
const {registerTeacher} = require("../controllers/teacherController");
const teacherRouter = express.Router();




teacherRouter.post('/',(req, res, next) => {
    console.log('success');
    next();
  }, registerTeacher)


const updateImage = async (req, res, next) => {
    res.send();
}

module.exports = teacherRouter;