const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Chapter = sequelize.define('chapter', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    }, 
    index: {
        type: Sequelize.INTEGER
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