const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  name: 'Priya Sharma',
  phone: '8765432109',
  password: 'testpass123',
  location: 'Mumbai, Maharashtra',
  language: 'हिंदी (Hindi)'
};

// Test API endpoints
const testAPI = async () => {
  try {
    console.log('\n🧪 Testing CropCare API Endpoints...\n');

    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data.message);

    // Test 2: Register user
    console.log('\n2. Testing user registration...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log('✅ Registration successful:', registerResponse.data.message);
    console.log('   User:', registerResponse.data.data.user.name);
    
    const token = registerResponse.data.data.token;
    console.log('   Token received:', token ? 'YES' : 'NO');

    // Test 3: Login user
    console.log('\n3. Testing user login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      phone: testUser.phone,
      password: testUser.password
    });
    console.log('✅ Login successful:', loginResponse.data.message);
    console.log('   User:', loginResponse.data.data.user.name);

    const loginToken = loginResponse.data.data.token;

    // Test 4: Get user profile (protected route)
    console.log('\n4. Testing protected route (user profile)...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${loginToken}`
      }
    });
    console.log('✅ Profile fetch successful');
    console.log('   User profile:', profileResponse.data.data.user.name);

    // Test 5: Test invalid login
    console.log('\n5. Testing invalid login...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        phone: testUser.phone,
        password: 'wrongpassword'
      });
      console.log('❌ Invalid login test FAILED - should have thrown error');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Invalid login test PASSED - got 401 error');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 6: Test protected route without token
    console.log('\n6. Testing protected route without token...');
    try {
      await axios.get(`${BASE_URL}/auth/profile`);
      console.log('❌ No token test FAILED - should have thrown error');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ No token test PASSED - got 401 error');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 7: Test duplicate registration
    console.log('\n7. Testing duplicate registration...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, testUser);
      console.log('❌ Duplicate registration test FAILED - should have thrown error');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Duplicate registration test PASSED - got 400 error');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n🎉 All API tests completed successfully!\n');

  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
};

// Execute if run directly
if (require.main === module) {
  console.log('Make sure the server is running on http://localhost:5000');
  console.log('Run: npm run dev (in another terminal)\n');
  
  // Wait a bit for user to start server
  setTimeout(testAPI, 2000);
}

module.exports = { testAPI };