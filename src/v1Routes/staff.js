const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff');
const { validateField } = require('../middlewares/validateField');
const { auth } = require('../middlewares/auth');
const { authorize } = require('../middlewares/authorize');

router.get('/:idCamp', 
    validateField('idCamp'),
    auth,
    authorize(['basic','rrhh','operator','admin']), 
    staffController.getByIdCamp
);

router.post('/',
    auth, 
    authorize(['admin']),
    validateField('idCamp'),
    validateField('deparment'),
    validateField('firstname'),
    validateField('lastname'),
    validateField('email'),
    validateField('password'),
    staffController.post
);

module.exports = router;