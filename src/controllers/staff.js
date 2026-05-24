const { sequelizeConfig } = require('../database/sequelizeConfig');
const { Staff, Department } = require('../models');
const { encryptPassword } = require('../utils/password');
const { handleError } = require('../utils/error');

const getById = async (staffId) => {
  try {
    const staff = await Staff.findOne({
      attributes: ['id', 'firstname', 'lastname','email', 'active', 'role', 'folio'],
      where: { 
        id:staffId
      }
    });
    return staff
  } catch (error) {
    throw error;
  }
};


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
    
    let department = await Department.findOne({
      where: {
        camps_id: campId,
        name: deparmentName
      }
    });

    const lastStaffFolio = await Staff.findOne({
      attributes:['folio'],
      order:[['id', 'DESC']]
    });

    const folio = Number(lastStaffFolio.folio)+1;
   
    const result = await sequelizeConfig.transaction(async (transaction) => {
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

      const staff = await Staff.create(
        {
          firstname:firstname,
          lastname:lastname,
          email:email,
          password:passwordEncrypted,
          department_id:department.id,
          folio:folio.toString()
        },
        {transaction}
      );
      return staff;
    });

    const staff = await getById(result.id)

    res.status(201).json({message:'Usuario creado.', staff});
  } catch (error) {
    next(new handleError('Error al crear el usuario', "SERVER_ERR"));
  }
};


module.exports = {
  getAll,
  getByCampId,
  post
};