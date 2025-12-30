const fs = require('fs');
const path = require('path');

class AdvisoryEngine {
  constructor() {
    this.rules = null;
    this.loadRules();
  }

  /**
   * Read advisoryRules.json
   */
  loadRules() {
    try {
      const rulesPath = path.join(__dirname, '../../advisoryRules.json');
      const rulesData = fs.readFileSync(rulesPath, 'utf8');
      this.rules = JSON.parse(rulesData);
      console.log(`Advisory Engine: Loaded ${this.rules.metadata.totalRules} rules`);
    } catch (error) {
      console.error('Advisory Engine: Error loading rules:', error.message);
      this.rules = { cropSuitability: [], fertilizerAdvice: [], irrigationAdvice: [] };
    }
  }

  /**
   * Accept input: crop, soilType, season
   * Generate structured advisory object
   */
  generateAdvice(crop, soilType, season) {
    // Normalize inputs
    const inputs = {
      crop: crop ? crop.trim() : null,
      soilType: soilType ? soilType.trim() : '',
      season: season ? season.trim() : ''
    };

    // Generate advice for each category
    const cropAdvice = this.getCropRecommendation(inputs);
    const fertilizerAdvice = this.getFertilizerAdvice(inputs);
    const irrigationAdvice = this.getIrrigationAdvice(inputs);

    // Calculate overall confidence score
    const confidenceScore = this.calculateConfidence([cropAdvice, fertilizerAdvice, irrigationAdvice]);

    // Return structured advisory object
    return {
      cropAdvice,
      fertilizerAdvice,
      irrigationAdvice,
      confidenceScore
    };
  }

  /**
   * Generate crop recommendation
   */
  getCropRecommendation(inputs) {
    // If crop is already specified, validate it
    if (inputs.crop && inputs.crop.toLowerCase() !== 'unknown') {
      return this.validateCropChoice(inputs);
    }

    // Find crop suitability rules
    const matchingRules = this.findRules('cropSuitability', inputs.soilType, inputs.season, null);

    if (matchingRules.length > 0) {
      const bestRule = matchingRules[0];
      return {
        recommendation: bestRule.recommendation,
        confidence: bestRule.confidence,
        explanation: `Based on ${inputs.soilType} soil and ${inputs.season} season analysis`,
        ruleApplied: bestRule.id
      };
    }

    // Fallback recommendation
    return this.getDefaultCropAdvice(inputs);
  }

  /**
   * Generate fertilizer advice
   */
  getFertilizerAdvice(inputs) {
    if (!inputs.crop || inputs.crop.toLowerCase() === 'unknown') {
      return this.getGeneralFertilizerAdvice(inputs);
    }

    // Find specific fertilizer rules
    const matchingRules = this.findRules('fertilizerAdvice', inputs.soilType, inputs.season, inputs.crop);

    if (matchingRules.length > 0) {
      const bestRule = matchingRules[0];
      return {
        recommendation: bestRule.recommendation,
        confidence: bestRule.confidence,
        explanation: `Fertilizer guidance for ${inputs.crop} in ${inputs.soilType} soil`,
        ruleApplied: bestRule.id
      };
    }

    // Try general crop rules
    const generalRules = this.rules.fertilizerAdvice.filter(rule =>
      rule.conditions.crop.toLowerCase() === inputs.crop.toLowerCase()
    );

    if (generalRules.length > 0) {
      const rule = generalRules[0];
      return {
        recommendation: rule.recommendation,
        confidence: Math.max(rule.confidence - 2, 1),
        explanation: `General fertilizer advice for ${inputs.crop}`,
        ruleApplied: rule.id
      };
    }

    return this.getGeneralFertilizerAdvice(inputs);
  }

  /**
   * Generate irrigation advice
   */
  getIrrigationAdvice(inputs) {
    // Find specific irrigation rules
    const matchingRules = this.findRules('irrigationAdvice', inputs.soilType, inputs.season, inputs.crop);

    if (matchingRules.length > 0) {
      const bestRule = matchingRules[0];
      return {
        recommendation: bestRule.recommendation,
        confidence: bestRule.confidence,
        explanation: `Irrigation schedule for ${inputs.soilType} soil during ${inputs.season} season`,
        ruleApplied: bestRule.id
      };
    }

    // Try soil-season combination
    const soilSeasonRules = this.findRules('irrigationAdvice', inputs.soilType, inputs.season, 'any');

    if (soilSeasonRules.length > 0) {
      const rule = soilSeasonRules[0];
      return {
        recommendation: rule.recommendation,
        confidence: Math.max(rule.confidence - 1, 1),
        explanation: `Irrigation guidance for ${inputs.soilType} soil in ${inputs.season} season`,
        ruleApplied: rule.id
      };
    }

    return this.getGeneralIrrigationAdvice(inputs);
  }

  /**
   * Match applicable rules - Rule-based logic
   */
  findRules(category, soilType, season, crop) {
    if (!this.rules[category]) return [];

    return this.rules[category]
      .filter(rule => {
        const soilMatch = rule.conditions.soil === 'any' || 
                         rule.conditions.soil.toLowerCase() === soilType.toLowerCase();
        
        const seasonMatch = rule.conditions.season === 'any' || 
                           rule.conditions.season.toLowerCase() === season.toLowerCase();
        
        let cropMatch = true;
        if (rule.conditions.crop !== null && crop !== null) {
          cropMatch = rule.conditions.crop === 'any' || 
                     rule.conditions.crop.toLowerCase() === crop.toLowerCase();
        }

        return soilMatch && seasonMatch && cropMatch;
      })
      .sort((a, b) => b.confidence - a.confidence); // Highest confidence first
  }

  /**
   * Validate crop choice - Explainable logic
   */
  validateCropChoice(inputs) {
    const suitabilityRules = this.findRules('cropSuitability', inputs.soilType, inputs.season, null);
    
    const cropMentioned = suitabilityRules.some(rule => 
      rule.recommendation.toLowerCase().includes(inputs.crop.toLowerCase())
    );

    if (cropMentioned) {
      return {
        recommendation: `${inputs.crop} is suitable for ${inputs.soilType} soil during ${inputs.season} season.`,
        confidence: 8,
        explanation: `Crop validated against soil-season suitability database`,
        ruleApplied: 'crop_validation'
      };
    }

    return {
      recommendation: `${inputs.crop} may not be optimal for ${inputs.soilType} soil during ${inputs.season} season. Consider local expert consultation.`,
      confidence: 4,
      explanation: `Crop not found in recommended list for these conditions`,
      ruleApplied: 'crop_caution'
    };
  }

  /**
   * Default crop advice - Easy to extend
   */
  getDefaultCropAdvice(inputs) {
    const soilCropMap = {
      'sandy': 'Consider drought-resistant crops like millets, groundnut, or watermelon for sandy soil.',
      'clay': 'Rice, wheat, and sugarcane are suitable for water-retentive clay soil.',
      'loamy': 'Loamy soil supports most crops including wheat, maize, and vegetables.',
      'black': 'Cotton, sugarcane, and cereals perform well in fertile black soil.',
      'red': 'Millets, pulses, and oilseeds are adapted to red soil conditions.',
      'alluvial': 'Most crops including rice, wheat, and vegetables thrive in alluvial soil.'
    };

    const advice = soilCropMap[inputs.soilType.toLowerCase()] || 
                  'Consult local agricultural experts for crop recommendations.';

    return {
      recommendation: advice,
      confidence: 5,
      explanation: `General guidance based on ${inputs.soilType} soil characteristics`,
      ruleApplied: 'default_crop'
    };
  }

  /**
   * General fertilizer advice - Easy to extend
   */
  getGeneralFertilizerAdvice(inputs) {
    const soilFertilizerMap = {
      'sandy': 'Apply fertilizers in small, frequent doses. Sandy soil has low nutrient retention.',
      'clay': 'Apply fertilizers in larger doses less frequently. Clay soil retains nutrients well.',
      'loamy': 'Apply balanced NPK fertilizers according to crop requirements.',
      'black': 'Focus on maintaining soil health. Black soil is naturally fertile.',
      'red': 'Use phosphorus-rich fertilizers and lime to improve soil fertility.',
      'alluvial': 'Apply fertilizers based on soil testing results.'
    };

    const advice = soilFertilizerMap[inputs.soilType.toLowerCase()] || 
                  'Apply balanced fertilizers based on soil testing.';

    return {
      recommendation: advice,
      confidence: 5,
      explanation: `General fertilizer guidance for ${inputs.soilType} soil`,
      ruleApplied: 'default_fertilizer'
    };
  }

  /**
   * General irrigation advice - Easy to extend
   */
  getGeneralIrrigationAdvice(inputs) {
    const soilIrrigationMap = {
      'sandy': 'Irrigate frequently with smaller amounts. Sandy soil drains quickly.',
      'clay': 'Irrigate less frequently but thoroughly. Clay soil retains water well.',
      'loamy': 'Irrigate moderately based on crop needs.',
      'black': 'Monitor soil moisture to prevent waterlogging.',
      'red': 'Maintain consistent moisture levels with regular irrigation.',
      'alluvial': 'Irrigate based on crop requirements and soil moisture.'
    };

    const seasonAdjustment = {
      'summer': ' Increase frequency during hot weather.',
      'winter': ' Reduce frequency in cooler weather.',
      'kharif': ' Supplement monsoon rainfall as needed.',
      'rabi': ' Provide regular irrigation during dry season.'
    };

    const baseAdvice = soilIrrigationMap[inputs.soilType.toLowerCase()] || 
                      'Irrigate based on crop and soil requirements.';
    
    const seasonNote = seasonAdjustment[inputs.season.toLowerCase()] || '';

    return {
      recommendation: baseAdvice + seasonNote,
      confidence: 5,
      explanation: `General irrigation guidance for ${inputs.soilType} soil in ${inputs.season} season`,
      ruleApplied: 'default_irrigation'
    };
  }

  /**
   * Calculate overall confidence score
   */
  calculateConfidence(adviceArray) {
    const validAdvice = adviceArray.filter(advice => advice && advice.confidence);
    if (validAdvice.length === 0) return 1;

    const totalConfidence = validAdvice.reduce((sum, advice) => sum + advice.confidence, 0);
    return Math.round((totalConfidence / validAdvice.length) * 10) / 10;
  }
}

module.exports = AdvisoryEngine;