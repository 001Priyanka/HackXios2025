const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const testSimple = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a simple user
    console.log('Creating user...');
    const user = await User.createUser({
      name: 'Test User',
      phone: '9876543210',
      password: 'password123'
    });

    console.log('User created:', user.toSafeObject());

    // Clean up
    await User.deleteOne({ _id: user._id });
    console.log('User deleted');

    await mongoose.connection.close();
    console.log('Test completed successfully!');

  } catch (error) {
    console.error('Test failed:', error);
    await mongoose.connection.close();
  }
};

testSimple();