const { CheckOutTime } = require('../models');
const { sequelizeConfig } = require('../database/sequelizeConfig');
const { getExpirationTime } = require('../utils/time');

const createStaffCheckOutTime = async (req, res, next) => {
    try {
        const { reason, checkOutType, status, idStaff } = req.body; 
        await CheckOutTime.create({
            reason:reason,
            check_Out_type:checkOutType,
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
            checkOutType, 
            status, 
            idStaff, 
            idVehicle, 
            gasTank, 
            destination 
        } = req.body; 
        console.log(req.body)
        // await sequelizeConfig.transaction( async (transaction) => {
        //     const checkOutTime = await CheckOutTime.create(
        //         {
        //             reason:reason,
        //             check_Out_type:checkOutType,
        //             expiration_time:getExpirationTime(),
        //             status:status,
        //             id_staff:idStaff
        //         },
        //         {transaction}
        //     );
            
        // });

        res.status(201).json({message:"Registro creado."});
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createStaffCheckOutTime,
    createVehicularCheckOutTime
};