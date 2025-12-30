import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Feedback.css';

const Feedback = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    wasHelpful: '',
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleRadioChange = (e) => {
    setFormData(prev => ({
      ...prev,
      wasHelpful: e.target.value
    }));
  };

  const handleCommentChange = (e) => {
    setFormData(prev => ({
      ...prev,
      comment: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required field
    if (!formData.wasHelpful) {
      alert('Please select whether the advice was helpful or not.');
      return;
    }

    setIsSubmitting(true);

    // Prepare feedback data
    const feedbackEntry = {
      id: Date.now(),
      wasHelpful: formData.wasHelpful === 'yes',
      comment: formData.comment.trim(),
      submittedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    };

    try {
      // Get existing feedback history from localStorage
      const existingFeedback = localStorage.getItem('feedbackHistory');
      let feedbackHistory = [];
      
      if (existingFeedback) {
        feedbackHistory = JSON.parse(existingFeedback);
      }
      
      // Add new feedback to history
      feedbackHistory.push(feedbackEntry);
      
      // Save updated feedback history to localStorage
      localStorage.setItem('feedbackHistory', JSON.stringify(feedbackHistory));
      
      console.log('Feedback saved to localStorage:', feedbackEntry);
      console.log('Total feedback entries:', feedbackHistory.length);
      
      // Show thank you message
      setTimeout(() => {
        setIsSubmitting(false);
        setShowThankYou(true);
        
        // Redirect to dashboard after showing thank you message
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
        
      }, 1000);
      
    } catch (error) {
      console.error('Error saving feedback:', error);
      setIsSubmitting(false);
      alert('Error saving feedback. Please try again.');
    }
  };

  if (showThankYou) {
    return (
      <div className="feedback-container">
        <div className="thank-you-card">
          <div className="thank-you-icon">🙏</div>
          <h1>Thank You!</h1>
          <p>Your feedback has been submitted successfully.</p>
          <p>We appreciate your input and will use it to improve our services.</p>
          <div className="redirect-info">
            <span className="redirect-spinner"></span>
            <span>Redirecting to dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        <div className="feedback-header">
          <div className="feedback-icon">💬</div>
          <h1>Share Your Feedback</h1>
          <p>Help us improve CropCare by sharing your experience</p>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="question-section">
            <h2 className="question-title">Was this advice helpful?</h2>
            
            <div className="radio-group">
              <div className="radio-option">
                <input
                  type="radio"
                  id="helpful-yes"
                  name="wasHelpful"
                  value="yes"
                  checked={formData.wasHelpful === 'yes'}
                  onChange={handleRadioChange}
                  className="radio-input"
                />
                <label htmlFor="helpful-yes" className="radio-label">
                  <div className="radio-custom">
                    <div className="radio-dot"></div>
                  </div>
                  <div className="radio-content">
                    <span className="radio-icon">👍</span>
                    <span className="radio-text">Yes, it was helpful</span>
                  </div>
                </label>
              </div>

              <div className="radio-option">
                <input
                  type="radio"
                  id="helpful-no"
                  name="wasHelpful"
                  value="no"
                  checked={formData.wasHelpful === 'no'}
                  onChange={handleRadioChange}
                  className="radio-input"
                />
                <label htmlFor="helpful-no" className="radio-label">
                  <div className="radio-custom">
                    <div className="radio-dot"></div>
                  </div>
                  <div className="radio-content">
                    <span className="radio-icon">👎</span>
                    <span className="radio-text">No, it wasn't helpful</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="comment-section">
            <label htmlFor="comment" className="comment-label">
              <span className="label-icon">💭</span>
              Additional Comments (Optional)
            </label>
            <textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleCommentChange}
              className="comment-textarea"
              placeholder="Tell us more about your experience or suggestions for improvement..."
              rows="4"
              maxLength="500"
            />
            <div className="character-count">
              {formData.comment.length}/500 characters
            </div>
          </div>

          <button 
            type="submit" 
            className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Submitting Feedback...
              </>
            ) : (
              <>
                <span className="btn-icon">📤</span>
                Submit Feedback
              </>
            )}
          </button>
        </form>

        <div className="feedback-info">
          <div className="info-card">
            <div className="info-icon">🔒</div>
            <div className="info-text">
              <h3>Privacy Notice</h3>
              <p>Your feedback is stored locally and helps us improve our services</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">⭐</div>
            <div className="info-text">
              <h3>Your Opinion Matters</h3>
              <p>Every feedback helps us provide better agricultural advice</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;