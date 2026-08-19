const { Sequelize } = require('sequelize');

const sequelizeConfig = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

const testConnection = async () => {
  try {
    await sequelizeConfig.authenticate();
    console.log('DB Connection has been established successfully.');
  } catch (error) {
    console.log('Unable to connect to the database:', error);
    throw new Error("Could not connect to the database");
  }
};

module.exports = {
  sequelizeConfig,
  testConnection
};