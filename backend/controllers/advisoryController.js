const Advisory = require('../models/Advisory');
const AdvisoryEngine = require('../services/advisoryEngine');
const weatherService = require('../services/weatherService');
const translationService = require('../services/translationService');

/**
 * Map user language preference to language code
 * @param {string} userLanguage - User's language preference from profile
 * @returns {string} Language code for translation service
 */
const mapUserLanguageToCode = (userLanguage) => {
  const languageMap = {
    'English': 'en',
    'हिंदी (Hindi)': 'hi',
    'मराठी (Marathi)': 'hi', // Use Hindi as fallback for Marathi
    'ಕನ್ನಡ (Kannada)': 'hi', // Use Hindi as fallback for Kannada
    'தமிழ் (Tamil)': 'hi', // Use Hindi as fallback for Tamil
    'తెలుగు (Telugu)': 'hi', // Use Hindi as fallback for Telugu
    'ગુજરાતી (Gujarati)': 'hi', // Use Hindi as fallback for Gujarati
    'বাংলা (Bengali)': 'hi' // Use Hindi as fallback for Bengali
  };
  
  return languageMap[userLanguage] || 'en';
};

/**
 * Translate advisory content
 * @param {Object} advisoryResult - Original advisory result
 * @param {string} targetLanguage - Target language code
 * @returns {Promise<Object>} Translation result with translated advisory
 */
const translateAdvisoryContent = async (advisoryResult, targetLanguage) => {
  try {
    if (targetLanguage === 'en') {
      return {
        success: true,
        translatedAdvisory: null, // No translation needed
        translationInfo: {
          method: 'no_translation_needed',
          confidence: 1.0
        }
      };
    }

    // Collect all texts to translate
    const textsToTranslate = [
      advisoryResult.cropAdvice.recommendation,
      advisoryResult.cropAdvice.explanation,
      advisoryResult.fertilizerAdvice.recommendation,
      advisoryResult.fertilizerAdvice.explanation,
      advisoryResult.irrigationAdvice.recommendation,
      advisoryResult.irrigationAdvice.explanation
    ];

    // Add weather advice texts if available
    if (advisoryResult.weatherAdvice) {
      if (advisoryResult.weatherAdvice.recommendations) {
        textsToTranslate.push(...advisoryResult.weatherAdvice.recommendations);
      }
      if (advisoryResult.weatherAdvice.explanation) {
        textsToTranslate.push(advisoryResult.weatherAdvice.explanation);
      }
      if (advisoryResult.weatherAdvice.warnings) {
        advisoryResult.weatherAdvice.warnings.forEach(warning => {
          textsToTranslate.push(warning.message);
        });
      }
    }

    // Translate all texts
    const translationResults = await translationService.translateMultiple(textsToTranslate, targetLanguage);

    if (!translationResults.success) {
      return {
        success: false,
        error: 'Translation failed',
        details: translationResults
      };
    }

    // Reconstruct translated advisory
    let textIndex = 0;
    const translatedAdvisory = {
      cropAdvice: {
        recommendation: translationResults.results[textIndex++].translatedText,
        confidence: advisoryResult.cropAdvice.confidence,
        explanation: translationResults.results[textIndex++].translatedText,
        ruleApplied: advisoryResult.cropAdvice.ruleApplied
      },
      fertilizerAdvice: {
        recommendation: translationResults.results[textIndex++].translatedText,
        confidence: advisoryResult.fertilizerAdvice.confidence,
        explanation: translationResults.results[textIndex++].translatedText,
        ruleApplied: advisoryResult.fertilizerAdvice.ruleApplied
      },
      irrigationAdvice: {
        recommendation: translationResults.results[textIndex++].translatedText,
        confidence: advisoryResult.irrigationAdvice.confidence,
        explanation: translationResults.results[textIndex++].translatedText,
        ruleApplied: advisoryResult.irrigationAdvice.ruleApplied
      },
      confidenceScore: advisoryResult.confidenceScore
    };

    // Add translated weather advice if available
    if (advisoryResult.weatherAdvice) {
      translatedAdvisory.weatherAdvice = {
        currentWeather: advisoryResult.weatherAdvice.currentWeather, // Keep original
        warnings: [],
        recommendations: [],
        confidence: advisoryResult.weatherAdvice.confidence,
        explanation: '',
        ruleApplied: advisoryResult.weatherAdvice.ruleApplied
      };

      // Translate weather recommendations
      if (advisoryResult.weatherAdvice.recommendations) {
        for (let i = 0; i < advisoryResult.weatherAdvice.recommendations.length; i++) {
          translatedAdvisory.weatherAdvice.recommendations.push(
            translationResults.results[textIndex++].translatedText
          );
        }
      }

      // Translate weather explanation
      if (advisoryResult.weatherAdvice.explanation) {
        translatedAdvisory.weatherAdvice.explanation = translationResults.results[textIndex++].translatedText;
      }

      // Translate weather warnings
      if (advisoryResult.weatherAdvice.warnings) {
        for (let i = 0; i < advisoryResult.weatherAdvice.warnings.length; i++) {
          translatedAdvisory.weatherAdvice.warnings.push({
            type: advisoryResult.weatherAdvice.warnings[i].type,
            severity: advisoryResult.weatherAdvice.warnings[i].severity,
            message: translationResults.results[textIndex++].translatedText
          });
        }
      }
    }

    // Calculate average translation confidence
    const avgConfidence = translationResults.results.reduce((sum, result) => {
      return sum + (result.confidence || 0);
    }, 0) / translationResults.results.length;

    return {
      success: true,
      translatedAdvisory: translatedAdvisory,
      translationInfo: {
        method: translationResults.results[0].method,
        confidence: avgConfidence,
        totalTexts: translationResults.totalTexts,
        successfulTranslations: translationResults.successfulTranslations
      }
    };

  } catch (error) {
    console.error('Translation Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate new advisory for farmer
 * POST /api/advisory/generate
 */
const generateAdvisory = async (req, res) => {
  try {
    const { crop, soilType, season, location } = req.body;
    const farmerId = req.user.id; // From JWT middleware

    // Validate required fields
    if (!crop || !soilType || !season) {
      return res.status(400).json({
        status: 'error',
        message: 'Crop, soil type, and season are required'
      });
    }

    // Validate enum values
    const validSoilTypes = ['Sandy', 'Clay', 'Loamy', 'Black', 'Red', 'Alluvial'];
    const validSeasons = ['Kharif', 'Rabi', 'Summer', 'Winter'];

    if (!validSoilTypes.includes(soilType)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid soil type. Must be one of: ${validSoilTypes.join(', ')}`
      });
    }

    if (!validSeasons.includes(season)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid season. Must be one of: ${validSeasons.join(', ')}`
      });
    }

    // Get weather data for the location
    let weatherData = null;
    let weatherError = null;
    
    // Use provided location or fall back to user's location
    const weatherLocation = location || req.user.location;
    
    if (weatherLocation) {
      try {
        console.log(`Fetching weather data for location: ${weatherLocation}`);
        const weatherResult = await weatherService.getWeatherByLocation(weatherLocation);
        
        if (weatherResult.success) {
          weatherData = weatherResult.data;
          console.log('Weather data retrieved successfully:', weatherData);
        } else {
          weatherError = weatherResult.error;
          console.warn('Weather service failed:', weatherError);
        }
      } catch (error) {
        weatherError = 'Weather service temporarily unavailable';
        console.error('Weather service error:', error.message);
      }
    } else {
      console.log('No location provided for weather data');
    }

    // Generate advisory using Advisory Engine (with or without weather data)
    const advisoryEngine = new AdvisoryEngine();
    const advisoryResult = advisoryEngine.generateAdvice(crop, soilType, season, weatherData);

    // Get farmer's language preference and translate advisory
    const farmer = req.user; // User object from JWT middleware
    const farmerLanguage = farmer.language || 'English';
    const languageCode = mapUserLanguageToCode(farmerLanguage);
    
    console.log(`Farmer's preferred language: ${farmerLanguage} (${languageCode})`);

    // Translate advisory content
    const translationResult = await translateAdvisoryContent(advisoryResult, languageCode);
    
    if (!translationResult.success) {
      console.warn('Translation failed, proceeding with original advisory:', translationResult.error);
    }

    // Prepare advisory data for database
    const advisoryData = {
      farmerId,
      crop: crop.trim(),
      soilType,
      season,
      advisoryResult
    };

    // Add translation information
    if (translationResult.success) {
      advisoryData.translationInfo = {
        farmerLanguage: farmerLanguage,
        languageCode: languageCode,
        translationMethod: translationResult.translationInfo.method,
        translationConfidence: translationResult.translationInfo.confidence,
        translatedAt: new Date()
      };

      // Add translated advisory if translation was performed
      if (translationResult.translatedAdvisory) {
        advisoryData.translatedAdvisoryResult = translationResult.translatedAdvisory;
      }
    }

    // Add weather data to advisory if available
    if (weatherData) {
      advisoryData.weatherData = {
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        description: weatherData.description,
        location: weatherLocation,
        fetchedAt: new Date()
      };
    }

    // Add weather error info if weather fetch failed
    if (weatherError) {
      advisoryData.weatherError = {
        message: weatherError,
        attemptedLocation: weatherLocation,
        failedAt: new Date()
      };
    }

    // Save advisory to database
    const advisory = new Advisory(advisoryData);
    const savedAdvisory = await advisory.save();

    // Return formatted advisory
    const formattedAdvisory = savedAdvisory.getFormattedAdvisory();

    // Add weather information to response
    const responseData = {
      advisoryId: savedAdvisory._id,
      advisory: formattedAdvisory
    };

    // Include weather information in response
    if (weatherData) {
      responseData.weatherInfo = {
        included: true,
        location: weatherLocation,
        data: weatherData
      };
    } else if (weatherError) {
      responseData.weatherInfo = {
        included: false,
        error: weatherError,
        location: weatherLocation || 'No location provided'
      };
    } else {
      responseData.weatherInfo = {
        included: false,
        reason: 'No location provided for weather data'
      };
    }

    // Include translation information in response
    if (translationResult.success) {
      responseData.translationInfo = {
        performed: !!translationResult.translatedAdvisory,
        farmerLanguage: farmerLanguage,
        languageCode: languageCode,
        method: translationResult.translationInfo.method,
        confidence: translationResult.translationInfo.confidence
      };

      if (translationResult.translationInfo.totalTexts) {
        responseData.translationInfo.statistics = {
          totalTexts: translationResult.translationInfo.totalTexts,
          successfulTranslations: translationResult.translationInfo.successfulTranslations
        };
      }
    } else {
      responseData.translationInfo = {
        performed: false,
        error: translationResult.error,
        farmerLanguage: farmerLanguage,
        languageCode: languageCode
      };
    }

    res.status(201).json({
      status: 'success',
      message: 'Advisory generated successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Generate Advisory Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate advisory',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * Get farmer's advisory history
 * GET /api/advisory/history
 */
const getAdvisoryHistory = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Get farmer's advisories with pagination
    const advisories = await Advisory.find({ farmerId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('farmerId', 'name phone location');

    // Get total count for pagination
    const totalAdvisories = await Advisory.countDocuments({ farmerId });
    const totalPages = Math.ceil(totalAdvisories / limit);

    // Format advisories for response
    const formattedAdvisories = advisories.map(advisory => ({
      id: advisory._id,
      crop: advisory.crop,
      soilType: advisory.soilType,
      season: advisory.season,
      confidenceScore: advisory.advisoryResult.confidenceScore,
      createdAt: advisory.createdAt,
      summary: {
        cropAdvice: advisory.advisoryResult.cropAdvice.recommendation.substring(0, 100) + '...',
        fertilizerAdvice: advisory.advisoryResult.fertilizerAdvice.recommendation.substring(0, 100) + '...',
        irrigationAdvice: advisory.advisoryResult.irrigationAdvice.recommendation.substring(0, 100) + '...'
      }
    }));

    res.status(200).json({
      status: 'success',
      message: 'Advisory history retrieved successfully',
      data: {
        advisories: formattedAdvisories,
        pagination: {
          currentPage: page,
          totalPages,
          totalAdvisories,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get Advisory History Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve advisory history',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * Get specific advisory by ID
 * GET /api/advisory/:id
 */
const getAdvisoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const farmerId = req.user.id;

    // Find advisory and ensure it belongs to the requesting farmer
    const advisory = await Advisory.findOne({ _id: id, farmerId })
      .populate('farmerId', 'name phone location');

    if (!advisory) {
      return res.status(404).json({
        status: 'error',
        message: 'Advisory not found'
      });
    }

    // Return formatted advisory
    const formattedAdvisory = advisory.getFormattedAdvisory();

    res.status(200).json({
      status: 'success',
      message: 'Advisory retrieved successfully',
      data: {
        advisory: formattedAdvisory
      }
    });

  } catch (error) {
    console.error('Get Advisory By ID Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve advisory',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * Get advisory statistics for farmer
 * GET /api/advisory/stats
 */
const getAdvisoryStats = async (req, res) => {
  try {
    const farmerId = req.user.id;

    // Get farmer's advisory statistics
    const stats = await Advisory.aggregate([
      { $match: { farmerId: farmerId } },
      {
        $group: {
          _id: null,
          totalAdvisories: { $sum: 1 },
          avgConfidence: { $avg: '$advisoryResult.confidenceScore' },
          cropDistribution: { $push: '$crop' },
          soilTypeDistribution: { $push: '$soilType' },
          seasonDistribution: { $push: '$season' },
          recentAdvisory: { $max: '$createdAt' }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'No advisory statistics available',
        data: {
          totalAdvisories: 0,
          averageConfidence: 0,
          cropDistribution: {},
          soilTypeDistribution: {},
          seasonDistribution: {},
          recentAdvisory: null
        }
      });
    }

    const result = stats[0];

    // Count occurrences
    const countOccurrences = (arr) => {
      return arr.reduce((acc, item) => {
        acc[item] = (acc[item] || 0) + 1;
        return acc;
      }, {});
    };

    res.status(200).json({
      status: 'success',
      message: 'Advisory statistics retrieved successfully',
      data: {
        totalAdvisories: result.totalAdvisories,
        averageConfidence: Math.round(result.avgConfidence * 10) / 10,
        cropDistribution: countOccurrences(result.cropDistribution),
        soilTypeDistribution: countOccurrences(result.soilTypeDistribution),
        seasonDistribution: countOccurrences(result.seasonDistribution),
        recentAdvisory: result.recentAdvisory
      }
    });

  } catch (error) {
    console.error('Get Advisory Stats Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve advisory statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * Delete advisory by ID
 * DELETE /api/advisory/:id
 */
const deleteAdvisory = async (req, res) => {
  try {
    const { id } = req.params;
    const farmerId = req.user.id;

    // Find and delete advisory (ensure it belongs to the requesting farmer)
    const advisory = await Advisory.findOneAndDelete({ _id: id, farmerId });

    if (!advisory) {
      return res.status(404).json({
        status: 'error',
        message: 'Advisory not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Advisory deleted successfully',
      data: {
        deletedAdvisoryId: id
      }
    });

  } catch (error) {
    console.error('Delete Advisory Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete advisory',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * Get available options for advisory form
 * GET /api/advisory/options
 */
const getAdvisoryOptions = async (req, res) => {
  try {
    const options = {
      soilTypes: ['Sandy', 'Clay', 'Loamy', 'Black', 'Red', 'Alluvial'],
      seasons: ['Kharif', 'Rabi', 'Summer', 'Winter'],
      commonCrops: [
        'Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 
        'Groundnut', 'Soybean', 'Barley', 'Millets', 'Pulses',
        'Tomato', 'Onion', 'Potato', 'Chili', 'Brinjal'
      ]
    };

    res.status(200).json({
      status: 'success',
      message: 'Advisory options retrieved successfully',
      data: options
    });

  } catch (error) {
    console.error('Get Advisory Options Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve advisory options',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  generateAdvisory,
  getAdvisoryHistory,
  getAdvisoryById,
  getAdvisoryStats,
  deleteAdvisory,
  getAdvisoryOptions
};