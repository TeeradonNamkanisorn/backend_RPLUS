const router = require('express').Router();
const studentController = require("../controllers/studentController");

router.post('/course/:courseId', studentController.buyCourse);

router.post('/lesson/:lessonId', studentController.markLessonComplete);

module.exports = router;