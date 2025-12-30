const AdvisoryEngine = require('../services/advisoryEngine');

// Example usage of the Advisory Engine
const demonstrateUsage = () => {
  console.log('🌾 Advisory Engine Usage Examples\n');

  const engine = new AdvisoryEngine();

  // Example 1: Complete advisory for a farmer
  console.log('Example 1: Farmer wants to grow Rice in Clay soil during Kharif season');
  const riceAdvice = engine.generateAdvice('Rice', 'Clay', 'Kharif');
  
  console.log('📋 Advisory Report:');
  console.log(`Crop: ${riceAdvice.cropAdvice.recommendation}`);
  console.log(`Fertilizer: ${riceAdvice.fertilizerAdvice.recommendation}`);
  console.log(`Irrigation: ${riceAdvice.irrigationAdvice.recommendation}`);
  console.log(`Overall Confidence: ${riceAdvice.confidenceScore}/10\n`);

  // Example 2: Crop recommendation for unknown crop
  console.log('Example 2: Farmer has Loamy soil and wants to plant in Rabi season');
  const cropRecommendation = engine.generateAdvice(null, 'Loamy', 'Rabi');
  
  console.log('🌱 Crop Recommendation:');
  console.log(`Suggestion: ${cropRecommendation.cropAdvice.recommendation}`);
  console.log(`Confidence: ${cropRecommendation.cropAdvice.confidence}/10`);
  console.log(`Reasoning: ${cropRecommendation.cropAdvice.explanation}\n`);

  // Example 3: Specific fertilizer advice
  console.log('Example 3: Farmer growing Wheat in Sandy soil during Rabi');
  const wheatFertilizer = engine.generateAdvice('Wheat', 'Sandy', 'Rabi');
  
  console.log('🌱 Fertilizer Guidance:');
  console.log(`Advice: ${wheatFertilizer.fertilizerAdvice.recommendation}`);
  console.log(`Confidence: ${wheatFertilizer.fertilizerAdvice.confidence}/10\n`);

  // Example 4: Irrigation scheduling
  console.log('Example 4: Summer irrigation for Sandy soil');
  const summerIrrigation = engine.generateAdvice('Groundnut', 'Sandy', 'Summer');
  
  console.log('💧 Irrigation Schedule:');
  console.log(`Guidance: ${summerIrrigation.irrigationAdvice.recommendation}`);
  console.log(`Confidence: ${summerIrrigation.irrigationAdvice.confidence}/10\n`);

  // Example 5: Handling unsupported combinations
  console.log('Example 5: Unsupported crop-soil-season combination');
  const unsupportedAdvice = engine.generateAdvice('Mango', 'Rocky', 'Monsoon');
  
  console.log('⚠️ Fallback Advisory:');
  console.log(`Crop: ${unsupportedAdvice.cropAdvice.recommendation}`);
  console.log(`Fertilizer: ${unsupportedAdvice.fertilizerAdvice.recommendation}`);
  console.log(`Irrigation: ${unsupportedAdvice.irrigationAdvice.recommendation}`);
  console.log(`Confidence: ${unsupportedAdvice.confidenceScore}/10\n`);

  console.log('🎯 Key Features Demonstrated:');
  console.log('✅ Rule-based recommendations');
  console.log('✅ Confidence scoring');
  console.log('✅ Explainable advice');
  console.log('✅ Fallback handling');
  console.log('✅ Structured output');
};

// How to extend the engine (example)
const extendEngine = () => {
  console.log('\n🔧 Extension Example: Adding Custom Logic\n');

  class ExtendedAdvisoryEngine extends AdvisoryEngine {
    // Override to add custom crop validation
    validateCropChoice(inputs) {
      // Custom validation logic
      if (inputs.crop.toLowerCase() === 'organic_rice') {
        return {
          recommendation: 'Organic rice requires special soil preparation and organic fertilizers.',
          confidence: 7,
          explanation: 'Custom organic farming guidance',
          ruleApplied: 'organic_validation'
        };
      }
      
      // Fall back to parent method
      return super.validateCropChoice(inputs);
    }

    // Add new method for pest advice
    getPestAdvice(inputs) {
      return {
        recommendation: 'Monitor for common pests and use integrated pest management.',
        confidence: 6,
        explanation: 'General pest management guidance',
        ruleApplied: 'pest_general'
      };
    }
  }

  const extendedEngine = new ExtendedAdvisoryEngine();
  const organicAdvice = extendedEngine.generateAdvice('organic_rice', 'Clay', 'Kharif');
  
  console.log('Extended Engine - Organic Rice Advice:');
  console.log(`Crop: ${organicAdvice.cropAdvice.recommendation}`);
  console.log(`Confidence: ${organicAdvice.cropAdvice.confidence}/10`);
  console.log(`Explanation: ${organicAdvice.cropAdvice.explanation}`);
};

// Run demonstrations
demonstrateUsage();
extendEngine();

module.exports = { demonstrateUsage, extendEngine };