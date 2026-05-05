const { sequelizeConfig } = require('../database/sequelizeConfig');
const { Staff, Department } = require('../models');
const { encryptPassword } = require('../utils/password');
const {handleError} = require('../utils/error');

const getAll = async (req, res, next) => {
  try {
    const staff = await Staff.findAll({
      attributes:['id', 'firstname', 'lastname'],
      where: { 
        active:true
      }
    });
    res.status(200).json({
      message:'Lista de personal', 
      staffList:staff
    });
  } catch (error) {
    next(new handleError('Error al obtener la lista del personal', "SERVER_ERR"));
  }
};

const getByCampId = async (req, res, next) => {
  try {
    const {campId} = req.params;
    const staff = await Staff.findAll({
      attributes:['id', 'firstname', 'lastname'],
      include: [
        {
          model:Department,
          as: 'department',
          where: {camps_id:campId},
          attributes:[]
        }
      ],
      where: { 
        active:true
      }
    });
    res.status(200).json({
      message:'Lista de personal por campus', 
      staffList:staff
    });
  } catch (error) {
    next(new handleError('Error al obtener la lista del personal por campus', "SERVER_ERR"));
  }
};

const post = async (req, res, next) => {
  try {
    const {
      campId,
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
          camps_id:campId,
          name:deparmentName
        }
      });
      
      if(!department) {
        department = await Department.create(
          {
            camps_id:campId,
            name: deparmentName
          },
          {transaction}
        );
      }

      const passwordEncrypted = password !== '' ? encryptPassword(password) : null;

      await Staff.create(
        {
          firstname:firstname,
          lastname:lastname,
          email:email,
          password:passwordEncrypted,
          department_id:department.id
        },
        {transaction}
      );
    });
    res.status(201).json({message:'Usuario creado'});
  } catch (error) {
    next(new handleError('Error al crear el usuario', "SERVER_ERR"));
  }
};

const patch = (req, res) => {
  res.send('Check Out PATCH endpoint');
}

module.exports = {
  getAll,
  getByCampId,
  post,
  patch
};