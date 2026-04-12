const { Equipment } = require('../models')
const { handleError } = require("../utils/error");
//Continuar agregando el equipo a la db
const addEquipment = (req, res, next) => {
    try {

        res.status(201).json({message:'Equipo agregado'});
    } catch (error) {
        next(new handleError('Error al agregar el equipo'));
    }
}

module.exports = {
    addEquipment
}