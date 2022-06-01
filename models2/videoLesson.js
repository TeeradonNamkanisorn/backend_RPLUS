const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../utils/database');

const VideoLesson = sequelize.define('videoLesson', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    }, 
    url: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    videoPublicId: {
        type: DataTypes.STRING
    },
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    }, 
    description: {
        type: DataTypes.TEXT,
    },
    length: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

module.exports =VideoLesson;