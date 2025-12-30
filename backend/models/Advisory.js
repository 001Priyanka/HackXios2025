const mongoose = require('mongoose');

const advisorySchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer ID is required'],
    index: true
  },
  crop: {
    type: String,
    required: [true, 'Crop name is required'],
    trim: true,
    maxlength: [100, 'Crop name cannot exceed 100 characters']
  },
  soilType: {
    type: String,
    required: [true, 'Soil type is required'],
    trim: true,
    enum: {
      values: ['Sandy', 'Clay', 'Loamy', 'Black', 'Red', 'Alluvial'],
      message: 'Please select a valid soil type'
    }
  },
  season: {
    type: String,
    required: [true, 'Season is required'],
    trim: true,
    enum: {
      values: ['Kharif', 'Rabi', 'Summer', 'Winter'],
      message: 'Please select a valid season'
    }
  },
  advisoryResult: {
    cropAdvice: {
      recommendation: {
        type: String,
        required: true
      },
      confidence: {
        type: Number,
        required: true,
        min: 1,
        max: 10
      },
      explanation: {
        type: String,
        required: true
      },
      ruleApplied: {
        type: String,
        required: true
      }
    },
    fertilizerAdvice: {
      recommendation: {
        type: String,
        required: true
      },
      confidence: {
        type: Number,
        required: true,
        min: 1,
        max: 10
      },
      explanation: {
        type: String,
        required: true
      },
      ruleApplied: {
        type: String,
        required: true
      }
    },
    irrigationAdvice: {
      recommendation: {
        type: String,
        required: true
      },
      confidence: {
        type: Number,
        required: true,
        min: 1,
        max: 10
      },
      explanation: {
        type: String,
        required: true
      },
      ruleApplied: {
        type: String,
        required: true
      }
    },
    confidenceScore: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    // Weather advice (optional - only if weather data was available)
    weatherAdvice: {
      currentWeather: {
        temperature: String,
        humidity: String,
        description: String
      },
      warnings: [{
        type: String,
        severity: String,
        message: String
      }],
      recommendations: [String],
      confidence: Number,
      explanation: String,
      ruleApplied: String
    }
  },
  // Weather data used for advisory generation (optional)
  weatherData: {
    temperature: {
      type: Number,
      min: -50,
      max: 60
    },
    humidity: {
      type: Number,
      min: 0,
      max: 100
    },
    description: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    fetchedAt: {
      type: Date
    }
  },
  // Weather error information (if weather fetch failed)
  weatherError: {
    message: {
      type: String,
      trim: true
    },
    attemptedLocation: {
      type: String,
      trim: true
    },
    failedAt: {
      type: Date
    }
  },
  // Translation information
  translationInfo: {
    farmerLanguage: {
      type: String,
      trim: true
    },
    languageCode: {
      type: String,
      trim: true
    },
    translationMethod: {
      type: String,
      trim: true
    },
    translationConfidence: {
      type: Number,
      min: 0,
      max: 1
    },
    translatedAt: {
      type: Date
    }
  },
  // Translated advisory result (optional - only if translation was performed)
  translatedAdvisoryResult: {
    cropAdvice: {
      recommendation: String,
      confidence: Number,
      explanation: String,
      ruleApplied: String
    },
    fertilizerAdvice: {
      recommendation: String,
      confidence: Number,
      explanation: String,
      ruleApplied: String
    },
    irrigationAdvice: {
      recommendation: String,
      confidence: Number,
      explanation: String,
      ruleApplied: String
    },
    weatherAdvice: {
      currentWeather: {
        temperature: String,
        humidity: String,
        description: String
      },
      warnings: [{
        type: String,
        severity: String,
        message: String
      }],
      recommendations: [String],
      confidence: Number,
      explanation: String,
      ruleApplied: String
    },
    confidenceScore: Number
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
advisorySchema.index({ farmerId: 1, createdAt: -1 });
advisorySchema.index({ crop: 1 });
advisorySchema.index({ soilType: 1, season: 1 });

// Virtual for advisory summary
advisorySchema.virtual('summary').get(function() {
  return {
    id: this._id,
    farmer: this.farmerId,
    crop: this.crop,
    soilType: this.soilType,
    season: this.season,
    overallConfidence: this.advisoryResult.confidenceScore,
    createdAt: this.createdAt
  };
});

// Instance method to get formatted advisory
advisorySchema.methods.getFormattedAdvisory = function() {
  // Determine which advisory to use (translated if available, otherwise original)
  const advisoryToUse = this.translatedAdvisoryResult || this.advisoryResult;
  const isTranslated = !!this.translatedAdvisoryResult;

  const formatted = {
    advisoryId: this._id,
    farmerInfo: {
      farmerId: this.farmerId,
      crop: this.crop,
      soilType: this.soilType,
      season: this.season
    },
    recommendations: {
      crop: {
        advice: advisoryToUse.cropAdvice.recommendation,
        confidence: advisoryToUse.cropAdvice.confidence,
        reasoning: advisoryToUse.cropAdvice.explanation
      },
      fertilizer: {
        advice: advisoryToUse.fertilizerAdvice.recommendation,
        confidence: advisoryToUse.fertilizerAdvice.confidence,
        reasoning: advisoryToUse.fertilizerAdvice.explanation
      },
      irrigation: {
        advice: advisoryToUse.irrigationAdvice.recommendation,
        confidence: advisoryToUse.irrigationAdvice.confidence,
        reasoning: advisoryToUse.irrigationAdvice.explanation
      }
    },
    overallConfidence: advisoryToUse.confidenceScore,
    generatedAt: this.createdAt
  };

  // Add weather advice if available
  if (advisoryToUse.weatherAdvice) {
    formatted.recommendations.weather = {
      currentConditions: advisoryToUse.weatherAdvice.currentWeather,
      warnings: advisoryToUse.weatherAdvice.warnings,
      advice: advisoryToUse.weatherAdvice.recommendations,
      confidence: advisoryToUse.weatherAdvice.confidence,
      reasoning: advisoryToUse.weatherAdvice.explanation
    };
  }

  // Add weather data information if available
  if (this.weatherData) {
    formatted.weatherInfo = {
      included: true,
      data: {
        temperature: this.weatherData.temperature,
        humidity: this.weatherData.humidity,
        description: this.weatherData.description,
        location: this.weatherData.location
      },
      fetchedAt: this.weatherData.fetchedAt
    };
  } else if (this.weatherError) {
    formatted.weatherInfo = {
      included: false,
      error: this.weatherError.message,
      attemptedLocation: this.weatherError.attemptedLocation,
      failedAt: this.weatherError.failedAt
    };
  } else {
    formatted.weatherInfo = {
      included: false,
      reason: 'No weather data requested or available'
    };
  }

  // Add translation information if available
  if (this.translationInfo) {
    formatted.translationInfo = {
      isTranslated: isTranslated,
      farmerLanguage: this.translationInfo.farmerLanguage,
      languageCode: this.translationInfo.languageCode,
      method: this.translationInfo.translationMethod,
      confidence: this.translationInfo.translationConfidence,
      translatedAt: this.translationInfo.translatedAt
    };
  } else {
    formatted.translationInfo = {
      isTranslated: false,
      reason: 'No translation performed (English or translation not requested)'
    };
  }

  return formatted;
};

// Static method to find advisories by farmer
advisorySchema.statics.findByFarmer = function(farmerId, limit = 10) {
  return this.find({ farmerId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('farmerId', 'name phone location');
};

// Static method to find advisories by crop
advisorySchema.statics.findByCrop = function(crop, limit = 10) {
  return this.find({ crop: new RegExp(crop, 'i') })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('farmerId', 'name phone');
};

// Static method to get advisory statistics
advisorySchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalAdvisories: { $sum: 1 },
        avgConfidence: { $avg: '$advisoryResult.confidenceScore' },
        cropDistribution: {
          $push: '$crop'
        },
        soilTypeDistribution: {
          $push: '$soilType'
        },
        seasonDistribution: {
          $push: '$season'
        }
      }
    }
  ]);

  if (stats.length === 0) return null;

  const result = stats[0];
  
  // Count occurrences
  const countOccurrences = (arr) => {
    return arr.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});
  };

  return {
    totalAdvisories: result.totalAdvisories,
    averageConfidence: Math.round(result.avgConfidence * 10) / 10,
    cropDistribution: countOccurrences(result.cropDistribution),
    soilTypeDistribution: countOccurrences(result.soilTypeDistribution),
    seasonDistribution: countOccurrences(result.seasonDistribution)
  };
};

const Advisory = mongoose.model('Advisory', advisorySchema);

module.exports = Advisory;