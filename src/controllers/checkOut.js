const { CheckOutTime, CheckOutTimeVehicular, Vehicle } = require('../models');
const { sequelizeConfig } = require('../database/sequelizeConfig');
const { getExpirationTime } = require('../utils/time');

const createStaffCheckOutTime = async (req, res, next) => {
    try {
        const { reason, status, idStaff } = req.body; 
        await CheckOutTime.create({
            reason:reason,
            check_Out_type:'staff',
            expiration_time:getExpirationTime(),
            status:status,
            id_staff:idStaff
        });
        res.status(201).json({message:"Registro creado."});
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
        
        await sequelizeConfig.transaction( async (transaction) => {
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
            
            await CheckOutTimeVehicular.create(
                {
                    departure_mileage: vehicle.init_mileage,
                    output_gasoline: gasTank,
                    destination: destination,
                    id_check_out: checkOutTime.id,
                    id_vehicle: idVehicle
                },
                {transaction}
            );
        });

        res.status(201).json({message:"Registro creado."});
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createStaffCheckOutTime,
    createVehicularCheckOutTime
};