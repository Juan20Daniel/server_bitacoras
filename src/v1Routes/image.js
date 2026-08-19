const express = require('express');
const router = express.Router();
const imageController = require('../controllers/image');
const { auth, authorize, setUploadFolder } = require('../middlewares');

router.get('/:imageName', 
    // auth, 
    // authorize(['basic','rrhh','operator','admin']),
    setUploadFolder('vehicles'),
    imageController.get
);

router.get('/vehicle/:imageName', 
    // auth, 
    // authorize(['basic','rrhh','operator','admin']),
    setUploadFolder('vehicles'),
    imageController.get
);

router.get('/selfie/:imageName', 
    // auth, 
    // authorize(['basic','rrhh','operator','admin']),
    setUploadFolder('selfies'),
    imageController.get
);

router.get('/article/:imageName', 
    // auth, 
    // authorize(['basic','rrhh','operator','admin']),
    setUploadFolder('articles'),
    imageController.get
);

router.get('/equipment/:imageName', 
    // auth, 
    // authorize(['basic','rrhh','operator','admin']),
    setUploadFolder('equipment'),
    imageController.get
);

module.exports = router;