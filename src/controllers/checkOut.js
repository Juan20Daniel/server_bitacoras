const { CheckOutTime, CheckOutTimeVehicular, Vehicle } = require('../models');
const { sequelizeConfig } = require('../database/sequelizeConfig');
const { getExpirationTime } = require('../utils/time');

const getByIdStaff = async (req, res, next) => {
    try {
        const {idStaff} = req.params;
        const result = await CheckOutTime.findAll({
            attributes:['id','reason','check_Out_type','departure_time','arrival_time','status','expiration_time'],
            include: [
                {
                    model:CheckOutTimeVehicular,
                    as:'checkOutTimeVehicular',
                    required:false,
                    attributes:['departure_mileage', 'arrival_mileage','output_gasoline','arrival_gasoline','destination','id_vehicle']
                }
            ],
            where: {
                id_staff:idStaff
            }
        });
        res.status(200).json({message:"Registros de salida.", data:result});
    } catch (error) {
        next(error);
    }
}

const createStaffCheckOutTime = async (req, res, next) => {
    try {
        const { reason, status, idStaff } = req.body; 
         const result = await CheckOutTime.create({
            reason:reason,
            check_Out_type:'staff',
            expiration_time:getExpirationTime(),
            status:status,
            id_staff:idStaff
        });
        res.status(201).json({message:"Registro creado.", data:result});
    } catch (error) {
        next(error);
    }
}

const createVehicularCheckOutTime = async (req, res, next) => {
    try {
        const { 
            reason,
            status,
            idStaff,
            idVehicle,
            gasTank, 
            destination 
        } = req.body;
        
        const result = await sequelizeConfig.transaction( async (transaction) => {
            const vehicle = await Vehicle.findOne({
                attributes:['id', 'init_mileage'],
                where: {
                    id:idVehicle
                }
            });

            const checkOutTime = await CheckOutTime.create(
                {
                    reason:reason,
                    check_Out_type:'vehicular',
                    expiration_time:getExpirationTime(),
                    status:status,
                    id_staff:idStaff
                },
                {transaction}
            );
            
            const checkOutTimeVehicular = await CheckOutTimeVehicular.create(
                {
                    departure_mileage: vehicle.init_mileage,
                    output_gasoline: gasTank,
                    destination: destination,
                    id_check_out: checkOutTime.id,
                    id_vehicle: idVehicle
                },
                {transaction}
            );
            return {
                checkOutTime,
                checkOutTimeVehicular
            }
        });

        res.status(201).json({message:"Registro creado.", data: result});
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getByIdStaff,
    createStaffCheckOutTime,
    createVehicularCheckOutTime
};