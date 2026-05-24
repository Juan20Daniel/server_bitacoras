const { Op } = require('sequelize');
const { Camp, Department, Equipment, Staff, EquipmentFeatures, EquipmentHistory } = require('../models');
const { handleError } = require('../utils/error');
const { normalizeQueryParams } = require('../utils/queryParams');
const { fromStringDateToUnixDate, fromUnixDateToDateFormat } = require('../utils/time');

const getDepartmentByCampus = async (req, res, next) => {
    try {
        const {campId} = req.query;
        const where = {}
        if(campId) {
            where.camps_id = campId;
        }
        const deparments = await Department.findAll({
            attributes: ['id','name'],
            include: [
                {
                    model: Camp,
                    as:'camp',
                    attributes: ['id', 'city', 'school_type']
                }
            ],
            where
        });

        res.status(200).json({message:'Lista de departamentos', deparments});

    } catch (error) {
        next(new handleError('Error al listar los departamentos', "SERVER_ERR"));
    }
};

const getDepartmentById = async (req, res, next) => {
    try {
        const { departmentId } = req.params;
       
        const deparment = await Department.findOne({
            attributes: ['id','name','inventory_type'],
            include: [
                {
                    model:Camp,
                    as:'camp',
                    attributes: ['id','city','school_type']
                }
            ],
            where:{ id:departmentId }
        });

        res.status(200).json({message:'Departamento', deparment});

    } catch (error) {
        next(new handleError('Error al obtener el departamento', "SERVER_ERR"));
    }
};

const getDepartmentHistory = async (req, res, next) => {
    try {
        const { departmentId } = req.params;
        const page = normalizeQueryParams(req.query.page);
        const initialDate = req.query.initialDate;
        const finalDate = req.query.finalDate;

        
        if((initialDate && !finalDate) || (!initialDate && finalDate)) {
            return next(new handleError('Rango de fechas invalido', "VALIDATION_ERR"));
        }

        const where = {
            department_id:departmentId,
            inventory_type: "department"
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
                },
                {
                    model:Staff,
                    attributes: ['id', 'firstname', 'lastname','email', 'active', 'role', 'folio'],
                    as:'staff'
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
            message: 'Historial del departamento',
            pageSize: pageSize,
            nextPage: page+1,
            equipments: equipments
        });
    } catch (error) {
        console.log(error);
        next(new handleError('Error al obtener el historial del departamento', "SERVER_ERR"));
    }
}

const createDepartment = (req, res, next) => {
    try {
        
    } catch (error) {
        next(new handleError('Error al crear el departamento', "SERVER_ERR"));
    }
}

module.exports = {
    getDepartmentByCampus,
    getDepartmentHistory,
    getDepartmentById,
    createDepartment
}