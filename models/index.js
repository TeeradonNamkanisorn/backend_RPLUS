const Chapter = require("./chapter");
const Course = require("./course");
const DocumentLesson = require("./document");
const Lesson = require("./lesson");
const Teacher = require("./teacher");
const User = require("./user");
const VideoLesson = require("./videoLesson");
const sequelize = require('../utils/database')


User.hasOne(Teacher);
Teacher.belongsTo(User)
//
Chapter.hasMany(Lesson);
Lesson.belongsTo(Chapter);

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

module.exports = {Chapter, Course, DocumentLesson, Lesson, Teacher, User, VideoLesson, sequelize};