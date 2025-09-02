import { useState } from 'react';
import { supabase } from '../config/supabase';
import OTPmodal from './OTPmodal';

const NumberInput = () => {
  // Universal phone number constraints (ITU-T standards)
  const PHONE_CONSTRAINTS = {
    MIN_DIGITS: 7, // Minimum for most countries
    MAX_DIGITS: 15, // ITU-T E.164 standard
    MAX_INPUT_LENGTH: 20, // Including formatting characters
  };

  // Rate limiting configuration - DISABLED
  // const RATE_LIMIT_CONFIG = {
  //   MAX_ATTEMPTS: 3, // Maximum attempts before rate limiting
  //   COOLDOWN_PERIODS: [60, 300, 900], // Cooldown in seconds: 1min, 5min, 15min
  //   RESET_PERIOD: 3600, // Reset attempts after 1 hour
  //   STORAGE_KEY: 'otp_rate_limit',
  // };

  // Country-specific phone number validation rules
  const countryValidationRules = {
    '+1': {
      // US/Canada
      minLength: 10,
      maxLength: 10,
      pattern: /^[2-9]\d{2}[2-9]\d{6}$/,
      name: 'US/Canada',
      example: '(555) 123-4567',
    },
    '+44': {
      // UK
      minLength: 10,
      maxLength: 11,
      pattern: /^(7[0-9]{9}|[1-9]\d{8,9})$/,
      name: 'United Kingdom',
      example: '7xxx xxx xxx',
    },
    '+33': {
      // France
      minLength: 9,
      maxLength: 9,
      pattern: /^[1-9]\d{8}$/,
      name: 'France',
      example: '6 12 34 56 78',
    },
    '+49': {
      // Germany
      minLength: 10,
      maxLength: 12,
      pattern: /^[1-9]\d{9,11}$/,
      name: 'Germany',
      example: '30 12345678',
    },
    '+39': {
      // Italy
      minLength: 9,
      maxLength: 11,
      pattern: /^[1-9]\d{8,10}$/,
      name: 'Italy',
      example: '312 345 6789',
    },
    '+34': {
      // Spain
      minLength: 9,
      maxLength: 9,
      pattern: /^[6-9]\d{8}$/,
      name: 'Spain',
      example: '612 34 56 78',
    },
    '+86': {
      // China
      minLength: 11,
      maxLength: 11,
      pattern: /^1[3-9]\d{9}$/,
      name: 'China',
      example: '138 0013 8000',
    },
    '+81': {
      // Japan
      minLength: 10,
      maxLength: 11,
      pattern: /^([7-9]0\d{8}|[1-9]\d{9})$/,
      name: 'Japan',
      example: '90 1234 5678',
    },
    '+91': {
      // India
      minLength: 10,
      maxLength: 10,
      pattern: /^[6-9]\d{9}$/,
      name: 'India',
      example: '98765 43210',
    },
    '+61': {
      // Australia
      minLength: 9,
      maxLength: 9,
      pattern: /^[2-9]\d{8}$/,
      name: 'Australia',
      example: '412 345 678',
    },
    '+55': {
      // Brazil
      minLength: 10,
      maxLength: 11,
      pattern: /^[1-9]\d{9,10}$/,
      name: 'Brazil',
      example: '11 91234-5678',
    },
    '+7': {
      // Russia
      minLength: 10,
      maxLength: 10,
      pattern: /^9\d{9}$/,
      name: 'Russia',
      example: '912 345 67 89',
    },
    '+233': {
      // Ghana
      minLength: 9,
      maxLength: 9,
      pattern: /^[2-9]\d{8}$/,
      name: 'Ghana',
      example: '24 123 4567',
    },
    '+234': {
      // Nigeria
      minLength: 10,
      maxLength: 10,
      pattern: /^[7-9]\d{9}$/,
      name: 'Nigeria',
      example: '803 123 4567',
    },
    '+254': {
      // Kenya
      minLength: 9,
      maxLength: 9,
      pattern: /^[7-9]\d{8}$/,
      name: 'Kenya',
      example: '712 345 678',
    },
    '+27': {
      // South Africa
      minLength: 9,
      maxLength: 9,
      pattern: /^[1-9]\d{8}$/,
      name: 'South Africa',
      example: '82 123 4567',
    },
  };

  // Common country codes with flags
  const countryCodes = [
    { code: '+1', country: 'US/CA', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+33', country: 'FR', flag: '🇫🇷' },
    { code: '+49', country: 'DE', flag: '🇩🇪' },
    { code: '+39', country: 'IT', flag: '🇮🇹' },
    { code: '+34', country: 'ES', flag: '🇪🇸' },
    { code: '+86', country: 'CN', flag: '🇨🇳' },
    { code: '+81', country: 'JP', flag: '🇯🇵' },
    { code: '+91', country: 'IN', flag: '🇮🇳' },
    { code: '+61', country: 'AU', flag: '🇦🇺' },
    { code: '+55', country: 'BR', flag: '🇧🇷' },
    { code: '+7', country: 'RU', flag: '🇷🇺' },
    { code: '+233', country: 'GH', flag: '🇬🇭' },
    { code: '+234', country: 'NG', flag: '🇳🇬' },
    { code: '+254', country: 'KE', flag: '🇰🇪' },
    { code: '+27', country: 'ZA', flag: '🇿🇦' },
  ];

  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showOTPmodal, setShowOTPmodal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showApiErrorPopup, setShowApiErrorPopup] = useState(false);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);

  // Rate limiting state - DISABLED
  // const [attemptCount, setAttemptCount] = useState(0);
  // const [isRateLimited, setIsRateLimited] = useState(false);
  // const [cooldownEndTime, setCooldownEndTime] = useState(null);
  // const [remainingCooldown, setRemainingCooldown] = useState(0);

  // Load rate limiting data from localStorage on component mount - DISABLED
  // useEffect(() => {
  //   const savedData = localStorage.getItem(RATE_LIMIT_CONFIG.STORAGE_KEY);
  //   if (savedData) {
  //     try {
  //       const { attempts, lastAttempt, cooldownEnd } = JSON.parse(savedData);
  //       const now = Date.now();
  //
  //       // Reset if reset period has passed
  //       if (now - lastAttempt > RATE_LIMIT_CONFIG.RESET_PERIOD * 1000) {
  //         localStorage.removeItem(RATE_LIMIT_CONFIG.STORAGE_KEY);
  //         return;
  //       }
  //
  //       setAttemptCount(attempts);
  //
  //       if (cooldownEnd && now < cooldownEnd) {
  //         setIsRateLimited(true);
  //         setCooldownEndTime(cooldownEnd);
  //         setRemainingCooldown(Math.ceil((cooldownEnd - now) / 1000));
  //       }
  //     } catch (error) {
  //       // console.error('Error loading rate limit data:', error);
  //       localStorage.removeItem(RATE_LIMIT_CONFIG.STORAGE_KEY);
  //     }
  //   }
  // }, []);

  // Cooldown timer effect - DISABLED
  // useEffect(() => {
  //   let interval;
  //   if (isRateLimited && cooldownEndTime) {
  //     interval = setInterval(() => {
  //       const now = Date.now();
  //       const remaining = Math.ceil((cooldownEndTime - now) / 1000);
  //
  //       if (remaining <= 0) {
  //         setIsRateLimited(false);
  //         setCooldownEndTime(null);
  //         setRemainingCooldown(0);
  //         // Update localStorage
  //         const savedData = localStorage.getItem(RATE_LIMIT_CONFIG.STORAGE_KEY);
  //         if (savedData) {
  //           try {
  //             const data = JSON.parse(savedData);
  //             data.cooldownEnd = null;
  //             localStorage.setItem(RATE_LIMIT_CONFIG.STORAGE_KEY, JSON.stringify(data));
  //           } catch (error) {
  //             // console.error('Error updating rate limit data:', error);
  //           }
  //         }
  //       } else {
  //         setRemainingCooldown(remaining);
  //       }
  //     }, 1000);
  //   }
  //
  //   return () => {
  //     if (interval) clearInterval(interval);
  //   };
  // }, [isRateLimited, cooldownEndTime]);

  // Rate limiting functions - DISABLED
  // const updateRateLimit = (newAttemptCount) => {
  //   const now = Date.now();
  //   let cooldownEnd = null;
  //
  //   if (newAttemptCount >= RATE_LIMIT_CONFIG.MAX_ATTEMPTS) {
  //     const cooldownIndex = Math.min(newAttemptCount - RATE_LIMIT_CONFIG.MAX_ATTEMPTS, RATE_LIMIT_CONFIG.COOLDOWN_PERIODS.length - 1);
  //     const cooldownDuration = RATE_LIMIT_CONFIG.COOLDOWN_PERIODS[cooldownIndex] * 1000;
  //     cooldownEnd = now + cooldownDuration;
  //
  //     setIsRateLimited(true);
  //     setCooldownEndTime(cooldownEnd);
  //     setRemainingCooldown(Math.ceil(cooldownDuration / 1000));
  //   }
  //
  //   setAttemptCount(newAttemptCount);
  //
  //   // Save to localStorage
  //   const rateData = {
  //     attempts: newAttemptCount,
  //     lastAttempt: now,
  //     cooldownEnd,
  //   };
  //   localStorage.setItem(RATE_LIMIT_CONFIG.STORAGE_KEY, JSON.stringify(rateData));
  // };

  // const canSendOTP = () => {
  //   return !isRateLimited;
  // };

  // const getRateLimitMessage = () => {
  //   if (!isRateLimited) return '';
  //
  //   const minutes = Math.floor(remainingCooldown / 60);
  //   const seconds = remainingCooldown % 60;
  //   const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  //
  //   if (attemptCount >= RATE_LIMIT_CONFIG.MAX_ATTEMPTS) {
  //     return `Too many verification attempts. Please wait ${timeStr} before trying again.`;
  //   }
  //
  //   return `Please wait ${timeStr} before requesting another code.`;
  // };

  // Enhanced validation before sending OTP request
  const validateForOTPRequest = (number, selectedCountryCode) => {
    const numericValue = number.replace(/\D/g, '');

    // Basic checks
    if (!number || numericValue.length === 0) {
      return { isValid: false, error: 'Phone number is required' };
    }

    // Country-specific validation
    const validation = validatePhoneNumber(number, selectedCountryCode);
    if (!validation.isValid) {
      return validation;
    }

    // Additional reliability checks
    const countryRules = countryValidationRules[selectedCountryCode];
    if (countryRules) {
      // Ensure exact length match for countries with fixed lengths
      if (countryRules.minLength === countryRules.maxLength && numericValue.length !== countryRules.minLength) {
        return {
          isValid: false,
          error: `${countryRules.name} phone numbers must be exactly ${countryRules.minLength} digits`,
        };
      }

      // Final pattern validation
      if (!countryRules.pattern.test(numericValue)) {
        return {
          isValid: false,
          error: `Invalid ${countryRules.name} phone number format. Please check and try again.`,
        };
      }
    }

    return { isValid: true, error: '' };
  };

  // Enhanced error message mapping
  const getErrorMessage = (error) => {
    if (!error) return '';

    const errorMessage = error.message || '';
    const errorCode = error.code || error.status || '';

    // Map specific errors to user-friendly messages
    if (errorMessage.includes('Invalid phone number') || errorMessage.includes('phone')) {
      return 'The phone number format is not supported by our SMS service. Please verify your number and try again.';
    }

    if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests') || errorCode === '429') {
      return 'Too many requests. Please wait a few minutes before trying again.';
    }

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'Network connection failed. Please check your internet connection and try again.';
    }

    if (errorMessage.includes('timeout')) {
      return 'Request timed out. Please check your connection and try again.';
    }

    if (errorMessage.includes('authentication') || errorMessage.includes('unauthorized')) {
      return 'Authentication failed. Please contact support if this problem persists.';
    }

    if (errorCode === '500' || errorMessage.includes('internal server error')) {
      return 'Our service is temporarily unavailable. Please try again in a few minutes.';
    }

    if (errorCode === '400' || errorMessage.includes('bad request')) {
      return 'Invalid request. Please check your phone number and try again.';
    }

    // Generic fallback message
    return 'Unable to send verification code. Please check your phone number and try again.';
  };

  // Check if error is rate limiting related
  const isRateLimitError = (errorMsg) => {
    const msg = errorMsg.toLowerCase();
    return msg.includes('rate limit') || msg.includes('too many requests') || msg.includes('wait a few minutes') || msg.includes('429');
  };

  // Clear errors when user starts typing
  const clearErrors = () => {
    if (apiError) {
      setApiError('');
      setShowApiErrorPopup(false);
    }
    if (!isValid && errorMessage && phoneNumber.length === 0) {
      setErrorMessage('');
      setIsValid(true);
    }
  };

  // Close API error popup
  const closeApiErrorPopup = () => {
    setShowApiErrorPopup(false);
    setApiError('');
  };

  // Check if user already exists in waitlist
  const checkUserExists = async (phoneNumber) => {
    try {
      // console.log('Checking if user exists:', phoneNumber);
      const { data, error } = await supabase.from('waitlist').select('phone').eq('phone', phoneNumber).single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new users
        // console.error('Error checking user existence:', error);
        return false;
      }

      return !!data; // Returns true if user exists, false otherwise
    } catch {
      // Error checking user existence
      return false;
    }
  };

  // Close duplicate popup
  const closeDuplicatePopup = () => {
    setShowDuplicatePopup(false);
  };

  // Send OTP -- Enhanced with comprehensive error handling (rate limiting disabled)
  const sendOTP = async () => {
    // Rate limiting disabled
    // if (!canSendOTP()) {
    //   const rateLimitMsg = getRateLimitMessage();
    //   setApiError(rateLimitMsg);
    //   setShowApiErrorPopup(true);
    //   return;
    // }

    // Clear any previous API errors
    setApiError('');
    setIsLoading(true);

    try {
      // Comprehensive validation before API request
      const finalValidation = validateForOTPRequest(phoneNumber, countryCode);

      if (!finalValidation.isValid) {
        // console.error('Validation failed:', finalValidation.error);
        setErrorMessage(finalValidation.error);
        setIsValid(false);
        setIsLoading(false);
        return;
      }

      const fullPhoneNumber = countryCode + phoneNumber.replace(/\D/g, '');
      // console.log('Sending OTP to validated number:', fullPhoneNumber);

      // Check if user already exists in waitlist before sending OTP
      const userExists = await checkUserExists(fullPhoneNumber);

      if (userExists) {
        // console.log('User already exists in waitlist');
        setIsLoading(false);
        setShowDuplicatePopup(true);
        return;
      }

      // Rate limiting disabled
      // updateRateLimit(attemptCount + 1);

      // Call the OTP API here with validated number
      const { data: _data, error } = await supabase.auth.signInWithOtp({
        phone: fullPhoneNumber,
        options: { channel: 'sms' },
      });

      if (error) {
        // console.error('Supabase OTP Error:', error);
        const friendlyMessage = getErrorMessage(error);
        setApiError(friendlyMessage);
        setShowApiErrorPopup(true);
        setIsValid(false);
      } else {
        // console.log('OTP sent successfully:', data);
        // Clear any existing errors on success
        setErrorMessage('');
        setApiError('');
        setIsValid(true);
        setShowOTPmodal(true);
      }
    } catch (err) {
      // console.error('Unexpected error sending OTP:', err);

      // Handle different types of network/fetch errors
      let friendlyMessage = 'An unexpected error occurred. Please try again.';

      if (err.name === 'NetworkError' || err.message?.includes('fetch')) {
        friendlyMessage = 'Network connection failed. Please check your internet connection and try again.';
      } else if (err.name === 'TypeError' && err.message?.includes('fetch')) {
        friendlyMessage = 'Unable to reach our servers. Please check your internet connection.';
      } else if (err.message?.includes('timeout')) {
        friendlyMessage = 'Request timed out. Please try again.';
      }

      setApiError(friendlyMessage);
      setShowApiErrorPopup(true);
      setIsValid(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Universal phone number formatting (adds spaces every 3-4 digits)
  const formatPhoneNumber = (value) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/\D/g, '');

    // Apply universal formatting with spaces
    if (numericValue.length <= 3) return numericValue;
    if (numericValue.length <= 6) return `${numericValue.slice(0, 3)} ${numericValue.slice(3)}`;
    if (numericValue.length <= 10) return `${numericValue.slice(0, 3)} ${numericValue.slice(3, 6)} ${numericValue.slice(6)}`;

    // For longer numbers, group as: XXX XXX XXX XXXX
    return `${numericValue.slice(0, 3)} ${numericValue.slice(3, 6)} ${numericValue.slice(6, 9)} ${numericValue.slice(9, 13)}`;
  };

  // Country-specific phone number validation
  const validatePhoneNumber = (value, selectedCountryCode = countryCode) => {
    const numericValue = value.replace(/\D/g, '');

    if (numericValue.length === 0) {
      return { isValid: true, error: '' };
    }

    // Get validation rules for the selected country
    const countryRules = countryValidationRules[selectedCountryCode];

    if (!countryRules) {
      // Fallback to universal validation if country not supported
      if (numericValue.length < PHONE_CONSTRAINTS.MIN_DIGITS) {
        return {
          isValid: false,
          error: `Phone number must be at least ${PHONE_CONSTRAINTS.MIN_DIGITS} digits`,
        };
      }
      if (numericValue.length > PHONE_CONSTRAINTS.MAX_DIGITS) {
        return {
          isValid: false,
          error: `Phone number cannot exceed ${PHONE_CONSTRAINTS.MAX_DIGITS} digits`,
        };
      }
      return { isValid: true, error: '' };
    }

    // Check length requirements
    if (numericValue.length < countryRules.minLength) {
      return {
        isValid: false,
        error: `${countryRules.name} phone numbers must be ${countryRules.minLength === countryRules.maxLength ? countryRules.minLength : `${countryRules.minLength}-${countryRules.maxLength}`} digits. Example: ${countryRules.example}`,
      };
    }

    if (numericValue.length > countryRules.maxLength) {
      return {
        isValid: false,
        error: `${countryRules.name} phone numbers cannot exceed ${countryRules.maxLength} digits. Example: ${countryRules.example}`,
      };
    }

    // Check pattern (format) requirements
    if (!countryRules.pattern.test(numericValue)) {
      return {
        isValid: false,
        error: `Invalid ${countryRules.name} phone number format. Example: ${countryRules.example}`,
      };
    }

    return { isValid: true, error: '' };
  };

  // Handle phone number change
  const handlePhoneChange = (e) => {
    const inputValue = e.target.value;

    // Clear errors when user starts typing
    clearErrors();

    // Only allow digits, spaces, dashes, parentheses, and dots
    const allowedChars = /^[0-9\s\-().]*$/;
    if (!allowedChars.test(inputValue)) {
      return; // Ignore invalid characters
    }

    // Check input length limit (including formatting)
    if (inputValue.length > PHONE_CONSTRAINTS.MAX_INPUT_LENGTH) {
      return; // Don't exceed max input length
    }

    // Format the number
    const formattedNumber = formatPhoneNumber(inputValue);

    // Validate
    const validation = validatePhoneNumber(formattedNumber);

    setPhoneNumber(formattedNumber);
    setIsValid(validation.isValid);
    setErrorMessage(validation.error);
  };

  // Handle country code change
  const handleCountryCodeChange = (e) => {
    const newCountryCode = e.target.value;
    setCountryCode(newCountryCode);

    // Re-validate existing phone number with new country code
    if (phoneNumber) {
      const validation = validatePhoneNumber(phoneNumber, newCountryCode);
      setIsValid(validation.isValid);
      setErrorMessage(validation.error);
    }

    // Update placeholder with country-specific example
    updatePlaceholderForCountry(newCountryCode);
  };

  // Update placeholder based on selected country
  const updatePlaceholderForCountry = (selectedCountryCode) => {
    const countryRules = countryValidationRules[selectedCountryCode];
    if (countryRules) {
      // This would be used if we had a ref to the input, for now the static placeholder works
      return `Enter ${countryRules.name} number (${countryRules.example})`;
    }
    return 'Enter phone number (7-15 digits)';
  };

  return (
    <div className="input-container">
      <div className="phone-input-wrapper">
        <select
          value={countryCode}
          onChange={handleCountryCodeChange}
          className="country-code-select">
          {countryCodes.map((country) => (
            <option
              key={country.code}
              value={country.code}>
              {country.flag} {country.code}
            </option>
          ))}
        </select>
        <div className="phone-input-container">
          <input
            type="tel"
            placeholder={countryValidationRules[countryCode] ? `Enter ${countryValidationRules[countryCode].name} number (e.g., ${countryValidationRules[countryCode].example})` : 'Enter phone number (7-15 digits)'}
            className={`phone-input ${!isValid ? 'phone-input-error' : phoneNumber && validateForOTPRequest(phoneNumber, countryCode).isValid ? 'phone-input-success' : ''}`}
            value={phoneNumber}
            onChange={handlePhoneChange}
            maxLength={PHONE_CONSTRAINTS.MAX_INPUT_LENGTH}
            title={!isValid && errorMessage ? errorMessage : ''}
          />
        </div>
      </div>
      <button
        className={`notify-button ${!validateForOTPRequest(phoneNumber, countryCode).isValid || isLoading ? 'notify-button-disabled' : ''}`}
        disabled={!validateForOTPRequest(phoneNumber, countryCode).isValid || isLoading}
        onClick={sendOTP}>
        {isLoading ? (
          <>
            <span className="loading-spinner"></span>
            Sending...
          </>
        ) : (
          'Notify Me'
        )}
      </button>

      {/* API Error Popup */}
      {showApiErrorPopup && (
        <div
          className="error-popup-backdrop"
          onClick={closeApiErrorPopup}>
          <div
            className={`api-error-popup ${isRateLimitError(apiError) ? 'rate-limit' : ''}`}
            onClick={(e) => e.stopPropagation()}>
            <button
              className="error-popup-close-btn"
              onClick={closeApiErrorPopup}>
              ×
            </button>
            <div className="api-error-popup-icon">{isRateLimitError(apiError) ? '⏱️' : '⚠️'}</div>
            <div className="api-error-popup-title">{isRateLimitError(apiError) ? 'Rate Limited' : 'Connection Error'}</div>
            <div className="api-error-popup-message">{apiError}</div>
            <button
              className="api-error-popup-retry-btn"
              onClick={closeApiErrorPopup}>
              {isRateLimitError(apiError) ? 'Got It' : 'Try Again'}
            </button>
          </div>
        </div>
      )}

      {/* Duplicate User Popup */}
      {showDuplicatePopup && (
        <div
          className="error-popup-backdrop"
          onClick={closeDuplicatePopup}>
          <div
            className="duplicate-popup"
            onClick={(e) => e.stopPropagation()}>
            <button
              className="error-popup-close-btn"
              onClick={closeDuplicatePopup}>
              ×
            </button>
            <div className="duplicate-popup-icon">✅</div>
            <div className="duplicate-popup-title">Already on Waitlist</div>
            <div className="duplicate-popup-message">Great news! You're already signed up for our waitlist. We'll notify you as soon as CharlitexMobileConnect launches.</div>
            <button
              className="duplicate-popup-ok-btn"
              onClick={closeDuplicatePopup}>
              Got It
            </button>
          </div>
        </div>
      )}

      <OTPmodal
        isOpen={showOTPmodal}
        onClose={() => setShowOTPmodal(false)}
        appName="CharlitexMobileConnect"
        phoneNumber={countryCode + phoneNumber.replace(/\D/g, '')}
      />
    </div>
  );
};

export default NumberInput;
