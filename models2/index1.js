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
Teacher.belongsTo(User);

Course.belongsTo(Teacher, {
    foreignKey: {allowNull: false}
});

Teacher.hasMany(Course, {
    foreignKey: {allowNull: false}
});

Chapter.belongsTo(Course);
Course.hasMany(Chapter);

VideoLesson.belongsTo(Lesson);
Lesson.hasOne(VideoLesson);



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



// Lesson.hasOne(DocumentLesson);
// DocumentLesson.belongsTo(Lesson);



// sequelize.sync();
//

const syncAll = async() => {
    await User.sync();
    await Teacher.sync();
    await Course.sync();
    await Chapter.sync();
    await VideoLesson.sync({});
    await Lesson.sync({});
}

syncAll();





module.exports = {Chapter, Course, DocumentLesson, Lesson, Teacher, User, VideoLesson, sequelize};