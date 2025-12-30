const AdvisoryEngine = require('../services/advisoryEngine');

const testAdvisoryEngine = () => {
  console.log('🌾 Testing Advisory Engine...\n');

  const engine = new AdvisoryEngine();

  // Test 1: Get available options
  console.log('1. Available Options:');
  const options = engine.getAvailableOptions();
  console.log('Soil Types:', options.soilTypes);
  console.log('Seasons:', options.seasons);
  console.log('Crops:', options.crops);
  console.log();

  // Test 2: Crop suitability for loamy soil in Rabi season
  console.log('2. Crop Suitability - Loamy Soil + Rabi Season:');
  const cropSuitability = engine.getCropSuitability('Loamy', 'Rabi');
  cropSuitability.forEach(rule => {
    console.log(`   ✅ ${rule.recommendation} (Confidence: ${rule.confidence}/10)`);
  });
  console.log();

  // Test 3: Fertilizer advice for wheat in sandy soil
  console.log('3. Fertilizer Advice - Wheat in Sandy Soil:');
  const fertilizerAdvice = engine.getFertilizerAdvice('Sandy', 'Rabi', 'Wheat');
  fertilizerAdvice.forEach(rule => {
    console.log(`   🌱 ${rule.recommendation} (Confidence: ${rule.confidence}/10)`);
  });
  console.log();

  // Test 4: Irrigation advice for summer season
  console.log('4. Irrigation Advice - Sandy Soil + Summer:');
  const irrigationAdvice = engine.getIrrigationAdvice('Sandy', 'Summer', 'any');
  irrigationAdvice.forEach(rule => {
    console.log(`   💧 ${rule.recommendation} (Confidence: ${rule.confidence}/10)`);
  });
  console.log();

  // Test 5: Comprehensive advice
  console.log('5. Comprehensive Advice - Clay Soil + Kharif + Rice:');
  const comprehensiveAdvice = engine.getComprehensiveAdvice('Clay', 'Kharif', 'Rice');
  
  if (comprehensiveAdvice.recommendations.fertilizerAdvice?.length) {
    console.log('   Fertilizer Recommendations:');
    comprehensiveAdvice.recommendations.fertilizerAdvice.forEach(rule => {
      console.log(`   🌱 ${rule.recommendation} (Confidence: ${rule.confidence}/10)`);
    });
  }
  
  if (comprehensiveAdvice.recommendations.irrigationAdvice?.length) {
    console.log('   Irrigation Recommendations:');
    comprehensiveAdvice.recommendations.irrigationAdvice.forEach(rule => {
      console.log(`   💧 ${rule.recommendation} (Confidence: ${rule.confidence}/10)`);
    });
  }
  console.log();

  // Test 6: Fallback advice for unknown crop
  console.log('6. Fallback Advice - Red Soil + Summer + Unknown Crop:');
  const fallbackAdvice = engine.getComprehensiveAdvice('Red', 'Summer', 'unknown');
  
  if (fallbackAdvice.recommendations.cropSuitability?.length) {
    console.log('   Crop Suitability:');
    fallbackAdvice.recommendations.cropSuitability.forEach(rule => {
      console.log(`   🌾 ${rule.recommendation} (Confidence: ${rule.confidence}/10)`);
    });
  }
  
  if (fallbackAdvice.recommendations.irrigationAdvice?.length) {
    console.log('   Irrigation Advice:');
    fallbackAdvice.recommendations.irrigationAdvice.forEach(rule => {
      console.log(`   💧 ${rule.recommendation} (Confidence: ${rule.confidence}/10)`);
    });
  }
  console.log();

  // Test 7: Rule statistics
  console.log('7. Rule Statistics:');
  const stats = engine.getRuleStatistics();
  console.log(`   Total Rules: ${stats.totalRules}`);
  console.log(`   Crop Suitability Rules: ${stats.cropSuitabilityRules}`);
  console.log(`   Fertilizer Advice Rules: ${stats.fertilizerAdviceRules}`);
  console.log(`   Irrigation Advice Rules: ${stats.irrigationAdviceRules}`);
  console.log(`   Version: ${stats.version}`);
  console.log(`   Last Updated: ${stats.lastUpdated}`);
  console.log();

  console.log('🎉 Advisory Engine testing completed!');
};

// Run tests
testAdvisoryEngine();