const express = require('express');
const router = express.Router();
const { getPricing, updatePricing } = require('../controllers/pricingController');

router.get('/', getPricing);
router.post('/', updatePricing);

module.exports = router;
