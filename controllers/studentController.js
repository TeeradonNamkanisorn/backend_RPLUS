const { Student, Course, sequelize, StudentCourse, Lesson, VideoLesson, StudentLesson } = require('../models');
const { v4 : uuidv4 } = require('uuid');
const createError = require('../utils/createError');
const ejs = require('ejs');
const pdf = require('html-pdf');
const util = require("util");
const { destroy } = require('../utils/cloudinary');
const { clearCertificateDir } = require('../services/clearFolder');
const omise = require('../utils/omise');
const { USDtoTHB } = require('../services/currencyConverter');



const renderFile = util.promisify(ejs.renderFile);

const createPdf = (data, options) => new Promise((resolve, reject) => {
    pdf.create(data, options).toFile(`certificates/${new Date()}.pdf`, (err, success) => {
        if (err) return reject(err);
        resolve(success);
    })
})



exports.buyCourses = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const studentId = req.user.id;
        const {courseItems} = req.body;
        const id = uuidv4();
        // const course = await Course.findOne({where : {
        //     id: courseId
        // }, transaction: t});

        const courseArray = courseItems.map(el => (
            {
                id: uuidv4(),
                studentId,
                courseId: el.id,
                price: el.price
            }
        ));
        
        
        
       

        const studentCourses = await StudentCourse.bulkCreate(courseArray, {transaction: t});
        console.log(studentCourses);
        await t.commit();
        
        res.status(201).json({
            studentCourses
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
        console.log(courseId);
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
        //June 6, 2022
        const date = today.toLocaleDateString("jp-JP", dateOptions);
        //2022/6/6
        
        
        //Format date to ISO standard.
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
        req.pdf = {filename: response.filename}
        req.date = today;
        next();

    } catch (err) {
        next(err)
    }
}

exports.sendCertificate = async (req, res, next) => {
    try {
        const courseId = req.params.courseId;
        const studentId = req.user.id;
        const studentCourse = await StudentCourse.findOne({where: 
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
        if (!req.certificateData.public_id) createError("public id not found");
        studentCourse.certificatePublicId = req.certificateData.public_id;
        studentCourse.certificateUrl = req.certificateData.secure_url;
        if (!req.date) createError("NO date has been passed down", 500);
        studentCourse.latestCompletedDate = req.date;
        console.log(req.date)
        await studentCourse.save();
        res.json({certificate: {
            url: studentCourse.certificateUrl,
            latestDate: studentCourse.latestCompletedDate,
        }})
    } catch (error) {
        next(error)
    } finally {
        clearCertificateDir();
    }
}

exports.checkPayment = async (req, res, next) => {
    try {
        const {omiseToken: token, courseItems} = req.body;
        const user = req.user;
        console.log(courseItems);
        const sum = courseItems.reduce((sum, cur) => sum+(cur.price) , 0) // in dollars
       
       const customer = await omise.customers.create({
           email: user.email,
           description: user.firstName + user.lastName,
           card: token
       })
       console.log(customer);
    
       const charge = await omise.charges.create({
           amount: sum*100,
           currency: "usd",
           customer: customer.id
       })
       
       for (let courseItem of courseItems) {
           
           const {id: courseId, price} = courseItem;
           const course = await Course.findByPk(courseId)
           const teacher = await course.getTeacher();
           const creditCardNumber = teacher.creditCardNumber;
           console.log(creditCardNumber)
           const recipient = await omise.recipients.create({
               name: teacher.firstName + ' '  +teacher.lastName,
               email: teacher.email,
               type: "individual",
               bank_account: {
                   number: creditCardNumber,
                   name: teacher.firstName + ' '  +teacher.lastName,
                   bank_code: "bbl"
               }
           });
           //amount must be in cents
           //I take half of the teachers' income
           console.log("price = ------", price);
           try {
                amount = await USDtoTHB(Number(price));
           } catch (err) {
               console.log(err);
               amount = Number(price) * 35;
           }
           //baht to satang
           const transfer = await omise.transfers.create({
               amount: Number(amount)*0.8*100,
               recipient: recipient.id,
               currency: "usd"
           })
           console.log("recipient: ------",recipient);
           console.log("transfer:-------",transfer);
           console.log("charge------->", charge)
    
        }
        next();
    } catch (err) {
        next(err)
    }

}