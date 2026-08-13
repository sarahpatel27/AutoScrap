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

router.get('/', getEnquiries);
router.get('/past', getPastEnquiries);
router.post('/', createEnquiry);
router.patch('/bulk-status', updateBulkEnquiryStatus);
router.patch('/:id/status', updateEnquiryStatus);
router.delete('/bulk-delete', deleteManyEnquiries);
router.delete('/:id', deleteEnquiry);

module.exports = router;
