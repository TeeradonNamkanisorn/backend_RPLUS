const bcrypt = require('bcryptjs');
const {v4 : uuidv4} = require('uuid');
const jwt = require('jsonwebtoken');
const { Course, Teacher, User, Chapter, sequelize, Lesson, VideoLesson } = require("../models")
const {Op} = require('sequelize');
const createError = require('../utils/createError');
const { destroy } = require('../utils/cloudinary');
const { clearMediaLocal } = require('../services/clearFolder');
const { getOwnedCourses } = require('../services/courseServices');

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
       
        const course = await Course.findOne({where: {id: courseId}});
        
        const chapters = await Chapter.findAll({where: {courseId},
                    include: {
                        model: Lesson,
                        include: {
                            model: VideoLesson
                        }
                    }, 
                    order: [["chapterIndex", "ASC"],[Lesson, "lessonIndex", "ASC"]]
                   });
        const teacher = await course.getTeacher();
        
        const objCourse = JSON.parse(JSON.stringify(course));
            if (teacher.id !== req.user.id) createError("You are not authorized to view this resource", 403);
        res.json({course: {
            ...objCourse,
            chapters
        }});
    } catch (error) {
        next(error)
    }
}

exports.updateCourse = async (req, res, next) => {
    try {

        const {name,description,level,price} = req.body;

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
        course.updatedAt = new Date();
        if (price) course.price = price;
        
        await course.changed('updatedAt', true);
        await course.save();
    
        clearMediaLocal();
    
        res.send({result: "success"});
    } catch (error) {
        next(error)
    }
}

exports.publicizeCourse = async (req, res, next) => { 
    try {
        const courseId = req.params.courseId;
        const course = await Course.findByPk(courseId);
        course.isPublished = true;
        await course.changed('updatedAt', true);
        await course.save();
        res.sendStatus(204);
    } catch (error) {
        next(error)
    }
 }

 exports.getAllCourse = async (req, res, next) => {
     try {
         // get all registered course ids
         const studentId = req.user.id;
         const ownIds = await getOwnedCourses(studentId);
         let courses = await Course.findAll({
             include: {
                 model: Teacher,
                 attributes: ["firstName", "lastName"]
             },
             where : {
                 id : {
                     [Op.notIn] : ownIds
                 },
                 isPublished: true
             }
         });
         //get all the index to find the video lengths in the video lesson table
         const courseIds = courses.map(course => course.id);



         let totalLength = await VideoLesson.findAll({
             attributes: [
                 "courseId",
                [sequelize.fn('SUM', sequelize.col('duration')), 'duration']
             ],
             where: {
                 courseId: {
                     [Op.in] : courseIds
                 }
             },
             group: "courseId"
         });

         totalLength = JSON.parse(JSON.stringify(totalLength))
         //An array is returned. To make it easily accessble, transform it to an object.
         const totalLengthObj = totalLength.reduce( (acc, cur) => {
             acc[cur.courseId] = cur.duration;
             return acc
         },{});
         console.log(totalLengthObj)

         courses = JSON.parse(JSON.stringify(courses));
         //set total length key for all the fetched courses
         courses.forEach(course => {
             course.totalLength = totalLengthObj[course.id] || 0;
         })

         res.json({courses});
     } catch (err) {
         next(err);
     }
 }

