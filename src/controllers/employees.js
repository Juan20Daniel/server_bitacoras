const { sequelizeConfig } = require('../database/sequelizeConfig');
const { Staff, Department } = require('../models');
const { handleError } = require('../utils/error');
const { encryptPassword } = require('../utils/password');
const { normalizeQueryParams } = require('../utils/queryParams');

const getAll = async (req, res, next) => {
  try {
    const page = normalizeQueryParams(req.query.page);
    const pageSize = 20;

    const staff = await Staff.findAll({
      attributes:['id', 'firstname', 'lastname', 'email', 'department_id'],
      limit:pageSize,
      offset: (page - 1) * pageSize,
      where: { 
        active:true,
      }
    });
    res.status(200).json({
      message:'Lista de empleados',
      nextPage:page+1,
      pageSize:pageSize,
      employees:staff
    });
  } catch (error) {
    next(new handleError('Error al obtener la lista empleados', "SERVER_ERR"));
  }
};

const getByDepartment = async (req, res, next) => {
  try {
    const { departmentId } = req.params;

    const staff = await Staff.findAll({
      attributes:['id', 'firstname', 'lastname', 'email', 'department_id'],
      where: { 
        active:true,
        department_id:departmentId
      }
    });
    res.status(200).json({
      message:'Lista de empleados por departamento',
      employees:staff
    });
  } catch (error) {
    next(new handleError('Error al obtener la lista empleados', "SERVER_ERR"));
  }
};

module.exports = {
  getAll,
  getByDepartment
};