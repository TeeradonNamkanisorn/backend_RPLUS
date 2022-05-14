const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Course = sequelize.define('course', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false

    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    imageLink: {
        type: Sequelize.STRING
    },
    videoLink: {
        type: Sequelize.STRING
    },
    description: {
        type: Sequelize.STRING
    }

})

module.exports = Course;