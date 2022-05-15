const Chapter = require("../models/chapter");
const Course = require("../models/course");
const jwt = require('jsonwebtoken');
const {v4 : uuidv4} = require('uuid');

module.exports.verifyLesson = async (req, res, next) => {
    //PAYLOAD : {title, lessonType, chapterId, index}
    //Headers: {authorization: "BEARER TOKEN"}
    try {
        const {title, lessonType, chapterId} = req.body;
        const id = uuidv4();
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        const {userId, role} = decoded;
        if (!decoded || !userId) createError("Invalid token", 401);
        if (role !== "teacher") createError("You are not authorized", 403);

        //Find the creator of the lesson
        const chapter = await Chapter.findByPk(chapterId);
        const courseId = chapter.courseId;
        const course = await Course.findOne({where: {id: courseId}});
        const teacherId = course.teacherId;

        //teacherId and user's primary key: id are the same.
        if (teacherId !== userId) createError("Invalid token", 403);

        // const maxIndex = await Lesson.max('lessonIndex', {where: {chapterId}});
        // const newIndex = (maxIndex || 0)+1;
        // const lesson = await Lesson.create({title, id, lessonIndex: newIndex, lessonType, chapterId});
    
        next();

        // res.send(lesson)
        
    } catch (err) {
        next(err)
    }
}
