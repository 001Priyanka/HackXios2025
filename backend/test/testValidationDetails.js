const axios = require('axios');

const testValidationDetails = async () => {
  try {
    console.log('🔍 Testing validation with detailed logging...\n');

    // Test with potentially problematic data
    const testData = {
      name: 'Validation Test User',
      phone: '6000000001', // New phone number
      password: 'testpass123',
      location: 'Test City, Test Village',
      language: 'English'
    };

    console.log('Sending data:', testData);

    const response = await axios.post('http://localhost:5000/api/auth/signup', testData);
    console.log('✅ Success:', response.data);

  } catch (error) {
    console.log('❌ Error occurred:');
    console.log('Status:', error.response?.status);
    console.log('Response data:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.data?.details) {
      console.log('\nDetailed validation errors:');
      error.response.data.details.forEach((detail, index) => {
        console.log(`${index + 1}. Field: ${detail.field}`);
        console.log(`   Message: ${detail.message}`);
        console.log(`   Value: ${detail.value}`);
      });
    }
  }
};

testValidationDetails();