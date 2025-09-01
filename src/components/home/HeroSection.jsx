import React from 'react';
import PhoneMockup from '../ui/PhoneMockup';

const HeroSection = ({ onOpenWaitlist }) => {
  const handleSubscribeClick = () => {
    onOpenWaitlist();
  };

  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-left">
          <h1 className="hero-title">
            Free International
            <br />
            calls to <span className="title-accent">155+</span>
            <br />
            countries worldwide
          </h1>

          <p className="hero-description">Connect with your loved ones across the globe without breaking the bank. Our cutting-edge technology delivers crystal-clear international calls at unbeatable prices.</p>

          <button
            className="subscribe-btn"
            onClick={handleSubscribeClick}>
            Join the Waitlist
            <span className="btn-arrow">→</span>
          </button>
        </div>

        <div className="hero-right">
          <PhoneMockup />
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="hero-bg">
        <div className="bg-shape bg-shape-1"></div>
        <div className="bg-shape bg-shape-2"></div>
        <div className="bg-shape bg-shape-3"></div>
      </div>
    </section>
  );
};

export default HeroSection;
