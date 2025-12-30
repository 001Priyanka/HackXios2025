const axios = require('axios');

const testSignupEndpoint = async () => {
  try {
    console.log('🧪 Testing Signup Endpoint Directly...\n');

    const testUser = {
      name: 'Debug Test User',
      phone: '9999999999', // New phone number
      password: 'testpass123',
      location: 'Test City, Test Village',
      language: 'English'
    };

    console.log('Sending signup request with data:', testUser);

    const response = await axios.post('http://localhost:5000/api/auth/signup', testUser, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Signup successful!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Signup failed!');
    console.error('Status:', error.response?.status);
    console.error('Error data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Error message:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔥 Backend server is not responding on port 5000');
    }
  }
};

testSignupEndpoint();