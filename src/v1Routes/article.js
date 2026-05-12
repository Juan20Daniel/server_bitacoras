const express = require('express');
const router = express.Router();
const articleController = require('../controllers/article');
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
    articleController.articlesByDepartment
);

// router.get('/by-employee/:employeeId',
//     auth,
//     authorize(['operator','admin']),
//     validateField('employeeId'),
//     articleController.equipmentsByEmployee
// );

router.post('/', 
    auth,
    authorize(['operator','admin']),
    setUploadFolder('articles'),
    upload.single('image'),
    validateField('articleName'),
    validateField('quantity'),
    validateField('unit'),
    validateField('observations', false),
    validateField('bill'),
    validateField('departmentId'),
    articleController.addArticle
);


// router.patch('/:equipmentId', 
//     auth,
//     authorize(['operator','admin']),
//     setUploadFolder('equipment'),
//     upload.single('image'),
//     validateField('own', false),
//     validateField('fixedAssetType', false),
//     validateField('clasification', false),
//     validateField('brand', false),
//     validateField('model', false),
//     validateField('state', false),
//     validateField('quantity', false),
//     validateField('inCharge', false),
//     validateField('features', false),
//     validateField('observations', false),
//     validateField('equipmentId'),
//     validateField('removeImage'),
//     articleController.edithEquipment
// );

router.delete('/:articleId',
    auth,
    authorize(['operator','admin']),
    validateField('articleId'),
    articleController.inactiveArticle
);

module.exports = router;