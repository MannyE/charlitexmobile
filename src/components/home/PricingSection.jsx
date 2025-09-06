import React from 'react';

// Countries with limited call minutes (not unlimited)
const LIMITED_MINUTES_COUNTRIES = [
  // Sorted by region and then alphabetically
  // European Countries
  { name: 'Austria', minutes: 414, region: 'Europe' },
  { name: 'Belgium', minutes: 67, region: 'Europe' },
  { name: 'Israel', minutes: 280, region: 'Europe/Middle East' },
  
  // Middle East & Asia
  { name: 'Sri Lanka', minutes: 156, region: 'Asia' },
  { name: 'United Arab Emirates', minutes: 157, region: 'Middle East' },
  
  // African Countries  
  { name: 'Ethiopia', minutes: 120, region: 'Africa' },
  { name: 'Ghana', minutes: 107, region: 'Africa' },
  { name: 'Guinea', minutes: 57, region: 'Africa' },
  { name: 'Kenya', minutes: 120, region: 'Africa' },
  { name: 'Nigeria', minutes: 219, region: 'Africa' },
  { name: 'Rwanda', minutes: 92, region: 'Africa' },
  { name: 'South Sudan', minutes: 48, region: 'Africa' },
  { name: 'Uganda', minutes: 75, region: 'Africa' },
  { name: 'Zimbabwe', minutes: 42, region: 'Africa' },
  
  // Central & South America
  { name: 'Guatemala', minutes: 155, region: 'Central America' },
  { name: 'Haiti', minutes: 82, region: 'Caribbean' },
  { name: 'Honduras', minutes: 149, region: 'Central America' },
];

// Group countries by region for better organization
const groupCountriesByRegion = (countries) => {
  return countries.reduce((groups, country) => {
    const region = country.region;
    if (!groups[region]) {
      groups[region] = [];
    }
    groups[region].push(country);
    return groups;
  }, {});
};

const PricingSection = ({ onOpenWaitlist }) => {
  const handleGetStarted = () => {
    if (onOpenWaitlist) {
      onOpenWaitlist();
    }
  };

  // Get countries grouped by region for display
  const countryGroups = groupCountriesByRegion(LIMITED_MINUTES_COUNTRIES);

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

        <div className="pricing-disclaimer-section">
          <p className="pricing-disclaimer">* Free unlimited calling to all nations except limited minutes to select countries</p>
          
          <div className="select-countries-container">
            <h4 className="select-countries-title">Countries with Minute Limitations:</h4>
            <div className="countries-by-region">
              {Object.entries(countryGroups).map(([region, countries]) => (
                <div key={region} className="region-group">
                  <h5 className="region-title">{region}</h5>
                  <div className="countries-grid">
                    {countries.map((country, index) => (
                      <div key={index} className="country-item">
                        <span className="country-name">{country.name}</span>
                        <span className="country-minutes">
                          {country.minutes} min{country.minutes !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="countries-summary">
              <p className="summary-text">
                <strong>Total: {LIMITED_MINUTES_COUNTRIES.length} countries</strong> with minute limitations. 
                All other countries enjoy unlimited calling.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
