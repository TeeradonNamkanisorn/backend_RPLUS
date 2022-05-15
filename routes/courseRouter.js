const express = require('express');

const courseController = require('../controllers/courseController');

const courseRouter = express.Router();

courseRouter.post('/', courseController.createCourse)

module.exports = courseRouter;