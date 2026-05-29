const express = require('express');
const router = express.Router();
const usersController = require('../controllers/checkOut');
const { 
    validateField, 
    setUploadFolder,
    authorize, 
    auth,
    upload,
    validateImage
} = require('../middlewares');

router.get('/',
    auth,
    authorize(['basic','rrhh','operator','admin']),
    usersController.getAll
);

router.get('/:staffId',
    validateField('staffId'),
    auth,
    authorize(['basic','rrhh','operator','admin']),
    usersController.getByStaffId
);

router.get('/getCheckOutByCampId/:campId',
    validateField('campId'),
    auth,
    authorize(['basic','rrhh','operator','admin']),
    usersController.getByCampId
);

router.post('/staff',
    auth,
    authorize(['basic','rrhh','operator','admin']),
    validateField('reason'),
    validateField('status'),
    validateField('staffId'),
    usersController.createStaffCheckOut
);

router.post('/vehicular',
    auth,
    authorize(['basic','rrhh','operator','admin']),
    validateField('reason'),
    validateField('status'),
    validateField('staffId'),
    validateField('departureKm'),
    validateField('outputTankLavel'),
    validateField('vehicleId'),
    validateField('destination'),
    usersController.createVehicularCheckOut
);

router.patch('/staff/:checkOutId',
    auth,
    authorize(['basic','rrhh','operator','admin']),
    validateField('reason'),
    usersController.updateCheckOutStaff
);

router.patch('/vehicular/:checkOutId',
    auth,
    authorize(['basic','rrhh','operator','admin']),
    validateField('reason'),
    validateField('vehicleId'),
    validateField('destination'),
    usersController.updateCheckOutVehicular
);

router.patch('/registerExitHour/:checkOutId',
    auth,
    authorize(['basic','rrhh','operator','admin']),
    validateField('vehicleId'),
    validateField('checkOutType'),
    validateField('departureKm'),
    validateField('inputTankLavel'),
    usersController.registerExitHour
);

router.patch('/registerInputHourStaff/:checkOutId',
    auth,
    authorize(['basic','rrhh','operator','admin']),
    setUploadFolder('selfies'),
    upload.single('selfie'),
    validateImage(),
    usersController.registerInputHourStaff
);

router.patch('/registerInputHourVehicular/:checkOutId',
    auth,
    authorize(['basic','rrhh','operator','admin']),
    setUploadFolder('selfies'),
    upload.single('selfie'),
    validateImage(),
    validateField('arrivalKm'),
    validateField('inputTankLavel'),
    usersController.registerInputHourVehicular
);

router.patch('/cancel/:checkOutId',
    auth,
    authorize(['basic','rrhh','operator','admin']),
    usersController.cancelCheckOut
);

router.delete('/:checkOutId',
    auth,
    authorize(['basic','rrhh','operator','admin']),
    usersController.removeCheckOut
);

module.exports = router;