const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  generateAdvisory,
  getAdvisoryHistory
} = require('../controllers/advisoryController');

/**
 * @route   POST /api/advisory/generate
 * @desc    Generate new advisory for farmer
 * @access  Private (requires JWT token)
 * @body    { crop, soilType, season }
 */
router.post('/generate', protect, generateAdvisory);

/**
 * @route   GET /api/advisory/history
 * @desc    Get farmer's advisory history
 * @access  Private (requires JWT token)
 * @query   ?limit=10&page=1 (optional pagination)
 */
router.get('/history', protect, getAdvisoryHistory);

module.exports = router;