const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const { checkField } = require('../validations/checkField');

router.get('/', usersController.get);
router.post('/', 
    checkField('city'),
    checkField('school_type'),
    checkField('deparment'),
    checkField('firstname'),
    checkField('lastname'),
    checkField('email'),
    checkField('password'),
    usersController.post
);

module.exports = router;