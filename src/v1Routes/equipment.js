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

router.get('/by-department/:departmentId',
    auth,
    authorize(['operator','admin']),
    validateField('departmentId'),
    equipmentController.equipmentsByDepartment
)

router.post('/', 
    auth,
    authorize(['operator','admin']),
    setUploadFolder('equipment'),
    upload.single('image'),
    validateField('own'),
    validateField('fixedAssetType'),
    validateField('clasification'),
    validateField('brand'),
    validateField('model'),
    validateField('state'),
    validateField('departmentId'),
    validateField('quantity'),
    validateField('inCharge'),
    validateField('features', false),
    validateField('observations', false),
    equipmentController.addEquipment
);

module.exports = router;