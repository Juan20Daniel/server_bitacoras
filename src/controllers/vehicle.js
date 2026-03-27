const { Vehicle, CheckOut, CheckOutVehicular, Staff } = require('../models');
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
        const { vehicleName, initMileage, initTankLavel } = req.body;
        const {filename} = req.file;
        await Vehicle.create({
            name:vehicleName,
            image:filename,
            init_mileage:initMileage,
            init_tank_lavel:initTankLavel
        });

        await moveImg(req.file, req.uploadFolder);
        res.status(201).json({message:'Vehiculo agregado'});
    } catch (error) {
        await removeImg(req.file.filename);
        next(new handleError('Error al agregar el vehiculo.', error));
    }
}

const vehicularActivity = async (req, res, next) => {
    try {
        const getVehicularActivity = await CheckOut.findAll({
            attributes:[],
            where:{check_Out_type:'vehicular', status:'initiated'},
            include: [
                {
                    model:Staff,
                    as:'staff',
                    attributes:['firstname','lastname']
                },
                {
                    model:CheckOutVehicular,
                    as:'checkOutVehicular',
                    attributes:['destination'],
                    include: [{
                        model:Vehicle,
                        as:'vehicle',
                        attributes:['name','image']
                    }]
                }
            ]
        });

        const formatData = getVehicularActivity.map((activity, index) => ({
            id:index,
            staffName:`${activity.staff.firstname} ${activity.staff.lastname}`,
            destination: activity.checkOutVehicular.destination,
            vehicleName: activity.checkOutVehicular.vehicle.name,
            vehicleImage: activity.checkOutVehicular.vehicle.image
        }));

        res.status(200).json({
            message:'Actividad vehicular',
            activity:formatData
        });
    } catch (error) {
        console.log(error);
        next(new handleError('Error al consultar la actividad vehicular.', error));
    }
}

module.exports = {
    get,
    post,
    vehicularActivity
}