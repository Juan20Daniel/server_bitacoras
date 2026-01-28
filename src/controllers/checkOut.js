const { CheckOut, CheckOutVehicular, Vehicle, Staff } = require('../models');
const { sequelizeConfig } = require('../database/sequelizeConfig');
const { Sequelize } = require('sequelize');
const { getExpirationTime, timeUnix } = require('../utils/time');
const { handleError } = require('../utils/error');
const { getDayAndHour } = require('../utils/time');

const getCheckOutById = async (id) => {
    const result = await CheckOut.findOne({
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
            id:id,
        },
    });
    return result;
}

const getAll = async (req, res, next) => {
    try {
        const result = await CheckOut.findAll({
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
        res.status(200).json({
            message:"Registros de salida.", 
            checkOutList:result
        });
    } catch (error) {
        next(new handleError('Error al obtener todos los registros de salida.', error));
    }
}

const getByStaffId = async (req, res, next) => {
    try {
        const {staffId} = req.params;
        const result = await CheckOut.findAll({
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
        res.status(200).json({
            message:"Registros de salida.", 
            checkOutList:result
        });
    } catch (error) {
        next(new handleError('Error al obtener los registros de salida', error));
    }
}

const createStaffCheckOut = async (req, res, next) => {
    try {
        const { reason, status, staffId } = req.body; 
         const newCheckOut = await CheckOut.create({
            reason:reason,
            check_Out_type:'staff',
            status:status,
            staff_id:staffId
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
        const { 
            reason,
            status,
            staffId,
            vehicleId,
            outletTankLavel, 
            destination 
        } = req.body;
        
        const result = await sequelizeConfig.transaction( async (transaction) => {
            const vehicle = await Vehicle.findOne({
                attributes:['id', 'init_mileage'],
                where: {
                    id:vehicleId
                }
            });

            const checkOut = await CheckOut.create(
                {
                    reason:reason,
                    check_Out_type:'vehicular',
                    status:status,
                    staff_id:staffId
                },
                {transaction}
            );
            
            const checkOutVehicular = await CheckOutVehicular.create(
                {
                    departure_km: vehicle.init_mileage,
                    outlet_tank_lavel: outletTankLavel,
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
        const { reason, vehicleId, outletTankLavel, destination } = req.body;

        await sequelizeConfig.transaction(async (transaction) => {
            await CheckOut.update(
                {reason:reason},
                {where:{id:checkOutId}},
                {transaction}
            );

            await CheckOutVehicular.update(
                {
                    outlet_tank_lavel:outletTankLavel,
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
        const { checkOutId } = req.params;
        
        await CheckOut.update(
            {
                start_date: Sequelize.literal('CURRENT_DATE'),
                departure_time:getDayAndHour(),
                status:'initiated',
                expiration_time:getExpirationTime()
            },
            {
                where: {
                    id:checkOutId
                }
            }
        );
        const checkOutUpdated = await getCheckOutById(checkOutId)
        res.status(201).json({
            message:"Hora de salida registrada",
            checkOutUpdated
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
        const now = timeUnix()
        if(now > checkOut.expiration_time) {
            throw new handleError('El tiempo de registrar la hora de regreso, expiró', 'EXPIRATION_ERROR');
        }
        console.log();

        res.status(201).json({
            message:"Hora de llegada registrada",
            checkOut
        });
    } catch (error) {
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
    registerExitHour,
    registerInputHourStaff,
    updateCheckOutVehicular,
    updateCheckOutStaff,
    removeCheckOut,
    cancelCheckOut
};