const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department');
const { authorize, auth } = require('../middlewares');

router.get('/', 
    auth, 
    authorize(['operator','admin']), 
    departmentController.getDepartmentByCampus
);

router.get('/:departmentId', 
    auth, 
    authorize(['operator','admin']), 
    departmentController.getDepartmentById
);

module.exports = router;