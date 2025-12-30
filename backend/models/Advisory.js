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
    }
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
  return {
    advisoryId: this._id,
    farmerInfo: {
      farmerId: this.farmerId,
      crop: this.crop,
      soilType: this.soilType,
      season: this.season
    },
    recommendations: {
      crop: {
        advice: this.advisoryResult.cropAdvice.recommendation,
        confidence: this.advisoryResult.cropAdvice.confidence,
        reasoning: this.advisoryResult.cropAdvice.explanation
      },
      fertilizer: {
        advice: this.advisoryResult.fertilizerAdvice.recommendation,
        confidence: this.advisoryResult.fertilizerAdvice.confidence,
        reasoning: this.advisoryResult.fertilizerAdvice.explanation
      },
      irrigation: {
        advice: this.advisoryResult.irrigationAdvice.recommendation,
        confidence: this.advisoryResult.irrigationAdvice.confidence,
        reasoning: this.advisoryResult.irrigationAdvice.explanation
      }
    },
    overallConfidence: this.advisoryResult.confidenceScore,
    generatedAt: this.createdAt
  };
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