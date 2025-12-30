const express = require('express');
const { signupUser, loginUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Signup user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', signupUser);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginUser);

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, getUserProfile);

module.exports = router;