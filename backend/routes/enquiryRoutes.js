const express = require('express');
const router = express.Router();
const {
  getEnquiries,
  getHighValueEnquiries,
  getPastEnquiries,
  createEnquiry,
  placeDealerBid,
  selectWinningDealer,
  markEnquiryPurchased,
  updateEnquiryStatus,
  updateBulkEnquiryStatus,
  deleteEnquiry,
  deleteManyEnquiries,
  deleteHighValueEnquiry,
  deleteManyHighValueEnquiries,
} = require('../controllers/enquiryController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { handleOptionalPhotoUpload } = require('../middleware/uploadMiddleware');

// Public customer submission endpoint (handles both standard JSON & multipart photo uploads)
router.post('/', handleOptionalPhotoUpload, createEnquiry);

// Protected admin & dealer endpoints
router.get('/', authenticateToken, getEnquiries);
router.get('/high-value', authenticateToken, getHighValueEnquiries);
router.post('/high-value/bid', authenticateToken, placeDealerBid);
router.post('/high-value/select-winner', authenticateToken, selectWinningDealer);
router.post('/high-value/purchase', authenticateToken, markEnquiryPurchased);
router.delete('/high-value/bulk-delete', authenticateToken, deleteManyHighValueEnquiries);
router.delete('/high-value/:id', authenticateToken, deleteHighValueEnquiry);
router.get('/past', authenticateToken, getPastEnquiries);
router.patch('/bulk-status', authenticateToken, updateBulkEnquiryStatus);
router.patch('/:id/status', authenticateToken, updateEnquiryStatus);
router.delete('/bulk-delete', authenticateToken, deleteManyEnquiries);
router.delete('/:id', authenticateToken, deleteEnquiry);

module.exports = router;
