const Chapter = require("./chapter");
const Teacher = require("./teacher");
const User = require("./user");
const Course = require('./course');
const DocumentLesson = require("./document")
const VideoLesson = require("./videoLesson");
const Lesson = require('./lesson');
const sequelize = require('../utils/database');
const {DataTypes} = require('sequelize');



User.hasOne(Teacher);
Teacher.belongsTo(User)

Lesson.belongsTo(Chapter);
Chapter.hasMany(Lesson);

VideoLesson.belongsTo(Lesson);
Lesson.hasOne(VideoLesson);

Lesson.hasOne(DocumentLesson);
DocumentLesson.belongsTo(Lesson);


Chapter.belongsTo(Course);
Course.hasMany(Chapter);

Course.belongsTo(Teacher, {
    foreignKey: {allowNull: false}
});
Teacher.hasMany(Course, {
    foreignKey: {allowNull: false}
});


// Lesson = {}



module.exports = {Chapter, Course, DocumentLesson, Lesson, Teacher, User, VideoLesson, sequelize};