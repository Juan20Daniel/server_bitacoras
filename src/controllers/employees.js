const { Op } = require('sequelize');
const { sequelizeConfig } = require('../database/sequelizeConfig');
const { Staff, Department, EquipmentFeatures, EquipmentHistory, Equipment, Camp } = require('../models');
const { handleError } = require('../utils/error');
const { encryptPassword } = require('../utils/password');
const { normalizeQueryParams } = require('../utils/queryParams');
const { fromStringDateToUnixDate, fromUnixDateToDateFormat } = require('../utils/time');

const getByEmployeeId = async (employeeId) => {
  try {
    const employee = await Staff.findOne({
      attributes:[
        'id', 
        'firstname', 
        'lastname',
        'email', 
        'active', 
        'role', 
        'folio',
        'title'
      ],
      include: [
        {
          model:Department,
          attributes: ['id','name', 'inventory_type', 'createdAt', 'active'],
          include: [
            {
              model:Camp,
              attributes:['id', 'city', 'school_type', 'active'],
              as:'camp'
            }
          ],
          as:'department',
        }
      ],
      where: {id:employeeId}
    });
    
    return employee;
  } catch (error) {
    throw error;
  }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const employee = await getByEmployeeId(employeeId);
    
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
      where.department_id = departmentId;
    }

    const pagination = req.query.page
      ? {
          limit: pageSize,
          offset: (page - 1) * pageSize,
        }
      : {}

    const employees = await Staff.findAll({
      attributes:[
        'id',
        'firstname',
        'lastname',
        'email',
        'active',
        'role',
        'folio',
        'title'
      ],
      include: [
        {
          model:Department,
          attributes: ['id','name', 'inventory_type', 'createdAt', 'active'],
          include: [
            {
              model:Camp,
              attributes:['id', 'city', 'school_type', 'active'],
              as:'camp'
            }
          ],
          as:'department',
        }
      ],
      where: where,
      ...pagination,
    });

    const paginationDetails = req.query.page
      ? {
          nextPage:page+1,
          pageSize:pageSize,
        }
      : {}
    
    res.status(200).json({
      message:'Lista de empleados',
      ...paginationDetails,
      employees:employees
    });
  } catch (error) {
    next(new handleError('Error al obtener la lista empleados', "SERVER_ERR"));
  }
};


const getEmployeeHistory = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const page = normalizeQueryParams(req.query.page);
    const initialDate = req.query.initialDate;
    const finalDate = req.query.finalDate;

    if((initialDate && !finalDate) || (!initialDate && finalDate)) {
      return next(new handleError('Rango de fechas invalido', "VALIDATION_ERR"));
    }

    const where = {
      inventory_type: "employee"
    };

    if(initialDate && finalDate) {
      const initialUnixDate = fromStringDateToUnixDate(initialDate);
      const finalUnixDate = fromStringDateToUnixDate(finalDate);

      if(initialUnixDate > finalUnixDate) {
        return next(new handleError("Rango de fecha invalido", "RANGE_ERR"));
      }
        
      where.createdAt = {
        [Op.between]:[
          fromUnixDateToDateFormat(initialUnixDate),
          fromUnixDateToDateFormat(finalUnixDate)
        ]
      }
    }
      
    const pageSize = 20;
    const equipments = await Equipment.findAll({
      attributes: [
        'id',
        'image',
        'own',
        'fixed_asset_type',
        'clasification',
        'brand',
        'model',
        'state',
        'folio',
        'quantity',
        'observations',
        'createdAt',
        'active'
      ],
      include: [
        {
          model:EquipmentHistory,
          attributes: [
            'id',
            'createdAt',
          ],
          as: 'equipmentHistory',
          required: true
        },
        {
          model:Staff,
          attributes: [
            'id', 
            'firstname', 
            'lastname',
            'email', 
            'active', 
            'role', 
            'folio',
            'title'
          ],
          as:'staff',
          through: {
            attributes: []
          },
          where: {
            id: employeeId
          },
          required: true
        },
        {
          model:EquipmentFeatures,
          attributes: ['id', 'description'],
          as: 'equipmentFeatures'
        },
        {
          model:Department,
          attributes: ['id','name', 'inventory_type', 'createdAt', 'active'],
          include: [
            {
              model:Camp,
              attributes:['id', 'city', 'school_type', 'active'],
              as:'camp'
            }
          ],
          as:'department',
        }
      ],
        order: [['id', 'DESC']],
        limit: pageSize,
        offset: (page - 1) * pageSize,
        where: where,
      });

    res.status(200).json({
      message: 'Historial del empleado',
      pageSize: pageSize,
      nextPage: page+1,
      equipments: equipments
    });
  } catch (error) {
    console.log(error);
    next(new handleError('Error al obtener el historial del empleado', "SERVER_ERR"));
  }
}

const getAssetCustodyForm = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    
    const equipments = await Equipment.findAll({
      attributes: [
        'id',
        'image',
        'own',
        'fixed_asset_type',
        'clasification',
        'brand',
        'model',
        'state',
        'folio',
        'quantity',
        'observations',
        'createdAt',
        'active',
      ],
      include: [
        {
          model:Staff,
          attributes: [
            'id',
            'firstname',
            'lastname',
            'email',
            'active',
            'role', 
            'folio',
            'title',
          ],
          as: 'staff',
          where: {id:employeeId}
        },
        {
          model:EquipmentFeatures,
          attributes: ['id', 'description'],
          as: 'equipmentFeatures'
        },
        {
          model:Department,
          attributes: ['id','name', 'inventory_type', 'createdAt', 'active'],
          include: [
            {
              model:Camp,
              attributes:['id', 'city', 'school_type', 'active'],
              as:'camp'
            }
          ],
          as:'department'
        }
      ],
      where: {
        inventory_type:'employee',
        active:true
      }
    });
    
    res.status(201).json({
      message: 'Lista de equipos',
      equipments: equipments,
    });
  } catch (error) {
    console.log(error);
    next(new handleError('Error al obtener los equipos', "SERVER_ERR"));
  }
}


const createEmployee = async (req, res, next) => {
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

    const staff = await getByEmployeeId(result.id)

    res.status(201).json({message:'Usuario empleado.', staff});
  } catch (error) {
    console.log(error);
    next(new handleError('Error al crear el empleado', "SERVER_ERR"));
  }
};



module.exports = {
  getEmployees,
  getEmployeesNames,
  getEmployeeById,
  getEmployeeHistory,
  getAssetCustodyForm,
  createEmployee
};