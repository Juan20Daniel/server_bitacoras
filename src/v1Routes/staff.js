const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff');
const { checkField } = require('../middlewares/checkField');
const { auth } = require('../middlewares/auth');
const { authorize } = require('../middlewares/authorize');

router.get('/', auth, authorize(['basic','rrhh','operator','admin']), staffController.get);
router.post('/', 
    checkField('city'),
    checkField('school_type'),
    checkField('deparment'),
    checkField('firstname'),
    checkField('lastname'),
    checkField('email'),
    checkField('password'),
    staffController.post
);

module.exports = router;