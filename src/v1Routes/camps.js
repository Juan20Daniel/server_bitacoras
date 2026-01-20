const express = require('express');
const router = express.Router();
const campsController = require('../controllers/camps');
const { auth } = require('../middlewares/auth');
const { authorize } = require('../middlewares/authorize');

router.get('/', auth, authorize(['basic','rrhh','operator','admin']), campsController.get);

module.exports = router;