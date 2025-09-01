import React from 'react';

const PhoneMockup = () => {
  return (
    <div className="phone-mockup">
      <div className="phone-frame">
        <div className="phone-screen">
          <div className="phone-content">
            {/* Phone UI mockup */}
            <div className="phone-header">
              <div className="status-bar">
                <span className="time">9:41</span>
                <div className="indicators">
                  <span className="signal">📶</span>
                  <span className="wifi">📶</span>
                  <span className="battery">🔋</span>
                </div>
              </div>
              <div className="app-header">
                <h3>Dashboard</h3>
              </div>
            </div>

            <div className="phone-body">
              <div className="usage-card">
                <div className="usage-title">Data Usage</div>
                <div className="usage-circle">
                  <div className="circle-progress"></div>
                  <div className="usage-text">
                    <span className="used">15.2</span>
                    <span className="total">/ 20 GB</span>
                  </div>
                </div>
              </div>

              <div className="quick-actions">
                <div className="action-item">
                  <div className="action-icon">📱</div>
                  <span>Top Up</span>
                </div>
                <div className="action-item">
                  <div className="action-icon">📊</div>
                  <span>Usage</span>
                </div>
                <div className="action-item">
                  <div className="action-icon">⚙️</div>
                  <span>Settings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;
