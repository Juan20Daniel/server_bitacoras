const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department');
const { authorize, auth, validateField } = require('../middlewares');

router.get('/',
    auth,
    authorize(['operator','admin']),
    departmentController.getDepartments
);

router.get('/:departmentId',
    auth,
    authorize(['operator','admin']),
    validateField('departmentId'),
    departmentController.getDepartmentById
);

router.get('/history/:departmentId',
    auth,
    authorize(['operator','admin']),
    validateField('departmentId'),
    validateField('page'),
    validateField('initialDate', false),
    validateField('finalDate', false),
    departmentController.getDepartmentHistory
);

router.get('/assetCustodyForm/:departmentId/:employeeId',
    auth,
    authorize(['operator','admin']),
    validateField('departmentId'),  
    validateField('employeeId'),    
    departmentController.getAssetCustodyForm
);

router.get('/variable-department-report/:departmentId',
    auth,
    authorize(['operator','admin']),
    validateField('departmentId'),
    validateField('initialDate'),
    validateField('finalDate'),
    departmentController.variableDepartmentReport
);

router.post('/',
    auth,
    authorize(['admin']),
    validateField('departmentName'),
    validateField('campId'),
    validateField('departmentInventoryType'),
    departmentController.createDepartment
);

module.exports = router;