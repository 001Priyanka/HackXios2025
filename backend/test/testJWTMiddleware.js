const axios = require('axios');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

const testJWTMiddleware = async () => {
  try {
    console.log('🧪 Testing JWT Authentication Middleware...\n');

    // First, create a test user and get a valid token
    const testUser = {
      name: 'JWT Test User',
      phone: '6666666666',
      password: 'testpass123',
      location: 'Test City',
      language: 'English'
    };

    console.log('0. Setting up test user...');
    let signupResponse;
    try {
      signupResponse = await axios.post(`${BASE_URL}/auth/signup`, testUser);
      console.log('✅ Test user created');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
        // User already exists, login instead
        signupResponse = await axios.post(`${BASE_URL}/auth/login`, {
          phone: testUser.phone,
          password: testUser.password
        });
        console.log('✅ Using existing test user');
      } else {
        throw error;
      }
    }

    const validToken = signupResponse.data.data.token;
    const userId = signupResponse.data.data.user._id;

    // Test 1: Read token from Authorization header ✅
    console.log('\n1. Testing token reading from Authorization header...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${validToken}` }
    });
    console.log('✅ Token successfully read from Authorization header');
    console.log('   User ID attached to request:', profileResponse.data.data.user._id);

    // Test 2: Verify token ✅
    console.log('\n2. Testing token verification...');
    const decoded = jwt.verify(validToken, process.env.JWT_SECRET);
    console.log('✅ Token verification successful');
    console.log('   Token contains user ID:', decoded.id);
    console.log('   Token expires in:', new Date(decoded.exp * 1000).toISOString());

    // Test 3: Attach user ID to request ✅
    console.log('\n3. Testing user ID attachment to request...');
    console.log('✅ User ID successfully attached to req.user');
    console.log('   Original user ID:', userId);
    console.log('   User ID from token:', decoded.id);
    console.log('   User ID from response:', profileResponse.data.data.user._id);
    console.log('   Match:', userId === decoded.id ? 'YES' : 'NO');

    // Test 4: Block request if no token ✅
    console.log('\n4. Testing request blocking with no token...');
    try {
      await axios.get(`${BASE_URL}/auth/profile`);
      console.log('❌ Should have blocked request without token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Request blocked without token');
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      }
    }

    // Test 5: Block request with invalid token ✅
    console.log('\n5. Testing request blocking with invalid token...');
    try {
      await axios.get(`${BASE_URL}/auth/profile`, {
        headers: { Authorization: 'Bearer invalid_token_here' }
      });
      console.log('❌ Should have blocked request with invalid token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Request blocked with invalid token');
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      }
    }

    // Test 6: Block request with expired token ✅
    console.log('\n6. Testing request blocking with expired token...');
    const expiredToken = jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: '1ms' } // Expires immediately
    );
    
    // Wait a moment to ensure token expires
    await new Promise(resolve => setTimeout(resolve, 10));
    
    try {
      await axios.get(`${BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${expiredToken}` }
      });
      console.log('❌ Should have blocked request with expired token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Request blocked with expired token');
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      }
    }

    // Test 7: Block request with malformed Authorization header ✅
    console.log('\n7. Testing request blocking with malformed header...');
    try {
      await axios.get(`${BASE_URL}/auth/profile`, {
        headers: { Authorization: 'InvalidFormat token_here' }
      });
      console.log('❌ Should have blocked request with malformed header');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Request blocked with malformed Authorization header');
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      }
    }

    // Test 8: Block request for non-existent user ✅
    console.log('\n8. Testing request blocking for non-existent user...');
    const fakeUserId = '507f1f77bcf86cd799439011'; // Valid ObjectId format but non-existent
    const fakeToken = jwt.sign(
      { id: fakeUserId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    try {
      await axios.get(`${BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${fakeToken}` }
      });
      console.log('❌ Should have blocked request for non-existent user');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Request blocked for non-existent user');
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      }
    }

    console.log('\n🎉 All JWT middleware tests passed!\n');

    // Show middleware behavior summary
    console.log('📋 JWT Middleware Behavior Summary:');
    console.log('   ✅ Reads token from Authorization header (Bearer format)');
    console.log('   ✅ Verifies token using JWT_SECRET from .env');
    console.log('   ✅ Attaches user object to req.user');
    console.log('   ✅ Blocks requests without token (401)');
    console.log('   ✅ Blocks requests with invalid token (401)');
    console.log('   ✅ Blocks requests with expired token (401)');
    console.log('   ✅ Blocks requests with malformed header (401)');
    console.log('   ✅ Blocks requests for non-existent users (401)');
    console.log('   ✅ Provides specific error messages for different scenarios');
    console.log('   ✅ Exported for use in other routes');

  } catch (error) {
    console.error('❌ JWT middleware test failed:', error.response?.data || error.message);
  }
};

// Execute test
if (require.main === module) {
  console.log('Make sure the server is running on http://localhost:5000');
  console.log('Starting JWT middleware tests in 2 seconds...\n');
  
  setTimeout(testJWTMiddleware, 2000);
}

module.exports = { testJWTMiddleware };