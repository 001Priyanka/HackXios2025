const axios = require('axios');

const debugValidation = async () => {
  try {
    console.log('🔍 Testing different signup scenarios to identify validation issues...\n');

    const baseURL = 'http://localhost:5000/api/auth/signup';

    // Test 1: Valid data
    console.log('1. Testing with valid data...');
    const validData = {
      name: 'Valid User',
      phone: '9876543210',
      password: 'password123',
      location: 'Mumbai, Maharashtra',
      language: 'English'
    };

    try {
      const response = await axios.post(baseURL, validData);
      console.log('✅ Valid data test passed');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
        console.log('✅ Valid data test passed (user already exists)');
      } else {
        console.log('❌ Valid data test failed:', error.response?.data);
      }
    }

    // Test 2: Missing name
    console.log('\n2. Testing with missing name...');
    try {
      await axios.post(baseURL, {
        phone: '9876543211',
        password: 'password123',
        location: 'Mumbai, Maharashtra',
        language: 'English'
      });
      console.log('❌ Should have failed validation');
    } catch (error) {
      console.log('✅ Correctly failed:', error.response?.data);
    }

    // Test 3: Invalid phone format
    console.log('\n3. Testing with invalid phone format...');
    try {
      await axios.post(baseURL, {
        name: 'Test User',
        phone: '123', // Invalid format
        password: 'password123',
        location: 'Mumbai, Maharashtra',
        language: 'English'
      });
      console.log('❌ Should have failed validation');
    } catch (error) {
      console.log('✅ Correctly failed:', error.response?.data);
    }

    // Test 4: Short password
    console.log('\n4. Testing with short password...');
    try {
      await axios.post(baseURL, {
        name: 'Test User',
        phone: '9876543212',
        password: '123', // Too short
        location: 'Mumbai, Maharashtra',
        language: 'English'
      });
      console.log('❌ Should have failed validation');
    } catch (error) {
      console.log('✅ Correctly failed:', error.response?.data);
    }

    // Test 5: Invalid language
    console.log('\n5. Testing with invalid language...');
    try {
      await axios.post(baseURL, {
        name: 'Test User',
        phone: '9876543213',
        password: 'password123',
        location: 'Mumbai, Maharashtra',
        language: 'InvalidLanguage'
      });
      console.log('❌ Should have failed validation');
    } catch (error) {
      console.log('✅ Correctly failed:', error.response?.data);
    }

    // Test 6: Empty strings
    console.log('\n6. Testing with empty strings...');
    try {
      await axios.post(baseURL, {
        name: '',
        phone: '',
        password: '',
        location: '',
        language: ''
      });
      console.log('❌ Should have failed validation');
    } catch (error) {
      console.log('✅ Correctly failed:', error.response?.data);
    }

    // Test 7: What frontend might be sending
    console.log('\n7. Testing typical frontend data...');
    const frontendData = {
      name: 'Frontend User',
      phone: '8765432109',
      password: 'frontend123',
      location: 'Delhi, New Delhi',
      language: 'हिंदी (Hindi)'
    };

    try {
      const response = await axios.post(baseURL, frontendData);
      console.log('✅ Frontend-style data test passed');
    } catch (error) {
      console.log('❌ Frontend-style data failed:', error.response?.data);
      console.log('Full error:', error.response?.data?.errors);
    }

  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
  }
};

debugValidation();