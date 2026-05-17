const { Camp, Department, Equipment, Staff, EquipmentFeatures } = require('../models');
const { handleError } = require('../utils/error');

const getDepartmentByCampus = async (req, res, next) => {
    try {
        const {campId} = req.query;
        const where = {}
        if(campId) {
            where.camps_id = campId;
        }
        const deparments = await Department.findAll({
            attributes:['id','name'],
            include: [
                {
                    model:Camp,
                    as:'camp',
                    attributes:['id', 'city', 'school_type']
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
            attributes:['id','name','inventory_type'],
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

        const result = await Equipment.findAll({
            attributes:[
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
                'createdAt'
            ],
            include: [
                {
                    model:Staff,
                    attributes: ['id', 'firstname', 'lastname'],
                    as:'staff'
                },
                {
                    model:EquipmentFeatures,
                    attributes: ['id', 'description'],
                    as: 'equipmentFeatures'
                }
            ],
            where:{
                department_id:departmentId
            }
        })
    } catch (error) {
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
    getDepartmentById,
    createDepartment
}