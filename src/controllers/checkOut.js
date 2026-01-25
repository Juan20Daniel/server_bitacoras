const { CheckOut, CheckOutVehicular, Vehicle, Staff } = require('../models');
const { sequelizeConfig } = require('../database/sequelizeConfig');
const { Sequelize } = require('sequelize');
const { getExpirationTime } = require('../utils/time');
const { handleError } = require('../utils/error');
const { getDayAndHour } = require('../utils/time');

const getNewCheckOut = async (id) => {
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
            expiration_time:getExpirationTime(),
            status:status,
            staff_id:staffId
        });
        const checkOut = await getNewCheckOut(newCheckOut.id);
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
                    expiration_time:getExpirationTime(),
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
         const checkOut = await getNewCheckOut(result.checkOut.id);
        res.status(201).json({
            message:"Registro creado.", 
            newCheckOut: checkOut
        });
    } catch (error) {
        next(new handleError('Error al crear el registro de salida', error));
    }
}

const registerExitHour = async (req, res, next) => {
    try {
        const { checkOutId } = req.params;
        
        await CheckOut.update(
            {
                start_date: Sequelize.literal('CURRENT_DATE'),
                departure_time:getDayAndHour(),
                status:'initiated'
            },
            {
                where: {
                    id:checkOutId
                }
            }
        );
        const checkOutUpdated = await getNewCheckOut(checkOutId)
        res.status(201).json({
            message:"Registro actualizado",
            checkOutUpdated
        });
    } catch (error) {
        console.log(error);
        next(new handleError('Error al registrar la hora de salida', error));
    }
}

const registerInputHourStaff = async (req, res, next) => {
    try {
       
        res.status(201).json({
            message:"Registro actualizado",
            checkOutUpdated
        });
    } catch (error) {
        console.log(error);
        next(new handleError('Error al registrar la hora de llegada', error));
    }
}

module.exports = {
    getByStaffId,
    createStaffCheckOut,
    createVehicularCheckOut,
    registerExitHour
};