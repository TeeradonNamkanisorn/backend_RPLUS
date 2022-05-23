const express = require('express');

const courseController = require('../controllers/courseController');
const jwtAuthenticator = require('../middlewares/jwtAuthenticator');
const { uploadPreviewMedia } = require('../services/multerUploads');
const { uploadVidAndImageToCloud  } = require('../services/uploadToCloudMW');


const courseRouter = express.Router();
const intercept = (req, res) => {
    console.log(req.files)
    res.send("success");
}



courseRouter.get('/:id', jwtAuthenticator("teacher"), courseController.getCourseInfo);

courseRouter.post('/', jwtAuthenticator("teacher"), uploadPreviewMedia, uploadVidAndImageToCloud , courseController.createCourse);

module.exports = courseRouter;