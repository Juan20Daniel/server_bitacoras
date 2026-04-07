const express = require('express');
const router = express.Router();
const { auth, authorize, validateField } = require('../middlewares');
const reportController = require('../controllers/reports');

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
    reportController.vehicleExitReport
);

module.exports = router;