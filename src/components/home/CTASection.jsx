import React from 'react';

const CTASection = ({ onOpenWaitlist }) => {
  const handleGetStarted = () => {
    onOpenWaitlist();
  };

  return (
    <section className="cta-section">
      <div className="cta-content">
        <h2 className="cta-title">Start Making Free International Calls Today</h2>
        <p className="cta-description">Join thousands who are already saving money on international calls. Connect with your loved ones worldwide without breaking the bank.</p>
        <div className="cta-buttons">
          <button
            className="cta-primary"
            onClick={handleGetStarted}>
            Get Started Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
