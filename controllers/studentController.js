const { Student, Course, sequelize, StudentCourse, Lesson, VideoLesson, StudentLesson } = require('../models');
const { v4 : uuidv4 } = require('uuid');
const createError = require('../utils/createError');
const ejs = require('ejs');
const pdf = require('html-pdf');
const util = require("util");
const { destroy } = require('../utils/cloudinary');

const renderFile = util.promisify(ejs.renderFile);

const createPdf = (data, options) => new Promise((resolve, reject) => {
    pdf.create(data, options).toFile(`certificates/${new Date()}.pdf`, (err, success) => {
        if (err) return reject(err);
        resolve(success);
    })
})



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

        // if (!lesson) createError('lesson not found', 400);

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
        const {firstName, lastName} = req.user;
        let today = new Date();
        const dateOptions = {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }
        const date = today.toLocaleDateString("jp-JP", dateOptions);
        const dateNumber = today.toLocaleString("jp-JP", dateOptions);
        console.log(date);
        const data = await renderFile("views/cert-template.ejs" , {firstName, lastName, date: date} );
        const options = {
                    height: "11.25in",
                width: "8.5in",
                header: {
                    height: "20mm"
                },
                footer: {
                    "height": "20mm",
                }
                };
        const response = await createPdf(data, options);
        // response : {filename: "/Users/admin/projects/fullstack_proj/backend/cert.pdf"}
        if (!response) createError("pdf creation error", 500);
        req.pdf = {fileName: response.filename}
        req.date = dateNumber;
        next();

    } catch (err) {
        next(err)
    }
}

exports.sendCertificate = async (req, res, next) => {
    try {
        const courseId = req.params.courseId;
        const studentId = req.user.id;
        const studentCourse = StudentCourse.findOne({where: 
            {
            studentId,
            courseId
        }
        });
        const {certificatePublicId} = studentCourse;
        if (certificatePublicId) {
            const result = await destroy(certificatePublicId);
            console.log(result);
        }
        if (!req.pdfData.public_id) createError("public id not found");
        studentCourse.certificatePublicId = req.pdfData.public_id;
        studentCourse.certificateUrl = req.pdfData.secure_url;
        if (!req.date) createError("NO date has been passed down", 500);
        studentCourse.latestCompletedDate = req.date;
        await studentCourse.save();
        res.json({certificate: {
            url: studentCourse.certificateUrl,
            latestDate: studentCourse.latestCompletedDate,
        }})
    } catch (error) {
        next(error)
    }
}