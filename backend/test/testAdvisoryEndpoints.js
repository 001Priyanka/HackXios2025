const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Test the specific endpoints you requested
const testAdvisoryEndpoints = async () => {
  const API_BASE_URL = 'http://localhost:5000/api';
  let authToken = '';

  try {
    console.log('🧪 Testing Advisory Controller Endpoints\n');

    // Step 1: Login to get JWT token
    console.log('1. Logging in to get JWT token...');
    
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      phone: '9876543210', // Use existing test user or create one
      password: 'password123'
    });

    authToken = loginResponse.data.token;
    console.log('✅ Login successful, JWT token obtained');

    // Step 2: Test POST /api/advisory/generate
    console.log('\n2. Testing POST /api/advisory/generate...');
    
    const advisoryData = {
      crop: 'Rice',
      soilType: 'Clay',
      season: 'Kharif'
    };

    const generateResponse = await axios.post(`${API_BASE_URL}/advisory/generate`, advisoryData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ Advisory generated successfully');
    console.log('   Advisory ID:', generateResponse.data.data.advisoryId);
    console.log('   Crop Advice:', generateResponse.data.data.advisory.recommendations.crop.advice.substring(0, 80) + '...');
    console.log('   Confidence Score:', generateResponse.data.data.advisory.overallConfidence);

    // Step 3: Test GET /api/advisory/history
    console.log('\n3. Testing GET /api/advisory/history...');
    
    const historyResponse = await axios.get(`${API_BASE_URL}/advisory/history`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ Advisory history retrieved successfully');
    console.log('   Total Advisories:', historyResponse.data.data.pagination.totalAdvisories);
    console.log('   Latest Advisory:', historyResponse.data.data.advisories[0]?.crop || 'None');

    // Step 4: Test authentication protection
    console.log('\n4. Testing JWT protection...');
    
    try {
      await axios.post(`${API_BASE_URL}/advisory/generate`, advisoryData);
      console.log('❌ Authentication protection failed');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ JWT protection working - unauthorized access blocked');
      } else {
        throw error;
      }
    }

    console.log('\n🎉 All tests passed! Advisory controller is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Note: Make sure the backend server is running on port 5000');
      console.log('   Run: cd CropCare/backend && npm start');
    }
  }
};

// Run the test
if (require.main === module) {
  testAdvisoryEndpoints();
}

module.exports = testAdvisoryEndpoints;