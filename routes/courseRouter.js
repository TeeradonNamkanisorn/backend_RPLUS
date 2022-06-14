const express = require("express");

const courseController = require("../controllers/courseController");
const jwtAuthenticator = require("../middlewares/jwtAuthenticator");
const { uploadPreviewMedia } = require("../services/multerUploads");
const {
  uploadVidAndImageToCloudMW,
  uploadEitherOrBothVideoAndImageToCloudMW,
} = require("../utils/cloudinary");

const courseRouter = express.Router();

courseRouter.get(
  "/owned",
  jwtAuthenticator("student"),
  courseController.getStudentOwnedCourses
);

courseRouter.get(
  "/",
  jwtAuthenticator("student"),
  courseController.getAllNotOwnedCourses
);

courseRouter.get(
  "/as-student/:courseId",
  jwtAuthenticator("student"),
  courseController.getStudentOwnedCourseById
);

courseRouter.post(
  "/",
  jwtAuthenticator("teacher"),
  uploadPreviewMedia,
  uploadVidAndImageToCloudMW,
  courseController.createCourse
);

courseRouter.put(
  "/:courseId",
  jwtAuthenticator("teacher"),
  uploadPreviewMedia,
  uploadEitherOrBothVideoAndImageToCloudMW,
  courseController.updateCourse
);

courseRouter.patch(
  "/:courseId/price",
  jwtAuthenticator("teacher"),
  courseController.changePrice
);

courseRouter.patch(
  "/:courseId",
  jwtAuthenticator("teacher"),
  courseController.publicizeCourse
);

courseRouter.get("/:id", jwtAuthenticator(), courseController.getCourseInfo);

module.exports = courseRouter;
