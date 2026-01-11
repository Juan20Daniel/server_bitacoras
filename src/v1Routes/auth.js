const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { checkField } = require('../middlewares/checkField');

router.get('/', 
    checkField('email'),
    checkField('password'),
    authController.login
);

module.exports = router;