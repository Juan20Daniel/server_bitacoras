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

router.get('/equipments/:jobPositionHistoryId',
    auth,
    authorize(['operator','admin']),
    validateField('jobPositionHistoryId'),
    validateField('inventoryType', false),
    validateField('page', false),
    historyController.historyEquipments
);

router.get('/assetCustodyForm/:jobPositionHistoryId',
    auth,
    authorize(['operator','admin']),
    validateField('jobPositionHistoryId'),
    validateField('inventoryType', false),
    historyController.getAssetCustodyForm
);

module.exports = router;