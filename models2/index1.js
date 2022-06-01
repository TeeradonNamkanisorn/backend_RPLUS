const sequelize = require('../utils/database');
const Chapter = require("./chapter");
const Teacher = require("./teacher");
const User = require("./user");
const Course = require('./course');
const Lesson = require('./lesson');
const DocumentLesson = require("./document")
const VideoLesson = require("./videoLesson");
const {DataTypes} = require('sequelize');






User.hasOne(Teacher);
Teacher.belongsTo(User)

Chapter.belongsTo(Course);
Course.hasMany(Chapter);

Course.belongsTo(Teacher, {
    foreignKey: {allowNull: false}
});

Teacher.hasMany(Course, {
    foreignKey: {allowNull: false}
});

Lesson.belongsTo(Chapter, {
    foreignKey: {
        name: "chapterId",
        allowNull: "false"
    }
});
Chapter.hasMany(Lesson, {
    foreignKey: {
        name: "chapterId",
        allowNull: "false"
    }
});

VideoLesson.belongsTo(Lesson);
Lesson.hasOne(VideoLesson);

// Lesson.hasOne(DocumentLesson);
// DocumentLesson.belongsTo(Lesson);





console.log("before sync")
Lesson.sync().then(()=> {
    sequelize.sync({})
})




module.exports = {Chapter, Course, DocumentLesson, Lesson, Teacher, User, VideoLesson, sequelize};