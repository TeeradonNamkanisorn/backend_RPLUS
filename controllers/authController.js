const {Teacher, Student} = require("../models")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createError = require('../utils/createError');
require('dotenv').config();
const {v4 : uuidv4 } = require('uuid');
//Route default to both teacher and students
module.exports.loginUser = async (req, res, next) => {
    try {
        const {email, password} = req.body;

        let role;
        let user = await Teacher.findOne({where: {
            email: email
        }});
        role = "teacher"

        if (!user) {
            user = await Student.findOne({where: {email}})
            role = "student"
        }
        
        if (!user) {
            role ="";
            createError("incorrect email or password", 400)
        };

        
        
        const compareResult = await bcrypt.compare(password, user.password);
        if (!compareResult) return res.status(400).json({message: "Incorrect username or password"})
        console.log
        const token = jwt.sign({userId: user.id, email: user.email, role: role}, process.env.TOKEN_SECRET, 
            {expiresIn: "30d"});

        res.send({username: user.username, userId:user.id, email: user.email, token, role: role });
    } catch(err) {
        next(err)
    }
}

module.exports.getUser = async (req, res, next) => {
    try {
        //Validator middleware needs to attach req.user to the request first
        const {userId: id, email, username, role} = req.user;
        res.json({id, email, username, role})
    } catch (error) {
        next(error)
    }
}

exports.registerTeacher = async (req, res, next) => {
    try {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const {username, email, password, firstName, lastName} = req.body;
        const newId = uuidv4();
        //Must make sure that this email isn't already registered as student
        const existStudent = await Student.findOne({where: {email}});
        console.log(existStudent)
        if (existStudent) createError("You have already registered", 403);
        const hashedPassword = await bcrypt.hash(password,salt);
        // const newUser = await User.create({username, email, password: hashedPassword, id: newId, role: 'teacher'});
        const newTeacher = await Teacher.create({id: newId, username, email, password: hashedPassword, firstName, lastName});
        const token = jwt.sign({email, userId:newId, role: "teacher"}, process.env.TOKEN_SECRET);

        const responseObj = {userId: newTeacher.id, email: newTeacher.email, token, role: "teacher"};
        res.send(responseObj);
    } catch (err) {
        next(err);
    }
}

exports.registerStudent = async (req, res, next) => {
    try {
        const {username, email, password, firstName, lastName} = req.body;
        const id = uuidv4();
        const existTeacher = await Teacher.findOne({where: {email}});
        if (existTeacher) createError("You have already registered as a teacher", 403);
        const hashedPassword = await bcrypt.hash(password, 10);
        const student = await Student.create({id, username, email, password: hashedPassword, firstName, lastName});
        const token = jwt.sign({email, userId: id, role: "student"}, process.env.TOKEN_SECRET);
        
        res.json({userId: id, email, token, role: "student"});
        
    } catch (err) {
        next(err)
    }
}