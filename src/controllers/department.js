const { Camp, Department } = require('../models');
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
        next(new handleError('Error al listar los departamentos', error));
    }
};

const getDepartmentById = async (req, res, next) => {
    try {
        const {departmentId} = req.params;
       
        const deparment = await Department.findOne({
            attributes:['id','name','inventory_type'],
            include: [
                {
                    model:Camp,
                    as:'camp',
                    attributes: ['id','city','school_type']
                }
            ],
            where:{id:departmentId}
        });

        res.status(200).json({message:'Departamento', deparment});

    } catch (error) {
        next(new handleError('Error al obtener el departamento', error));
    }
};


module.exports = {
    getDepartmentByCampus,
    getDepartmentById
}