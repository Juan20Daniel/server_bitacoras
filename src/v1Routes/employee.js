const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employees');
const { auth, authorize, validateField } = require('../middlewares');

router.get('/', 
    auth,
    authorize(['operator','admin']),
    validateField('page'),
    employeeController.getAll
);

router.get('/by-department/:departmentId', 
    auth,
    authorize(['operator','admin']),
    validateField('departmentId'),
    employeeController.getByDepartment
);


module.exports = router;