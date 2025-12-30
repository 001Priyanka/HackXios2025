import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    contact: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

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
      // Prepare credentials for API (match backend expectations)
      const credentials = {
        phone: formData.contact.trim(), // Backend expects 'phone' field
        password: formData.password
      };

      // Send POST request to /api/auth/login
      const result = await authService.login(credentials);

      if (result.success) {
        // On success: JWT token and user profile stored in localStorage
        console.log('Login successful:', {
          user: result.user,
          token: result.token ? 'Token received' : 'No token',
          timestamp: new Date().toISOString()
        });

        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        // Handle API errors
        setApiError(result.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="app-logo">🌾</div>
          <h1>Welcome Back</h1>
          <p>Sign in to access your CropCare dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {apiError && (
            <div className="api-error">
              <span className="error-icon">⚠️</span>
              {apiError}
            </div>
          )}

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
              autoComplete="username"
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
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Signing In...
              </>
            ) : (
              <>
                <span className="btn-icon">🚀</span>
                Login
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <Link to="/signup" className="signup-link">Create Account</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;