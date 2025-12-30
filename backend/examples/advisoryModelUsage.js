const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Advisory = require('../models/Advisory');
const User = require('../models/User');
const AdvisoryEngine = require('../services/advisoryEngine');

dotenv.config();

const demonstrateAdvisoryModelUsage = async () => {
  try {
    console.log('🌾 Advisory Model Usage Example\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Initialize Advisory Engine
    const advisoryEngine = new AdvisoryEngine();

    // Example: Create advisory for a farmer
    console.log('\n1. Creating Advisory for Farmer...');
    
    // Find or create a test user
    let farmer = await User.findByPhone('9000000002');
    if (!farmer) {
      farmer = await User.createUser({
        name: 'Example Farmer',
        phone: '9000000002',
        password: 'password123',
        location: 'Example Village, Example District',
        language: 'English'
      });
      console.log('✅ Created test farmer:', farmer.name);
    } else {
      console.log('✅ Using existing farmer:', farmer.name);
    }

    // Generate advisory using Advisory Engine
    const farmingInputs = {
      crop: 'Rice',
      soilType: 'Clay',
      season: 'Kharif'
    };

    console.log('📋 Farmer inputs:', farmingInputs);
    
    const advisoryResult = advisoryEngine.generateAdvice(
      farmingInputs.crop,
      farmingInputs.soilType,
      farmingInputs.season
    );

    console.log('🤖 Generated advisory with confidence:', advisoryResult.confidenceScore);

    // Save advisory to database
    const advisory = new Advisory({
      farmerId: farmer._id,
      crop: farmingInputs.crop,
      soilType: farmingInputs.soilType,
      season: farmingInputs.season,
      advisoryResult: advisoryResult
    });

    const savedAdvisory = await advisory.save();
    console.log('✅ Advisory saved to database with ID:', savedAdvisory._id);

    // Example: Retrieve farmer's advisory history
    console.log('\n2. Retrieving Farmer Advisory History...');
    const farmerHistory = await Advisory.findByFarmer(farmer._id, 5);
    
    console.log(`📚 Found ${farmerHistory.length} advisories for ${farmer.name}:`);
    farmerHistory.forEach((adv, index) => {
      console.log(`   ${index + 1}. ${adv.crop} (${adv.soilType} soil, ${adv.season}) - Confidence: ${adv.advisoryResult.confidenceScore}`);
    });

    // Example: Get formatted advisory for display
    console.log('\n3. Formatted Advisory for Display...');
    const formattedAdvisory = savedAdvisory.getFormattedAdvisory();
    
    console.log('📱 Formatted for mobile app:');
    console.log('   Crop Advice:', formattedAdvisory.recommendations.crop.advice.substring(0, 80) + '...');
    console.log('   Fertilizer Advice:', formattedAdvisory.recommendations.fertilizer.advice.substring(0, 80) + '...');
    console.log('   Irrigation Advice:', formattedAdvisory.recommendations.irrigation.advice.substring(0, 80) + '...');
    console.log('   Overall Confidence:', formattedAdvisory.overallConfidence + '/10');

    // Example: Search advisories by crop
    console.log('\n4. Searching Advisories by Crop...');
    const riceAdvisories = await Advisory.findByCrop('Rice', 3);
    
    console.log(`🌾 Found ${riceAdvisories.length} Rice advisories:`);
    riceAdvisories.forEach((adv, index) => {
      console.log(`   ${index + 1}. Farmer: ${adv.farmerId.name}, Soil: ${adv.soilType}, Season: ${adv.season}`);
    });

    // Example: Get advisory statistics
    console.log('\n5. Advisory Statistics...');
    const stats = await Advisory.getStatistics();
    
    console.log('📊 Platform Statistics:');
    console.log('   Total Advisories Generated:', stats.totalAdvisories);
    console.log('   Average Confidence Score:', stats.averageConfidence + '/10');
    console.log('   Most Popular Crops:', Object.entries(stats.cropDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([crop, count]) => `${crop} (${count})`)
      .join(', '));

    // Example: Create multiple advisories for different scenarios
    console.log('\n6. Creating Multiple Advisory Scenarios...');
    
    const scenarios = [
      { crop: 'Wheat', soilType: 'Loamy', season: 'Rabi' },
      { crop: 'Cotton', soilType: 'Black', season: 'Kharif' },
      { crop: 'Groundnut', soilType: 'Sandy', season: 'Summer' }
    ];

    for (const scenario of scenarios) {
      const result = advisoryEngine.generateAdvice(scenario.crop, scenario.soilType, scenario.season);
      
      const newAdvisory = new Advisory({
        farmerId: farmer._id,
        crop: scenario.crop,
        soilType: scenario.soilType,
        season: scenario.season,
        advisoryResult: result
      });

      await newAdvisory.save();
      console.log(`   ✅ Created advisory for ${scenario.crop} (Confidence: ${result.confidenceScore})`);
    }

    // Final statistics
    console.log('\n7. Updated Statistics...');
    const finalStats = await Advisory.getStatistics();
    console.log('📈 Updated Platform Statistics:');
    console.log('   Total Advisories:', finalStats.totalAdvisories);
    console.log('   Crop Distribution:', finalStats.cropDistribution);
    console.log('   Soil Type Distribution:', finalStats.soilTypeDistribution);

    // Clean up
    console.log('\n8. Cleaning up test data...');
    await Advisory.deleteMany({ farmerId: farmer._id });
    await User.deleteOne({ _id: farmer._id });
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 Advisory Model usage demonstration completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Integration example for API routes
const createAdvisoryForAPI = async (farmerId, crop, soilType, season) => {
  try {
    // Generate advisory using engine
    const advisoryEngine = new AdvisoryEngine();
    const advisoryResult = advisoryEngine.generateAdvice(crop, soilType, season);

    // Save to database
    const advisory = new Advisory({
      farmerId,
      crop,
      soilType,
      season,
      advisoryResult
    });

    const savedAdvisory = await advisory.save();
    
    // Return formatted result for API response
    return {
      success: true,
      advisoryId: savedAdvisory._id,
      advisory: savedAdvisory.getFormattedAdvisory()
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Run demonstration
if (require.main === module) {
  demonstrateAdvisoryModelUsage();
}

module.exports = {
  demonstrateAdvisoryModelUsage,
  createAdvisoryForAPI
};