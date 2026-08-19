const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff');
const { auth, authorize, validateField } = require('../middlewares');

router.get('/', 
    auth,
    authorize(['operator','admin']), 
    staffController.getAll
);

router.get('/:campId', 
    auth,
    authorize(['basic','rrhh','operator','admin']), 
    validateField('campId'),
    staffController.getByCampId
);

module.exports = router;