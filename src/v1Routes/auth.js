const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { validateField, auth, authorize } = require('../middlewares');

router.get('/:password',
    auth,
    authorize(['admin']),
    validateField('password'),
    authController.passwordVerification
);

router.post('/',
    validateField('email'),
    validateField('password'),
    authController.login
);

router.patch('/resetPassword',
    validateField('email'),
    authController.resetPassword
);

router.patch('/changePassword/:id',
    auth,
    authorize(['basic','rrhh','operator','admin']),
    validateField('id'),
    validateField('password'),
    authController.changePassword
);


module.exports = router;