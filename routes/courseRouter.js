const express = require('express');
const Course = require('../models/course');
const { v4: uuidv4 } = require('uuid');

const courseRouter = express.Router();

courseRouter.use('/', async (req, res, next) => {
    const {name, imageLink, videoLink, teacherId} = req.body;
    try {
        const newCourse = await Course.create({name, imageLink, videoLink, id: uuidv4()});
        const targetUser = await findByPk(teacherId);
        targetUser.addCourse(newCourse);
        res.send(newCourse);
    } catch(error) {
        console.log(error);
        res.status(400).send(error)
    }
}) 

module.exports = courseRouter;