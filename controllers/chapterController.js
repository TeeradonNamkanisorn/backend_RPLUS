const bcrypt = require('bcrypt');
const {v4 : uuidv4} = require('uuid');
const jwt = require('jsonwebtoken');
const { Course, Teacher, User, Chapter, sequelize, Lesson } = require('../models/index1');
const {Op} = require('sequelize');
const createError = require('../utils/createError');

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
            }
        }} );

        const newChap = await Chapter.create({name, chapterIndex: index, description, courseId, id});

        res.json(newChap);
   } catch (err) {
       next(err)
   }
};