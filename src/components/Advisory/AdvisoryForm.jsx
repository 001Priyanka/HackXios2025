import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdvisoryService from '../../services/advisoryService';
import './AdvisoryForm.css';

const AdvisoryForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    crop: '',
    soilType: '',
    season: '',
    image: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [advisoryOptions, setAdvisoryOptions] = useState({
    soilTypes: [],
    seasons: [],
    commonCrops: []
  });
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Load advisory options on component mount
  useEffect(() => {
    loadAdvisoryOptions();
  }, []);

  const loadAdvisoryOptions = async () => {
    try {
      const response = await AdvisoryService.getAdvisoryOptions();
      if (response.success) {
        setAdvisoryOptions(response.data);
      } else {
        console.error('Failed to load advisory options:', response.error);
        // Use fallback options if API fails
        setAdvisoryOptions({
          soilTypes: ['Sandy', 'Clay', 'Loamy', 'Black', 'Red', 'Alluvial'],
          seasons: ['Kharif', 'Rabi', 'Summer', 'Winter'],
          commonCrops: ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Groundnut', 'Soybean', 'Barley', 'Millets', 'Pulses']
        });
      }
    } catch (error) {
      console.error('Error loading advisory options:', error);
      // Use fallback options
      setAdvisoryOptions({
        soilTypes: ['Sandy', 'Clay', 'Loamy', 'Black', 'Red', 'Alluvial'],
        seasons: ['Kharif', 'Rabi', 'Summer', 'Winter'],
        commonCrops: ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Groundnut', 'Soybean', 'Barley', 'Millets', 'Pulses']
      });
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user makes selection
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          image: 'Please select a valid image file (JPEG, PNG, GIF)'
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: 'Image size should be less than 5MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Clear any previous error
      if (errors.image) {
        setErrors(prev => ({
          ...prev,
          image: ''
        }));
      }
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById('image');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateForm = () => {
    // Use AdvisoryService validation
    const validation = AdvisoryService.validateAdvisoryForm(formData);
    return validation.errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        setErrors({ submit: 'Please login to generate advisory' });
        setIsSubmitting(false);
        navigate('/login');
        return;
      }

      // Generate advisory using API
      const response = await AdvisoryService.generateAdvisory({
        crop: formData.crop,
        soilType: formData.soilType,
        season: formData.season
      });

      if (response.success) {
        // Store advisory result in localStorage for the result page
        localStorage.setItem('currentAdvisory', JSON.stringify(response.data));
        
        console.log('Advisory generated successfully:', response.data);
        
        // Navigate to result page
        navigate('/result');
      } else {
        // Handle API error
        if (response.error.includes('unauthorized') || response.error.includes('token')) {
          setErrors({ submit: 'Session expired. Please login again.' });
          navigate('/login');
        } else {
          setErrors({ submit: response.error });
        }
        console.error('Advisory generation failed:', response.error);
      }
    } catch (error) {
      console.error('Error generating advisory:', error);
      if (error.message.includes('Network Error')) {
        setErrors({ submit: 'Network error. Please check your connection and try again.' });
      } else {
        setErrors({ submit: 'Failed to generate advisory. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="advisory-container">
      <div className="advisory-card">
        <div className="advisory-header">
          <div className="form-icon">🌱</div>
          <h1>Get Crop Advisory</h1>
          <p>Get personalized farming advice based on your crop and conditions</p>
        </div>

        {loadingOptions ? (
          <div className="loading-options">
            <div className="loading-spinner"></div>
            <p>Loading advisory options...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="advisory-form">
            {errors.submit && (
              <div className="error-banner">
                <span className="error-icon">⚠️</span>
                {errors.submit}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="crop" className="form-label">
                <span className="label-icon">🌾</span>
                Crop Name
              </label>
              <select
                id="crop"
                name="crop"
                value={formData.crop}
                onChange={handleInputChange}
                className={`form-select ${errors.crop ? 'error' : ''}`}
              >
                <option value="">Select your crop</option>
                {advisoryOptions.commonCrops.map((crop) => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
              {errors.crop && <span className="error-message">{errors.crop}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="soilType" className="form-label">
                <span className="label-icon">🏔️</span>
                Soil Type
              </label>
              <select
                id="soilType"
                name="soilType"
                value={formData.soilType}
                onChange={handleInputChange}
                className={`form-select ${errors.soilType ? 'error' : ''}`}
              >
                <option value="">Select soil type</option>
                {advisoryOptions.soilTypes.map((soil) => (
                  <option key={soil} value={soil}>{soil}</option>
                ))}
              </select>
              {errors.soilType && <span className="error-message">{errors.soilType}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="season" className="form-label">
                <span className="label-icon">🌤️</span>
                Season
              </label>
              <select
                id="season"
                name="season"
                value={formData.season}
                onChange={handleInputChange}
                className={`form-select ${errors.season ? 'error' : ''}`}
              >
                <option value="">Select season</option>
                {advisoryOptions.seasons.map((season) => (
                  <option key={season} value={season}>{season}</option>
                ))}
              </select>
              {errors.season && <span className="error-message">{errors.season}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="image" className="form-label">
                <span className="label-icon">📷</span>
                Upload Image (Optional)
                <span className="label-subtitle">For pest detection and better analysis</span>
              </label>
              
              {!imagePreview ? (
                <div className="image-upload-area">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="image-input"
                  />
                  <label htmlFor="image" className="image-upload-label">
                    <div className="upload-icon">📸</div>
                    <div className="upload-text">
                      <p>Click to upload image</p>
                      <span>JPEG, PNG, GIF up to 5MB</span>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="image-preview-container">
                  <div className="image-preview">
                    <img src={imagePreview} alt="Crop preview" />
                    <button 
                      type="button" 
                      className="remove-image-btn"
                      onClick={removeImage}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="image-info">
                    <p className="image-name">{formData.image?.name}</p>
                    <p className="image-size">
                      {formData.image ? (formData.image.size / 1024 / 1024).toFixed(2) + ' MB' : ''}
                    </p>
                  </div>
                </div>
              )}
              
              {errors.image && <span className="error-message">{errors.image}</span>}
            </div>

            <button 
              type="submit" 
              className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Generating Advisory...
                </>
              ) : (
                <>
                  <span className="btn-icon">🔍</span>
                  Get Advisory
                </>
              )}
            </button>
          </form>
        )}

        <div className="advisory-info">
          <div className="info-card">
            <div className="info-icon">💡</div>
            <div className="info-text">
              <h3>Expert Analysis</h3>
              <p>Get personalized recommendations from agricultural experts</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">🔬</div>
            <div className="info-text">
              <h3>AI-Powered Advice</h3>
              <p>Advanced algorithms analyze your crop conditions for optimal results</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisoryForm;