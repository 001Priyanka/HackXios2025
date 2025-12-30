const axios = require('axios');

class TranslationService {
  constructor() {
    this.supportedLanguages = {
      'en': 'English',
      'hi': 'Hindi',
      'pa': 'Punjabi'
    };
    
    // Mock translation map for common farming terms
    this.mockTranslations = {
      'hi': {
        // Common farming terms
        'crop': 'फसल',
        'soil': 'मिट्टी',
        'water': 'पानी',
        'fertilizer': 'उर्वरक',
        'irrigation': 'सिंचाई',
        'season': 'मौसम',
        'temperature': 'तापमान',
        'humidity': 'नमी',
        'weather': 'मौसम',
        'advice': 'सलाह',
        'recommendation': 'सिफारिश',
        'confidence': 'विश्वास',
        'high': 'उच्च',
        'medium': 'मध्यम',
        'low': 'कम',
        'warning': 'चेतावनी',
        'alert': 'अलर्ट',
        
        // Soil types
        'sandy': 'रेतीली',
        'clay': 'चिकनी मिट्टी',
        'loamy': 'दोमट',
        'black': 'काली मिट्टी',
        'red': 'लाल मिट्टी',
        'alluvial': 'जलोढ़',
        
        // Seasons
        'kharif': 'खरीफ',
        'rabi': 'रबी',
        'summer': 'गर्मी',
        'winter': 'सर्दी',
        
        // Common crops
        'rice': 'चावल',
        'wheat': 'गेहूं',
        'maize': 'मक्का',
        'cotton': 'कपास',
        'sugarcane': 'गन्ना',
        
        // Weather conditions
        'clear sky': 'साफ आसमान',
        'cloudy': 'बादल',
        'rain': 'बारिश',
        'storm': 'तूफान',
        
        // Common phrases
        'heat stress': 'गर्मी का तनाव',
        'fungal risk': 'फंगल जोखिम',
        'disease pressure': 'रोग दबाव',
        'cold stress': 'ठंड का तनाव'
      },
      'pa': {
        // Common farming terms in Punjabi
        'crop': 'ਫਸਲ',
        'soil': 'ਮਿੱਟੀ',
        'water': 'ਪਾਣੀ',
        'fertilizer': 'ਖਾਦ',
        'irrigation': 'ਸਿੰਚਾਈ',
        'season': 'ਮੌਸਮ',
        'temperature': 'ਤਾਪਮਾਨ',
        'humidity': 'ਨਮੀ',
        'weather': 'ਮੌਸਮ',
        'advice': 'ਸਲਾਹ',
        'recommendation': 'ਸਿਫਾਰਸ਼',
        'confidence': 'ਭਰੋਸਾ',
        'high': 'ਉੱਚਾ',
        'medium': 'ਮੱਧਮ',
        'low': 'ਘੱਟ',
        'warning': 'ਚੇਤਾਵਨੀ',
        'alert': 'ਅਲਰਟ',
        
        // Soil types
        'sandy': 'ਰੇਤਲੀ',
        'clay': 'ਚਿਕਨੀ ਮਿੱਟੀ',
        'loamy': 'ਦੋਮਟ',
        'black': 'ਕਾਲੀ ਮਿੱਟੀ',
        'red': 'ਲਾਲ ਮਿੱਟੀ',
        'alluvial': 'ਜਲੋਢ਼',
        
        // Seasons
        'kharif': 'ਖਰੀਫ',
        'rabi': 'ਰਬੀ',
        'summer': 'ਗਰਮੀ',
        'winter': 'ਸਰਦੀ',
        
        // Common crops
        'rice': 'ਚਾਵਲ',
        'wheat': 'ਕਣਕ',
        'maize': 'ਮੱਕੀ',
        'cotton': 'ਕਪਾਹ',
        'sugarcane': 'ਗੰਨਾ',
        
        // Weather conditions
        'clear sky': 'ਸਾਫ਼ ਅਸਮਾਨ',
        'cloudy': 'ਬੱਦਲ',
        'rain': 'ਮੀਂਹ',
        'storm': 'ਤੂਫਾਨ',
        
        // Common phrases
        'heat stress': 'ਗਰਮੀ ਦਾ ਤਣਾਅ',
        'fungal risk': 'ਫੰਗਲ ਜੋਖਮ',
        'disease pressure': 'ਬਿਮਾਰੀ ਦਾ ਦਬਾਅ',
        'cold stress': 'ਠੰਡ ਦਾ ਤਣਾਅ'
      }
    };
  }

  /**
   * Translate text to target language
   * @param {string} text - Text to translate
   * @param {string} targetLanguage - Target language code (en, hi, pa)
   * @returns {Promise<Object>} Translation result
   */
  async translateText(text, targetLanguage) {
    try {
      // Validate inputs
      if (!text || typeof text !== 'string') {
        throw new Error('Text is required and must be a string');
      }

      if (!targetLanguage || typeof targetLanguage !== 'string') {
        throw new Error('Target language is required and must be a string');
      }

      const langCode = targetLanguage.toLowerCase().trim();

      // Validate supported language
      if (!this.supportedLanguages[langCode]) {
        throw new Error(`Unsupported language: ${targetLanguage}. Supported languages: ${Object.keys(this.supportedLanguages).join(', ')}`);
      }

      // If target language is English, return original text
      if (langCode === 'en') {
        return {
          success: true,
          originalText: text,
          translatedText: text,
          targetLanguage: 'en',
          method: 'no_translation_needed',
          confidence: 1.0
        };
      }

      // Try API translation first (if API key is available)
      const apiResult = await this.tryApiTranslation(text, langCode);
      if (apiResult.success) {
        return apiResult;
      }

      // Fallback to mock translation
      const mockResult = await this.tryMockTranslation(text, langCode);
      if (mockResult.success) {
        return mockResult;
      }

      // Final fallback - return original text with warning
      return {
        success: true,
        originalText: text,
        translatedText: text,
        targetLanguage: langCode,
        method: 'fallback_original',
        confidence: 0.0,
        warning: 'Translation not available, returning original text'
      };

    } catch (error) {
      console.error('Translation Service Error:', error.message);
      
      return {
        success: false,
        error: error.message,
        originalText: text || '',
        translatedText: text || '',
        targetLanguage: targetLanguage || 'unknown',
        method: 'error_fallback'
      };
    }
  }

  /**
   * Try API-based translation (Google Translate, Azure, etc.)
   * @param {string} text - Text to translate
   * @param {string} targetLanguage - Target language code
   * @returns {Promise<Object>} Translation result
   */
  async tryApiTranslation(text, targetLanguage) {
    try {
      // Check if translation API is configured
      const apiKey = process.env.TRANSLATION_API_KEY;
      const apiProvider = process.env.TRANSLATION_PROVIDER || 'google';

      if (!apiKey) {
        console.log('Translation API key not configured, skipping API translation');
        return { success: false, reason: 'api_not_configured' };
      }

      // Google Translate API example
      if (apiProvider === 'google') {
        return await this.googleTranslate(text, targetLanguage, apiKey);
      }

      // Azure Translator API example
      if (apiProvider === 'azure') {
        return await this.azureTranslate(text, targetLanguage, apiKey);
      }

      return { success: false, reason: 'unsupported_provider' };

    } catch (error) {
      console.error('API Translation Error:', error.message);
      return { success: false, reason: 'api_error', error: error.message };
    }
  }

  /**
   * Google Translate API integration
   * @param {string} text - Text to translate
   * @param {string} targetLanguage - Target language code
   * @param {string} apiKey - Google API key
   * @returns {Promise<Object>} Translation result
   */
  async googleTranslate(text, targetLanguage, apiKey) {
    try {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
        {
          q: text,
          target: targetLanguage,
          source: 'en',
          format: 'text'
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.data && response.data.data && response.data.data.translations) {
        const translation = response.data.data.translations[0];
        
        return {
          success: true,
          originalText: text,
          translatedText: translation.translatedText,
          targetLanguage: targetLanguage,
          method: 'google_translate_api',
          confidence: 0.9,
          detectedSourceLanguage: translation.detectedSourceLanguage
        };
      }

      return { success: false, reason: 'invalid_api_response' };

    } catch (error) {
      console.error('Google Translate Error:', error.message);
      return { success: false, reason: 'google_api_error', error: error.message };
    }
  }

  /**
   * Azure Translator API integration
   * @param {string} text - Text to translate
   * @param {string} targetLanguage - Target language code
   * @param {string} apiKey - Azure API key
   * @returns {Promise<Object>} Translation result
   */
  async azureTranslate(text, targetLanguage, apiKey) {
    try {
      const region = process.env.AZURE_TRANSLATOR_REGION || 'global';
      
      const response = await axios.post(
        `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${targetLanguage}`,
        [{ text: text }],
        {
          headers: {
            'Ocp-Apim-Subscription-Key': apiKey,
            'Ocp-Apim-Subscription-Region': region,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.data && response.data[0] && response.data[0].translations) {
        const translation = response.data[0].translations[0];
        
        return {
          success: true,
          originalText: text,
          translatedText: translation.text,
          targetLanguage: targetLanguage,
          method: 'azure_translator_api',
          confidence: 0.9,
          detectedSourceLanguage: response.data[0].detectedLanguage?.language
        };
      }

      return { success: false, reason: 'invalid_azure_response' };

    } catch (error) {
      console.error('Azure Translator Error:', error.message);
      return { success: false, reason: 'azure_api_error', error: error.message };
    }
  }

  /**
   * Mock translation using predefined dictionary
   * @param {string} text - Text to translate
   * @param {string} targetLanguage - Target language code
   * @returns {Promise<Object>} Translation result
   */
  async tryMockTranslation(text, targetLanguage) {
    try {
      const translations = this.mockTranslations[targetLanguage];
      
      if (!translations) {
        return { success: false, reason: 'no_mock_translations' };
      }

      // Simple word-by-word translation for mock
      const words = text.toLowerCase().split(/\s+/);
      const translatedWords = words.map(word => {
        // Remove punctuation for lookup
        const cleanWord = word.replace(/[^\w]/g, '');
        return translations[cleanWord] || word;
      });

      const translatedText = translatedWords.join(' ');

      // Calculate confidence based on how many words were translated
      const translatedCount = words.filter(word => {
        const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
        return translations[cleanWord];
      }).length;
      
      const confidence = words.length > 0 ? translatedCount / words.length : 0;

      return {
        success: true,
        originalText: text,
        translatedText: translatedText,
        targetLanguage: targetLanguage,
        method: 'mock_dictionary',
        confidence: Math.round(confidence * 100) / 100,
        translatedWords: translatedCount,
        totalWords: words.length
      };

    } catch (error) {
      console.error('Mock Translation Error:', error.message);
      return { success: false, reason: 'mock_translation_error', error: error.message };
    }
  }

  /**
   * Translate multiple texts at once
   * @param {Array<string>} texts - Array of texts to translate
   * @param {string} targetLanguage - Target language code
   * @returns {Promise<Array<Object>>} Array of translation results
   */
  async translateMultiple(texts, targetLanguage) {
    try {
      if (!Array.isArray(texts)) {
        throw new Error('Texts must be an array');
      }

      const results = await Promise.all(
        texts.map(text => this.translateText(text, targetLanguage))
      );

      return {
        success: true,
        results: results,
        totalTexts: texts.length,
        successfulTranslations: results.filter(r => r.success).length
      };

    } catch (error) {
      console.error('Multiple Translation Error:', error.message);
      return {
        success: false,
        error: error.message,
        results: []
      };
    }
  }

  /**
   * Get supported languages
   * @returns {Object} Supported languages object
   */
  getSupportedLanguages() {
    return { ...this.supportedLanguages };
  }

  /**
   * Check if language is supported
   * @param {string} languageCode - Language code to check
   * @returns {boolean} Whether language is supported
   */
  isLanguageSupported(languageCode) {
    return !!this.supportedLanguages[languageCode?.toLowerCase()];
  }

  /**
   * Test translation service
   * @returns {Promise<Object>} Test results
   */
  async testTranslation() {
    try {
      const testText = 'crop advice for wheat';
      const results = {};

      for (const langCode of Object.keys(this.supportedLanguages)) {
        results[langCode] = await this.translateText(testText, langCode);
      }

      return {
        success: true,
        message: 'Translation service test completed',
        testText: testText,
        results: results
      };

    } catch (error) {
      return {
        success: false,
        message: 'Translation service test failed',
        error: error.message
      };
    }
  }
}

// Create and export singleton instance
const translationService = new TranslationService();

module.exports = translationService;