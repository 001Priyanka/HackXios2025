const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const User = require('../models/User');
const Advisory = require('../models/Advisory');

dotenv.config();

// Test configuration
const API_BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testUserId = '';

const testAdvisoryAPI = async () => {
  try {
    console.log('🧪 Advisory API Integration Test\n');

    // Test 1: Create test user and login
    console.log('1. Setting up test user...');
    
    // Clean up any existing test user
    await User.deleteOne({ phone: '9999999999' });
    
    // Create test user
    const signupResponse = await axios.post(`${API_BASE_URL}/auth/signup`, {
      name: 'Test Farmer',
      phone: '9999999999',
      password: 'testpass123',
      location: 'Test Village, Test District',
      language: 'English'
    });

    console.log('✅ Test user created successfully');

    // Login to get JWT token
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      phone: '9999999999',
      password: 'testpass123'
    });

    authToken = loginResponse.data.token;
    testUserId = loginResponse.data.user.id;
    console.log('✅ User logged in, JWT token obtained');

    // Test 2: Get advisory options
    console.log('\n2. Testing GET /api/advisory/options...');
    
    const optionsResponse = await axios.get(`${API_BASE_URL}/advisory/options`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ Advisory options retrieved:');
    console.log('   Soil Types:', optionsResponse.data.data.soilTypes.length);
    console.log('   Seasons:', optionsResponse.data.data.seasons.length);
    console.log('   Common Crops:', optionsResponse.data.data.commonCrops.length);

    // Test 3: Generate advisory
    console.log('\n3. Testing POST /api/advisory/generate...');
    
    const advisoryData = {
      crop: 'Rice',
      soilType: 'Clay',
      season: 'Kharif'
    };

    const generateResponse = await axios.post(`${API_BASE_URL}/advisory/generate`, advisoryData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const advisoryId = generateResponse.data.data.advisoryId;
    console.log('✅ Advisory generated successfully');
    console.log('   Advisory ID:', advisoryId);
    console.log('   Confidence Score:', generateResponse.data.data.advisory.overallConfidence);
    console.log('   Crop Advice:', generateResponse.data.data.advisory.recommendations.crop.advice.substring(0, 80) + '...');

    // Test 4: Get specific advisory by ID
    console.log('\n4. Testing GET /api/advisory/:id...');
    
    const getAdvisoryResponse = await axios.get(`${API_BASE_URL}/advisory/${advisoryId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ Advisory retrieved by ID');
    console.log('   Crop:', getAdvisoryResponse.data.data.advisory.farmerInfo.crop);
    console.log('   Soil Type:', getAdvisoryResponse.data.data.advisory.farmerInfo.soilType);
    console.log('   Season:', getAdvisoryResponse.data.data.advisory.farmerInfo.season);

    // Test 5: Generate multiple advisories for history
    console.log('\n5. Creating multiple advisories for history test...');
    
    const additionalAdvisories = [
      { crop: 'Wheat', soilType: 'Loamy', season: 'Rabi' },
      { crop: 'Cotton', soilType: 'Black', season: 'Kharif' },
      { crop: 'Groundnut', soilType: 'Sandy', season: 'Summer' }
    ];

    for (const advisory of additionalAdvisories) {
      await axios.post(`${API_BASE_URL}/advisory/generate`, advisory, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`   ✅ Created advisory for ${advisory.crop}`);
    }

    // Test 6: Get advisory history
    console.log('\n6. Testing GET /api/advisory/history...');
    
    const historyResponse = await axios.get(`${API_BASE_URL}/advisory/history?limit=5&page=1`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ Advisory history retrieved');
    console.log('   Total Advisories:', historyResponse.data.data.pagination.totalAdvisories);
    console.log('   Current Page:', historyResponse.data.data.pagination.currentPage);
    console.log('   Advisories on this page:', historyResponse.data.data.advisories.length);

    historyResponse.data.data.advisories.forEach((advisory, index) => {
      console.log(`   ${index + 1}. ${advisory.crop} (${advisory.soilType}, ${advisory.season}) - Confidence: ${advisory.confidenceScore}`);
    });

    // Test 7: Get advisory statistics
    console.log('\n7. Testing GET /api/advisory/stats...');
    
    const statsResponse = await axios.get(`${API_BASE_URL}/advisory/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ Advisory statistics retrieved');
    console.log('   Total Advisories:', statsResponse.data.data.totalAdvisories);
    console.log('   Average Confidence:', statsResponse.data.data.averageConfidence);
    console.log('   Crop Distribution:', statsResponse.data.data.cropDistribution);
    console.log('   Soil Type Distribution:', statsResponse.data.data.soilTypeDistribution);

    // Test 8: Test error handling - Invalid soil type
    console.log('\n8. Testing error handling - Invalid soil type...');
    
    try {
      await axios.post(`${API_BASE_URL}/advisory/generate`, {
        crop: 'Rice',
        soilType: 'InvalidSoil',
        season: 'Kharif'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Error handling works - Invalid soil type rejected');
        console.log('   Error message:', error.response.data.message);
      } else {
        throw error;
      }
    }

    // Test 9: Test error handling - Missing required fields
    console.log('\n9. Testing error handling - Missing required fields...');
    
    try {
      await axios.post(`${API_BASE_URL}/advisory/generate`, {
        crop: 'Rice'
        // Missing soilType and season
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Error handling works - Missing fields rejected');
        console.log('   Error message:', error.response.data.message);
      } else {
        throw error;
      }
    }

    // Test 10: Test unauthorized access
    console.log('\n10. Testing unauthorized access...');
    
    try {
      await axios.get(`${API_BASE_URL}/advisory/history`);
      // Should not reach here
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Authorization works - Unauthorized access rejected');
      } else {
        throw error;
      }
    }

    // Test 11: Delete advisory
    console.log('\n11. Testing DELETE /api/advisory/:id...');
    
    const deleteResponse = await axios.delete(`${API_BASE_URL}/advisory/${advisoryId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ Advisory deleted successfully');
    console.log('   Deleted Advisory ID:', deleteResponse.data.data.deletedAdvisoryId);

    // Verify deletion
    try {
      await axios.get(`${API_BASE_URL}/advisory/${advisoryId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Deletion verified - Advisory not found after deletion');
      } else {
        throw error;
      }
    }

    console.log('\n🎉 All Advisory API tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  } finally {
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    try {
      await Advisory.deleteMany({ farmerId: testUserId });
      await User.deleteOne({ _id: testUserId });
      console.log('✅ Test data cleaned up');
    } catch (cleanupError) {
      console.error('⚠️ Cleanup error:', cleanupError.message);
    }
  }
};

// Performance test
const performanceTest = async () => {
  try {
    console.log('\n⚡ Advisory API Performance Test\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    // Create test user
    const testUser = await User.createUser({
      name: 'Performance Test User',
      phone: '8888888888',
      password: 'testpass123',
      location: 'Test Location',
      language: 'English'
    });

    // Login
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      phone: '8888888888',
      password: 'testpass123'
    });

    const token = loginResponse.data.token;

    // Test advisory generation speed
    console.log('Testing advisory generation speed...');
    const startTime = Date.now();
    
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(
        axios.post(`${API_BASE_URL}/advisory/generate`, {
          crop: 'Rice',
          soilType: 'Clay',
          season: 'Kharif'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      );
    }

    await Promise.all(promises);
    const endTime = Date.now();
    
    console.log(`✅ Generated 10 advisories in ${endTime - startTime}ms`);
    console.log(`   Average time per advisory: ${(endTime - startTime) / 10}ms`);

    // Clean up
    await Advisory.deleteMany({ farmerId: testUser._id });
    await User.deleteOne({ _id: testUser._id });

  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

// Run tests
const runTests = async () => {
  try {
    // Connect to MongoDB for cleanup
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Run API tests
    await testAdvisoryAPI();
    
    // Run performance test
    await performanceTest();
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n📋 Test suite completed');
  }
};

// Export for use in other files
module.exports = {
  testAdvisoryAPI,
  performanceTest,
  runTests
};

// Run if called directly
if (require.main === module) {
  runTests();
}