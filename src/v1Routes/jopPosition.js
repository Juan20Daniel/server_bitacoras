const express = require('express');
const router = express.Router();
const jobPositionController = require('../controllers/jobPosition');
const { auth, authorize, validateField } = require('../middlewares');

router.get('/:jopPositionId', 
    auth,
    authorize(['admin']), 
    validateField('jopPositionId'),
    jobPositionController.getJobPositionById
);

router.get('/by-department/:departmentId', 
    auth,
    authorize(['admin']), 
    validateField('departmentId'),
    jobPositionController.getJobPositionsByDepartment
);

router.post('/', 
    auth,
    authorize(['admin']), 
    validateField('jobPositionName'),
    validateField('departmentId'),
    jobPositionController.createJobPosition
);

module.exports = router;