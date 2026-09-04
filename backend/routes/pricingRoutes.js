const express = require('express');
const router = express.Router();
const {
  getPricing,
  updatePricing,
  getDistrictPricing,
  updateDistrictPricing,
  deleteDistrictPricing,
} = require('../controllers/pricingController');
const { authenticateToken, optionalAuthenticateToken } = require('../middleware/authMiddleware');

router.get('/districts', optionalAuthenticateToken, getDistrictPricing);
router.post('/districts', authenticateToken, updateDistrictPricing);
router.put('/districts', authenticateToken, updateDistrictPricing);
router.delete('/districts/:district', authenticateToken, deleteDistrictPricing);

router.get('/', getPricing);
router.post('/', authenticateToken, updatePricing);

module.exports = router;
