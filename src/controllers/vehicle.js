const { Vehicle, CheckOut, CheckOutVehicular, Staff } = require('../models');
const { handleError } = require('../utils/error');
const { moveImg, removeImg } = require('../utils/file');

const getVehicleById = async (vehicleId) => {
     try {
        const vehice = await Vehicle.findOne({
            attributes: [
                'id',
                'name',
                'image',
                'init_mileage',
                'init_tank_lavel',
                'active',
                'code',
                'unit',
                'license_plate',
                'serie'
            ],
            where: {id:vehicleId}
        });
        return vehice;
    } catch (error) {
        throw error;
    }
}

const get = async (req, res, next) => {
    try {
        const vehices = await Vehicle.findAll({
            attributes: [
                'id',
                'name',
                'image',
                'init_mileage',
                'init_tank_lavel',
                'active',
                'code',
                'unit',
                'license_plate',
                'serie'
            ]
        });
        res.status(200).json({
            message:'Vehículos', 
            vehiclesList: vehices
        });
    } catch (error) {
        next(new handleError('Error al obtener los vehículos', "SERVER_ERR"));
    }
}

const getCode = async () => {
    try {
        const vehicles = await Vehicle.findOne({
            attributes:['unit'],
            order: [['id', 'DESC']]
        });
        const unit = Number(vehicles.unit);
        if(isNaN(unit)) throw new Error('Error al generar la unidad');

        return unit+1;
    } catch (error) {
        throw error;
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
            id: index,
            staffName: `${activity.staff.firstname} ${activity.staff.lastname}`,
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
        next(new handleError('Error al consultar la actividad vehicular.', "SERVER_ERR"));
    }
}

const post = async (req, res, next) => {
    try {
        const { 
            vehicle,
            initMileage,
            initTankLavel,
            code,
            serie,
            licensePlate
        } = req.body;
        const {filename} = req.file;
        const unit = await getCode();

        const result = await Vehicle.create({
            name:vehicle,
            image:filename,
            init_mileage: initMileage,
            init_tank_lavel:initTankLavel,
            code: code,
            unit: unit,
            license_plate: licensePlate,
            serie: serie
        });

        const newVehicle = await getVehicleById(result.id);

        await moveImg(req.file, req.uploadFolder);

        res.status(201).json({message:'Vehículo agregado', vehicle:newVehicle});
    } catch (error) {
        console.log(error);
        await removeImg(req.file.filename);
        next(new handleError('Error al agregar el vehículo.', "SERVER_ERR"));
    }
}

const edithVehicle = async (req, res, next) => {
    try {
        const { vehicleId } = req.params;
        const data = {
            name: req.body.vehicle??false,
            init_mileage: req.body.initMileage??false,
            init_tank_lavel: req.body.initTankLavel??false,
            code: req.body.code??false,
            license_plate: req.body.licensePlate??false,
            serie: req.body.serie??false,
        }

        for(const field in data) {
            if(!data[field]) delete data[field];
        }

        if(req.file) {
            const vehicle = await Vehicle.findOne({
                attributes:['image'],
                where:{id:vehicleId}
            });
            await removeImg(vehicle.image, 'public/images/vehicles');
            data.image = req.file.filename;
        }

        await Vehicle.update(
            data,
            {where:{id:vehicleId}}
        );

        if(req.file) {
            await moveImg(req.file, req.uploadFolder);
        }

        const vehicleUpdated = await getVehicleById(vehicleId);

        res.status(200).json({message:'Vehículo modificado', vehicle:vehicleUpdated});
    } catch (error) {
        console.log(error);
        if(req.file) {
            await removeImg(req.file.filename, 'public/temp');
        }
        next(new handleError('Error al actualizar el vehículo', "SERVER_ERR"));
    }
}

const toggleVehicle = async (req, res, next) => {
    try {
        const { vehicleId } = req.params;
        
        const disable = req.body.disable === 'true' ? false : true
       
        await Vehicle.update(
            {active:disable},
            {where:{id:vehicleId}}
        );

        res.status(201).json({message:`Vehículo ${!disable ? 'inavilitado' : 'habilitado'}`});
    } catch (error) {
        console.log(error);
        next(new handleError(`Error al ${disable ? 'inavilitado' : 'habilitado'} el vehículo`, "SERVER_ERR"));
    }
}


module.exports = {
    get,
    post,
    vehicularActivity,
    edithVehicle,
    toggleVehicle
}