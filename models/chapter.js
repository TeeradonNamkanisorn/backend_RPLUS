const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Chapter = sequelize.define('chapter', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    }, 
    chapterIndex: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT
    }
});

module.exports = Chapter;