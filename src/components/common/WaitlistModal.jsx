import React, { useState, useEffect } from 'react';
import { usePhoneValidation } from '../../hooks/usePhoneValidation';
import { useAPI } from '../../hooks/useAPI';
import { useOTP } from '../../hooks/useOTP';
import { COUNTRY_VALIDATION_RULES, OTP_CONFIG } from '../../constants/validation';
import Button from '../ui/Button';
import Popup from '../ui/Popup';

const WaitlistModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState('phone'); // 'phone', 'otp', 'success'
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Phone validation hook
  const { countryCode, phoneNumber, showErrorPopup, validationError, handlePhoneChange, handleCountryCodeChange, closeErrorPopup, getFullNumber, isReadyForOTP, resetValidation } = usePhoneValidation('+1');

  // API hook
  const { isLoading, error: apiError, showApiErrorPopup, showDuplicatePopup, sendOTPWithCheck, addToWaitlist, closeApiErrorPopup, closeDuplicatePopup, resetAPIState } = useAPI();

  // OTP hook
  const { otpDigits, timeLeft, isVerifying, error: otpError, isSuccess: otpSuccess, resendCooldown, isResendDisabled, inputRefs, handleOTPChange, handleKeyDown, handlePaste, handleVerify, handleResend, resetOTP, formatTime, isComplete, isExpired } = useOTP(getFullNumber());

  // Reset all states when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('phone');
      setIsTransitioning(false);
      resetValidation();
      resetAPIState();
      resetOTP();
    }
  }, [isOpen, resetValidation, resetAPIState, resetOTP]);

  // Handle sending OTP
  const handleSendOTP = async () => {
    if (!isReadyForOTP) return;

    const result = await sendOTPWithCheck(getFullNumber());
    if (result.success) {
      // Transition to OTP step
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep('otp');
        setIsTransitioning(false);
        // Focus first OTP input
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      }, 300);
    }
  };

  // Handle OTP verification
  const handleOTPVerify = async () => {
    const verifyResult = await handleVerify();

    if (verifyResult.success) {
      // Add user to waitlist
      const waitlistResult = await addToWaitlist(getFullNumber());

      if (waitlistResult.success) {
        // Transition to success step
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentStep('success');
          setIsTransitioning(false);
        }, 300);
      }
    }
  };

  // Handle modal close
  const handleClose = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  // Back to phone step
  const handleBackToPhone = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep('phone');
      setIsTransitioning(false);
      resetOTP();
    }, 300);
  };

  // Final close after success
  const handleSuccessClose = () => {
    handleClose();
  };

  if (!isOpen) return null;

  const isRateLimitError = apiError?.toLowerCase().includes('rate') || apiError?.toLowerCase().includes('limit') || apiError?.toLowerCase().includes('wait');

  return (
    <div
      className="waitlist-modal-backdrop"
      onClick={handleClose}>
      <div
        className={`waitlist-modal ${isTransitioning ? 'transitioning' : ''}`}
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="waitlist-modal-header">
          <h2 className="waitlist-modal-title">
            {currentStep === 'phone' && 'Join Our Waitlist'}
            {currentStep === 'otp' && 'Verify Your Phone'}
            {currentStep === 'success' && 'Welcome Aboard!'}
          </h2>
          <button
            className="waitlist-modal-close"
            onClick={handleClose}>
            ×
          </button>
        </div>

        {/* Content */}
        <div className="waitlist-modal-content">
          {/* Phone Input Step */}
          {currentStep === 'phone' && (
            <div className="phone-step">
              <p className="step-description">Get notified when we launch and be among the first to experience international calling made simple.</p>

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
          )}

          {/* OTP Verification Step */}
          {currentStep === 'otp' && (
            <div className="otp-step">
              <p className="step-description">We've sent a {OTP_CONFIG.LENGTH}-digit verification code to</p>
              <p className="phone-display">{getFullNumber()}</p>

              <div className="otp-input-container">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="1"
                    className={`otp-digit ${digit ? 'filled' : ''}`}
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={(e) => handlePaste(e, index)}
                    disabled={isVerifying || otpSuccess}
                  />
                ))}
              </div>

              {otpError && (
                <div className="otp-error">
                  <p>{otpError}</p>
                </div>
              )}

              {otpSuccess && (
                <div className="otp-success">
                  <p>✅ Verification successful!</p>
                </div>
              )}

              <div className="otp-timer">{timeLeft > 0 ? <p>Code expires in {formatTime(timeLeft)}</p> : <p>Code has expired</p>}</div>

              <div className="otp-actions">
                <Button
                  variant="primary"
                  size="large"
                  onClick={handleOTPVerify}
                  disabled={!isComplete || isVerifying || otpSuccess || isExpired}
                  loading={isVerifying}
                  className="verify-btn">
                  {isVerifying ? 'Verifying...' : 'Verify Code'}
                </Button>

                <div className="resend-section">
                  <Button
                    variant="ghost"
                    onClick={handleResend}
                    disabled={isResendDisabled || otpSuccess}
                    className="resend-btn">
                    {isResendDisabled ? `Resend in ${formatTime(resendCooldown)}` : 'Resend Code'}
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="medium"
                  onClick={handleBackToPhone}
                  className="back-btn">
                  ← Change Number
                </Button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {currentStep === 'success' && (
            <div className="success-step">
              <div className="success-icon">🎉</div>
              <h3 className="success-title">You're on the list!</h3>
              <p className="success-description">Thank you for joining our waitlist! We'll notify you as soon as we launch and you'll be among the first to experience seamless international calling.</p>

              <div className="success-features">
                <div className="feature-item">
                  <span className="feature-icon">📱</span>
                  <span>Early access to the app</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">💰</span>
                  <span>Special launch pricing</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🎯</span>
                  <span>Premium features included</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="large"
                onClick={handleSuccessClose}
                className="success-btn">
                Got it, thanks!
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Error Popups */}
      <Popup
        isOpen={showErrorPopup}
        onClose={closeErrorPopup}
        type="error"
        title="Invalid Phone Number"
        message={validationError}
      />

      <Popup
        isOpen={showApiErrorPopup}
        onClose={closeApiErrorPopup}
        type="error"
        title={isRateLimitError ? 'Rate Limited' : 'Error'}
        message={apiError}
        className={isRateLimitError ? 'rate-limit-popup' : ''}
      />

      <Popup
        isOpen={showDuplicatePopup}
        onClose={closeDuplicatePopup}
        type="success"
        title="Already on Waitlist!"
        message="You're already on our waitlist! We'll notify you when we launch."
      />
    </div>
  );
};

export default WaitlistModal;
