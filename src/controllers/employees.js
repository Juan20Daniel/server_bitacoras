const { sequelizeConfig } = require('../database/sequelizeConfig');
const { Staff, Department } = require('../models');
const { handleError } = require('../utils/error');
const { encryptPassword } = require('../utils/password');
const { normalizeQueryParams } = require('../utils/queryParams');

const getEmployeeById = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const employee = await Staff.findOne({
      attributes:['id', 'firstname', 'lastname', 'email'],
      include: [
        {
          model:Department,
          attributes: ['id','name', 'inventory_type', 'createdAt', 'camps_id', 'active'],
          as:'department'
        }
      ],
      where: {id:employeeId}
    });
    
    res.status(200).json({
      message:'Empleado',
      employee
    });
  } catch (error) {
    next(new handleError('Error el empleado', "SERVER_ERR"));
  }
};


const getEmployeesNames = async (req, res, next) => {
  try {
    const employeesNames = await Staff.findAll({
      attributes:['id', 'firstname', 'lastname'],
      where: {active:true}
    });
    
    res.status(200).json({
      message:'Lista de nombres de empleados',
      employeesNames
    });
  } catch (error) {
    next(new handleError('Error al obtener la lista nombres de empleados', "SERVER_ERR"));
  }
};


const getEmployees = async (req, res, next) => {
  try {
    const page = normalizeQueryParams(req.query.page);
    const departmentId = normalizeQueryParams(req.query.departmentId);
    const pageSize = 20;

    const where = {active:true};

    if(req.query.departmentId) {
      where.department_id = departmentId
    }

    const employees = await Staff.findAll({
      attributes:['id', 'firstname', 'lastname', 'email'],
      include: [
        {
          model:Department,
          attributes: ['id','name', 'inventory_type', 'createdAt', 'camps_id', 'active'],
          as:'department'
        }
      ],
      limit:pageSize,
      offset: (page - 1) * pageSize,
      where: where
    });
    
    res.status(200).json({
      message:'Lista de empleados',
      nextPage:page+1,
      pageSize:pageSize,
      employees:employees
    });
  } catch (error) {
    next(new handleError('Error al obtener la lista empleados', "SERVER_ERR"));
  }
};

module.exports = {
  getEmployees,
  getEmployeesNames,
  getEmployeeById
};