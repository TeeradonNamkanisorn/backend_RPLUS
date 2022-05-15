const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../utils/database');

const Chapter = sequelize.define('chapter', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }, 
    chapterIndex: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    }
});

module.exports = Chapter;
