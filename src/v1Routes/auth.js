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

module.exports = router;