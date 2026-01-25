const express = require('express');
const router = express.Router();
const usersController = require('../controllers/checkOut');
const { validateField } = require('../middlewares/validateField');
const { auth } = require('../middlewares/auth');
const { authorize } = require('../middlewares/authorize');

router.get('/:staffId',
    validateField('staffId'),
    auth,
    authorize(['basic','rrhh','operator','admin']),
    usersController.getByStaffId
)

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
    validateField('vehicleId'),
    validateField('outletTankLavel'),
    validateField('destination'),
    usersController.createVehicularCheckOut
)

router.patch('/registerExitHour/:checkOutId',
    auth,
    authorize(['basic','rrhh','operator','admin']),
    usersController.registerExitHour
);


module.exports = router;