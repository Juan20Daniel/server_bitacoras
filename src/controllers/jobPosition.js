const JopPosition = require('../models/jopPosition');
const Department = require('../models/department');
const Camp = require('../models/camps');
const { handleError } = require('../utils/error');
const Staff = require('../models/staff');
const { normalizeQueryParams } = require('../utils/queryParams');

const jobPositionById = async (id) => {
    return await JopPosition.findOne({
        attributes:['id', 'name', 'active','createdAt','updatedAt'],
        include: [
            {
                model: Department,
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
        where:{id:id}
    });
}

const getJobPositionById = async (req, res, next) => {
    try {
        const { jopPositionId } = req.params;

        const jopPosition = await JopPosition.findOne({
        attributes:['id', 'name', 'active','createdAt','updatedAt'],
        include: [
            {
                model: Department,
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
        where:{id:jopPositionId}
    });
    
    res.status(200).json({
        message:'Posición de trabajo',
        jopPosition:jopPosition
    });
    } catch (error) {
        console.log(error);
        next(new handleError('Error al optener los puestos de trabajo por departamento'))
    }
}

const getJopPositionsNames = async (req, res, next) => {
    try {
        const jopPositionsNames = await JopPosition.findAll({
            attributes:['id', 'name'],
            where: {active:true}
        });
    
        res.status(200).json({
            message:'Lista de nombres de positiones de trabajo',
            jopPositionsNames
        });
    } catch (error) {
        next(new handleError('Error al obtener la lista nombres de puestos de trabajo', "SERVER_ERR"));
    }
};

const getJobPositionsByDepartment = async (req, res, next) => {
    try {
        const { departmentId } = req.params;
        const page =  normalizeQueryParams(req.query.page);
        const pageSize = 10;
        const jopPositions = await JopPosition.findAll({
        attributes:['id', 'name', 'active','createdAt','updatedAt'],
        include: [
            {
                model: Staff,
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
                as: 'staff',
                required: false
            },
            {
                model: Department,
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
        limit: pageSize,
        offset: (page - 1) * pageSize,
        where:{
            department_id:departmentId,
            active: true
        }
    });
    
    res.status(200).json({
        message:'Lista de puestos de trabajo por departamento',
        pageSize: pageSize,
        nextPage: page+1,
        jopPositions:jopPositions
    });
    } catch (error) {
        console.log(error);
        next(new handleError('Error al optener los puestos de trabajo por departamento'))
    }
}

const createJobPosition = async (req, res, next) => {
    try {
        const { jopPositionName, departmentId } = req.body;
        const { id } = await JopPosition.create({
            name:jopPositionName,
            department_id:departmentId
        });

        const newJopPosition = await jobPositionById(id);

        res.status(201).json({
            message:'Puesto de trabajo creado',
            jopPosition:newJopPosition
        });
    } catch (error) {
        console.log(error);
        next(new handleError('Error al crear el puesto de trabajo'));
    }
}

module.exports = {
    getJopPositionsNames,
    getJobPositionById,
    getJobPositionsByDepartment,
    createJobPosition,
}