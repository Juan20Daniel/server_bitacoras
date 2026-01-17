const { sequelizeConfig } = require('../database/sequelizeConfig');
const { Staff, Department } = require('../models');
const { encryptPassword } = require('../utils/password');

const get = async (req, res, next) => {
  try {
    const staff = await Staff.findAll({
      attributes:['id', 'firstname', 'lastname'],
      where: { active:true }
    });
    res.status(200).json({message:'Lista de personal', data:staff});
  } catch (error) {
    next(error);
  }
};

const post = async (req, res, next) => {
  try {
    const {
      city,
      schoolType,
      deparment:deparmentName,
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
          school_type:schoolType,
          name:deparmentName
        }
      });
      
      if(!department) {
        department = await Department.create(
          {
            city:city,
            school_type: schoolType,
            name: deparmentName
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