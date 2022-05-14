const bcrypt = require('bcrypt');
const {v4 : uuidv4} = require('uuid');
const jwt = require('jsonwebtoken');
const { Course, Teacher, User, Chapter, sequelize } = require('../models');
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
    const token = jwt.sign({username: username, email, userId:newId, role: newUser.role}, process.env.TOKENSECRET);

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
        decoded = jwt.verify(token, process.env.TOKENSECRET);
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
    // BODY: {name, index, description, courseId}
    try {
        const token = req.headers.authorization.split(' ')[1];
        const {name, description, courseId} = req.body;
        const id = uuidv4();

        const decoded = jwt.verify(token, process.env.TOKENSECRET)
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

        const {count} = await Chapter.findAndCountAll({where: {courseId}});
        const max_index = await Chapter.max('chapterIndex');
        const new_index = max_index? max_index+1 : 1;
        const result = await Chapter.create({name, chapterIndex: new_index, description, id, courseId});

        res.json(result);


    } catch (err) {
        next(err)
    }
};

exports.deleteChapter = (req, res, next) => {
    
}

