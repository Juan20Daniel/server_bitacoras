const { Vehicle } = require('../models');

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
    post
}