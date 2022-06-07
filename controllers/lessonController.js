const jwt = require('jsonwebtoken');
const {v4 : uuidv4} = require('uuid');
const { Lesson, Chapter, Course, VideoLesson, sequelize, StudentLesson } = require("../models");
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
        if (teacherId !== userId) createError("You are forbidden to edit this resource", 403);
        
       
      
    
    
        next();

        // res.send(lesson)
        
    } catch (err) {
        next(err)
    }
}

module.exports.verifyUpdateLesson = async (req, res, next) => {
    try {
        const {lessonId} = req.params;
        const {title} = req.body;
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        const {userId, role} = decoded;
        if (!decoded || !userId) createError("Invalid token", 401);
        if (role !== "teacher") createError("You are not authorized", 403);
        if (title) {
            if (title?.trim() === '') createError('invalid title');
        }
        const lesson = await Lesson.findByPk(lessonId); 
        const chapter = await lesson.getChapter();
        const course = await chapter.getCourse();
        const teacher = await course.getTeacher();
        if (teacher.id !== userId) createError("You are forbidden to edit this resource", 403);

        next();

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

        const courseId = course.id;
        const vidPublicId = videoLesson.videoPublicId;
        console.log(videoLesson);
        if (vidPublicId) {
            const result = await destroy(vidPublicId, {resource_type: "video"});
            console.log(result);
        }

        const index = lesson.lessonIndex;
        await StudentLesson.destroy({where: {
            lessonId
        }, transaction: t});
        const deleteResult = await VideoLesson.destroy({where: {id: videoLesson.id}, transaction: t});
        await Lesson.destroy({where: {id: lessonId}, transaction: t})

        //Decrease indexes by 1 for chapters after
        
        const result = await Lesson.increment({lessonIndex: -1}, {where: {
            lessonIndex: {
                [Op.gte]: index
            },
            id: lesson.chapterId
        }, transaction : t },  );
        
        await t.commit();

        await course.changed('updatedAt', true);
        await course.save();

        res.json({message: "deleted successfully"});
    
    } catch (error) {
        await t.rollback();
        next(error)
    }
}

module.exports.appendVideoLesson = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const {title, chapterId, description} = req.body;
        console.log(req.uploadData);

        //req.upload data is parsed by the cloudinary upload middleware
        const url = req.uploadData.secure_url;
        //in seconds
        const duration = req.uploadData.duration;
        const videoPublicId = req.uploadData.public_id;

        //No need no get lesson type through body since path is exclusive to video lessons only
        const lessonType = req.uploadedFileType;
        const id = uuidv4();
        const maxIndex = await Lesson.max('lessonIndex', {where: {chapterId}, transaction : t});

        const chapter = await Chapter.findOne({where: {id: chapterId}, transaction : t});
        const courseId = chapter.courseId;
        const course = await chapter.getCourse();

        const newIndex = (maxIndex || 0)+1;
    
        const lesson = await Lesson.create({title, id, lessonIndex: newIndex, lessonType, chapterId, courseId}, {transaction : t});
        const videoLesson = await VideoLesson.create({title, url, id, description, lessonId: id, duration, videoPublicId, courseId} , {
            transaction : t
        });

        await course.changed('updatedAt', true);
        await t.commit();

        await course.save();
        
        
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

exports.updateVideoLesson = async (req, res, next) => {
    //params: lessonId
    const t = await sequelize.transaction();
    try {
        const {title, description} = req.body;
        const url = req.uploadData?.secure_url;
        const duration = req.uploadData?.duration;
        const videoPublicId = req.uploadData?.public_id;
        const lessonType = req.uploadedFileType;
        const lessonId = req.params.lessonId;
        
        const lesson = await Lesson.findByPk(lessonId, {transaction: t});
        const videoLesson = await VideoLesson.findByPk(lessonId, {transaction: t});
        const chapter = await lesson.getChapter();
        const course = await chapter.getCourse();
        const courseId = course.id

        console.log(videoLesson.videoPublicId);
        if (videoLesson.videoPublicId && req.uploadData) {
            const result = await destroy(videoLesson.videoPublicId, {resource_type: "video"});
            console.log(result);
        } else if (!videoLesson.videoPublicId) {
            createError("A video lesson must have a public id", 500);
        }

        // Description is inside the video lesson
        await Lesson.update({title},{ where:{id: lessonId}, transaction: t});
        await VideoLesson.update({title, description, url, videoPublicId, duration}, {where: {id : lessonId}, transaction: t});

        await t.commit();

        await course.changed('updatedAt', true);
        await course.save();
        

        res.status(200).json({lesson: {
            title,
            chapterId: lesson.chapterId,
            id: lesson.id,
            description,
            url,
            lessonType,
            videoPublicId,
            duration
        }})
       

    } catch (err) {
        await t.rollback();
        next(err)
    }
}
