const express = require('express');
const router = express.Router();
const {
  submitContactMessage,
  getContactSubmissions,
  deleteContactSubmission,
} = require('../controllers/contactController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public route to submit contact form
router.post('/submit', submitContactMessage);

// Protected routes (Super Admin only)
router.get('/', authenticateToken, getContactSubmissions);
router.delete('/:id', authenticateToken, deleteContactSubmission);

module.exports = router;
