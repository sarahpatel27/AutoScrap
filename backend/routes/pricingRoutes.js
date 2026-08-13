const express = require('express');
const router = express.Router();
const { getPricing, updatePricing } = require('../controllers/pricingController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', getPricing);
router.post('/', authenticateToken, updatePricing);

module.exports = router;
