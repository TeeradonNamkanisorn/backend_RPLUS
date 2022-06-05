const bcrypt = require('bcryptjs');
const {v4 : uuidv4} = require('uuid');
const jwt = require('jsonwebtoken');
const { Course, Teacher, User, Chapter, sequelize, Lesson, VideoLesson} = require("../models")
const {Op} = require('sequelize');
const createError = require('../utils/createError');

exports.appendChapter = async (req, res, next) => {
    // PAYLOAD required
    // HEADERS: {authorization: BEARER __TOKEN}
    // BODY: {name, description, courseId}
    try {
        
        const {name, description, courseId} = req.body;
        const id = uuidv4();

       const course = await Course.findByPk(courseId);
       if (course.teacherId !== req.user.id) createError("You are unauthorized", 403);
        //Find the index of the highest chapter then add it by one to get the new chapter's index
        const max_index = await Chapter.max('chapterIndex', {where: {courseId}});
        const new_index = max_index? max_index+1 : 1;
        const result = await Chapter.create({name, chapterIndex: new_index, description, id, courseId});

        res.json(result);


    } catch (err) {
        next(err)
    }
};

exports.insertChapterByIndex = async (req, res, next) => {
    //Payloads: {name, index, description, courseId}
    //Headers: {authorization: BEARER TOKEN}
   try {
        const {name, index, description, courseId} = req.body;
        const id = uuidv4();

        const token = req.headers.authorization?.split(' ')[1];

        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        
        const {userId,role} = decoded;

        if (!decoded) createError("Invalid token", 401);

        const user = await User.findByPk(userId);

        if (!user) createError("User Id not found", 400);
        if (role !== "teacher") createError("Only teachers are authorized to edit the resource", 403);

        //To insert a chapter in-between, increase the index of chapters beyond the current by 1
        //Op.gte = greater or equal
        const result = await Chapter.increment({chapterIndex: 1}, {where: {
            chapterIndex: {
                [Op.gte]: index
            },
            id : courseId
        }} );

        const newChap = await Chapter.create({name, chapterIndex: index, description, courseId, id});

        res.json(newChap);
   } catch (err) {
       next(err)
   }
};

// exports.getAllChapters = async (req, res, next) => {
//     try {
//         const {courseId} = req.params;

    
//         const chapters = await Chapter.findAll({where: {courseId},
//         include: {
//             model: Lesson,
//             include: {
//                 model: VideoLesson
//             }
//         }, 
//         order: [["chapterIndex", "ASC"],[Lesson, "lessonIndex", "ASC"]]
//        });
    
//         const course = await Course.findByPk(courseId);
//         const teacher = await course.getTeacher();
    
//         if (teacher.id !== req.user.id) createError("You are not authorized to view this resource", 403);
        
//         res.json({chapters: JSON.parse(JSON.stringify(chapters))});
    
//     } catch (err) {
//         next(err);
//     }
// }