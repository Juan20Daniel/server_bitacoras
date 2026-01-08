const {connection} = require('../database/sequelizeConfig');

const get = async (req, res) => {
  try {
    res.send('Database connection has been established successfully.');
  } catch (error) {
    console.log(error)
    res.status(500).send('Unable to connect to the database');
  }
};

const post = (req, res) => {
  console.log(req.body);
  res.send('Check Out POST endpoint');
};

const patch = (req, res) => {
  res.send('Check Out PATCH endpoint');
}

module.exports = {
  get,
  post,
  patch
};