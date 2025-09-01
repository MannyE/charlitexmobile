import { PHONE_CONSTRAINTS, COUNTRY_VALIDATION_RULES, ERROR_MESSAGES } from '../constants/validation';

/**
 * Validates phone number format for a specific country
 * @param {string} phoneNumber - The phone number to validate
 * @param {string} countryCode - The country code (e.g., '+1', '+44')
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validatePhoneNumber = (phoneNumber, countryCode) => {
  if (!phoneNumber || !countryCode) {
    return { isValid: false, error: 'Phone number and country code are required' };
  }

  // Remove all non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');

  // Universal constraints check
  if (cleanNumber.length < PHONE_CONSTRAINTS.MIN_DIGITS) {
    return { isValid: false, error: ERROR_MESSAGES.PHONE_VALIDATION.TOO_SHORT };
  }

  if (cleanNumber.length > PHONE_CONSTRAINTS.MAX_DIGITS) {
    return { isValid: false, error: ERROR_MESSAGES.PHONE_VALIDATION.TOO_LONG };
  }

  // Country-specific validation
  const rules = COUNTRY_VALIDATION_RULES[countryCode];
  if (rules) {
    if (cleanNumber.length < rules.minLength || cleanNumber.length > rules.maxLength) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.PHONE_VALIDATION.INVALID_FORMAT.replace('{country}', rules.name),
      };
    }

    if (!rules.pattern.test(cleanNumber)) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.PHONE_VALIDATION.INVALID_FORMAT.replace('{country}', rules.name),
      };
    }
  }

  return { isValid: true, error: null };
};

/**
 * Validates if a phone number is ready for OTP request
 * @param {string} phoneNumber - The phone number to validate
 * @param {string} countryCode - The country code
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateForOTPRequest = (phoneNumber, countryCode) => {
  const validation = validatePhoneNumber(phoneNumber, countryCode);
  if (!validation.isValid) {
    return validation;
  }

  const cleanNumber = phoneNumber.replace(/\D/g, '');

  // Additional checks for OTP readiness
  if (cleanNumber.length < 7) {
    return { isValid: false, error: 'Phone number must be at least 7 digits' };
  }

  return { isValid: true, error: null };
};

/**
 * Formats phone number for display
 * @param {string} phoneNumber - The phone number to format
 * @param {string} countryCode - The country code
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber, countryCode) => {
  const cleanNumber = phoneNumber.replace(/\D/g, '');

  // Basic formatting based on country
  switch (countryCode) {
    case '+1': // US/Canada
      if (cleanNumber.length === 10) {
        return `(${cleanNumber.slice(0, 3)}) ${cleanNumber.slice(3, 6)}-${cleanNumber.slice(6)}`;
      }
      break;
    case '+44': // UK
      if (cleanNumber.length === 11 && cleanNumber.startsWith('7')) {
        return `${cleanNumber.slice(0, 4)} ${cleanNumber.slice(4, 7)} ${cleanNumber.slice(7)}`;
      }
      break;
    // Add more formatting rules as needed
  }

  // Default formatting - add spaces every 3-4 digits
  if (cleanNumber.length > 6) {
    return cleanNumber.replace(/(\d{3})(\d{3})(\d+)/, '$1 $2 $3');
  } else if (cleanNumber.length > 3) {
    return cleanNumber.replace(/(\d{3})(\d+)/, '$1 $2');
  }

  return cleanNumber;
};

/**
 * Gets the full international phone number
 * @param {string} phoneNumber - The phone number
 * @param {string} countryCode - The country code
 * @returns {string} - Full international phone number
 */
export const getFullPhoneNumber = (phoneNumber, countryCode) => {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  return countryCode + cleanNumber;
};

/**
 * Checks if a phone number should show validation error popup
 * @param {string} phoneNumber - The phone number
 * @param {string} countryCode - The country code
 * @returns {boolean} - Whether to show error popup
 */
export const shouldShowValidationError = (phoneNumber, countryCode) => {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const rules = COUNTRY_VALIDATION_RULES[countryCode];

  if (!rules) {
    // Generic validation for unknown countries - only show error if clearly too long
    return cleanNumber.length > PHONE_CONSTRAINTS.MAX_DIGITS;
  }

  // Only show error if number is clearly too long (exceeds max length)
  // Don't show "too short" errors while user is still typing
  return cleanNumber.length > rules.maxLength;
};
