const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Advisory = require('../models/Advisory');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const testAdvisoryModel = async () => {
  try {
    console.log('🧪 Testing Advisory Model...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test 1: Create a test user first
    console.log('\n1. Creating test user...');
    let testUser;
    try {
      testUser = await User.createUser({
        name: 'Advisory Test Farmer',
        phone: '9000000001',
        password: 'testpass123',
        location: 'Test Village, Test District',
        language: 'English'
      });
      console.log('✅ Test user created:', testUser.name);
    } catch (error) {
      if (error.code === 11000) {
        // User already exists, find them
        testUser = await User.findByPhone('9000000001');
        console.log('✅ Using existing test user:', testUser.name);
      } else {
        throw error;
      }
    }

    // Test 2: Create advisory with valid data
    console.log('\n2. Creating advisory with valid data...');
    const validAdvisory = new Advisory({
      farmerId: testUser._id,
      crop: 'Rice',
      soilType: 'Clay',
      season: 'Kharif',
      advisoryResult: {
        cropAdvice: {
          recommendation: 'Rice is suitable for clay soil during Kharif season.',
          confidence: 9,
          explanation: 'Clay soil retains water well for rice cultivation.',
          ruleApplied: 'cs002'
        },
        fertilizerAdvice: {
          recommendation: 'Use DAP at 100 kg/ha before transplanting.',
          confidence: 8,
          explanation: 'Clay soil retains nutrients well.',
          ruleApplied: 'fa002'
        },
        irrigationAdvice: {
          recommendation: 'Maintain 2-5cm standing water throughout season.',
          confidence: 10,
          explanation: 'Rice requires standing water for optimal growth.',
          ruleApplied: 'ia002'
        },
        confidenceScore: 9.0
      }
    });

    const savedAdvisory = await validAdvisory.save();
    console.log('✅ Advisory created successfully');
    console.log('   Advisory ID:', savedAdvisory._id);
    console.log('   Farmer ID:', savedAdvisory.farmerId);
    console.log('   Crop:', savedAdvisory.crop);
    console.log('   Overall Confidence:', savedAdvisory.advisoryResult.confidenceScore);

    // Test 3: Test virtual field
    console.log('\n3. Testing virtual field...');
    const summary = savedAdvisory.summary;
    console.log('✅ Advisory summary:', {
      id: summary.id,
      crop: summary.crop,
      soilType: summary.soilType,
      season: summary.season,
      overallConfidence: summary.overallConfidence
    });

    // Test 4: Test instance method
    console.log('\n4. Testing instance method...');
    const formattedAdvisory = savedAdvisory.getFormattedAdvisory();
    console.log('✅ Formatted advisory structure:');
    console.log('   Farmer Info:', formattedAdvisory.farmerInfo);
    console.log('   Crop Advice Confidence:', formattedAdvisory.recommendations.crop.confidence);
    console.log('   Overall Confidence:', formattedAdvisory.overallConfidence);

    // Test 5: Test static method - find by farmer
    console.log('\n5. Testing findByFarmer static method...');
    const farmerAdvisories = await Advisory.findByFarmer(testUser._id);
    console.log('✅ Found', farmerAdvisories.length, 'advisories for farmer');
    if (farmerAdvisories.length > 0) {
      console.log('   Latest advisory crop:', farmerAdvisories[0].crop);
      console.log('   Farmer name:', farmerAdvisories[0].farmerId.name);
    }

    // Test 6: Create another advisory for testing
    console.log('\n6. Creating second advisory...');
    const secondAdvisory = new Advisory({
      farmerId: testUser._id,
      crop: 'Wheat',
      soilType: 'Loamy',
      season: 'Rabi',
      advisoryResult: {
        cropAdvice: {
          recommendation: 'Wheat is highly suitable for loamy soil.',
          confidence: 9,
          explanation: 'Loamy soil provides excellent drainage.',
          ruleApplied: 'cs001'
        },
        fertilizerAdvice: {
          recommendation: 'Apply NPK fertilizer at sowing.',
          confidence: 8,
          explanation: 'Balanced nutrition for wheat growth.',
          ruleApplied: 'fa005'
        },
        irrigationAdvice: {
          recommendation: 'Irrigate every 15-20 days.',
          confidence: 9,
          explanation: 'Wheat needs moderate irrigation.',
          ruleApplied: 'ia003'
        },
        confidenceScore: 8.7
      }
    });

    await secondAdvisory.save();
    console.log('✅ Second advisory created for Wheat');

    // Test 7: Test findByCrop static method
    console.log('\n7. Testing findByCrop static method...');
    const riceAdvisories = await Advisory.findByCrop('Rice');
    console.log('✅ Found', riceAdvisories.length, 'Rice advisories');

    // Test 8: Test statistics method
    console.log('\n8. Testing getStatistics static method...');
    const stats = await Advisory.getStatistics();
    console.log('✅ Advisory statistics:');
    console.log('   Total advisories:', stats.totalAdvisories);
    console.log('   Average confidence:', stats.averageConfidence);
    console.log('   Crop distribution:', stats.cropDistribution);
    console.log('   Soil type distribution:', stats.soilTypeDistribution);
    console.log('   Season distribution:', stats.seasonDistribution);

    // Test 9: Test validation errors
    console.log('\n9. Testing validation errors...');
    try {
      const invalidAdvisory = new Advisory({
        farmerId: testUser._id,
        crop: '', // Empty crop should fail
        soilType: 'InvalidSoil', // Invalid soil type
        season: 'Kharif',
        advisoryResult: {
          cropAdvice: {
            recommendation: 'Test',
            confidence: 15, // Invalid confidence (>10)
            explanation: 'Test',
            ruleApplied: 'test'
          },
          fertilizerAdvice: {
            recommendation: 'Test',
            confidence: 8,
            explanation: 'Test',
            ruleApplied: 'test'
          },
          irrigationAdvice: {
            recommendation: 'Test',
            confidence: 8,
            explanation: 'Test',
            ruleApplied: 'test'
          },
          confidenceScore: 8
        }
      });

      await invalidAdvisory.save();
      console.log('❌ Validation should have failed');
    } catch (error) {
      console.log('✅ Validation correctly failed:', error.message);
    }

    // Clean up test data
    console.log('\n10. Cleaning up test data...');
    await Advisory.deleteMany({ farmerId: testUser._id });
    await User.deleteOne({ _id: testUser._id });
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All Advisory Model tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run tests
testAdvisoryModel();