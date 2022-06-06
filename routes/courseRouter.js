const express = require('express');

const courseController = require('../controllers/courseController');
const jwtAuthenticator = require('../middlewares/jwtAuthenticator');
const { uploadPreviewMedia } = require('../services/multerUploads');
const { uploadVidAndImageToCloudMW, uploadEitherOrBothVideoAndImageToCloudMW  } = require('../utils/cloudinary');


const courseRouter = express.Router();




courseRouter.get('/:id', jwtAuthenticator("teacher"), courseController.getCourseInfo);

courseRouter.get("/", jwtAuthenticator(), courseController.getAllCourse)

courseRouter.post('/', jwtAuthenticator("teacher"), uploadPreviewMedia, uploadVidAndImageToCloudMW , courseController.createCourse);

courseRouter.put('/:courseId', jwtAuthenticator("teacher"), uploadPreviewMedia, uploadEitherOrBothVideoAndImageToCloudMW , courseController.updateCourse)
courseRouter.patch('/:courseId', jwtAuthenticator("teacher"), courseController.publicizeCourse);
module.exports = courseRouter;