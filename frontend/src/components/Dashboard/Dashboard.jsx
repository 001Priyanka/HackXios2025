import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import AdvisoryService from '../../services/advisoryService';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [advisories, setAdvisories] = useState([]);
  const [advisoriesLoading, setAdvisoriesLoading] = useState(true);
  const [advisoriesError, setAdvisoriesError] = useState(null);
  const [stats, setStats] = useState({
    totalAdvisories: 0,
    averageConfidence: 0,
    recentAdvisory: null
  });

  useEffect(() => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Get user data from localStorage
    const userData = authService.getCurrentUser();
    if (userData) {
      setUser(userData);
    }
    
    setLoading(false);

    // Load advisory history
    loadAdvisoryHistory();
  }, [navigate]);

  const loadAdvisoryHistory = async () => {
    try {
      setAdvisoriesLoading(true);
      setAdvisoriesError(null);

      // Fetch last 3 advisories
      const response = await AdvisoryService.getAdvisoryHistory(1, 3);
      
      if (response.success) {
        setAdvisories(response.data.advisories);
        
        // Update stats from pagination data
        setStats(prev => ({
          ...prev,
          totalAdvisories: response.data.pagination.totalAdvisories,
          recentAdvisory: response.data.advisories[0] || null
        }));

        // Get additional stats if available
        try {
          const statsResponse = await AdvisoryService.getAdvisoryStats();
          if (statsResponse.success) {
            setStats(prev => ({
              ...prev,
              averageConfidence: statsResponse.data.averageConfidence || 0
            }));
          }
        } catch (statsError) {
          console.log('Stats not available:', statsError);
        }

      } else {
        setAdvisoriesError(response.error);
        console.error('Failed to load advisory history:', response.error);
      }
    } catch (error) {
      setAdvisoriesError('Failed to load advisory history');
      console.error('Error loading advisory history:', error);
    } finally {
      setAdvisoriesLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const viewAdvisoryDetails = (advisory) => {
    // Store the advisory data for the result page
    const advisoryForDisplay = {
      advisoryId: advisory.id,
      advisory: {
        advisoryId: advisory.id,
        farmerInfo: {
          farmerId: user.id,
          crop: advisory.crop,
          soilType: advisory.soilType,
          season: advisory.season
        },
        recommendations: {
          crop: {
            advice: advisory.summary.cropAdvice.replace('...', ''),
            confidence: advisory.confidenceScore,
            reasoning: `Recommendation for ${advisory.crop} in ${advisory.season} season`
          },
          fertilizer: {
            advice: advisory.summary.fertilizerAdvice.replace('...', ''),
            confidence: advisory.confidenceScore,
            reasoning: `Fertilizer guidance for ${advisory.soilType} soil`
          },
          irrigation: {
            advice: advisory.summary.irrigationAdvice.replace('...', ''),
            confidence: advisory.confidenceScore,
            reasoning: `Irrigation schedule for ${advisory.season} season`
          }
        },
        overallConfidence: advisory.confidenceScore,
        generatedAt: advisory.createdAt
      }
    };

    localStorage.setItem('currentAdvisory', JSON.stringify(advisoryForDisplay));
    navigate('/result');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="error">
          <p>Unable to load user data. Please login again.</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="welcome-section">
          <div className="user-avatar">👨‍🌾</div>
          <div className="welcome-text">
            <h1>Welcome back, {user.name}!</h1>
            <p>Phone: {user.phone} | Location: {user.location || 'Not specified'}</p>
            <p>Language: {user.language}</p>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={handleLogout} className="logout-btn">
            <span className="logout-icon">🚪</span>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-grid">
            <Link to="/advisory" className="action-card">
              <div className="action-icon">🌱</div>
              <h3>Get Advisory</h3>
              <p>Get expert advice for your crops</p>
            </Link>
            
            <Link to="/market" className="action-card">
              <div className="action-icon">💰</div>
              <h3>Market Prices</h3>
              <p>Check current market rates</p>
            </Link>
            
            <Link to="/result" className="action-card">
              <div className="action-icon">📊</div>
              <h3>View Results</h3>
              <p>See your advisory results</p>
            </Link>
            
            <Link to="/feedback" className="action-card">
              <div className="action-icon">💬</div>
              <h3>Feedback</h3>
              <p>Share your experience</p>
            </Link>
          </div>
        </div>

        <div className="dashboard-stats">
          <h2>Your Farm Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <h3>Total Advisories</h3>
                <p className="stat-number">{stats.totalAdvisories}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-info">
                <h3>Avg Confidence</h3>
                <p className="stat-number">{stats.averageConfidence ? `${stats.averageConfidence}/10` : 'N/A'}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🌾</div>
              <div className="stat-info">
                <h3>Recent Crop</h3>
                <p className="stat-number">{stats.recentAdvisory?.crop || 'None'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="recent-advisories">
          <div className="section-header">
            <h2>Recent Advisories</h2>
            <Link to="/advisory" className="view-all-btn">
              Get New Advisory
            </Link>
          </div>

          {advisoriesLoading ? (
            <div className="advisories-loading">
              <div className="spinner"></div>
              <p>Loading your advisories...</p>
            </div>
          ) : advisoriesError ? (
            <div className="advisories-error">
              <div className="error-icon">⚠️</div>
              <p>{advisoriesError}</p>
              <button onClick={loadAdvisoryHistory} className="retry-btn">
                Try Again
              </button>
            </div>
          ) : advisories.length === 0 ? (
            <div className="empty-advisories">
              <div className="empty-icon">📋</div>
              <h3>No Advisories Yet</h3>
              <p>Get your first crop advisory to see personalized recommendations</p>
              <Link to="/advisory" className="get-advisory-btn">
                <span className="btn-icon">🌱</span>
                Get Your First Advisory
              </Link>
            </div>
          ) : (
            <div className="advisories-list">
              {advisories.map((advisory) => (
                <div key={advisory.id} className="advisory-item">
                  <div className="advisory-main">
                    <div className="advisory-crop">
                      <div className="crop-icon">{AdvisoryService.getSoilEmoji(advisory.soilType)}</div>
                      <div className="crop-info">
                        <h4>{advisory.crop}</h4>
                        <p>{advisory.soilType} • {advisory.season}</p>
                      </div>
                    </div>
                    
                    <div className="advisory-meta">
                      <div className="advisory-date">
                        <span className="date-icon">📅</span>
                        {AdvisoryService.formatDate(advisory.createdAt)}
                      </div>
                      <div 
                        className="confidence-score"
                        style={{ color: AdvisoryService.getConfidenceColor(advisory.confidenceScore) }}
                      >
                        <span className="confidence-icon">🎯</span>
                        {advisory.confidenceScore}/10
                      </div>
                    </div>
                  </div>
                  
                  <div className="advisory-summary">
                    <div className="summary-item">
                      <strong>Crop:</strong> {advisory.summary.cropAdvice}
                    </div>
                    <div className="summary-item">
                      <strong>Fertilizer:</strong> {advisory.summary.fertilizerAdvice}
                    </div>
                    <div className="summary-item">
                      <strong>Irrigation:</strong> {advisory.summary.irrigationAdvice}
                    </div>
                  </div>
                  
                  <div className="advisory-actions">
                    <button 
                      onClick={() => viewAdvisoryDetails(advisory)}
                      className="view-details-btn"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
              
              {stats.totalAdvisories > 3 && (
                <div className="view-all-container">
                  <Link to="/advisory/history" className="view-all-advisories-btn">
                    View All {stats.totalAdvisories} Advisories
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;