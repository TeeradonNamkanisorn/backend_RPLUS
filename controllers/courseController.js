const bcrypt = require('bcrypt');
const {v4 : uuidv4} = require('uuid');
const jwt = require('jsonwebtoken');
const { Course, Teacher, User, Chapter, sequelize, Lesson } = require('../models/index1');
const {Op} = require('sequelize');
const createError = require('../utils/createError');

exports.createCourse = async (req, res, next) => {
    // PAYLOAD required
// HEADERS: {authorization: BEARER __TOKEN} : TOKEN WITH USER_ID, ROLE, USERNAME AND EMAIL
// BODY: {name, description, teacherId}
try {
    const {name,description} = req.body;
    const header = req.headers;
    const token = header.authorization.split(' ')[1];
    let decoded
    try {
        decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    } catch(err) {
        next(err)
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