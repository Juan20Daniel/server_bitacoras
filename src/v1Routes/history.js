const express = require('express');
const router = express.Router();
const historyController = require('../controllers/history');
const { auth, authorize, validateField } = require('../middlewares');

router.get('/:jobPositionId',
    auth,
    authorize(['operator','admin']),
    validateField('jobPositionId'),
    historyController.getHistory
);

router.get('/equipments/:jobPositionId',
    auth,
    authorize(['operator','admin']),
    validateField('jobPositionId'),
    validateField('page', false),
    historyController.historyEquipments
);

module.exports = router;