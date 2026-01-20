const { sequelizeConfig } = require('../database/sequelizeConfig');
const { Staff, Department } = require('../models');
const { encryptPassword } = require('../utils/password');

const getByIdCamp = async (req, res, next) => {
  try {
    const {idCamp} = req.params;
    const staff = await Staff.findAll({
      attributes:['id', 'firstname', 'lastname'],
      include: [
        {
          model:Department,
          as: 'department',
          where: {id_camps:idCamp},
          attributes:[]
        }
      ],
      where: { 
        active:true
      }
    });
    res.status(200).json({message:'Lista de personal', data:staff});
  } catch (error) {
    next(error);
  }
};

const post = async (req, res, next) => {
  try {
    const {
      idCamp,
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
          id_camps:idCamp,
          name:deparmentName
        }
      });
      
      if(!department) {
        department = await Department.create(
          {
            id_camps:idCamp,
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
  getByIdCamp,
  post,
  patch
};