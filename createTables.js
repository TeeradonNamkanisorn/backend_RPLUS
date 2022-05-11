const Sequelize = require('sequelize');

const sequelize = new Sequelize('remote', 'root', '19731973', {
  dialect: 'mysql',
  host: 'localhost'
});

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
}

testConnection();

