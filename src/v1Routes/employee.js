const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employees');
const { auth, authorize, validateField } = require('../middlewares');

router.get('/', 
    auth,
    authorize(['operator','admin']),
    validateField('page', false),
    validateField('departmentId', false),
    employeeController.getEmployees
);

router.get('/names',
    auth,
    authorize(['operator','admin']),
    employeeController.getEmployeesNames
);

router.get('/:employeeId', 
    auth,
    authorize(['operator','admin']),
    validateField('employeeId'),
    employeeController.getEmployeeById
);

router.get('/history/:employeeId',
    auth,
    authorize(['operator','admin']),
    validateField('employeeId'),
    validateField('page'),
    validateField('initialDate', false),
    validateField('finalDate', false),
    employeeController.getEmployeeHistory
);

router.get('/assetCustodyForm/:employeeId',
    auth,
    authorize(['operator','admin']),
    validateField('employeeId'),
    employeeController.getAssetCustodyForm
);

router.post('/',
    auth,
    authorize(['admin']),
    validateField('role'),
    validateField('campId'),
    validateField('deparment'),
    validateField('title', false),
    validateField('firstname'),
    validateField('lastname'),
    validateField('email', false),
    validateField('password', false),
    employeeController.createEmployee
);

router.patch('/:employeeId',
    auth, 
    authorize(['admin']),
    validateField('employeeId'),
    validateField('role', false),
    validateField('campId', false),
    validateField('deparment', false),
    validateField('title', false),
    validateField('firstname', false),
    validateField('lastname', false),
    validateField('email', false),
    validateField('password', false),
    employeeController.editEmployee
);

module.exports = router;