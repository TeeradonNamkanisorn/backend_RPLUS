const jwt = require('jsonwebtoken');
const {v4 : uuidv4} = require('uuid');
const { Lesson, Chapter, Course, VideoLesson } = require('../models/index1')

module.exports.verifyLesson = async (req, res, next) => {
    //PAYLOAD : {title, chapterId}
    //Headers: {authorization: "BEARER TOKEN"}
    try {
        const chapterId = req.headers["chapterid"];
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        const {userId, role} = decoded;
        if (!decoded || !userId) createError("Invalid token", 401);
        if (role !== "teacher") createError("You are not authorized", 403);

        console.log(req.headers);
        //Find the creator of the lesson
        const chapter = await Chapter.findByPk(chapterId);
        const courseId = chapter.courseId;
        const course = await Course.findOne({where: {id: courseId}});
        const teacherId = course.teacherId;

        //teacherId and user's primary key: id are the same.
        if (teacherId !== userId) createError("Invalid token", 403);

      
    
    
        next();

        // res.send(lesson)
        
    } catch (err) {
        next(err)
    }
}

module.exports.appendLesson = async (req, res, next) => {
    const {title, chapterid: chapterId, description} = req.headers;
    const url = req.uploadData.url;
    const lessonType = req.uploadedFileType;
    const maxIndex = await Lesson.max('lessonIndex', {where: {chapterId}});
    const newIndex = (maxIndex || 0)+1;
    const id = uuidv4();

    const lesson = await Lesson.create({title, id, lessonIndex: newIndex, lessonType, chapterId});
    const videoLesson = await VideoLesson.create({title, url, id, description, lessonId: id})
    //title, url, id, description
    res.json({lesson, url})
};
