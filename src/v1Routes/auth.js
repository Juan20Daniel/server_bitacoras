const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { validateField } = require('../middlewares/validateField');

router.post('/', 
    validateField('email'),
    validateField('password'),
    authController.login
);

module.exports = router;