import React, { useState, useEffect } from 'react';
import logo from '../../assets/logos/logo-blue.png';

const Header = ({ showMobileMenu: _showMobileMenu, onMobileMenuToggle: _onMobileMenuToggle }) => {
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleAccountClick = () => {
    setShowComingSoon(true);
  };

  // Auto-hide the coming soon toast after 3 seconds
  useEffect(() => {
    if (showComingSoon) {
      const timer = setTimeout(() => {
        setShowComingSoon(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showComingSoon]);

  return (
    <header className="home-header">
      <div className="header-content">
        <div className="logo">
          <img src={logo} alt="Charlitex Mobile Connect" className="logo-image w-12 h-12" />
          <span className="logo-text">
            CHARLI<span className="logo-accent">MOBIL</span>
          </span>

        </div>

        <div className="header-actions">
          <div className="account-button-container">
            <button
              className="my-account-btn"
              onClick={handleAccountClick}>
              <span className="account-icon">👤</span>
              My Account
            </button>
            
            {/* Coming Soon Toast */}
            {showComingSoon && (
              <div className="coming-soon-toast">
                <div className="toast-content">
                  <span className="toast-icon">🚀</span>
                  <span className="toast-text">Coming Soon!</span>
                  <span className="toast-subtext">Account features are in development</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
