const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle');
const {setUploadFolder, upload, validateField, validateImage, auth, authorize } = require('../middlewares');

router.post('/',
    setUploadFolder('vehicles'),
    upload.single('image'),
    validateImage(),
    validateField('vehicleName'),
    validateField('initMileage'),
    auth,
    authorize(['admin']),
    vehicleController.post
);

module.exports = router;