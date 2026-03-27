const { CheckOut, CheckOutVehicular, Vehicle, Staff, Department } = require('../models');
const { sequelizeConfig } = require('../database/sequelizeConfig');
const { Sequelize } = require('sequelize');
const { getExpirationTime, timeUnix } = require('../utils/time');
const { handleError } = require('../utils/error');
const { getDayAndHour } = require('../utils/time');
const { moveImg, removeImg } = require('../utils/file')

const getCheckOutById = async (id) => {
    const checkOuts = await CheckOut.findOne({
        attributes: ['id','reason','check_Out_type','departure_time','arrival_time','status','expiration_time'],
        include: [
            {
                model:CheckOutVehicular,
                as:'checkOutVehicular',
                required:false,
                attributes:['departure_km', 'arrival_km','outlet_tank_lavel','input_tank_lavel','destination','vehicle_id'],
                include: [
                    {
                        model:Vehicle,
                        as:'vehicle',
                        attributes:['name', 'image']
                    }
                ]
            },
            {
                model:Staff,
                as:'staff',
                attributes:['firstname', 'lastname']
            }
        ],
        where: {
            id:id,
        },
    });
   
    return checkOuts;
}

const getByCampId = async (req, res, next) => {
     try {
        const { campId } = req.params;
        const checkOuts = await CheckOut.findAll({
            attributes:['id','reason','check_Out_type','departure_time','arrival_time','status','expiration_time'],
            include: [
                {
                    model:CheckOutVehicular,
                    as:'checkOutVehicular',
                    required:false,
                    attributes:['departure_km', 'arrival_km','outlet_tank_lavel','input_tank_lavel','destination','vehicle_id'],
                    include: [
                        {
                            model:Vehicle,
                            as:'vehicle',
                            attributes:['name', 'image']
                        }
                    ]
                },
                {
                    model:Staff,
                    as:'staff',
                    attributes:['firstname', 'lastname'],
                    required:true,
                    include: [
                        {
                            model:Department,
                            as:'department',
                            attributes:[],
                            where: {camps_id:campId}
                        }
                    ]
                }
            ],
            where: {status:['programmed', 'initiated']}
        });

        const validCheckOuts = await getVelidCheckOuts(checkOuts);

        res.status(200).json({
            message:"Registros de salida.", 
            checkOutList:validCheckOuts
        });
    } catch (error) {
        next(new handleError('Error al obtener todos los registros de salida.', error));
    }
}

const getVelidCheckOuts = async (checkOuts) => {
    const now = timeUnix();
    const expireCheckOuts = [];
    const validCheckOuts = [];
    checkOuts.forEach(checkOut => {
        (checkOut.status === 'initiated' && now > checkOut.expiration_time)
            ?   expireCheckOuts.push(checkOut)
            :   validCheckOuts.push(checkOut)
    });

    if(!expireCheckOuts.length) return validCheckOuts;

    const expireCheckOutIds = expireCheckOuts.map(checkOut => checkOut.id);
    try {
        await CheckOut.update(
            {status:'incomplete'},
            {where:{id:expireCheckOutIds}}
        );

        return validCheckOuts;
    } catch (error) {
        throw error;
    }
}

const getAll = async (req, res, next) => {
    try {
        const checkOuts = await CheckOut.findAll({
            attributes:['id','reason','check_Out_type','departure_time','arrival_time','status','expiration_time'],
            include: [
                {
                    model:CheckOutVehicular,
                    as:'checkOutVehicular',
                    required:false,
                    attributes:['departure_km', 'arrival_km','outlet_tank_lavel','input_tank_lavel','destination','vehicle_id'],
                    include: [
                        {
                            model:Vehicle,
                            as:'vehicle',
                            attributes:['name', 'image']
                        }
                    ]
                },
                {
                    model:Staff,
                    as:'staff',
                    attributes:['firstname', 'lastname']
                }
            ],
            where: {status:['programmed', 'initiated']}
        });

        const validCheckOuts = await getVelidCheckOuts(checkOuts);

        res.status(200).json({
            message:"Registros de salida.", 
            checkOutList:validCheckOuts
        });
    } catch (error) {
        next(new handleError('Error al obtener todos los registros de salida.', error));
    }
}


const getByStaffId = async (req, res, next) => {
    try {
        const { staffId } = req.params;
        const checkOuts = await CheckOut.findAll({
            attributes:['id','reason','check_Out_type','departure_time','arrival_time','status','expiration_time'],
            include: [
                {
                    model:CheckOutVehicular,
                    as:'checkOutVehicular',
                    required:false,
                    attributes:['departure_km', 'arrival_km','outlet_tank_lavel','input_tank_lavel','destination','vehicle_id'],
                    include: [
                        {
                            model:Vehicle,
                            as:'vehicle',
                            attributes:['name', 'image']
                        }
                    ]
                },
                {
                    model:Staff,
                    as:'staff',
                    attributes:['firstname', 'lastname']
                }
            ],
            where: {
                staff_id:staffId,
                status:['programmed', 'initiated']
            },
            order: [['createdAt', 'DESC']]
        });

        const validCheckOuts = await getVelidCheckOuts(checkOuts);
        
        res.status(200).json({
            message:"Registros de salida.", 
            checkOutList:validCheckOuts
        });
    } catch (error) {
        next(new handleError('Error al obtener los registros de salida', error));
    }
}

const createStaffCheckOut = async (req, res, next) => {
    try {
        const { reason, status, staffId } = req.body;

        const isInitiated = status === 'initiated';

        const newCheckOut = await CheckOut.create({
            reason:reason,
            check_Out_type:'staff',
            departure_time:isInitiated ? getDayAndHour() : null,
            status:status,
            expiration_time:isInitiated ? getExpirationTime() : null,
            staff_id:staffId,
            start_date: isInitiated ? Sequelize.literal('CURRENT_DATE') : null,
        });
        
        const checkOut = await getCheckOutById(newCheckOut.id);
        res.status(201).json({
            message:"Registro creado.",
            newCheckOut: checkOut
        });
    } catch (error) {
        next(new handleError('Error al crear el registro de salida', error));
    }
}

const createVehicularCheckOut = async (req, res, next) => {
    try {
        const { reason, status, staffId, vehicleId, destination } = req.body;
        
        const vehicle = await Vehicle.findOne({
            attributes:['id', 'init_mileage', 'init_tank_lavel'],
            where: {
                id:vehicleId
            }
        });
        const result = await sequelizeConfig.transaction( async (transaction) => {
            const isInitiated = status === 'initiated';
            const checkOut = await CheckOut.create(
                {
                    reason:reason,
                    check_Out_type:'vehicular',
                    departure_time:isInitiated ? getDayAndHour() : null,
                    status:status,
                    expiration_time:isInitiated ? getExpirationTime() : null,
                    staff_id:staffId,
                    start_date: isInitiated ? Sequelize.literal('CURRENT_DATE') : null,
                },
                {transaction}
            );
            
            const checkOutVehicular = await CheckOutVehicular.create(
                {
                    departure_km: isInitiated ? vehicle.init_mileage : null,
                    outlet_tank_lavel: isInitiated ? vehicle.init_tank_lavel : null,
                    destination: destination,
                    check_out_id: checkOut.id,
                    vehicle_id: vehicleId
                },
                {transaction}
            );
            return {
                checkOut,
                checkOutVehicular
            }
        });
        const checkOut = await getCheckOutById(result.checkOut.id);
        res.status(201).json({
            message:"Registro creado.", 
            newCheckOut: checkOut
        });
    } catch (error) {
        next(new handleError('Error al crear el registro de salida', error));
    }
}

const updateCheckOutStaff = async (req, res, next) => {
    try {
        const { checkOutId } = req.params;
        const { reason } = req.body;
        await CheckOut.update(
            {reason:reason},
            {where:{id:checkOutId}},
        );
        const checkOutUpdated = await getCheckOutById(checkOutId);
        res.status(201).json({
            message:"Registro actualizado",
            checkOutUpdated
        });
    } catch (error) {
        next(new handleError('Error al registrar el registro de salida', error));
    }
}

const updateCheckOutVehicular = async (req, res, next) => {
    try {
        const { checkOutId } = req.params;
        const { reason, vehicleId, destination } = req.body;

        await sequelizeConfig.transaction(async (transaction) => {
            await CheckOut.update(
                {reason:reason},
                {where:{id:checkOutId}},
                {transaction}
            );

            await CheckOutVehicular.update(
                {
                    destination:destination,
                    vehicle_id:vehicleId
                },
                {where:{check_out_id:checkOutId}},
                {transaction}
            );
        });
        const checkOutUpdated = await getCheckOutById(checkOutId);
        res.status(201).json({
            message:"Registro actualizado",
            checkOutUpdated
        });
    } catch (error) {
        next(new handleError('Error al registrar el registro de salida', error));
    }
}

const registerExitHour = async (req, res, next) => {
    try {
        const { checkOutId, type } = req.params;
        await sequelizeConfig.transaction(async (transaction) => {
            await CheckOut.update(
                {
                    start_date: Sequelize.literal('CURRENT_DATE'),
                    departure_time:getDayAndHour(),
                    status:'initiated',
                    expiration_time:getExpirationTime()
                },
                {
                    where: {id:checkOutId}
                },
                {transaction}
            );
            
            if(type === 'staff') return;
            const checkOut = await CheckOut.findOne(
                {
                    attributes:[],
                    where:{id:checkOutId},
                    include: [
                        {
                            model:CheckOutVehicular,
                            as:'checkOutVehicular',
                            attributes:[],
                            include: [
                                {
                                    model: Vehicle,
                                    as: 'vehicle',
                                    attributes:['id','init_mileage', 'init_tank_lavel']
                                }
                            ]
                        }
                    ],
                    raw:true
                },
            );
           
            const [ _, initMileage, initTankLavel ] = Object.values(checkOut);
            await CheckOutVehicular.update(
                {
                    departure_km: initMileage,
                    outlet_tank_lavel: initTankLavel,
                },
                {
                    where: {check_out_id:checkOutId}
                },
                {transaction}
            );
        });
       
        const checkOut = await getCheckOutById(checkOutId);
        
        return res.status(201).json({
            message:"Hora de salida registrada",
            checkOut
        });
       
    } catch (error) {
        next(new handleError('Error al registrar la hora de salida', error));
    }
}

const registerInputHourStaff = async (req, res, next) => {
    try {
        const { filename } = req.file;
        const { checkOutId } = req.params;
        const checkOut = await CheckOut.findOne({where:{id:checkOutId}});
        const now = timeUnix();

        if(now > checkOut.expiration_time) {
            await CheckOut.update(
                {status:'incomplete'},
                {where:{id:checkOutId}}
            );
            await removeImg(req.file.filename);
            return next(new handleError('El tiempo para registrar la hora de regreso, expiró', 'EXPIRATION_ERROR'));
        }

        await CheckOut.update(
            {
                status:'finalized',
                arrival_time:getDayAndHour(),
                selfie_img:filename
            },
            {where:{id:checkOutId}}
        );
        await moveImg(req.file, req.uploadFolder);
        const checkOutUpdated = await getCheckOutById(checkOutId);
        res.status(201).json({
            message:"Hora de llegada registrada",
            checkOut:checkOutUpdated
        });
    } catch (error) {
        await removeImg(req.file.filename);
        next(new handleError('Error al registrar la hora de llegada', error));
    }
}

const registerInputHourVehicular = async (req, res, next) => {
    try {
        const { filename } = req.file;
        const { checkOutId } = req.params;
        const { arrivalKm, inputTankLavel } = req.body;
        
        const checkOutInstance = await CheckOut.findOne({
            include: {
                model:CheckOutVehicular,
                as:'checkOutVehicular',
                attributes:['vehicle_id'],
                include:{
                    model:Vehicle,
                    as:'vehicle',
                    attributes:['init_mileage']
                }
            },
            where: {id:checkOutId}, 
        });
        const checkOut = checkOutInstance.toJSON()
        
        const now = timeUnix();

        if(now > checkOut.expiration_time) {
            await CheckOut.update(
                {status:'incomplete'},
                {where:{id:checkOutId}}
            );
            await removeImg(req.file.filename);
            return next(new handleError('El tiempo para registrar la hora de regreso, expiró', 'EXPIRATION_ERROR'));
        }
        const { vehicle_id } = checkOut.checkOutVehicular;
        const { init_mileage } = checkOut.checkOutVehicular.vehicle;
        
        if(arrivalKm <= init_mileage) {
            await removeImg(req.file.filename);
            return next(new handleError('El kilometraje, no es válido', 'VALIDATION_ERR'));
        }
        await sequelizeConfig.transaction( async (transaction) => {
            await CheckOut.update(
                {
                    status:'finalized',
                    arrival_time:getDayAndHour(),
                    selfie_img:filename
                },
                {where:{id:checkOutId}},
                {transaction}
            );
            await CheckOutVehicular.update(
                {
                    arrival_km:arrivalKm,
                    input_tank_lavel:inputTankLavel
                },
                {where:{check_out_id:checkOutId}},
                {transaction}
            );
            await Vehicle.update(
                {
                    init_mileage:arrivalKm,
                    init_tank_lavel:inputTankLavel
                },
                {where:{id:vehicle_id}},
                {transaction}
            );
        });

        await moveImg(req.file, req.uploadFolder);
        const checkOutUpdated = await getCheckOutById(checkOutId);
        res.status(201).json({
            message:"Hora de llegada registrada",
            checkOut:checkOutUpdated
        });
    } catch (error) {
        await removeImg(req.file.filename);
        next(new handleError('Error al registrar la hora de llegada', error));
    }
}

const removeCheckOut = async (req, res, next) => {
     try {
        const { checkOutId } = req.params;
        await CheckOut.update(
            {status:'removed'},
            {where:{id:checkOutId}}
        );
        res.status(201).json({
            message:"Registro eliminado",
        });
    } catch (error) {
        next(new handleError('Error al eliminar el registro', error));
    }
}

const cancelCheckOut = async (req, res, next) => {
     try {
        const { checkOutId } = req.params;
        await CheckOut.update(
            {status:'canceled'},
            {where:{id:checkOutId}}
        );
        res.status(201).json({
            message:"Registro cancelado",
        });
    } catch (error) {
        next(new handleError('Error al cancelar el registro', error));
    }
}

module.exports = {
    getAll,
    getByStaffId,
    createStaffCheckOut,
    createVehicularCheckOut,
    getByCampId,
    registerExitHour,
    registerInputHourStaff,
    registerInputHourVehicular,
    updateCheckOutVehicular,
    updateCheckOutStaff,
    removeCheckOut,
    cancelCheckOut
};