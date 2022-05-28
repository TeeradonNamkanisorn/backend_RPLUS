const express = require('express');

const courseController = require('../controllers/courseController');
const jwtAuthenticator = require('../middlewares/jwtAuthenticator');
const { uploadPreviewMedia } = require('../services/multerUploads');
const { uploadVidAndImageToCloudMW, uploadEitherOrBothVideoAndImageToCloudMW  } = require('../utils/cloudinary');


const courseRouter = express.Router();
const intercept = (req, res) => {
    console.log(req.files)
    res.send("success");
}



courseRouter.get('/:id', jwtAuthenticator("teacher"), courseController.getCourseInfo);

courseRouter.post('/', jwtAuthenticator("teacher"), uploadPreviewMedia, uploadVidAndImageToCloudMW , courseController.createCourse);

courseRouter.put('/:courseId', jwtAuthenticator("teacher"), uploadPreviewMedia, uploadEitherOrBothVideoAndImageToCloudMW , courseController.updateCourse)

module.exports = courseRouter;