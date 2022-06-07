const { Course, StudentCourse } = require('../models');

module.exports.getOwnedCourses = async (studentId) => {
    const ids = await StudentCourse.findAll({
        attributes: ["courseId"],
        where: {
            studentId
        }
    });
    return JSON.parse(JSON.stringify(ids)).map(el => el.courseId);
}