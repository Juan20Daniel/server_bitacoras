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
);

router.get('/by-employee/:employeeId',
    auth,
    authorize(['operator','admin']),
    validateField('employeeId'),
    equipmentController.equipmentsByEmployee
);

router.get('/search',
    auth,
    authorize(['operator','admin']),
    validateField('searchBy'),
    validateField('query'),
    equipmentController.searchEquipment
);

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
    validateField('inventoryType'),
    equipmentController.addEquipment
);

router.patch('/:equipmentId',
    auth,
    authorize(['operator','admin']),
    setUploadFolder('equipment'),
    upload.single('image'),
    validateField('own', false),
    validateField('fixedAssetType', false),
    validateField('clasification', false),
    validateField('brand', false),
    validateField('model', false),
    validateField('state', false),
    validateField('quantity', false),
    validateField('inCharge', false),
    validateField('features', false),
    validateField('observations', false),
    validateField('equipmentId'),
    validateField('removeImage'),
    equipmentController.edithEquipment
);

router.delete('/:equipmentId',
    auth,
    authorize(['operator','admin']),
    validateField('equipmentId'),
    equipmentController.inactiveEquipment
);

module.exports = router;