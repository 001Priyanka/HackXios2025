const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getWeatherByQuery,
  getWeatherByLocation,
  getWeatherByCoordinates,
  testWeatherService,
  getWeatherStatus
} = require('../controllers/weatherController');

/**
 * Weather Routes
 * All routes are protected and require JWT authentication
 */

// GET /api/weather?location=cityName
// Main route as requested - protected with JWT
router.get('/', protect, getWeatherByQuery);

// POST /api/weather/location
// Alternative method for getting weather by location
router.post('/location', protect, getWeatherByLocation);

// POST /api/weather/coordinates  
// Get weather by coordinates
router.post('/coordinates', protect, getWeatherByCoordinates);

// GET /api/weather/test
// Test weather service connection - protected
router.get('/test', protect, testWeatherService);

// GET /api/weather/status
// Check weather service configuration - protected
router.get('/status', protect, getWeatherStatus);

module.exports = router;