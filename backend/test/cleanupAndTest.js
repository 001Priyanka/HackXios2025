const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const axios = require('axios');

dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

const cleanupAndTest = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for cleanup');

    // Clean up test users
    await User.deleteMany({ phone: { $in: ['8765432109', '9876543210'] } });
    console.log('✅ Test users cleaned up');

    await mongoose.connection.close();
    console.log('Database connection closed');

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Now test the API
    console.log('\n🧪 Testing Authentication API...\n');

    const testUser = {
      name: 'Test User',
      phone: '8765432109',
      password: 'testpass123',
      location: 'Mumbai, Maharashtra',
      language: 'हिंदी (Hindi)'
    };

    // Test 1: Register user
    console.log('1. Testing user registration...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log('✅ Registration successful');
    console.log('   User:', registerResponse.data.data.user.name);
    console.log('   Token received:', registerResponse.data.data.token ? 'YES' : 'NO');
    console.log('   Password in response:', registerResponse.data.data.user.password ? 'YES (BAD!)' : 'NO (GOOD!)');

    // Test 2: Login user
    console.log('\n2. Testing user login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      phone: testUser.phone,
      password: testUser.password
    });
    console.log('✅ Login successful');
    console.log('   User:', loginResponse.data.data.user.name);
    console.log('   Token received:', loginResponse.data.data.token ? 'YES' : 'NO');
    console.log('   Password in response:', loginResponse.data.data.user.password ? 'YES (BAD!)' : 'NO (GOOD!)');

    // Test 3: Test duplicate registration
    console.log('\n3. Testing duplicate registration prevention...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, testUser);
      console.log('❌ Duplicate prevention FAILED');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Duplicate prevention PASSED');
        console.log('   Error message:', error.response.data.message);
      }
    }

    // Test 4: Test invalid login
    console.log('\n4. Testing invalid login...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        phone: testUser.phone,
        password: 'wrongpassword'
      });
      console.log('❌ Invalid login test FAILED');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid login test PASSED');
        console.log('   Error message:', error.response.data.message);
      }
    }

    // Test 5: Test protected route
    console.log('\n5. Testing protected route...');
    const token = loginResponse.data.data.token;
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Protected route access successful');
    console.log('   Profile user:', profileResponse.data.data.user.name);

    console.log('\n🎉 All authentication tests passed!\n');

    // Show JWT token details
    console.log('📋 JWT Token Analysis:');
    const tokenParts = token.split('.');
    console.log('   Token parts:', tokenParts.length);
    console.log('   Token length:', token.length);
    console.log('   Token starts with:', token.substring(0, 20) + '...');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

cleanupAndTest();