const axios = require('axios');

class WeatherService {
  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
    
    if (!this.apiKey) {
      console.warn('Weather API key not found in environment variables');
    }
  }

  /**
   * Get weather data for a specific city/location
   * @param {string} location - City name or coordinates
   * @returns {Promise<Object>} Weather data object
   */
  async getWeatherByLocation(location) {
    try {
      // Validate input
      if (!location || typeof location !== 'string') {
        throw new Error('Location is required and must be a string');
      }

      if (!this.apiKey) {
        throw new Error('Weather API key is not configured');
      }

      // Clean location input
      const cleanLocation = location.trim();
      
      // Make API request
      const response = await axios.get(this.baseUrl, {
        params: {
          q: cleanLocation,
          appid: this.apiKey,
          units: 'metric' // Get temperature in Celsius
        },
        timeout: 10000 // 10 second timeout
      });

      // Extract required data from API response
      const weatherData = this.extractWeatherData(response.data);
      
      return {
        success: true,
        data: weatherData,
        location: response.data.name,
        country: response.data.sys.country
      };

    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get weather data using coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<Object>} Weather data object
   */
  async getWeatherByCoordinates(lat, lon) {
    try {
      // Validate coordinates
      if (typeof lat !== 'number' || typeof lon !== 'number') {
        throw new Error('Latitude and longitude must be numbers');
      }

      if (lat < -90 || lat > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }

      if (lon < -180 || lon > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }

      if (!this.apiKey) {
        throw new Error('Weather API key is not configured');
      }

      // Make API request
      const response = await axios.get(this.baseUrl, {
        params: {
          lat: lat,
          lon: lon,
          appid: this.apiKey,
          units: 'metric'
        },
        timeout: 10000
      });

      // Extract required data from API response
      const weatherData = this.extractWeatherData(response.data);
      
      return {
        success: true,
        data: weatherData,
        location: response.data.name,
        country: response.data.sys.country
      };

    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Extract only required weather data from API response
   * @param {Object} apiData - Raw API response data
   * @returns {Object} Clean weather object
   */
  extractWeatherData(apiData) {
    return {
      temperature: Math.round(apiData.main.temp), // Round to nearest integer
      humidity: apiData.main.humidity,
      description: apiData.weather[0].description
    };
  }

  /**
   * Handle and format errors consistently
   * @param {Error} error - Error object
   * @returns {Object} Formatted error response
   */
  handleError(error) {
    console.error('Weather Service Error:', error.message);

    // Handle different types of errors
    if (error.response) {
      // API responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || 'Weather API error';

      switch (status) {
        case 401:
          return {
            success: false,
            error: 'Invalid API key. Please check your weather API configuration.',
            code: 'INVALID_API_KEY'
          };
        case 404:
          return {
            success: false,
            error: 'Location not found. Please check the city name and try again.',
            code: 'LOCATION_NOT_FOUND'
          };
        case 429:
          return {
            success: false,
            error: 'Too many requests. Please try again later.',
            code: 'RATE_LIMIT_EXCEEDED'
          };
        default:
          return {
            success: false,
            error: `Weather API error: ${message}`,
            code: 'API_ERROR'
          };
      }
    } else if (error.request) {
      // Network error
      return {
        success: false,
        error: 'Unable to connect to weather service. Please check your internet connection.',
        code: 'NETWORK_ERROR'
      };
    } else {
      // Other errors (validation, etc.)
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Test the weather service connection
   * @returns {Promise<Object>} Test result
   */
  async testConnection() {
    try {
      const result = await this.getWeatherByLocation('Delhi');
      return {
        success: true,
        message: 'Weather service is working correctly',
        testData: result
      };
    } catch (error) {
      return {
        success: false,
        message: 'Weather service test failed',
        error: error.message
      };
    }
  }
}

// Create and export a singleton instance
const weatherService = new WeatherService();

module.exports = weatherService;