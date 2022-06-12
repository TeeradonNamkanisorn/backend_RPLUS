const router = require('express').Router();
const studentController = require("../controllers/studentController");
const courseController = require('../controllers/courseController')
const { uploadPdf } = require('../utils/cloudinary');

// router.post('/course/:courseId', studentController.buyCourse);

router.post('/lesson/:lessonId', studentController.markLessonComplete);

router.get('/cert/:courseId', studentController.validateComplete, studentController.getCertficate, uploadPdf, studentController.sendCertificate )
router.delete('/lesson/:lessonId', studentController.markLessonIncomplete);
router.post('/course/buy', studentController.checkPayment, studentController.buyCourses)
module.exports = router;