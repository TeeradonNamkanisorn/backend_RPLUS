const bcrypt = require('bcrypt');
const {v4 : uuidv4} = require('uuid');
const jwt = require('jsonwebtoken');
const { Course, Teacher, User, Chapter, sequelize, Lesson } = require('../models/index1');
const {Op} = require('sequelize');
const createError = require('../utils/createError');

exports.validateCourseParams = async (req, res, next) => {
    
    try {
        const validLevels = ["all", "beginner", "intermediate", "advanced"]
        if (req.headers.name.length > 0) createError("Course name can't be empty");
        if (!validLevels.includes(req.headers.level)) createError("Invalid course level");
        //If there's any white space before or after coursename, trim them.
        req.headers.name = req.headers.name?.trim();
        next();
    } catch (error) {
        next(error);
    }
}

exports.createCourse = async (req, res, next) => {
// PAYLOAD required
// HEADERS: {authorization: BEARER __TOKEN} : TOKEN WITH USER_ID, ROLE, USERNAME AND EMAIL
// MUST BE AUTHENTICATED TO BE ABLE TO ACCESS REQ.USER
try {
    const {name,description,level} = req.headers;

    const {id: userId} = req.user;

    const imageUrl = req.imageData.url;
    const videoUrl = req.videoData.url;

    const result = await Course.create({name, description, teacherId: userId, id: uuidv4(), level, imageLink: imageUrl, videoLink: videoUrl});

    res.send(result);
} catch(err) {
 next(err)
}
};

exports.getCourseInfo = async (req, res, next) => {
    const courseId = req.params.id;
    const course = await Course.findByPk(courseId);

    const {id, name, imageLink, videoLink, description, level, createdAt, updatedAt, teacherId, price, length} = course;
    res.json({course});
}