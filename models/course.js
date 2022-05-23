const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../utils/database');

const Course = sequelize.define('course', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    imageLink: {
        type: Sequelize.STRING
    },
    videoLink: {
        type: Sequelize.STRING
    },
    description: {
        type: Sequelize.STRING
    },
    level: {
        type: DataTypes.ENUM('all', 'beginner', 'intermediate', 'advanced'),
        defaultValue: "all"
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    length: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }

})

module.exports = Course;