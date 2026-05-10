const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employees');
const { auth, authorize, validateField } = require('../middlewares');

router.get('/', 
    auth,
    authorize(['operator','admin']),
    validateField('page'),
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


module.exports = router;