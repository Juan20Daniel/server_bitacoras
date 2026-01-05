const express = require('express');
const router = express.Router();
const usersController = require('../controllers/checkOut');

router.get('/', usersController.get);

module.exports = router;