/**
 * Weather Service Usage Examples
 * 
 * This file demonstrates how to use the weatherService in your controllers
 */

const weatherService = require('../services/weatherService');

// Example 1: Get weather by city name
async function getWeatherByCity() {
  console.log('=== Getting Weather by City ===');
  
  const result = await weatherService.getWeatherByLocation('Mumbai');
  
  if (result.success) {
    console.log('Weather Data:', result.data);
    console.log('Location:', result.location, result.country);
  } else {
    console.error('Error:', result.error);
  }
}

// Example 2: Get weather by coordinates
async function getWeatherByCoords() {
  console.log('\n=== Getting Weather by Coordinates ===');
  
  // Mumbai coordinates
  const result = await weatherService.getWeatherByCoordinates(19.0760, 72.8777);
  
  if (result.success) {
    console.log('Weather Data:', result.data);
    console.log('Location:', result.location, result.country);
  } else {
    console.error('Error:', result.error);
  }
}

// Example 3: Test connection
async function testWeatherService() {
  console.log('\n=== Testing Weather Service ===');
  
  const testResult = await weatherService.testConnection();
  
  if (testResult.success) {
    console.log('✅ Weather service is working');
    console.log('Test data:', testResult.testData.data);
  } else {
    console.log('❌ Weather service test failed');
    console.error('Error:', testResult.error);
  }
}

// Example 4: How to use in a controller
async function exampleControllerUsage(req, res) {
  try {
    const { location } = req.body;
    
    // Get weather data
    const weatherResult = await weatherService.getWeatherByLocation(location);
    
    if (!weatherResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to get weather data',
        error: weatherResult.error
      });
    }
    
    // Use weather data in your application logic
    const { temperature, humidity, description } = weatherResult.data;
    
    res.json({
      success: true,
      weather: {
        temperature,
        humidity,
        description,
        location: weatherResult.location
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// Run examples (uncomment to test)
// Note: You need to set WEATHER_API_KEY in your .env file first
async function runExamples() {
  console.log('Weather Service Examples');
  console.log('========================');
  console.log('Note: Make sure to set WEATHER_API_KEY in your .env file');
  console.log('Get your free API key from: https://openweathermap.org/api\n');
  
  // Uncomment these lines to test (after setting up API key):
  // await getWeatherByCity();
  // await getWeatherByCoords();
  // await testWeatherService();
}

// Export for use in other files
module.exports = {
  getWeatherByCity,
  getWeatherByCoords,
  testWeatherService,
  exampleControllerUsage
};

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples();
}