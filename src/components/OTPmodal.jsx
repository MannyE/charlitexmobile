import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';

/* 
  Database Schema (matches your Supabase setup):
  
  create table public.waitlist (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    phone text not null,
    consent boolean not null default true,
    created_at timestamptz not null default now(),
    unique (phone),
    unique (user_id)
  );
*/

const OTPmodal = ({ isOpen, onClose, appName = 'CharlitexMobileConnect', phoneNumber }) => {
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Resend rate limiting state
  const [resendAttempts, setResendAttempts] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0); // Start with no cooldown
  const [isResendDisabled, setIsResendDisabled] = useState(false); // Allow immediate resend initially

  // Resend cooldown periods (in seconds): 1min, 3min, 5min, 15min
  const RESEND_COOLDOWN_PERIODS = [60, 180, 300, 900];

  // Refs for input fields
  const inputRefs = useRef([]);

  // Database functions

  const addUserToDatabase = async (phoneNumber) => {
    try {
      // console.log('Attempting to add user to database:', phoneNumber);

      // Get the current authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        // console.error('User not authenticated:', userError);
        throw new Error('User must be authenticated to join waitlist');
      }

      // console.log('Authenticated user ID:', user.id);

      const { data, error } = await supabase
        .from('waitlist')
        .insert([
          {
            user_id: user.id,
            phone: phoneNumber,
            consent: true,
          },
        ])
        .select();

      if (error) {
        // Supabase error details logged
        throw error;
      }

      // console.log('User added to waitlist successfully:', data);
      return data;
    } catch {
      // console.error('Complete error object:', err);
      throw err;
    }
  };

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;

    if (timeLeft <= 0) {
      setError('Verification code has expired. Please request a new one.');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setError('Verification code has expired. Please request a new one.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  // Resend cooldown timer
  useEffect(() => {
    if (!isOpen || !isResendDisabled || resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          setIsResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isResendDisabled, resendCooldown]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtpDigits(['', '', '', '', '', '']);
      setError('');
      setIsSuccess(false);
      setIsVerifying(false);

      setTimeLeft(60); // Reset timer to 60 seconds

      // Reset resend state - allow immediate resend on first open
      setResendAttempts(0);
      setResendCooldown(0);
      setIsResendDisabled(false); // Allow immediate resend when modal opens

      // Focus first input after modal renders
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Format time as minutes and seconds
  const formatTime = (seconds) => {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  };

  // Format resend cooldown time
  const formatResendTime = (seconds) => {
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      if (remainingSeconds === 0) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
      }
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  };

  // Handle OTP digit input
  const handleDigitChange = (index, value) => {
    // Only allow single digit
    if (value.length > 1) return;

    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    setError(''); // Clear error on new input

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newDigits = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtpDigits(newDigits);

    // Focus next empty input or last input
    const nextEmptyIndex = newDigits.findIndex((digit) => digit === '');
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  // Verify OTP code
  const handleVerify = async () => {
    // Combine all digits into a single string
    const code = otpDigits.join('');

    // Check if the code is exactly 6 digits
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    // Set verifying state
    setIsVerifying(true);
    setError('');

    // Try to verify the OTP code
    try {
      const result = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: code,
        type: 'sms',
      });

      // If there is an error, set the error message
      if (result.error) {
        let errorMessage = '';

        if (typeof result.error === 'string') {
          errorMessage = result.error;
        } else if (result.error.message) {
          const msg = result.error.message.toLowerCase();

          // Map common error messages to user-friendly versions
          if (msg.includes('invalid') || msg.includes('incorrect')) {
            errorMessage = 'Invalid verification code. Please try again.';
          } else if (msg.includes('expired')) {
            errorMessage = 'Verification code has expired. Please request a new one.';
          } else if (msg.includes('too many')) {
            errorMessage = 'Too many attempts. Please wait before trying again.';
          } else {
            errorMessage = result.error.message;
          }
        } else {
          errorMessage = 'Verification failed. Please try again.';
        }

        setError(errorMessage);
      } else {
        // If the OTP code is verified successfully, add user to database
        // console.log('OTP verified successfully');

        // Add user to database (duplicate check already done before OTP was sent)
        try {
          await addUserToDatabase(phoneNumber);
          setIsSuccess(true);
          // Close modal after 2 seconds to show success message
          setTimeout(() => {
            onClose();
          }, 2000);
        } catch {
          // console.error('Failed to add user to database:', err);

          // Provide more specific error messages based on error type
          let errorMessage = 'Successfully verified, but failed to join waitlist. Please contact support.';

          if (err.message?.includes('User must be authenticated')) {
            errorMessage = 'Authentication error. Please try signing in again.';
          } else if (err.code === '42P01') {
            errorMessage = 'Database setup incomplete. Please contact support.';
          } else if (err.code === '23505') {
            // This handles both unique phone and unique user_id constraints
            if (err.message?.includes('phone')) {
              errorMessage = 'This phone number is already on our waitlist!';
            } else {
              errorMessage = 'You are already on our waitlist!';
            }
          } else if (err.message?.includes('Failed to fetch')) {
            errorMessage = 'Network connection issue. Please check your internet and try again.';
          } else if (err.code === 'PGRST301') {
            errorMessage = 'Database permissions issue. Please contact support.';
          }

          setError(errorMessage);
        }
      }
    } catch {
      // If there is an error, set the error message
      // console.error('OTP verification error:', err);
      setError('Verification failed. Please try again.');
    } finally {
      // Set the verifying state to false
      setIsVerifying(false);
    }
  };

  // Resend OTP with progressive cooldown
  const handleResend = async () => {
    if (isResendDisabled) return;

    // Reset the OTP digits, error, and time left
    setOtpDigits(['', '', '', '', '', '']);
    setError('');
    setTimeLeft(60); // Reset timer

    // Increment attempts and set next cooldown period
    const newAttempts = resendAttempts + 1;
    setResendAttempts(newAttempts);

    // Get the appropriate cooldown period based on current attempts (0-indexed)
    // 1st resend (attempts = 1) -> index 0 (60s)
    // 2nd resend (attempts = 2) -> index 1 (180s)
    // 3rd resend (attempts = 3) -> index 2 (300s)
    // 4th+ resend (attempts = 4+) -> index 3 (900s)
    const cooldownIndex = Math.min(newAttempts - 1, RESEND_COOLDOWN_PERIODS.length - 1);
    const nextCooldown = RESEND_COOLDOWN_PERIODS[cooldownIndex];

    setResendCooldown(nextCooldown);
    setIsResendDisabled(true);

    // console.log(`Resend attempt ${newAttempts}, next cooldown: ${nextCooldown}s (${formatResendTime(nextCooldown)})`);

    try {
      // console.log('Resending OTP to:', phoneNumber);
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
        options: { channel: 'sms' },
      });

      if (error) {
        // console.error('Error resending OTP:', error);
        setError('Failed to resend code. Please try again.');
      }
    } catch {
      // console.error('Error resending OTP:', err);
      setError('Failed to resend code. Please try again.');
    }

    inputRefs.current[0]?.focus();
  };

  if (!isOpen) return null;

  const isComplete = otpDigits.every((digit) => digit !== '');

  return (
    <>
      {/* Backdrop */}
      <div
        className="otp-backdrop"
        onClick={!isVerifying ? onClose : undefined}
      />

      {/* Modal */}
      <div className="otp-modal">
        {/* Close Button */}
        <button
          className="otp-close-btn"
          onClick={onClose}
          disabled={isVerifying}
          aria-label="Close modal">
          ×
        </button>

        {/* Lightning Icon */}
        <div className={`otp-icon ${isSuccess ? 'success' : ''}`}>{isSuccess ? '✓' : '⚡'}</div>

        {/* Title */}
        <h2 className="otp-title">{isSuccess ? 'Verification Successful!' : 'Verify Your Phone'}</h2>

        {/* Description */}
        <p className="otp-description">{isSuccess ? `Welcome to ${appName}! You'll be notified when we launch.` : `Enter the 6-digit code sent to ${phoneNumber}`}</p>

        {!isSuccess && (
          <>
            {/* OTP Input Fields */}
            <div className="otp-inputs-container">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={`otp-digit-input ${error ? 'error' : ''}`}
                  disabled={isVerifying}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && <p className="otp-error">{error}</p>}

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={!isComplete || isVerifying}
              className={`otp-verify-btn ${isComplete && !isVerifying ? 'active' : ''} ${isVerifying ? 'loading' : ''}`}>
              {isVerifying ? (
                <>
                  <span className="loading-spinner"></span>
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </button>

            {/* Expiration and Resend */}
            <div className="otp-footer">
              <p className="otp-expiry">Code expires in {formatTime(timeLeft)}</p>

              <button
                onClick={handleResend}
                className="otp-resend-btn"
                disabled={isVerifying || isResendDisabled}
                title={isResendDisabled ? `Please wait ${formatResendTime(resendCooldown)} before requesting another code` : 'Request a new verification code'}>
                {isResendDisabled && resendCooldown > 0 ? `Resend in ${formatResendTime(resendCooldown)}` : 'Resend Code'}
              </button>

              {resendAttempts > 0 && isResendDisabled && (
                <p className="otp-disclaimer">
                  <small>Wait time increases with each resend to prevent abuse</small>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default OTPmodal;
