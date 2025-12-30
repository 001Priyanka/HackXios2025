import api from './api';

/**
 * Advisory Service - Frontend integration with Advisory API
 */
class AdvisoryService {
  
  /**
   * Generate new advisory
   * @param {Object} advisoryData - { crop, soilType, season }
   * @returns {Promise} Advisory response
   */
  static async generateAdvisory(advisoryData) {
    try {
      const response = await api.post('/advisory/generate', advisoryData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to generate advisory',
        details: error.response?.data
      };
    }
  }

  /**
   * Get farmer's advisory history
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise} Advisory history response
   */
  static async getAdvisoryHistory(page = 1, limit = 10) {
    try {
      const response = await api.get(`/advisory/history?page=${page}&limit=${limit}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get advisory history',
        details: error.response?.data
      };
    }
  }

  /**
   * Get specific advisory by ID
   * @param {string} advisoryId - Advisory ID
   * @returns {Promise} Advisory response
   */
  static async getAdvisoryById(advisoryId) {
    try {
      const response = await api.get(`/advisory/${advisoryId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get advisory',
        details: error.response?.data
      };
    }
  }

  /**
   * Get advisory statistics for farmer
   * @returns {Promise} Statistics response
   */
  static async getAdvisoryStats() {
    try {
      const response = await api.get('/advisory/stats');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get advisory statistics',
        details: error.response?.data
      };
    }
  }

  /**
   * Delete advisory by ID
   * @param {string} advisoryId - Advisory ID
   * @returns {Promise} Delete response
   */
  static async deleteAdvisory(advisoryId) {
    try {
      const response = await api.delete(`/advisory/${advisoryId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete advisory',
        details: error.response?.data
      };
    }
  }

  /**
   * Get available options for advisory form
   * @returns {Promise} Options response
   */
  static async getAdvisoryOptions() {
    try {
      const response = await api.get('/advisory/options');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get advisory options',
        details: error.response?.data
      };
    }
  }

  /**
   * Validate advisory form data
   * @param {Object} formData - { crop, soilType, season }
   * @returns {Object} Validation result
   */
  static validateAdvisoryForm(formData) {
    const errors = {};

    // Required fields
    if (!formData.crop || formData.crop.trim() === '') {
      errors.crop = 'Crop name is required';
    }

    if (!formData.soilType) {
      errors.soilType = 'Soil type is required';
    }

    if (!formData.season) {
      errors.season = 'Season is required';
    }

    // Validate crop name length
    if (formData.crop && formData.crop.trim().length > 100) {
      errors.crop = 'Crop name cannot exceed 100 characters';
    }

    // Validate enum values (these should match backend validation)
    const validSoilTypes = ['Sandy', 'Clay', 'Loamy', 'Black', 'Red', 'Alluvial'];
    const validSeasons = ['Kharif', 'Rabi', 'Summer', 'Winter'];

    if (formData.soilType && !validSoilTypes.includes(formData.soilType)) {
      errors.soilType = `Invalid soil type. Must be one of: ${validSoilTypes.join(', ')}`;
    }

    if (formData.season && !validSeasons.includes(formData.season)) {
      errors.season = `Invalid season. Must be one of: ${validSeasons.join(', ')}`;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Format advisory for display
   * @param {Object} advisory - Advisory object from API
   * @returns {Object} Formatted advisory
   */
  static formatAdvisoryForDisplay(advisory) {
    if (!advisory || !advisory.recommendations) {
      return null;
    }

    return {
      id: advisory.advisoryId,
      farmerInfo: advisory.farmerInfo,
      recommendations: {
        crop: {
          title: 'Crop Recommendation',
          advice: advisory.recommendations.crop.advice,
          confidence: advisory.recommendations.crop.confidence,
          reasoning: advisory.recommendations.crop.reasoning,
          confidenceText: this.getConfidenceText(advisory.recommendations.crop.confidence)
        },
        fertilizer: {
          title: 'Fertilizer Advice',
          advice: advisory.recommendations.fertilizer.advice,
          confidence: advisory.recommendations.fertilizer.confidence,
          reasoning: advisory.recommendations.fertilizer.reasoning,
          confidenceText: this.getConfidenceText(advisory.recommendations.fertilizer.confidence)
        },
        irrigation: {
          title: 'Irrigation Guidance',
          advice: advisory.recommendations.irrigation.advice,
          confidence: advisory.recommendations.irrigation.confidence,
          reasoning: advisory.recommendations.irrigation.reasoning,
          confidenceText: this.getConfidenceText(advisory.recommendations.irrigation.confidence)
        }
      },
      overallConfidence: advisory.overallConfidence,
      overallConfidenceText: this.getConfidenceText(advisory.overallConfidence),
      generatedAt: advisory.generatedAt
    };
  }

  /**
   * Get confidence level text
   * @param {number} confidence - Confidence score (1-10)
   * @returns {string} Confidence text
   */
  static getConfidenceText(confidence) {
    if (confidence >= 9) return 'Very High';
    if (confidence >= 7) return 'High';
    if (confidence >= 5) return 'Medium';
    if (confidence >= 3) return 'Low';
    return 'Very Low';
  }

  /**
   * Get confidence color for UI
   * @param {number} confidence - Confidence score (1-10)
   * @returns {string} CSS color class or hex color
   */
  static getConfidenceColor(confidence) {
    if (confidence >= 9) return '#22c55e'; // Green
    if (confidence >= 7) return '#84cc16'; // Light green
    if (confidence >= 5) return '#eab308'; // Yellow
    if (confidence >= 3) return '#f97316'; // Orange
    return '#ef4444'; // Red
  }

  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  static formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get season emoji
   * @param {string} season - Season name
   * @returns {string} Emoji
   */
  static getSeasonEmoji(season) {
    const seasonEmojis = {
      'Kharif': '🌧️',
      'Rabi': '❄️',
      'Summer': '☀️',
      'Winter': '🌨️'
    };
    return seasonEmojis[season] || '🌱';
  }

  /**
   * Get soil type emoji
   * @param {string} soilType - Soil type name
   * @returns {string} Emoji
   */
  static getSoilEmoji(soilType) {
    const soilEmojis = {
      'Sandy': '🏖️',
      'Clay': '🧱',
      'Loamy': '🌱',
      'Black': '⚫',
      'Red': '🔴',
      'Alluvial': '🏞️'
    };
    return soilEmojis[soilType] || '🌍';
  }
}

export default AdvisoryService;