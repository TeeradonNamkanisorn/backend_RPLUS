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

exports.getAllCourses = async (req, res, next) => {
    try {
        const {id} = req.user;
        const teacher = await Teacher.findByPk(id);
        const courses = await teacher.getCourses();
        
        res.json({courses})

    } catch (error) {
        next(error)
    }
}






    
        



