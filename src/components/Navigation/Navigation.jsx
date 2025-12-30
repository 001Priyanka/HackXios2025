import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.navigation')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" onClick={closeMenu}>CropCare</Link>
        </div>
        
        <button 
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <div className="nav-links-container">
            <Link to="/" onClick={closeMenu} className="nav-link">
              <span className="nav-icon">🏠</span>
              Home
            </Link>
            <Link to="/signup" onClick={closeMenu} className="nav-link">
              <span className="nav-icon">📝</span>
              Signup
            </Link>
            <Link to="/login" onClick={closeMenu} className="nav-link">
              <span className="nav-icon">👤</span>
              Login
            </Link>
            <Link to="/dashboard" onClick={closeMenu} className="nav-link">
              <span className="nav-icon">📊</span>
              Dashboard
            </Link>
            <Link to="/advisory" onClick={closeMenu} className="nav-link">
              <span className="nav-icon">🌱</span>
              Advisory
            </Link>
            <Link to="/result" onClick={closeMenu} className="nav-link">
              <span className="nav-icon">📋</span>
              Results
            </Link>
            <Link to="/market" onClick={closeMenu} className="nav-link">
              <span className="nav-icon">💰</span>
              Market
            </Link>
            <Link to="/feedback" onClick={closeMenu} className="nav-link">
              <span className="nav-icon">💬</span>
              Feedback
            </Link>
          </div>
        </div>
      </div>
      
      {isMenuOpen && <div className="nav-overlay" onClick={closeMenu}></div>}
    </nav>
  );
};

export default Navigation;