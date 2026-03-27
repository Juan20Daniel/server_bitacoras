const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle');
const {
    upload,
    setUploadFolder,
    validateField,
    validateImage, 
    auth,
    authorize,
} = require('../middlewares');

router.get('/', 
    auth,
    authorize(['basic','rrhh','operator','admin']),
    vehicleController.get
);

router.get('/activity',
    auth,
    authorize(['basic','rrhh','operator','admin']),
    vehicleController.vehicularActivity
);

router.post('/',
    auth,
    authorize(['admin']),
    setUploadFolder('vehicles'),
    upload.single('image'),
    validateImage(),
    validateField('vehicleName'),
    validateField('initMileage'),
    validateField('initTankLavel'),
    vehicleController.post
);

module.exports = router;