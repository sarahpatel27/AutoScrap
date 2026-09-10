const express = require('express');
const router = express.Router();
const {
  login,
  getCurrentUser,
  getUsers,
  createUser,
  updateDealerCoverage,
  deleteUser,
  changePassword,
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/me', authenticateToken, getCurrentUser);
router.post('/change-password', authenticateToken, changePassword);
router.get('/users', authenticateToken, getUsers);
router.post('/users', authenticateToken, createUser);
router.put('/users/:id/coverage', authenticateToken, updateDealerCoverage);
router.put('/users/:id', authenticateToken, updateDealerCoverage);
router.delete('/users/:id', authenticateToken, deleteUser);

module.exports = router;
