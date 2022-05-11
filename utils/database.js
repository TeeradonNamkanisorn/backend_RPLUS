const Sequelize = require('sequelize');

const sequelize = new Sequelize('remote', 'root', '19731973', {
  dialect: 'mysql',
});

module.exports = sequelize;