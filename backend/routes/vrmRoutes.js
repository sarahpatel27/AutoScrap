const express = require('express');
const router = express.Router();
const { lookupVehicle } = require('../controllers/vrmController');

router.get('/', lookupVehicle);

module.exports = router;
