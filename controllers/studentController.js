const { Student, Course, sequelize, StudentCourse, Lesson, VideoLesson, StudentLesson } = require('../models');
const { v4 : uuidv4 } = require('uuid');
const createError = require('../utils/createError');



exports.buyCourse = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const studentId = req.user.id;
        const courseId = req.params.courseId;
        const id = uuidv4();
        const course = await Course.findOne({where : {
            id: courseId
        }, transaction: t});

        const price = course.price;

        const studentCourse = await StudentCourse.create({id, studentId, courseId, price}, {transaction: t});
        console.log(studentCourse);

        await t.commit();
        res.status(201).json({
            studentCourse
        })

    } catch (error) {
        await t.rollback();
        next(error)
    }
};

exports.markLessonComplete = async (req, res, next) => {
    try {
        const studentId = req.user.id;
        const lessonId = req.params.lessonId;
        const { status } = req.body;
    
        const lesson = await Lesson.findOne({where: {
            id: lessonId
        }});

        const chapter = await lesson.getChapter();
        if (!chapter) createError("chapter does not match", 400);
        const course = await chapter.getCourse();
        if (!course) createError("course does not match", 400);
    
        if (lesson.lessonType !== "video") {
            createError("Non-video lessons cannot be marked complete manually");
        }
    
        const studentLesson = await StudentLesson.create({
            studentId,
            lessonId,
            status: "COMPLETED",
            courseId: course.id,
            id: uuidv4()
        });

        if (!studentLesson) {
            createError("student's lesson not found", 400);
        }
    
        res.sendStatus(204);
    } catch (err) {
        next(err)
    }
}

exports.validateComplete = async (req, res, next) => {
    try {
        const courseId = req.params.courseId;
        const studentId = req.user.id;
        //count all of the lessons that the student has completed
        const { count : lessonsCompleted } = await StudentLesson.findAndCountAll({where: {
            studentId,
            courseId,
            status: "COMPLETED"
        }});
        const { count: lessonCount } = await Lesson.findAndCountAll({where : {
            courseId
        }});
        if ( lessonCount === 0) createError("no lessons found");
        if (lessonsCompleted < lessonCount) createError("You are have not taken all the lessons");

        //student info is already in req.user
        next();

    } catch (err) {
        next(err);
    }
}

exports.getCertficate = async (req, res, next) => {
    try {
        
    } catch (err) {
        next(err)
    }
}