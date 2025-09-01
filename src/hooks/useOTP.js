import { useState, useEffect, useRef, useCallback } from 'react';
import { sendOTP, verifyOTP } from '../services/authService';
import { OTP_CONFIG } from '../constants/validation';

/**
 * Custom hook for OTP functionality
 * @param {string} phoneNumber - Full international phone number
 * @returns {Object} - OTP utilities and state
 */
export const useOTP = (phoneNumber) => {
  const [otpDigits, setOtpDigits] = useState(Array(OTP_CONFIG.LENGTH).fill(''));
  const [timeLeft, setTimeLeft] = useState(OTP_CONFIG.EXPIRY_TIME);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Resend rate limiting
  const [resendAttempts, setResendAttempts] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);

  const inputRefs = useRef([]);

  /**
   * Start countdown timer
   */
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setError('Verification code has expired. Please request a new one.');
    }
  }, [timeLeft]);

  /**
   * Handle resend cooldown timer
   */
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendCooldown === 0 && isResendDisabled) {
      setIsResendDisabled(false);
    }
  }, [resendCooldown, isResendDisabled]);

  /**
   * Handle OTP digit input
   */
  const handleOTPChange = useCallback(
    (index, value) => {
      if (!/^\d*$/.test(value)) return; // Only allow digits

      const newOtpDigits = [...otpDigits];
      newOtpDigits[index] = value.slice(-1); // Take only the last digit
      setOtpDigits(newOtpDigits);
      setError('');

      // Auto-focus next input
      if (value && index < OTP_CONFIG.LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otpDigits],
  );

  /**
   * Handle backspace/delete
   */
  const handleKeyDown = useCallback(
    (e, index) => {
      if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otpDigits],
  );

  /**
   * Handle paste
   */
  const handlePaste = useCallback(
    (e, startIndex) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '');

      if (pastedData) {
        const newOtpDigits = [...otpDigits];
        for (let i = 0; i < Math.min(pastedData.length, OTP_CONFIG.LENGTH - startIndex); i++) {
          newOtpDigits[startIndex + i] = pastedData[i];
        }
        setOtpDigits(newOtpDigits);
        setError('');

        // Focus the next empty input or the last input
        const nextIndex = Math.min(startIndex + pastedData.length, OTP_CONFIG.LENGTH - 1);
        inputRefs.current[nextIndex]?.focus();
      }
    },
    [otpDigits],
  );

  /**
   * Verify OTP
   */
  const handleVerify = useCallback(async () => {
    const otpCode = otpDigits.join('');

    if (otpCode.length !== OTP_CONFIG.LENGTH) {
      setError('Please enter the complete verification code.');
      return { success: false };
    }

    setIsVerifying(true);
    setError('');

    try {
      const result = await verifyOTP(phoneNumber, otpCode);

      if (result.success) {
        setIsSuccess(true);
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'Verification failed. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsVerifying(false);
    }
  }, [otpDigits, phoneNumber]);

  /**
   * Resend OTP
   */
  const handleResend = useCallback(async () => {
    if (isResendDisabled) return { success: false };

    try {
      const result = await sendOTP(phoneNumber);

      if (result.success) {
        // Reset OTP state
        setOtpDigits(Array(OTP_CONFIG.LENGTH).fill(''));
        setTimeLeft(OTP_CONFIG.EXPIRY_TIME);
        setError('');
        setIsSuccess(false);

        // Update resend limiting
        const newAttempts = resendAttempts + 1;
        setResendAttempts(newAttempts);

        if (newAttempts <= OTP_CONFIG.RESEND_COOLDOWN_PERIODS.length) {
          const cooldownIndex = Math.min(newAttempts - 1, OTP_CONFIG.RESEND_COOLDOWN_PERIODS.length - 1);
          const cooldownTime = OTP_CONFIG.RESEND_COOLDOWN_PERIODS[cooldownIndex];
          setResendCooldown(cooldownTime);
          setIsResendDisabled(true);
        }

        // Focus first input
        inputRefs.current[0]?.focus();

        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'Failed to resend code. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [phoneNumber, resendAttempts, isResendDisabled]);

  /**
   * Reset OTP state
   */
  const resetOTP = useCallback(() => {
    setOtpDigits(Array(OTP_CONFIG.LENGTH).fill(''));
    setTimeLeft(OTP_CONFIG.EXPIRY_TIME);
    setIsVerifying(false);
    setError('');
    setIsSuccess(false);
    setResendAttempts(0);
    setResendCooldown(0);
    setIsResendDisabled(false);
  }, []);

  /**
   * Format time for display
   */
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    // State
    otpDigits,
    timeLeft,
    isVerifying,
    error,
    isSuccess,
    resendCooldown,
    isResendDisabled,

    // Refs
    inputRefs,

    // Actions
    handleOTPChange,
    handleKeyDown,
    handlePaste,
    handleVerify,
    handleResend,
    resetOTP,

    // Utilities
    formatTime,

    // Computed values
    isComplete: otpDigits.every((digit) => digit !== ''),
    isExpired: timeLeft === 0,
    otpCode: otpDigits.join(''),
  };
};
