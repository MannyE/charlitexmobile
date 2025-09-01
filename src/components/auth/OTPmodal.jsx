import React, { useEffect } from 'react';
import { useOTP } from '../../hooks/useOTP';
import { useAPI } from '../../hooks/useAPI';
import { OTP_CONFIG } from '../../constants/validation';
import Button from '../ui/Button';

const OTPmodal = ({ isOpen, onClose, onSuccess, phoneNumber, appName = 'CharlitexMobileConnect' }) => {
  const { otpDigits, timeLeft, isVerifying, error, isSuccess, resendCooldown, isResendDisabled, inputRefs, handleOTPChange, handleKeyDown, handlePaste, handleVerify, handleResend, resetOTP, formatTime, isComplete, isExpired } = useOTP(phoneNumber);

  const { addToWaitlist } = useAPI();

  // Reset OTP state when modal opens
  useEffect(() => {
    if (isOpen) {
      resetOTP();
      // Focus first input after a short delay
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen, resetOTP]);

  // Handle successful OTP verification
  const handleOTPVerify = async () => {
    const verifyResult = await handleVerify();

    if (verifyResult.success) {
      // Add user to waitlist
      const waitlistResult = await addToWaitlist(phoneNumber);

      if (waitlistResult.success) {
        onSuccess();
      }
      // Error handling is done by the hooks
    }
  };

  if (!isOpen) return null;

  return (
    <div className="otp-modal-backdrop">
      <div className="otp-modal">
        <div className="otp-modal-header">
          <h2 className="otp-modal-title">Verify Your Phone</h2>
          <button
            className="otp-modal-close"
            onClick={onClose}>
            ×
          </button>
        </div>

        <div className="otp-modal-content">
          <p className="otp-instructions">We've sent a {OTP_CONFIG.LENGTH}-digit verification code to</p>
          <p className="phone-display">{phoneNumber}</p>

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
                disabled={isVerifying || isSuccess}
              />
            ))}
          </div>

          {error && (
            <div className="otp-error">
              <p>{error}</p>
            </div>
          )}

          {isSuccess && (
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
              disabled={!isComplete || isVerifying || isSuccess || isExpired}
              loading={isVerifying}
              className="verify-btn">
              {isVerifying ? 'Verifying...' : 'Verify Code'}
            </Button>

            <div className="resend-section">
              <Button
                variant="ghost"
                onClick={handleResend}
                disabled={isResendDisabled || isSuccess}
                className="resend-btn">
                {isResendDisabled ? `Resend in ${formatTime(resendCooldown)}` : 'Resend Code'}
              </Button>
            </div>
          </div>

          <div className="otp-footer">
            <p className="privacy-notice">By verifying your phone number, you agree to receive SMS notifications from {appName}.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPmodal;
