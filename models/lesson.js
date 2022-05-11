const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Lesson = sequelize.define('lesson', {
    title: {
        type: Sequelize.STRING,
        allowNull: false
    }, 
    url: {
        type: Sequelize.TEXT
    },
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
    }
});

module.exports = Lesson;