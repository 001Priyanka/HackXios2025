const Advisory = require('../models/Advisory');
const AdvisoryEngine = require('../services/advisoryEngine');
const weatherService = require('../services/weatherService');

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

    // Prepare advisory data for database
    const advisoryData = {
      farmerId,
      crop: crop.trim(),
      soilType,
      season,
      advisoryResult
    };

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