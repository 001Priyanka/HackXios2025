import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MarketPrices.css';

const MarketPrices = () => {
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState([]);

  // Static JSON data for crop prices
  const staticMarketData = [
    {
      id: 1,
      cropName: 'Rice',
      todayPrice: 2850,
      unit: 'per quintal',
      lastUpdated: '2024-12-29T10:30:00Z',
      change: '+2.5%',
      changeType: 'increase'
    },
    {
      id: 2,
      cropName: 'Wheat',
      todayPrice: 2200,
      unit: 'per quintal',
      lastUpdated: '2024-12-29T10:15:00Z',
      change: '-1.2%',
      changeType: 'decrease'
    },
    {
      id: 3,
      cropName: 'Cotton',
      todayPrice: 6800,
      unit: 'per quintal',
      lastUpdated: '2024-12-29T09:45:00Z',
      change: '+5.8%',
      changeType: 'increase'
    },
    {
      id: 4,
      cropName: 'Sugarcane',
      todayPrice: 350,
      unit: 'per quintal',
      lastUpdated: '2024-12-29T10:00:00Z',
      change: '0.0%',
      changeType: 'neutral'
    },
    {
      id: 5,
      cropName: 'Soybean',
      todayPrice: 4200,
      unit: 'per quintal',
      lastUpdated: '2024-12-29T10:20:00Z',
      change: '+3.1%',
      changeType: 'increase'
    },
    {
      id: 6,
      cropName: 'Corn (Maize)',
      todayPrice: 1950,
      unit: 'per quintal',
      lastUpdated: '2024-12-29T09:30:00Z',
      change: '-0.8%',
      changeType: 'decrease'
    },
    {
      id: 7,
      cropName: 'Potato',
      todayPrice: 1200,
      unit: 'per quintal',
      lastUpdated: '2024-12-29T10:10:00Z',
      change: '+8.5%',
      changeType: 'increase'
    },
    {
      id: 8,
      cropName: 'Tomato',
      todayPrice: 2500,
      unit: 'per quintal',
      lastUpdated: '2024-12-29T09:55:00Z',
      change: '-12.3%',
      changeType: 'decrease'
    },
    {
      id: 9,
      cropName: 'Onion',
      todayPrice: 1800,
      unit: 'per quintal',
      lastUpdated: '2024-12-29T10:25:00Z',
      change: '+4.2%',
      changeType: 'increase'
    },
    {
      id: 10,
      cropName: 'Groundnut',
      todayPrice: 5500,
      unit: 'per quintal',
      lastUpdated: '2024-12-29T09:40:00Z',
      change: '+1.7%',
      changeType: 'increase'
    },
    {
      id: 11,
      cropName: 'Sunflower',
      todayPrice: 6200,
      unit: 'per quintal',
      lastUpdated: '2024-12-29T10:05:00Z',
      change: '-2.1%',
      changeType: 'decrease'
    },
    {
      id: 12,
      cropName: 'Mustard',
      todayPrice: 5800,
      unit: 'per quintal',
      lastUpdated: '2024-12-29T09:50:00Z',
      change: '+6.3%',
      changeType: 'increase'
    }
  ];

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setMarketData(staticMarketData);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatLastUpdated = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getChangeIcon = (changeType) => {
    switch (changeType) {
      case 'increase':
        return '📈';
      case 'decrease':
        return '📉';
      default:
        return '➖';
    }
  };

  const getChangeClass = (changeType) => {
    switch (changeType) {
      case 'increase':
        return 'price-increase';
      case 'decrease':
        return 'price-decrease';
      default:
        return 'price-neutral';
    }
  };

  if (loading) {
    return (
      <div className="market-container">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <h2>Loading Market Prices...</h2>
          <p>Fetching latest crop prices from markets</p>
        </div>
      </div>
    );
  }

  return (
    <div className="market-container">
      <div className="market-header">
        <div className="header-content">
          <div className="market-icon">💰</div>
          <div className="header-text">
            <h1>Market Prices</h1>
            <p>Current crop prices from major agricultural markets</p>
          </div>
        </div>
        <div className="last-refresh">
          <span className="refresh-icon">🔄</span>
          <span>Last updated: {formatLastUpdated(new Date().toISOString())}</span>
        </div>
      </div>

      <div className="market-grid">
        {marketData.map((crop) => (
          <div key={crop.id} className="price-card">
            <div className="crop-header">
              <h3 className="crop-name">{crop.cropName}</h3>
              <div className={`price-change ${getChangeClass(crop.changeType)}`}>
                <span className="change-icon">{getChangeIcon(crop.changeType)}</span>
                <span className="change-value">{crop.change}</span>
              </div>
            </div>
            
            <div className="price-info">
              <div className="today-price">
                <span className="price-label">Today's Price</span>
                <span className="price-value">
                  {formatPrice(crop.todayPrice)}
                  <span className="price-unit"> {crop.unit}</span>
                </span>
              </div>
            </div>
            
            <div className="update-info">
              <span className="update-icon">⏰</span>
              <span className="update-time">
                Updated {formatLastUpdated(crop.lastUpdated)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="disclaimer-section">
        <div className="disclaimer-card">
          <div className="disclaimer-icon">⚠️</div>
          <div className="disclaimer-content">
            <h3>Important Notice</h3>
            <p>Prices shown are indicative for demo purposes.</p>
            <p>
              Actual market prices may vary based on location, quality, and market conditions. 
              Please consult local markets or authorized dealers for accurate pricing information.
            </p>
          </div>
        </div>
      </div>

      <div className="market-actions">
        <Link to="/advisory" className="action-card">
          <div className="action-icon">🌱</div>
          <h3>Get Crop Advisory</h3>
          <p>Get expert advice for your crops</p>
        </Link>
        
        <Link to="/dashboard" className="action-card">
          <div className="action-icon">📊</div>
          <h3>Back to Dashboard</h3>
          <p>Return to your main dashboard</p>
        </Link>
      </div>
    </div>
  );
};

export default MarketPrices;