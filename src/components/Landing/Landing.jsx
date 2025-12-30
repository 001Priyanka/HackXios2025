import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const languages = [
    'English',
    'हिंदी (Hindi)',
    'मराठी (Marathi)',
    'ಕನ್ನಡ (Kannada)',
    'தமிழ் (Tamil)',
    'తెలుగు (Telugu)',
    'ગુજરાતી (Gujarati)',
    'বাংলা (Bengali)'
  ];

  return (
    <div className="landing-container">
      <div className="landing-header">
        <div className="language-selector">
          <select 
            value={selectedLanguage} 
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="language-dropdown"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="landing-content">
        <div className="hero-section">
          <div className="app-icon">
            🌾
          </div>
          <h1 className="app-name">CropCare</h1>
          <h2 className="app-subtitle">Smart Crop Advisory for Farmers</h2>
          
          <div className="explanation">
            <p>
              Get expert advice for your crops right on your phone. 
              Know when to plant, what fertilizers to use, and get 
              current market prices - all in simple language.
            </p>
            <p>
              Help your crops grow better and earn more from your harvest 
              with personalized farming tips from agricultural experts.
            </p>
          </div>

          <div className="action-buttons">
            <Link to="/login" className="btn btn-primary">
              <span className="btn-icon">👤</span>
              Login
            </Link>
            <Link to="/signup" className="btn btn-secondary">
              <span className="btn-icon">📝</span>
              Sign Up
            </Link>
          </div>

          <div className="features-preview">
            <div className="feature-item">
              <span className="feature-icon">🌱</span>
              <span>Crop Advice</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💰</span>
              <span>Market Prices</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Farm Reports</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;