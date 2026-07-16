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
    validateField('vehicle'),
    validateField('initMileage'),
    validateField('initTankLavel'),
    validateField('carCode'),
    validateField('carSerie'),
    validateField('licensePlate'),
    vehicleController.post
);

router.patch('/:vehicleId',
    auth,
    authorize(['admin']),
    setUploadFolder('vehicles'),
    upload.single('image'),
    validateImage(false),
    validateField('vehicle',false),
    validateField('initMileage', false),
    validateField('initTankLavel', false),
    validateField('carCode', false),
    validateField('carSerie', false),
    validateField('licensePlate', false),
    vehicleController.edithVehicle
);

router.patch('/toggle/:vehicleId',
    auth,
    authorize(['admin']),
    validateField('vehicleId'),
    validateField('disable'),
    vehicleController.toggleVehicle
);


module.exports = router;