const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  generateAdvisory,
  getAdvisoryHistory,
  getAdvisoryById,
  getAdvisoryStats,
  deleteAdvisory,
  getAdvisoryOptions
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
 * @desc    Get farmer's advisory history with pagination
 * @access  Private (requires JWT token)
 * @query   ?limit=10&page=1
 */
router.get('/history', protect, getAdvisoryHistory);

/**
 * @route   GET /api/advisory/stats
 * @desc    Get advisory statistics for farmer
 * @access  Private (requires JWT token)
 */
router.get('/stats', protect, getAdvisoryStats);

/**
 * @route   GET /api/advisory/options
 * @desc    Get available options for advisory form (soil types, seasons, crops)
 * @access  Private (requires JWT token)
 */
router.get('/options', protect, getAdvisoryOptions);

/**
 * @route   GET /api/advisory/:id
 * @desc    Get specific advisory by ID
 * @access  Private (requires JWT token)
 */
router.get('/:id', protect, getAdvisoryById);

/**
 * @route   DELETE /api/advisory/:id
 * @desc    Delete advisory by ID
 * @access  Private (requires JWT token)
 */
router.delete('/:id', protect, deleteAdvisory);

module.exports = router;