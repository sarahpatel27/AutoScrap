const express = require('express');
const router = express.Router();
const {
  getEnquiries,
  getPastEnquiries,
  createEnquiry,
  updateEnquiryStatus,
  updateBulkEnquiryStatus,
  deleteEnquiry,
  deleteManyEnquiries,
} = require('../controllers/enquiryController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public customer submission endpoint
router.post('/', createEnquiry);

// Protected admin endpoints
router.get('/', authenticateToken, getEnquiries);
router.get('/past', authenticateToken, getPastEnquiries);
router.patch('/bulk-status', authenticateToken, updateBulkEnquiryStatus);
router.patch('/:id/status', authenticateToken, updateEnquiryStatus);
router.delete('/bulk-delete', authenticateToken, deleteManyEnquiries);
router.delete('/:id', authenticateToken, deleteEnquiry);

module.exports = router;
