const express = require('express');
const router = express.Router();
const imageController = require('../controllers/image');
const { auth } = require('../middlewares/auth');
const { authorize, setUploadFolder } = require('../middlewares');

router.get('/:imageName', 
    // auth, 
    // authorize(['basic','rrhh','operator','admin']),
    setUploadFolder('vehicles'),
    imageController.get
);

module.exports = router;