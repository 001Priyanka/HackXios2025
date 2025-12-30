import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdvisoryService from '../../services/advisoryService';
import './AdvisoryResult.css';

const AdvisoryResult = () => {
  const navigate = useNavigate();
  const [advisoryData, setAdvisoryData] = useState(null);
  const [formattedAdvisory, setFormattedAdvisory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Retrieve data from localStorage
    try {
      const storedData = localStorage.getItem('currentAdvisory');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setAdvisoryData(parsedData);
        
        // Format advisory for display
        const formatted = AdvisoryService.formatAdvisoryForDisplay(parsedData.advisory);
        setFormattedAdvisory(formatted);
        
        console.log('Retrieved advisory data from localStorage:', parsedData);
      } else {
        console.log('No advisory data found in localStorage');
      }
    } catch (error) {
      console.error('Error retrieving data from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cleanup effect for speech synthesis
  useEffect(() => {
    // Cleanup function
    return () => {
      // Cancel any ongoing speech when component unmounts
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsListening(false);
      }
    };
  }, []);

  // Simple effect to handle page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isListening) {
        window.speechSynthesis.cancel();
        setIsListening(false);
        console.log('Speech stopped due to tab switch');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isListening]);

  const handleListenAdvice = () => {
    if (!formattedAdvisory) return;

    // Check if browser supports Speech Synthesis
    if (!('speechSynthesis' in window)) {
      alert('Sorry, your browser does not support text-to-speech functionality.');
      return;
    }

    // If currently listening, stop the speech
    if (isListening) {
      window.speechSynthesis.cancel();
      setIsListening(false);
      console.log('Speech synthesis stopped by user');
      return;
    }

    // Cancel any existing speech first
    window.speechSynthesis.cancel();

    // Prepare the text to be spoken
    const adviceText = `
      Here is your crop advisory for ${formattedAdvisory.farmerInfo.crop} in ${formattedAdvisory.farmerInfo.season} season on ${formattedAdvisory.farmerInfo.soilType} soil.
      
      ${formattedAdvisory.recommendations.crop.title}: ${formattedAdvisory.recommendations.crop.advice}
      Confidence level: ${formattedAdvisory.recommendations.crop.confidenceText}
      
      ${formattedAdvisory.recommendations.fertilizer.title}: ${formattedAdvisory.recommendations.fertilizer.advice}
      Confidence level: ${formattedAdvisory.recommendations.fertilizer.confidenceText}
      
      ${formattedAdvisory.recommendations.irrigation.title}: ${formattedAdvisory.recommendations.irrigation.advice}
      Confidence level: ${formattedAdvisory.recommendations.irrigation.confidenceText}
      
      Overall confidence score: ${formattedAdvisory.overallConfidenceText}
      
      Follow these recommendations for optimal crop growth and maximum yield. Good luck with your farming!
    `;

    // Create speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(adviceText);
    
    // Configure speech settings
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = 'en-US';

    // Set up event handlers
    utterance.onstart = () => {
      setIsListening(true);
      console.log('Speech started successfully');
    };

    utterance.onend = () => {
      setIsListening(false);
      console.log('Speech completed');
    };

    utterance.onerror = (event) => {
      setIsListening(false);
      console.log('Speech error:', event.error);
      
      // Only show error alert for serious issues
      if (event.error === 'network-error' || event.error === 'synthesis-failed') {
        alert('Unable to play speech. Please check your internet connection and try again.');
      }
    };

    // Start speaking
    try {
      window.speechSynthesis.speak(utterance);
      console.log('Speech synthesis started');
    } catch (error) {
      console.error('Failed to start speech:', error);
      setIsListening(false);
      alert('Unable to start text-to-speech. Please try again.');
    }
  };

  const handleGiveFeedback = () => {
    navigate('/feedback');
  };

  if (loading) {
    return (
      <div className="result-container">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <h2>Analyzing Your Crop Data...</h2>
          <p>Please wait while we generate your personalized advisory</p>
        </div>
      </div>
    );
  }

  if (!advisoryData || !formattedAdvisory) {
    return (
      <div className="result-container">
        <div className="no-data-card">
          <div className="no-data-icon">📋</div>
          <h2>No Advisory Data Found</h2>
          <p>Please submit the advisory form first to get recommendations</p>
          <Link to="/advisory" className="back-btn">
            <span className="btn-icon">🌱</span>
            Get Advisory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="result-container">
      <div className="result-card">
        <div className="result-header">
          <div className="success-icon">✅</div>
          <h1>Your Crop Advisory Results</h1>
          <p>Personalized recommendations for {formattedAdvisory.farmerInfo.crop}</p>
        </div>

        <div className="crop-summary">
          <h2>Crop Information</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <div className="summary-icon">🌾</div>
              <div className="summary-info">
                <h3>Crop</h3>
                <p>{formattedAdvisory.farmerInfo.crop}</p>
              </div>
            </div>
            <div className="summary-item">
              <div className="summary-icon">{AdvisoryService.getSoilEmoji(formattedAdvisory.farmerInfo.soilType)}</div>
              <div className="summary-info">
                <h3>Soil Type</h3>
                <p>{formattedAdvisory.farmerInfo.soilType}</p>
              </div>
            </div>
            <div className="summary-item">
              <div className="summary-icon">{AdvisoryService.getSeasonEmoji(formattedAdvisory.farmerInfo.season)}</div>
              <div className="summary-info">
                <h3>Season</h3>
                <p>{formattedAdvisory.farmerInfo.season}</p>
              </div>
            </div>
            <div className="summary-item">
              <div className="summary-icon">📊</div>
              <div className="summary-info">
                <h3>Confidence</h3>
                <p style={{ color: AdvisoryService.getConfidenceColor(formattedAdvisory.overallConfidence) }}>
                  {formattedAdvisory.overallConfidenceText} ({formattedAdvisory.overallConfidence}/10)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="advisory-sections">
          <div className="advice-section">
            <div className="advice-header">
              <div className="advice-icon">🌱</div>
              <h3>{formattedAdvisory.recommendations.crop.title}</h3>
              <div className="confidence-badge" style={{ backgroundColor: AdvisoryService.getConfidenceColor(formattedAdvisory.recommendations.crop.confidence) }}>
                {formattedAdvisory.recommendations.crop.confidenceText}
              </div>
            </div>
            <div className="advice-content">
              <p>{formattedAdvisory.recommendations.crop.advice}</p>
              <div className="advice-reasoning">
                <strong>Reasoning:</strong> {formattedAdvisory.recommendations.crop.reasoning}
              </div>
            </div>
          </div>

          <div className="advice-section">
            <div className="advice-header">
              <div className="advice-icon">🧪</div>
              <h3>{formattedAdvisory.recommendations.fertilizer.title}</h3>
              <div className="confidence-badge" style={{ backgroundColor: AdvisoryService.getConfidenceColor(formattedAdvisory.recommendations.fertilizer.confidence) }}>
                {formattedAdvisory.recommendations.fertilizer.confidenceText}
              </div>
            </div>
            <div className="advice-content">
              <p>{formattedAdvisory.recommendations.fertilizer.advice}</p>
              <div className="advice-reasoning">
                <strong>Reasoning:</strong> {formattedAdvisory.recommendations.fertilizer.reasoning}
              </div>
            </div>
          </div>

          <div className="advice-section">
            <div className="advice-header">
              <div className="advice-icon">💧</div>
              <h3>{formattedAdvisory.recommendations.irrigation.title}</h3>
              <div className="confidence-badge" style={{ backgroundColor: AdvisoryService.getConfidenceColor(formattedAdvisory.recommendations.irrigation.confidence) }}>
                {formattedAdvisory.recommendations.irrigation.confidenceText}
              </div>
            </div>
            <div className="advice-content">
              <p>{formattedAdvisory.recommendations.irrigation.advice}</p>
              <div className="advice-reasoning">
                <strong>Reasoning:</strong> {formattedAdvisory.recommendations.irrigation.reasoning}
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            onClick={handleListenAdvice}
            className={`action-btn listen-btn ${isListening ? 'listening' : ''}`}
            type="button"
            aria-label={isListening ? 'Stop listening to advice' : 'Listen to advice'}
          >
            {isListening ? (
              <>
                <span className="btn-icon">⏹️</span>
                Stop Listening
              </>
            ) : (
              <>
                <span className="btn-icon">🔊</span>
                Listen Advice
              </>
            )}
          </button>

          <button 
            onClick={handleGiveFeedback}
            className="action-btn feedback-btn"
            type="button"
            aria-label="Give feedback"
          >
            <span className="btn-icon">💬</span>
            Give Feedback
          </button>
        </div>

        <div className="next-steps">
          <h2>Next Steps</h2>
          <div className="steps-grid">
            <Link to="/market" className="step-card">
              <div className="step-icon">💰</div>
              <h3>Check Market Prices</h3>
              <p>View current market rates for your crop</p>
            </Link>
            <Link to="/advisory" className="step-card">
              <div className="step-icon">🔄</div>
              <h3>New Advisory</h3>
              <p>Get advice for another crop or season</p>
            </Link>
          </div>
        </div>

        <div className="result-footer">
          <div className="advisory-meta">
            <p><strong>Advisory ID:</strong> {advisoryData.advisoryId}</p>
            <p><strong>Generated:</strong> {AdvisoryService.formatDate(formattedAdvisory.generatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisoryResult;