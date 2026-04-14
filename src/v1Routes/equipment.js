const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipment');
const { 
    upload, 
    authorize, 
    auth, 
    setUploadFolder,
    validateField,
} = require('../middlewares');

router.post('/', 
    auth,
    authorize(['operator','admin']),
    setUploadFolder('equipment'),
    upload.single('image'),
    validateField('equipmentName'),
    validateField('equipmentOwn'),
    validateField('fixedAssetType'),
    validateField('clasification'),
    validateField('equipmentBrand'),
    validateField('equipmentModel'),
    validateField('equipmentState'),
    validateField('departmentId'),
    validateField('quantity'),
    validateField('inCharge'),
    validateField('features', false),
    validateField('observations', false),
    equipmentController.addEquipment
);

module.exports = router;