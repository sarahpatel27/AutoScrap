const express = require('express');
const router = express.Router();
const {
  getCityOptions,
  getCities,
  createCity,
  updateCity,
  deleteCity,
} = require('../controllers/cityController');
const { authenticateToken, requireSuperAdmin } = require('../middleware/authMiddleware');

router.get('/options', getCityOptions);
router.get('/', getCities);
router.post('/', authenticateToken, requireSuperAdmin, createCity);
router.put('/:id', authenticateToken, requireSuperAdmin, updateCity);
router.delete('/:id', authenticateToken, requireSuperAdmin, deleteCity);

module.exports = router;
