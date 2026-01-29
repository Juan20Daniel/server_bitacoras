const { Vehicle } = require('../models');
const { handleError } = require('../utils/error');
const { moveImg, removeImg } = require('../utils/file');

const get = async (req, res, next) => {
    try {
        const vehices = await Vehicle.findAll({
            attributes:['id', 'name', 'image']
        });
        res.status(200).json({message:'Vehiculos', vehiclesList:vehices});
    } catch (error) {
        next(new handleError('Error al crear el usuario', error));
    }
}

const post = async (req, res, next) => {
    try {
        const { vehicleName, initMileage } = req.body;
        const {filename} = req.file;
        await Vehicle.create({
            name:vehicleName,
            image:filename,
            init_mileage:initMileage
        });
        await moveImg(req.file, req.uploadFolder);
        res.status(201).json({message:'Vehiculo agregado'})
    } catch (error) {
        removeImg(req.file.filename);
        next(new handleError('Error al agregar el vehiculo.', error));
    }
}

module.exports = {
    get,
    post
}