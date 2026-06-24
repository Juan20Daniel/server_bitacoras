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

module.exports = router;