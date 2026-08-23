const express = require('express');
const router = express.Router();
const {
  getCustomerAudience,
  previewPromotionalCampaign,
  sendPromotionalCampaign,
} = require('../controllers/promotionController');
const { authenticateToken, requireSuperAdmin } = require('../middleware/authMiddleware');

// Super Admin Only Promotional Routes
router.get('/customers', authenticateToken, requireSuperAdmin, getCustomerAudience);
router.post('/preview', authenticateToken, requireSuperAdmin, previewPromotionalCampaign);
router.post('/send', authenticateToken, requireSuperAdmin, sendPromotionalCampaign);

module.exports = router;
