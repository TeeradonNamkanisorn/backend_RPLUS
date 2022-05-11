const express = require('express');
const { uuid } = require('uuidv4');
const Chapter = require('../models/chapter');
const Lesson = require('../models/Lesson');

const lessonRouter = express.Router();

lessonRouter.post('/', async (req, res, next) => {
    const {name, description, index} = req.body;
    let newLesson;
    try {
        const newLesson = await Lesson.create({
            name: name, 
            description: description,
            index: index,
            lessonId: uuid()
        })
       await Chapter.addLesson(newLesson)
    } catch(error) {
        console.log(error)
    };
    res.send(newLesson);
});

module.exports.lessonRouter = lessonRouter;
