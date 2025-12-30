const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for testing');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// Test User Model
const testUserModel = async () => {
  try {
    console.log('\n🧪 Testing User Model...\n');

    // Test 1: Create a new user
    console.log('1. Creating a new user...');
    const testUser = await User.createUser({
      name: 'Rajesh Kumar',
      phone: '9876543210',
      password: 'password123',
      location: 'Pune, Maharashtra',
      language: 'मराठी (Marathi)'
    });
    console.log('✅ User created successfully:', testUser.toSafeObject());

    // Test 2: Find user by phone
    console.log('\n2. Finding user by phone...');
    const foundUser = await User.findByPhone('9876543210');
    console.log('✅ User found:', foundUser ? foundUser.toSafeObject() : 'Not found');

    // Test 3: Test password matching
    console.log('\n3. Testing password matching...');
    const userWithPassword = await User.findByPhoneWithPassword('9876543210');
    const isMatch = await userWithPassword.matchPassword('password123');
    console.log('✅ Password match test:', isMatch ? 'PASSED' : 'FAILED');

    // Test 4: Test invalid password
    console.log('\n4. Testing invalid password...');
    const isInvalidMatch = await userWithPassword.matchPassword('wrongpassword');
    console.log('✅ Invalid password test:', !isInvalidMatch ? 'PASSED' : 'FAILED');

    // Test 5: Test validation (invalid phone)
    console.log('\n5. Testing validation with invalid phone...');
    try {
      const invalidUser = await User.createUser({
        name: 'Test User',
        phone: '123', // Invalid phone
        password: 'password123'
      });
      console.log('❌ Validation test FAILED - should have thrown error');
    } catch (error) {
      console.log('✅ Validation test PASSED - caught error:', error.message);
    }

    // Test 6: Test duplicate phone
    console.log('\n6. Testing duplicate phone number...');
    try {
      const duplicateUser = await User.createUser({
        name: 'Another User',
        phone: '9876543210', // Same phone as first user
        password: 'password123'
      });
      console.log('❌ Duplicate test FAILED - should have thrown error');
    } catch (error) {
      console.log('✅ Duplicate test PASSED - caught error:', error.message);
    }

    // Clean up - remove test user
    console.log('\n7. Cleaning up test data...');
    await User.deleteOne({ phone: '9876543210' });
    console.log('✅ Test user removed');

    console.log('\n🎉 All User Model tests completed successfully!\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run tests
const runTests = async () => {
  await connectDB();
  await testUserModel();
};

// Execute if run directly
if (require.main === module) {
  runTests();
}

module.exports = { testUserModel };