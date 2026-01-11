const { sequelizeConfig } = require('../database/sequelizeConfig');
const { Staff, Department } = require('../models');
const { encryptPassword } = require('../utils/password');

const get = async (req, res, next) => {
  try {
    res.status(200).json({message:'Lista de usuarios'});
  } catch (error) {
    next(error);
  }
};

const post = async (req, res, next) => {
  try {
    const {
      city,
      school_type,
      deparment:deparment_name,
      firstname,
      lastname,
      email,
      password
    } = req.body;
   
    await sequelizeConfig.transaction(async (transaction) => {
      let department = null;
      department = await Department.findOne({
        where: {
          city:city,
          school_type:school_type,
          name:deparment_name
        }
      })
      if(!department) {
        department = await Department.create(
          {
            city:city,
            school_type: school_type,
            name: deparment_name
          },
          {transaction}
        );
      }

      await Staff.create(
        {
          firstname:firstname,
          lastname:lastname,
          email:email,
          password:encryptPassword(password),
          department_id:department.id
        },
        {transaction}
      );
    });
    res.status(201).json({message:'Usuario creado'});
  } catch (error) {
    next(error);
  }
};

const patch = (req, res) => {
  res.send('Check Out PATCH endpoint');
}

module.exports = {
  get,
  post,
  patch
};