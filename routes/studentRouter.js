const router = require('express').Router();
const studentController = require("../controllers/studentController");

router.post('/course/:courseId', studentController.buyCourse);


module.exports = router;