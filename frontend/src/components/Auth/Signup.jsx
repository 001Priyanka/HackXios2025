import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    password: '',
    confirmPassword: '',
    district: '',
    village: '',
    preferredLanguage: 'English'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear API error
    if (apiError) {
      setApiError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Contact validation (phone number only for backend compatibility)
    if (!formData.contact.trim()) {
      newErrors.contact = 'Phone number is required';
    } else {
      const phoneRegex = /^[6-9]\d{9}$/;
      
      if (!phoneRegex.test(formData.contact)) {
        newErrors.contact = 'Enter a valid 10-digit phone number starting with 6-9';
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // District validation
    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }

    // Village validation
    if (!formData.village.trim()) {
      newErrors.village = 'Village is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError('');

    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare data for API (match backend expectations)
      const signupData = {
        name: formData.name.trim(),
        phone: formData.contact.trim(), // Backend expects 'phone' field
        password: formData.password,
        location: `${formData.district.trim()}, ${formData.village.trim()}`,
        language: formData.preferredLanguage
      };

      // Send POST request to /api/auth/signup
      const result = await authService.signup(signupData);

      if (result.success) {
        // On success, redirect to login
        console.log('Signup successful:', result.data);
        alert('Account created successfully! Please login to continue.');
        navigate('/login');
      } else {
        // Handle API errors
        setApiError(result.message);
        
        // Handle field-specific errors if provided
        if (result.errors && result.errors.length > 0) {
          const fieldErrors = {};
          result.errors.forEach(error => {
            if (error.includes('phone')) fieldErrors.contact = error;
            if (error.includes('name')) fieldErrors.name = error;
            if (error.includes('password')) fieldErrors.password = error;
          });
          setErrors(fieldErrors);
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <div className="app-logo">🌾</div>
          <h1>Join CropCare</h1>
          <p>Create your account to get personalized farming advice</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {apiError && (
            <div className="api-error">
              <span className="error-icon">⚠️</span>
              {apiError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              <span className="label-icon">👤</span>
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter your full name"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="contact" className="form-label">
              <span className="label-icon">📱</span>
              Phone Number
            </label>
            <input
              type="text"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              className={`form-input ${errors.contact ? 'error' : ''}`}
              placeholder="Enter 10-digit phone number"
            />
            {errors.contact && <span className="error-message">{errors.contact}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <span className="label-icon">🔒</span>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Create a password"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              <span className="label-icon">🔒</span>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <div className="location-group">
            <div className="form-group">
              <label htmlFor="district" className="form-label">
                <span className="label-icon">🏛️</span>
                District
              </label>
              <input
                type="text"
                id="district"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className={`form-input ${errors.district ? 'error' : ''}`}
                placeholder="Enter your district"
              />
              {errors.district && <span className="error-message">{errors.district}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="village" className="form-label">
                <span className="label-icon">🏘️</span>
                Village
              </label>
              <input
                type="text"
                id="village"
                name="village"
                value={formData.village}
                onChange={handleInputChange}
                className={`form-input ${errors.village ? 'error' : ''}`}
                placeholder="Enter your village"
              />
              {errors.village && <span className="error-message">{errors.village}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="preferredLanguage" className="form-label">
              <span className="label-icon">🌐</span>
              Preferred Language
            </label>
            <select
              id="preferredLanguage"
              name="preferredLanguage"
              value={formData.preferredLanguage}
              onChange={handleInputChange}
              className="form-select"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              <>
                <span className="btn-icon">✨</span>
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="signup-footer">
          <p>Already have an account? <Link to="/login" className="login-link">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;