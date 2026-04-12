const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipment');
const { 
    upload, 
    authorize, 
    auth, 
    setUploadFolder, 
    validateImage,
    validateField,
} = require('../middlewares');

router.post('/', 
    auth, 
    authorize(['operator','admin']),
    setUploadFolder('equipment'),
    upload.single('image'),
    validateImage(),
    validateField('equipmentName'),
    validateField('equipmentOwn'),
    validateField('fixedAssetType'),
    validateField('clasification'),
    validateField('equipmentBrand'),
    validateField('equipmentModel'),
    validateField('equipmentState'),
    validateField('departmentId'),
    equipmentController.addEquipment
);

module.exports = router;