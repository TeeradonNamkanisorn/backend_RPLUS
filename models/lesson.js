const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../utils/database');

const Lesson = sequelize.define('lesson', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    }, 
    url: {
        type: DataTypes.TEXT
    },
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    index: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Lesson;