const express = require('express');
const router = express.Router();
const jobPositionController = require('../controllers/jobPosition');
const { auth, authorize, validateField } = require('../middlewares');

router.get('/names',
    auth,
    authorize(['operator','admin']),
    jobPositionController.getJopPositionsNames
);

router.get('/:jobPositionId',
    auth,
    authorize(['admin']), 
    validateField('jobPositionId'),
    jobPositionController.getJobPositionById
);

router.get('/by-department/:departmentId', 
    auth,
    authorize(['admin']), 
    validateField('departmentId'),
    jobPositionController.getJobPositionsByDepartment
);

router.get('/assetCustodyForm/:departmentId',
    auth,
    authorize(['operator','admin']),
    validateField('departmentId'),
    validateField('jobPositionId'),
    jobPositionController.getAssetCustodyForm
);

router.post('/', 
    auth,
    authorize(['admin']), 
    validateField('jobPositionName'),
    validateField('departmentId'),
    jobPositionController.createJobPosition
);

router.post('/vacatePosition', 
    auth,
    authorize(['admin']), 
    validateField('jobPositionId'),
    jobPositionController.vacatePosition
);

module.exports = router;