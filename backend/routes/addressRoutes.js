const express = require('express');
const router = express.Router();
const { lookupAddress } = require('../controllers/addressController');

router.get('/', lookupAddress);

module.exports = router;
