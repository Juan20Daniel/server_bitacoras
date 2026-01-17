const express = require('express');
const router = express.Router();
const usersController = require('../controllers/checkOut');
const { validateField } = require('../middlewares/validateField');
const { auth } = require('../middlewares/auth');
const { authorize } = require('../middlewares/authorize');

router.post('/staff',
    validateField('reason'),
    validateField('checkOutType'),
    validateField('status'),
    validateField('idStaff'),
    auth,
    authorize(['basic','rrhh','operator','admin']),
    usersController.createStaffCheckOutTime
);

router.post('/vehicular',
    validateField('reason'),
    validateField('checkOutType'),
    validateField('status'),
    validateField('idStaff'),
    validateField('idVehicle'),
    validateField('gasTank'),
    validateField('destination'),
    auth,
    authorize(['basic','rrhh','operator','admin']),
    usersController.createVehicularCheckOutTime
);

module.exports = router;