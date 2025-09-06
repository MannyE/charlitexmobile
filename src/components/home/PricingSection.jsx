import React from 'react';

const PricingSection = ({ onOpenWaitlist }) => {
  const handleGetStarted = () => {
    if (onOpenWaitlist) {
      onOpenWaitlist();
    }
  };

  return (
    <section
      className="pricing-section-wrapper"
      id="pricing"
      aria-labelledby="pricing-heading">
      <div className="pricing-content">
        <h2
          id="pricing-heading"
          className="pricing-title">
          Affordable International Calling Plans - Pricing That Fits Your Budget
        </h2>
        <div
          className="pricing-cards"
          role="list">
          <div className="pricing-card essentials">
            <div className="card-badge">STARTER</div>
            <div className="card-header">
              <div className="card-icon">💎</div>
              <h3>Essentials</h3>
              <div className="price-container">
                <div className="price">
                  $20<span>/mo</span>
                </div>
                <div className="price-description">Perfect for personal use</div>
              </div>
            </div>
            <ul className="features">
              <li>
                <span className="feature-icon">📞</span>
                <span className="feature-text">Unlimited Calls (US recipients)</span>
              </li>
              <li>
                <span className="feature-icon">🌍</span>
                <span className="feature-text">Unlimited International Calls *</span>
              </li>
              <li>
                <span className="feature-icon">💰</span>
                <span className="feature-text">$40 setup fee</span>
              </li>
            </ul>
            <button
              className="card-cta"
              onClick={handleGetStarted}>
              Get Started
            </button>
          </div>

          <div className="pricing-card premium">
            <div className="card-badge popular">MOST POPULAR</div>
            <div className="card-header">
              <div className="card-icon">👑</div>
              <h3>Premium</h3>
              <div className="price-container">
                <div className="price">
                  $55<span>/mo</span>
                </div>
                <div className="price-description">Everything you need & more</div>
              </div>
            </div>
            <ul className="features">
              <li>
                <span className="feature-icon">📞</span>
                <span className="feature-text">Unlimited Calls (US recipients)</span>
              </li>
              <li>
                <span className="feature-icon">📶</span>
                <span className="feature-text">Unlimited Data + Hotspot (US)</span>
              </li>
              <li>
                <span className="feature-icon">🌍</span>
                <span className="feature-text">Unlimited International Calls *</span>
              </li>
              <li>
                <span className="feature-icon">💰</span>
                <span className="feature-text">$50 setup fee</span>
              </li>
              <li>
                <span className="feature-icon">✈️</span>
                <span className="feature-text">20GB international roaming</span>
              </li>
            </ul>
            <button
              className="card-cta"
              onClick={handleGetStarted}>
              Choose Premium
            </button>
          </div>
        </div>

        <p className="pricing-disclaimer">* Free unlimited calling to all nations except limited minutes to select countries</p>
      </div>
    </section>
  );
};

export default PricingSection;
