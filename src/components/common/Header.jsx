import React from 'react';

const Header = ({ showMobileMenu, onMobileMenuToggle }) => {
  const handleAccountClick = () => {
    alert('Account features coming soon! This will navigate to account management.');
  };

  return (
    <header className="home-header">
      <div className="header-content">
        <div className="logo">
          <span className="logo-text">
            CHARLI<span className="logo-accent">MOBIL</span>
          </span>
        </div>

        <div className="header-actions">
          <button
            className="my-account-btn"
            onClick={handleAccountClick}>
            <span className="account-icon">👤</span>
            My Account
          </button>

          <button
            className="mobile-menu-btn"
            onClick={onMobileMenuToggle}>
            <span className="menu-icon">☰</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
