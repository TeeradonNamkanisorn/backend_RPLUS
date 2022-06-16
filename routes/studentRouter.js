const router = require('express').Router();
const studentController = require("../controllers/studentController");
const courseController = require('../controllers/courseController')
const { uploadPdf } = require('../utils/cloudinary');
const uploadLocal = require('../utils/uploadLocal');

// router.post('/course/:courseId', studentController.buyCourse);

router.post('/lesson/:lessonId', studentController.markLessonComplete);

router.post('/cert/:courseId', studentController.validateComplete, studentController.getCertficate, uploadPdf, studentController.sendCertificateStatus )
router.delete('/lesson/:lessonId', studentController.markLessonIncomplete);
router.post('/course/buy', studentController.checkPayment, studentController.buyCourses);
router.get('/cert/:courseId', studentController.downloadCertificate);

module.exports = router;