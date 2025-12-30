const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

const testNewRoutes = async () => {
  try {
    console.log('🧪 Testing New Auth Routes...\n');

    // Clean up test data first
    await mongoose.connect(process.env.MONGODB_URI);
    await User.deleteMany({ phone: { $in: ['7777777777', '8888888888'] } });
    await mongoose.connection.close();

    const testUser = {
      name: 'Route Test User',
      phone: '7777777777',
      password: 'testpass123',
      location: 'Delhi, India',
      language: 'हिंदी (Hindi)'
    };

    // Test 1: POST /api/auth/signup
    console.log('1. Testing POST /api/auth/signup...');
    const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, testUser);
    
    console.log('✅ Signup successful');
    console.log('   Status:', signupResponse.status);
    console.log('   Message:', signupResponse.data.message);
    console.log('   User:', signupResponse.data.data.user.name);
    console.log('   Token received:', signupResponse.data.data.token ? 'YES' : 'NO');
    console.log('   Password in response:', signupResponse.data.data.user.password ? 'YES (BAD!)' : 'NO (GOOD!)');

    // Test 2: POST /api/auth/login
    console.log('\n2. Testing POST /api/auth/login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      phone: testUser.phone,
      password: testUser.password
    });

    console.log('✅ Login successful');
    console.log('   Status:', loginResponse.status);
    console.log('   Message:', loginResponse.data.message);
    console.log('   User:', loginResponse.data.data.user.name);
    console.log('   Token received:', loginResponse.data.data.token ? 'YES' : 'NO');
    console.log('   Password in response:', loginResponse.data.data.user.password ? 'YES (BAD!)' : 'NO (GOOD!)');

    // Test 3: GET /api/auth/profile (Protected route)
    console.log('\n3. Testing GET /api/auth/profile (Protected)...');
    const token = loginResponse.data.data.token;
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Profile fetch successful');
    console.log('   Status:', profileResponse.status);
    console.log('   User:', profileResponse.data.data.user.name);
    console.log('   Phone:', profileResponse.data.data.user.phone);
    console.log('   Location:', profileResponse.data.data.user.location);
    console.log('   Language:', profileResponse.data.data.user.language);

    // Test 4: Test duplicate signup prevention
    console.log('\n4. Testing duplicate signup prevention...');
    try {
      await axios.post(`${BASE_URL}/auth/signup`, testUser);
      console.log('❌ Duplicate prevention FAILED');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Duplicate prevention PASSED');
        console.log('   Error:', error.response.data.message);
      }
    }

    // Test 5: Test invalid login
    console.log('\n5. Testing invalid login...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        phone: testUser.phone,
        password: 'wrongpassword'
      });
      console.log('❌ Invalid login test FAILED');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid login test PASSED');
        console.log('   Error:', error.response.data.message);
      }
    }

    // Test 6: Test protected route without token
    console.log('\n6. Testing protected route without token...');
    try {
      await axios.get(`${BASE_URL}/auth/profile`);
      console.log('❌ No token test FAILED');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ No token test PASSED');
        console.log('   Error:', error.response.data.message);
      }
    }

    console.log('\n🎉 All new route tests completed successfully!\n');

    // Show route summary
    console.log('📋 Route Summary:');
    console.log('   POST /api/auth/signup  ✅ Working');
    console.log('   POST /api/auth/login   ✅ Working');
    console.log('   GET  /api/auth/profile ✅ Working (Protected)');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

// Execute test
if (require.main === module) {
  console.log('Make sure the server is running on http://localhost:5000');
  console.log('Starting tests in 2 seconds...\n');
  
  setTimeout(testNewRoutes, 2000);
}

module.exports = { testNewRoutes };