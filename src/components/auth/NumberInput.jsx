import React from 'react';
import { usePhoneValidation } from '../../hooks/usePhoneValidation';
import { useAPI } from '../../hooks/useAPI';
import { COUNTRY_VALIDATION_RULES } from '../../constants/validation';
import Popup from '../ui/Popup';
import Button from '../ui/Button';
import OTPmodal from './OTPmodal';

const NumberInput = () => {
  const [showOTPModal, setShowOTPModal] = React.useState(false);

  const { countryCode, phoneNumber, showErrorPopup, validationError, handlePhoneChange, handleCountryCodeChange, closeErrorPopup, getFullNumber, isReadyForOTP } = usePhoneValidation('+1');

  const { isLoading, error: apiError, showApiErrorPopup, showDuplicatePopup, sendOTPWithCheck, closeApiErrorPopup, closeDuplicatePopup } = useAPI();

  const handleSendOTP = async () => {
    if (!isReadyForOTP) return;

    const fullPhoneNumber = getFullNumber();
    const result = await sendOTPWithCheck(fullPhoneNumber);

    if (result.success) {
      setShowOTPModal(true);
    }
    // Errors are handled by the useAPI hook
  };

  const handleOTPSuccess = () => {
    setShowOTPModal(false);
    // Could redirect or show success message
    alert("Successfully joined waitlist! We'll notify you when we launch.");
  };

  const handleOTPClose = () => {
    setShowOTPModal(false);
  };

  const isRateLimitError = apiError?.toLowerCase().includes('rate') || apiError?.toLowerCase().includes('limit') || apiError?.toLowerCase().includes('wait');

  return (
    <div className="waitlist-container">
      <div className="waitlist-content">
        {/* Header */}
        <div className="waitlist-header">
          <h1 className="waitlist-title">
            Coming <span className="title-highlight">Soon</span>
          </h1>
          <p className="waitlist-subtitle">Get notified when we launch and be among the first to experience the future of connectivity</p>
        </div>

        {/* Phone Input Form */}
        <div className="phone-input-section">
          <div className="input-group">
            <div className="country-select-wrapper">
              <select
                className="country-select"
                value={countryCode}
                onChange={(e) => handleCountryCodeChange(e.target.value)}>
                {Object.entries(COUNTRY_VALIDATION_RULES).map(([code, rule]) => (
                  <option
                    key={code}
                    value={code}>
                    {rule.flag} {code}
                  </option>
                ))}
              </select>
            </div>

            <div className="phone-input-wrapper">
              <input
                type="tel"
                className="phone-input"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                maxLength={20}
              />
            </div>
          </div>

          <Button
            variant="primary"
            size="large"
            onClick={handleSendOTP}
            disabled={!isReadyForOTP}
            loading={isLoading}
            className="send-otp-btn">
            {isLoading ? 'Sending...' : 'Send Verification Code'}
          </Button>
        </div>

        {/* Features Preview */}
        <div className="features-preview">
          <div className="feature-item">
            <div className="feature-icon">🚀</div>
            <span>5G Speed</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">💰</div>
            <span>Affordable</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🛡️</div>
            <span>Reliable</span>
          </div>
        </div>
      </div>

      {/* Error Popup */}
      <Popup
        isOpen={showErrorPopup}
        onClose={closeErrorPopup}
        type="error"
        title="Invalid Phone Number"
        message={validationError}
      />

      {/* API Error Popup */}
      <Popup
        isOpen={showApiErrorPopup}
        onClose={closeApiErrorPopup}
        type="error"
        title={isRateLimitError ? 'Rate Limited' : 'Error'}
        message={apiError}
        className={isRateLimitError ? 'rate-limit-popup' : ''}
      />

      {/* Duplicate User Popup */}
      <Popup
        isOpen={showDuplicatePopup}
        onClose={closeDuplicatePopup}
        type="success"
        title="Already on Waitlist!"
        message="You're already on our waitlist! We'll notify you when we launch."
      />

      {/* OTP Modal */}
      <OTPmodal
        isOpen={showOTPModal}
        onClose={handleOTPClose}
        onSuccess={handleOTPSuccess}
        phoneNumber={getFullNumber()}
      />
    </div>
  );
};

export default NumberInput;
