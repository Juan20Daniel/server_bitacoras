const { Vehicle } = require('../models');

const get = async (req, res, next) => {
    try {
        const vehices = await Vehicle.findAll({
            attributes:['id', 'name', 'image']
        });
        res.status(200).json({message:'Vehiculos', data:vehices});
    } catch (error) {
        next(error);
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
        res.status(201).json({message:'Vehiculo agregado'})
    } catch (error) {
        next(error);
    }
}

module.exports = {
    get,
    post
}