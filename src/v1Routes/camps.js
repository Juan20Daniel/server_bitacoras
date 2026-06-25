const express = require('express');
const router = express.Router();
const campsController = require('../controllers/camps');
const { auth, validateField, authorize } = require('../middlewares');

router.get('/', 
    auth, 
    authorize(['basic','rrhh','operator','admin']), 
    campsController.getAllCampus
);

router.post('/', 
    auth, 
    authorize(['admin']),
    validateField('city'),
    validateField('schoolType'),
    campsController.createCampus
);

router.patch('/:campId',
    auth,
    authorize(['admin']),
    validateField('campId'),
    validateField('city'),
    validateField('schoolType'),
    campsController.updateCampus
);

module.exports = router;