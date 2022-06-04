const bcrypt = require('bcryptjs');
const {v4 : uuidv4} = require('uuid');
const jwt = require('jsonwebtoken');
const { Course, Teacher, User, Chapter, sequelize, Lesson } = require("../models")
const {Op} = require('sequelize');
const createError = require('../utils/createError');
const { destroy } = require('../utils/cloudinary');

const { clearMediaLocal } = require('../services/clearFolder');

exports.validateCourseParams = async (req, res, next) => {
    
    try {
        const validLevels = ["all", "beginner", "intermediate", "advanced"]
        if (req.body.name.length > 0) createError("Course name can't be empty");
        if (!validLevels.includes(req.body.level)) createError("Invalid course level");
        //If there's any white space before or after coursename, trim them.
        req.body.name = req.body.name?.trim();
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
    const {name,description,level} = req.body;

    const {id: userId} = req.user;

    const imageUrl = req.imageData.secure_url;
    const videoUrl = req.videoData.secure_url;

    const result = await Course.create({name, description, teacherId: userId, id: uuidv4(), level, imageLink: imageUrl, videoLink: videoUrl,
    imagePublicId: req.imageData.public_id, videoPublicId: req.imageData.public_id});

    res.send(result);
} catch(err) {
 next(err)
}
};

exports.getCourseInfo = async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const course = await Course.findByPk(courseId);
    
        const {id, name, imageLink, videoLink, description, level, createdAt, updatedAt, teacherId, price, length} = course;
        res.json({course});
    } catch (error) {
        next(error)
    }
}

exports.updateCourse = async (req, res, next) => {
    try {

        const {name,description,level} = req.body;

        const {id: userId} = req.user;
        const {courseId} = req.params;
    
        const imageUrl = req.imageData?.secure_url;
        const videoUrl = req.videoData?.secure_url;
    
    
    
        const course = await Course.findOne({where: {id: courseId} });
    
        if (!course) createError("course not found");
        if (course.teacherId !== userId) createError("you are not authorized to edit", 403);
      
       // If we want to replace the existing image url
        if (course.imageLink && req.imageData?.secure_url) {
            const result = await destroy(course.imagePublicId)
            course.imagePublicId = req.imageData?.public_id ;
            course.imageLink = imageUrl;
        }
        //otherwise the imageLink stays the same
    
        if (course.videoLink && req.videoData?.secure_url) {
            const result = await destroy(course.videoPublicId, {resource_type: "video"});
            course.videoPublicId = req.videoData?.public_id ;
            course.videoLink = videoUrl;
        }
    
    
        
        
        
        course.name = name;
        course.description = description;
        course.level = level
    
        const result = await course.save();
    
        clearMediaLocal();
    
        res.send({result: "success"});
    } catch (error) {
        next(error)
    }
}