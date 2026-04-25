const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reports');
const { auth, authorize, validateField } = require('../middlewares');

router.get(
    '/staffDepartureReport',
    auth,
    authorize(['admin','rrhh']),
    validateField('initialDate'),
    validateField('finalDate'),
    reportController.staffDepartureReport
);

router.get(
    '/vehicleExitReport',
    auth,
    authorize(['admin','operator']),
    validateField('monthAndYear'),
    reportController.vehicleExitReport
);

module.exports = router;