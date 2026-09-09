const express = require('express');
const router = express.Router();
const jopPositionController = require('../controllers/jopPosition');
const { auth, authorize, validateField } = require('../middlewares');

router.get('/by-department/:departmentId', 
    auth,
    authorize(['admin']), 
    validateField('departmentId'),
    jopPositionController.getJopPositionByDepartment
);

router.post('/', 
    auth,
    authorize(['admin']), 
    validateField('jopPositionName'),
    validateField('departmentId'),
    jopPositionController.createJopPosition
);

module.exports = router;