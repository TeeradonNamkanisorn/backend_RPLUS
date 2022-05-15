const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../utils/database');

const VideoLesson = sequelize.define('videoLesson', {
    title: {
        type: Sequelize.STRING,
        allowNull: false
    }, 
    url: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    }, 
    description: {
        type: DataTypes.TEXT,
    }
});

module.exports =VideoLesson;