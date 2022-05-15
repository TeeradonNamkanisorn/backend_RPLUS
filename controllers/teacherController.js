const bcrypt = require('bcrypt');
const {v4 : uuidv4} = require('uuid');
const jwt = require('jsonwebtoken');
const { Course, Teacher, User, Chapter, sequelize, Lesson } = require('../models/index1');
const {Op} = require('sequelize');
const createError = require('../utils/createError');

require('dotenv').config;

exports.registerTeacher = async (req, res, next) => {
    try {
        const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const {username, email, password} = req.body;
    const newId = uuidv4();
    const hashedPassword = await bcrypt.hash(password,salt);
    const newUser = await User.create({username, email, password: hashedPassword, id: newId, role: 'teacher'});
    const newTeacher = await newUser.createTeacher({id: newId, username, email, password: hashedPassword});
    const token = jwt.sign({username: username, email, userId:newId, role: newUser.role}, process.env.TOKEN_SECRET);

    const responseObj = {username: newUser.username, userId: newUser.id, email: newUser.email, token, role: newUser.role};
    res.send(responseObj);
    } catch (err) {
        next(err);
    }
}


exports.createCourse = async (req, res, next) => {
        // PAYLOAD required
    // HEADERS: {authorization: BEARER __TOKEN} : TOKEN WITH USER_ID, ROLE, USERNAME AND EMAIL
    // BODY: {name, description, teacherId}
 try {
    const {name,description} = req.body;
    const header = req.headers;
    const token = header.authorization.split(' ')[1];
    console.log(token);
    let decoded
    try {
        decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        console.log(decoded);
        
    } catch(err) {
        console.log(decoded);
        res.status(400).json({message: "Invalid token"});
    }
    

    const {userId, role} = decoded;
    
    if (role !== "teacher") {
        return res.status(400).send("You are not authorised to create this resource.");
    }

    const teacher = await Teacher.findByPk(userId);
 
    if (!teacher) {
        return res.status(404).json({message: "User not found"});
    }

    const result = await Course.create({name, description, teacherId: userId, id: uuidv4()});

    res.send(result);
 } catch(err) {
     next(err)
 }
};

exports.appendChapter = async (req, res, next) => {
    // PAYLOAD required
    // HEADERS: {authorization: BEARER __TOKEN}
    // BODY: {name, description, courseId}
    try {
        const token = req.headers.authorization.split(' ')[1];
        const {name, description, courseId} = req.body;
        const id = uuidv4();

        const decoded = jwt.verify(token, process.env.TOKEN_SECRET)
        const {userId, role} = decoded;

        if (!decoded) {
            return res.status(404).json({message: "Invalid token"})
        }

        const user = await User.findByPk(userId);


        if (!user) {
            return res.status(404).json({message: "Invalid token, you are unauthorized"});
        };

        if (role !== "teacher") {
            return res.status(400).send("You are not authorised to create this resource.");
        }

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

        //To insert a chapter in-between other chapters, add indexes to chapters after by 1

        const result = await Chapter.increment({chapterIndex: 1}, {where: {
            chapterIndex: {
                [Op.gte]: index
            }
        }} );

        const newChap = await Chapter.create({name, chapterIndex: index, description, courseId, id});

        res.json(newChap);
   } catch (err) {
       next(err)
   }
};

    exports.appendLesson = async (req, res, next) => {
        //PAYLOAD : {title, lessonType, chapterId, index}
        //Headers: {authorization: "BEARER TOKEN"}
        const {title, lessonType, chapterId} = req.body;
        const id = uuidv4();
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        const {userId, role} = decoded;
        if (!decoded || !userId) createError("Invalid token", 401);
        if (role !== "teacher") createError("You are not authorized", 403);

        //Find the creator of the lesson
        const chapter = await Chapter.findByPk(chapterId);
        const courseId = chapter.courseId;
        const course = await Course.findOne({where: {id: courseId}});
        const teacherId = course.teacherId;

        //teacherId and user's primary key: id are the same.
        if (teacherId !== userId) createError("Invalid token", 403);

        //After verifying all the credentials now the lesson can be created.
        const maxIndex = await Lesson.max('lessonIndex', {where: {chapterId}});
        const newIndex = (maxIndex || 0)+1;
        const lesson = await Lesson.create({title, id, lessonIndex: newIndex, lessonType, chapterId});

        res.send(lesson);
    }



