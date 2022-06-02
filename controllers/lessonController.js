const jwt = require('jsonwebtoken');
const {v4 : uuidv4} = require('uuid');
const { Lesson, Chapter, Course, VideoLesson, sequelize } = require("../models");
const { Op } = require('sequelize');
const { destroy } = require('../utils/cloudinary');
const createError = require('../utils/createError');

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

module.exports.deleteVideoLesson = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { lessonId } = req.params
        const videoLesson = await VideoLesson.findByPk(lessonId);
        const lesson = await Lesson.findByPk(lessonId);
        if (!lesson) createError("lesson not found", 400);
        const chapter = await Chapter.findByPk(lesson.chapterId);
        if (!chapter) createError("invalid chapter", 500);
        const course = await Course.findByPk(chapter.courseId);
        if (!course) createError("course not found", 500);
        if (course.teacherId !== req.user.id) createError("You are not authorized", 403);

        const vidPublicId = videoLesson.videoPublicId;
        console.log(videoLesson);
        if (vidPublicId) {
            const result = await destroy(vidPublicId, {resource_type: "video"});
            console.log(result);
        }

        const index = lesson.index;

        const deleteResult = await VideoLesson.destroy({where: {id: videoLesson.id}}, {transaction: t});
        await Lesson.destroy({where: {id: lessonId}})

        //Decrease indexes by 1 for chapters after
        const result = await Lesson.increment({lessonIndex: -1}, {where: {
            lessonIndex: {
                [Op.gte]: index
            }
        }}, {transaction: t} );
        await t.commit();
        res.json({message: "deleted successfully"});
    
    } catch (error) {
        await t.rollback();
        next(error)
    }
}

module.exports.appendVideoLesson = async (req, res, next) => {
    try {
        const {title, chapterId, description} = req.body;
        console.log(req.uploadData);

        const url = req.uploadData.secure_url;
        //in seconds
        const duration = req.uploadData.duration;
        const videoPublicId = req.uploadData.public_id;
        const lessonType = req.uploadedFileType;
        const maxIndex = await Lesson.max('lessonIndex', {where: {chapterId}});
        const newIndex = (maxIndex || 0)+1;
        const id = uuidv4();
    
        const lesson = await Lesson.create({title, id, lessonIndex: newIndex, lessonType, chapterId});
        const videoLesson = await VideoLesson.create({title, url, id, description, lessonId: id, duration, videoPublicId});
        console.log(videoLesson.url)
        res.json({lesson: {
            id: lesson.id,
            title: lesson.title,
            lessonIndex: lesson.lessonIndex,
            lessonType: lesson.lessonType,
            chapterId: lesson.chapterId,
            url: videoLesson.url,
            description: videoLesson.description,
            duration
        }});
    } catch (error) {
        next(error)
    }
};
