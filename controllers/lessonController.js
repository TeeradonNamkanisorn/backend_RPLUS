const jwt = require('jsonwebtoken');
const {v4 : uuidv4} = require('uuid');
const { Lesson, Chapter, Course, VideoLesson } = require('../models2/index1')

module.exports.verifyLesson = async (req, res, next) => {
    //PAYLOAD : {title, chapterId}
    //Headers: {authorization: "BEARER TOKEN"}
    try {
        const chapterId = req.body["chapterId"];
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        const {userId, role} = decoded;
        if (!decoded || !userId) createError("Invalid token", 401);
        if (role !== "teacher") createError("You are not authorized", 403);

        console.log(req.headers);
        //Find the creator of the lesson
        console.log(chapterId)
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

module.exports.appendVideoLesson = async (req, res, next) => {
    try {
        const {title, chapterId, description} = req.body;
        console.log(req.body);
        const url = req.uploadData.secure_ur;
        //in seconds
        const duration = req.uploadData.duration;
        const lessonType = req.uploadedFileType;
        const maxIndex = await Lesson.max('lessonIndex', {where: {chapterId}});
        const newIndex = (maxIndex || 0)+1;
        const id = uuidv4();
    
        const lesson = await Lesson.create({title, id, lessonIndex: newIndex, lessonType, chapterId});
        const videoLesson = await VideoLesson.create({title, url, id, description, lessonId: id, duration});
        res.json({lesson: {
            id: lesson.id,
            title: lesson.title,
            lessonIndex: lesson.lessonIndex,
            lessonType: lesson.lessonType,
            chapterId: lesson.chapterId,
            url: videoLesson.url,
            description: videoLesson.description,
            duration
        }})
    } catch (error) {
        next(error)
    }
};
