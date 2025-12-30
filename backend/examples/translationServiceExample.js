/**
 * Translation Service Usage Examples
 * 
 * This file demonstrates how to use the translationService in your controllers
 */

const translationService = require('../services/translationService');

// Example 1: Basic translation
async function basicTranslation() {
  console.log('=== Basic Translation Example ===');
  
  const text = 'Apply fertilizer to your wheat crop';
  const targetLanguage = 'hi';
  
  const result = await translationService.translateText(text, targetLanguage);
  
  if (result.success) {
    console.log('Original:', result.originalText);
    console.log('Translated:', result.translatedText);
    console.log('Method:', result.method);
    console.log('Confidence:', result.confidence);
  } else {
    console.error('Translation failed:', result.error);
  }
}

// Example 2: Multiple language translation
async function multipleLanguageTranslation() {
  console.log('\n=== Multiple Language Translation ===');
  
  const text = 'High temperature warning for crops';
  const languages = ['en', 'hi', 'pa'];
  
  for (const lang of languages) {
    const result = await translationService.translateText(text, lang);
    console.log(`${lang.toUpperCase()}: ${result.translatedText}`);
  }
}

// Example 3: Translate multiple texts
async function multipleTextsTranslation() {
  console.log('\n=== Multiple Texts Translation ===');
  
  const texts = [
    'crop advice',
    'soil type',
    'weather warning',
    'irrigation schedule'
  ];
  
  const result = await translationService.translateMultiple(texts, 'hi');
  
  if (result.success) {
    console.log(`Successfully translated ${result.successfulTranslations}/${result.totalTexts} texts:`);
    result.results.forEach((translation, index) => {
      console.log(`${texts[index]} → ${translation.translatedText}`);
    });
  }
}

// Example 4: Error handling
async function errorHandlingExample() {
  console.log('\n=== Error Handling Example ===');
  
  // Test with unsupported language
  const result1 = await translationService.translateText('hello', 'fr');
  console.log('Unsupported language result:', result1.success ? 'Success' : result1.error);
  
  // Test with empty text
  const result2 = await translationService.translateText('', 'hi');
  console.log('Empty text result:', result2.success ? 'Success' : result2.error);
}

// Example 5: How to use in a controller
async function exampleControllerUsage(req, res) {
  try {
    const { text, language } = req.body;
    
    // Validate input
    if (!text || !language) {
      return res.status(400).json({
        success: false,
        message: 'Text and language are required'
      });
    }
    
    // Translate text
    const translationResult = await translationService.translateText(text, language);
    
    if (!translationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Translation failed',
        error: translationResult.error
      });
    }
    
    // Return translated text
    res.json({
      success: true,
      data: {
        originalText: translationResult.originalText,
        translatedText: translationResult.translatedText,
        targetLanguage: translationResult.targetLanguage,
        method: translationResult.method,
        confidence: translationResult.confidence
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// Example 6: Advisory translation
async function translateAdvisoryExample() {
  console.log('\n=== Advisory Translation Example ===');
  
  const advisoryText = {
    cropAdvice: 'Wheat is suitable for loamy soil during winter season',
    fertilizerAdvice: 'Apply balanced NPK fertilizer according to crop requirements',
    irrigationAdvice: 'Irrigate moderately based on crop needs',
    weatherWarning: 'High temperature alert: Heat stress risk for crops'
  };
  
  console.log('Translating advisory to Hindi:');
  
  for (const [key, text] of Object.entries(advisoryText)) {
    const result = await translationService.translateText(text, 'hi');
    console.log(`${key}: ${result.translatedText}`);
  }
}

// Example 7: Test translation service
async function testTranslationService() {
  console.log('\n=== Testing Translation Service ===');
  
  const testResult = await translationService.testTranslation();
  
  if (testResult.success) {
    console.log('✅ Translation service is working');
    console.log('Test text:', testResult.testText);
    
    Object.entries(testResult.results).forEach(([lang, result]) => {
      console.log(`${lang}: ${result.translatedText} (${result.method})`);
    });
  } else {
    console.log('❌ Translation service test failed');
    console.error('Error:', testResult.error);
  }
}

// Run examples (uncomment to test)
async function runExamples() {
  console.log('Translation Service Examples');
  console.log('============================');
  console.log('Note: API translation requires TRANSLATION_API_KEY in .env file');
  console.log('Without API key, mock translation will be used\n');
  
  // Uncomment these lines to test:
  // await basicTranslation();
  // await multipleLanguageTranslation();
  // await multipleTextsTranslation();
  // await errorHandlingExample();
  // await translateAdvisoryExample();
  // await testTranslationService();
}

// Export for use in other files
module.exports = {
  basicTranslation,
  multipleLanguageTranslation,
  multipleTextsTranslation,
  errorHandlingExample,
  exampleControllerUsage,
  translateAdvisoryExample,
  testTranslationService
};

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples();
}