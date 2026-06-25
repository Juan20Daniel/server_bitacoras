const Camp = require('../models/camps');
const {handleError} = require('../utils/error');

const getCampusById = async (id) => {
    try {
        const camps = await Camp.findOne({
            attributes:['id', 'city', 'school_type', 'active'],
            where:{id}
        });
        return camps;
    } catch (error) {
        throw error;
    }
}

const getAllCampus = async (req, res, next) => {
    try {
        const camps = await Camp.findAll();
        
        res.status(200).json({message:"Campus registrados", campsList:camps})
    } catch (error) {
        next(new handleError('Error al obtener los campus', "SERVER_ERR"));
    }
}

const createCampus = async (req, res, next) => {
    try {
        const { city, schoolType } = req.body;

        const result = await Camp.create({
            city:city,
            school_type:schoolType
        });
        const camp = await getCampusById(result.id);

        res.status(201).json({message:"Nuevo campus", camp});
    } catch (error) {
        next(new handleError('Error al crear el campus', "SERVER_ERR"));
    }
}

const updateCampus = async (req, res, next) => {
    try {
        const { campId } = req.params;
        const { city, schoolType } = req.body;
        console.log({city, schoolType})
        await Camp.update(
            {
                city: city,
                school_type: schoolType
            },
            {where:{id:6}}
        );

        const camp = await getCampusById(campId);

        res.status(201).json({message:"Campus actualizado", camp});
    } catch (error) {
        console.log(error);
        next(new handleError('Error al actualizar el campus', "SERVER_ERR"));
    }
}

module.exports = {
    getAllCampus,
    createCampus,
    updateCampus
}