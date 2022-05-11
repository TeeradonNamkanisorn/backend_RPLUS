const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const VideoLesson = sequelize.define('videoLesson', {
    title: {
        type: Sequelize.STRING,
        allowNull: false
    }, 
    url: {
        type: Sequelize.TEXT
    },
    id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    }
});

module.exports =VideoLesson;