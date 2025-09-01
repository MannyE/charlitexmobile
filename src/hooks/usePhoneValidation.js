import { useState, useCallback } from 'react';
import { validatePhoneNumber, validateForOTPRequest, shouldShowValidationError, formatPhoneNumber, getFullPhoneNumber } from '../utils/phoneValidation';

/**
 * Custom hook for phone number validation and formatting
 * @param {string} initialCountryCode - Initial country code
 * @returns {Object} - Phone validation utilities and state
 */
export const usePhoneValidation = (initialCountryCode = '+233') => {
  const [countryCode, setCountryCode] = useState(initialCountryCode);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [validationError, setValidationError] = useState('');

  /**
   * Handle phone number input changes
   */
  const handlePhoneChange = useCallback(
    (value) => {
      setPhoneNumber(value);

      // Clear previous validation errors
      setValidationError('');
      setShowErrorPopup(false);

      // Show error popup for problematic numbers
      if (value && shouldShowValidationError(value, countryCode)) {
        const validation = validatePhoneNumber(value, countryCode);
        if (!validation.isValid) {
          setValidationError(validation.error);
          setShowErrorPopup(true);
        }
      }
    },
    [countryCode],
  );

  /**
   * Handle country code changes
   */
  const handleCountryCodeChange = useCallback(
    (newCountryCode) => {
      setCountryCode(newCountryCode);

      // Revalidate phone number with new country code
      if (phoneNumber) {
        handlePhoneChange(phoneNumber);
      }
    },
    [phoneNumber, handlePhoneChange],
  );

  /**
   * Validate current phone number
   */
  const validateCurrent = useCallback(() => {
    return validatePhoneNumber(phoneNumber, countryCode);
  }, [phoneNumber, countryCode]);

  /**
   * Validate for OTP request
   */
  const validateForOTP = useCallback(() => {
    return validateForOTPRequest(phoneNumber, countryCode);
  }, [phoneNumber, countryCode]);

  /**
   * Get formatted phone number
   */
  const getFormattedNumber = useCallback(() => {
    return formatPhoneNumber(phoneNumber, countryCode);
  }, [phoneNumber, countryCode]);

  /**
   * Get full international phone number
   */
  const getFullNumber = useCallback(() => {
    return getFullPhoneNumber(phoneNumber, countryCode);
  }, [phoneNumber, countryCode]);

  /**
   * Close error popup
   */
  const closeErrorPopup = useCallback(() => {
    setShowErrorPopup(false);
    setValidationError('');
  }, []);

  /**
   * Reset all validation state
   */
  const resetValidation = useCallback(() => {
    setPhoneNumber('');
    setValidationError('');
    setShowErrorPopup(false);
  }, []);

  return {
    // State
    countryCode,
    phoneNumber,
    showErrorPopup,
    validationError,

    // Actions
    handlePhoneChange,
    handleCountryCodeChange,
    closeErrorPopup,
    resetValidation,

    // Utilities
    validateCurrent,
    validateForOTP,
    getFormattedNumber,
    getFullNumber,

    // Computed values
    isValid: validateCurrent().isValid,
    isReadyForOTP: validateForOTP().isValid,
  };
};
