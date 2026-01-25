const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff');
const { validateField } = require('../middlewares/validateField');
const { auth } = require('../middlewares/auth');
const { authorize } = require('../middlewares/authorize');

router.get('/:campId', 
    validateField('campId'),
    auth,
    authorize(['basic','rrhh','operator','admin']), 
    staffController.getByCampId
);

router.post('/',
    auth, 
    authorize(['admin']),
    validateField('campId'),
    validateField('deparment'),
    validateField('firstname'),
    validateField('lastname'),
    validateField('email'),
    validateField('password'),
    staffController.post
);

module.exports = router;