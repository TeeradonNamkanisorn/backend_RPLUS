const express = require('express');
const Chapter = require('../models/chapter');
const { v4: uuidv4 } = require('uuid');
const Course = require('../models/course');
const chapterRouter = express.Router();

chapterRouter.post('/', async (req, res, next) => {
    const {index, name, description, courseId} = req.body
    let newChapter;
    try {
        newChapter = await Chapter.create({index: +index, name, description, id: uuidv4()});
        const targetCourse = await Course.findByPk(courseId);
        const result = await targetCourse.addChapter(newChapter);
        res.send(result);
    } catch(error) {
        console.log(error);
        res.status(400).send(error)
    }
    
    
    
});

module.exports.chapterRouter = chapterRouter;
