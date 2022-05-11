const Sequelize = require('sequelize');
const sequelize = require('../utils/database');


const Teacher = sequelize.define('teacher', {
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    imageUrl: {
        type: Sequelize.STRING
    },
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    }
})


module.exports = Teacher;