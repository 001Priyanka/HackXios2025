const weatherService = require('../services/weatherService');

/**
 * Weather Controller
 * Handles weather-related API endpoints
 */

/**
 * Get weather data by location (city name)
 * POST /api/weather/location
 * Body: { location: "Mumbai" }
 */
const getWeatherByLocation = async (req, res) => {
  try {
    const { location } = req.body;

    // Validate input
    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location is required',
        error: 'Please provide a city name or location'
      });
    }

    if (typeof location !== 'string' || location.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid location format',
        error: 'Location must be a non-empty string'
      });
    }

    // Call weather service
    const weatherResult = await weatherService.getWeatherByLocation(location);

    // Handle service response
    if (!weatherResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Unable to get weather data',
        error: weatherResult.error,
        code: weatherResult.code
      });
    }

    // Return successful response
    res.json({
      success: true,
      message: 'Weather data retrieved successfully',
      data: {
        weather: weatherResult.data,
        location: weatherResult.location,
        country: weatherResult.country
      }
    });

  } catch (error) {
    console.error('Weather Controller Error (getWeatherByLocation):', error);
    
    // Return friendly error message without crashing server
    res.status(500).json({
      success: false,
      message: 'Weather service is temporarily unavailable',
      error: 'Please try again later or contact support if the problem persists'
    });
  }
};

/**
 * Get weather data by coordinates
 * POST /api/weather/coordinates
 * Body: { lat: 19.0760, lon: 72.8777 }
 */
const getWeatherByCoordinates = async (req, res) => {
  try {
    const { lat, lon } = req.body;

    // Validate input
    if (lat === undefined || lon === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Coordinates are required',
        error: 'Please provide both latitude and longitude'
      });
    }

    // Convert to numbers if they're strings
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates',
        error: 'Latitude and longitude must be valid numbers'
      });
    }

    // Call weather service
    const weatherResult = await weatherService.getWeatherByCoordinates(latitude, longitude);

    // Handle service response
    if (!weatherResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Unable to get weather data',
        error: weatherResult.error,
        code: weatherResult.code
      });
    }

    // Return successful response
    res.json({
      success: true,
      message: 'Weather data retrieved successfully',
      data: {
        weather: weatherResult.data,
        location: weatherResult.location,
        country: weatherResult.country,
        coordinates: { lat: latitude, lon: longitude }
      }
    });

  } catch (error) {
    console.error('Weather Controller Error (getWeatherByCoordinates):', error);
    
    // Return friendly error message without crashing server
    res.status(500).json({
      success: false,
      message: 'Weather service is temporarily unavailable',
      error: 'Please try again later or contact support if the problem persists'
    });
  }
};

/**
 * Get weather data by location (query parameter)
 * GET /api/weather?location=Mumbai
 */
const getWeatherByQuery = async (req, res) => {
  try {
    const { location } = req.query;

    // Validate input
    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location parameter is required',
        error: 'Please provide location as a query parameter: ?location=CityName'
      });
    }

    if (typeof location !== 'string' || location.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid location format',
        error: 'Location must be a non-empty string'
      });
    }

    // Call weather service
    const weatherResult = await weatherService.getWeatherByLocation(location);

    // Handle service response
    if (!weatherResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Unable to get weather data',
        error: weatherResult.error,
        code: weatherResult.code
      });
    }

    // Return successful response
    res.json({
      success: true,
      message: 'Weather data retrieved successfully',
      data: {
        weather: weatherResult.data,
        location: weatherResult.location,
        country: weatherResult.country
      }
    });

  } catch (error) {
    console.error('Weather Controller Error (getWeatherByQuery):', error);
    
    // Return friendly error message without crashing server
    res.status(500).json({
      success: false,
      message: 'Weather service is temporarily unavailable',
      error: 'Please try again later or contact support if the problem persists'
    });
  }
};

/**
 * Test weather service connection
 * GET /api/weather/test
 */
const testWeatherService = async (req, res) => {
  try {
    const testResult = await weatherService.testConnection();

    if (testResult.success) {
      res.json({
        success: true,
        message: 'Weather service is working correctly',
        data: {
          status: 'operational',
          testLocation: testResult.testData.location,
          sampleWeather: testResult.testData.data
        }
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Weather service test failed',
        error: testResult.error,
        data: {
          status: 'unavailable'
        }
      });
    }

  } catch (error) {
    console.error('Weather Controller Error (testWeatherService):', error);
    
    res.status(500).json({
      success: false,
      message: 'Unable to test weather service',
      error: 'Service test failed due to an unexpected error'
    });
  }
};

/**
 * Get weather service status and configuration
 * GET /api/weather/status
 */
const getWeatherStatus = async (req, res) => {
  try {
    const hasApiKey = !!process.env.WEATHER_API_KEY;
    
    res.json({
      success: true,
      message: 'Weather service status',
      data: {
        configured: hasApiKey,
        apiKeyPresent: hasApiKey,
        status: hasApiKey ? 'ready' : 'not configured'
      }
    });

  } catch (error) {
    console.error('Weather Controller Error (getWeatherStatus):', error);
    
    res.status(500).json({
      success: false,
      message: 'Unable to get weather service status',
      error: 'Status check failed'
    });
  }
};

module.exports = {
  getWeatherByLocation,
  getWeatherByCoordinates,
  getWeatherByQuery,
  testWeatherService,
  getWeatherStatus
};