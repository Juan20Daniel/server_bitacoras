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

module.exports = {
    getAllCampus,
    createCampus
}