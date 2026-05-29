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

router.post('/',
    auth, 
    authorize(['admin']),
    validateField('campId'),
    validateField('deparment'),
    validateField('title', false),
    validateField('firstname'),
    validateField('lastname'),
    validateField('email', false),
    validateField('password', false),
    staffController.post
);

module.exports = router;