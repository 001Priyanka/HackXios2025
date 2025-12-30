import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
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
              <div className="stat-icon">🌾</div>
              <div className="stat-info">
                <h3>Active Crops</h3>
                <p className="stat-number">3</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <h3>Advisories Received</h3>
                <p className="stat-number">12</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-info">
                <h3>Success Rate</h3>
                <p className="stat-number">85%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;