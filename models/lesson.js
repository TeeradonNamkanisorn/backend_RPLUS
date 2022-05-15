const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../utils/database');

const Lesson = sequelize.define('lesson', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    }, 
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    lessonIndex: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    lessonType: {
        type: DataTypes.ENUM("document", "video", "link", "assignment")
    }
});

module.exports = Lesson;