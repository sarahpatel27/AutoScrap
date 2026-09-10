const express = require('express');
const router = express.Router();
const {
  getPublicReviews,
  getAdminReviews,
  createReview,
  updateReview,
  toggleReviewVisibility,
  deleteReview,
} = require('../controllers/reviewController');
const { authenticateToken, requireSuperAdmin } = require('../middleware/authMiddleware');

// Public route for fetching active visible reviews & header rating stats
router.get('/', getPublicReviews);

// Super Admin restricted management routes
router.get('/admin', authenticateToken, requireSuperAdmin, getAdminReviews);
router.post('/admin', authenticateToken, requireSuperAdmin, createReview);
router.put('/admin/:id', authenticateToken, requireSuperAdmin, updateReview);
router.patch('/admin/:id/visibility', authenticateToken, requireSuperAdmin, toggleReviewVisibility);
router.delete('/admin/:id', authenticateToken, requireSuperAdmin, deleteReview);

module.exports = router;
