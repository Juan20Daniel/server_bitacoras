const JopPosition = require('../models/jopPosition');
const Department = require('../models/department');
const Camp = require('../models/camps');
const { handleError } = require('../utils/error');
const Staff = require('../models/staff');

const jopPositionById = async (id) => {
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

const getJopPositionByDepartment = async (req, res, next) => {
    try {
        const { departmentId } = req.params;
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
        where:{
            department_id:departmentId,
            active: true
        }
    });
    
     res.status(200).json({
        message:'Lista de puestos de trabajo por departamento',
        jopPositions:jopPositions
    });
    } catch (error) {
        console.log(error);
        next(new handleError('Error al optener los puestos de trabajo por departamento'))
    }
}

const createJopPosition = async (req, res, next) => {
    try {
        const { jopPositionName, departmentId } = req.body;
        const { id } = await JopPosition.create({
            name:jopPositionName,
            department_id:departmentId
        });

        const newJopPosition = await jopPositionById(id);

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
    getJopPositionByDepartment,
    createJopPosition,
}