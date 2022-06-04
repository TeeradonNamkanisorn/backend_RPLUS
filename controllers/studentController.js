const { Student, Course, sequelize, studentCourse } = require('../models');
const studentCourse = require('../models/studentCourse');
const { v4 : uuidv4 } = require('uuid')



exports.buyCourse = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const studentId = req.user.id;
        const courseId = req.user.courseId;
        const id = uuidv4();
        const course = await Course.findOne({where : {
            id: courseId
        }, transaction: t});

        const price = course.price;

        const studentCourse = await studentCourse.create({id, studentId, courseId, price}, {transaction: t});
        console.log(studentCourse);

        res.status(201).json({
            studentCourse
        })

    } catch (error) {
        await t.rollback();
        next(error)
    }
};