import React from 'react';
import PhoneMockup from '../ui/PhoneMockup';

const HeroSection = ({ onOpenWaitlist }) => {
  const handleSubscribeClick = () => {
    onOpenWaitlist();
  };

  return (
    <section
      className="hero-section"
      role="banner">
      <div className="hero-content">
        <div className="hero-left">
          <h1 className="hero-title">
            Free International Calls to{' '}
            <span
              className="title-accent"
              aria-label="155 plus">
              155+
            </span>{' '}
            Countries Worldwide
          </h1>

          <p className="hero-description">Connect with your loved ones across the globe without breaking the bank. Our cutting-edge VoIP technology delivers crystal-clear international calls with unlimited minutes to over 155 countries at unbeatable prices starting from just $15/month.</p>

          <button
            className="subscribe-btn"
            onClick={handleSubscribeClick}
            aria-label="Join the waitlist for international calling service">
            Join the Waitlist
            <span
              className="btn-arrow"
              aria-hidden="true">
              →
            </span>
          </button>
        </div>

        <div className="hero-right">
          <PhoneMockup />
        </div>
      </div>

      {/* Background decorative elements */}
      <div
        className="hero-bg"
        aria-hidden="true">
        <div className="bg-shape bg-shape-1"></div>
        <div className="bg-shape bg-shape-2"></div>
        <div className="bg-shape bg-shape-3"></div>
      </div>
    </section>
  );
};

export default HeroSection;
