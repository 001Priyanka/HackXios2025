const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Signup user
// @route   POST /api/auth/signup
// @access  Public
const signupUser = async (req, res) => {
  try {
    const { name, phone, password, location, language } = req.body;

    // Log received data for debugging
    console.log('Signup request received:', {
      name: name,
      phone: phone,
      password: password ? '[HIDDEN]' : undefined,
      location: location,
      language: language,
      bodyKeys: Object.keys(req.body)
    });

    // Validation
    if (!name || !phone || !password) {
      console.log('Basic validation failed:', { name: !!name, phone: !!phone, password: !!password });
      return res.status(400).json({
        status: 'error',
        message: 'Please provide name, phone, and password'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByPhone(phone);
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this phone number already exists'
      });
    }

    // Create user with hashed password
    const user = await User.createUser({
      name,
      phone,
      password,
      location,
      language
    });

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      message: 'User signed up successfully',
      data: {
        user: user.toSafeObject(), // Returns user without password
        token
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.log('Validation error details:', {
        errorName: error.name,
        errors: error.errors,
        messages: messages,
        receivedData: { name, phone, password, location, language }
      });
      
      return res.status(400).json({
        status: 'error',
        message: 'User validation failed',
        errors: messages,
        details: Object.keys(error.errors).map(field => ({
          field,
          message: error.errors[field].message,
          value: error.errors[field].value
        }))
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Phone number already exists'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Server error during signup'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Validation
    if (!phone || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide phone and password'
      });
    }

    // Check if user exists and get password field
    const user = await User.findByPhoneWithPassword(phone);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid phone number or password'
      });
    }

    // Verify password using bcrypt
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid phone number or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: user.toSafeObject(), // Returns user without password
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: user.toSafeObject()
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error fetching profile'
    });
  }
};

module.exports = {
  signupUser,
  loginUser,
  getUserProfile
};