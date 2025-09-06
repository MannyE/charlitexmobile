import React from 'react';
import logo from '../../assets/logos/logo-blue.png';

const Header = ({ showMobileMenu: _showMobileMenu, onMobileMenuToggle }) => {
  const handleAccountClick = () => {
    alert('Account features coming soon! This will navigate to account management.');
  };

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
