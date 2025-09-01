// Universal phone number constraints (ITU-T standards)
export const PHONE_CONSTRAINTS = {
  MIN_DIGITS: 7, // Minimum for most countries
  MAX_DIGITS: 15, // ITU-T E.164 standard
  MAX_INPUT_LENGTH: 20, // Including formatting characters
};

// Country flags mapping
export const COUNTRY_FLAGS = {
  '+1': '🇺🇸',
  '+44': '🇬🇧',
  '+33': '🇫🇷',
  '+49': '🇩🇪',
  '+81': '🇯🇵',
  '+86': '🇨🇳',
  '+91': '🇮🇳',
  '+61': '🇦🇺',
  '+55': '🇧🇷',
  '+234': '🇳🇬',
  '+233': '🇬🇭',
  '+27': '🇿🇦',
  '+52': '🇲🇽',
  '+39': '🇮🇹',
  '+34': '🇪🇸',
  '+7': '🇷🇺',
  '+82': '🇰🇷',
};

// Country-specific phone number validation rules
export const COUNTRY_VALIDATION_RULES = {
  '+1': {
    // US/Canada
    minLength: 10,
    maxLength: 10,
    pattern: /^[2-9]\d{2}[2-9]\d{6}$/,
    name: 'US/Canada',
    flag: '🇺🇸',
    example: '(555) 123-4567',
  },
  '+44': {
    // UK
    minLength: 10,
    maxLength: 11,
    pattern: /^(7[0-9]{9}|[1-9]\d{8,9})$/,
    name: 'United Kingdom',
    flag: '🇬🇧',
    example: '7xxx xxx xxx',
  },
  '+33': {
    // France
    minLength: 9,
    maxLength: 9,
    pattern: /^[1-9]\d{8}$/,
    name: 'France',
    flag: '🇫🇷',
    example: '6 12 34 56 78',
  },
  '+49': {
    // Germany
    minLength: 10,
    maxLength: 12,
    pattern: /^(1[0-9]{9,11})$/,
    name: 'Germany',
    flag: '🇩🇪',
    example: '151 12345678',
  },
  '+81': {
    // Japan
    minLength: 10,
    maxLength: 11,
    pattern: /^([7-9]0[0-9]{8}|[8-9]0[0-9]{7,8})$/,
    name: 'Japan',
    flag: '🇯🇵',
    example: '90 1234 5678',
  },
  '+86': {
    // China
    minLength: 11,
    maxLength: 11,
    pattern: /^1[3-9]\d{9}$/,
    name: 'China',
    flag: '🇨🇳',
    example: '138 0000 0000',
  },
  '+91': {
    // India
    minLength: 10,
    maxLength: 10,
    pattern: /^[6-9]\d{9}$/,
    name: 'India',
    flag: '🇮🇳',
    example: '98765 43210',
  },
  '+61': {
    // Australia
    minLength: 9,
    maxLength: 10,
    pattern: /^[2-578]\d{8}$|^4[0-9]{8}$/,
    name: 'Australia',
    flag: '🇦🇺',
    example: '4xx xxx xxx',
  },
  '+55': {
    // Brazil
    minLength: 10,
    maxLength: 11,
    pattern: /^([1-9]{2}9?[6-9]\d{7})$/,
    name: 'Brazil',
    flag: '🇧🇷',
    example: '11 99999-9999',
  },
  '+234': {
    // Nigeria
    minLength: 10,
    maxLength: 10,
    pattern: /^[7-9][0-1]\d{8}$/,
    name: 'Nigeria',
    flag: '🇳🇬',
    example: '80X XXX XXXX',
  },
  '+233': {
    // Ghana
    minLength: 9,
    maxLength: 9,
    pattern: /^[2-5][0-9]{8}$/,
    name: 'Ghana',
    flag: '🇬🇭',
    example: '2XX XXX XXX',
  },
  '+27': {
    // South Africa
    minLength: 9,
    maxLength: 9,
    pattern: /^[1-8]\d{8}$/,
    name: 'South Africa',
    flag: '🇿🇦',
    example: '8X XXX XXXX',
  },
  '+52': {
    // Mexico
    minLength: 10,
    maxLength: 10,
    pattern: /^[1-9]\d{9}$/,
    name: 'Mexico',
    flag: '🇲🇽',
    example: '55 1234 5678',
  },
  '+39': {
    // Italy
    minLength: 9,
    maxLength: 10,
    pattern: /^3[0-9]{8,9}$/,
    name: 'Italy',
    flag: '🇮🇹',
    example: '3XX XXX XXXX',
  },
  '+34': {
    // Spain
    minLength: 9,
    maxLength: 9,
    pattern: /^[6-9]\d{8}$/,
    name: 'Spain',
    flag: '🇪🇸',
    example: '6XX XXX XXX',
  },
  '+7': {
    // Russia
    minLength: 10,
    maxLength: 10,
    pattern: /^9\d{9}$/,
    name: 'Russia',
    flag: '🇷🇺',
    example: '9XX XXX XX XX',
  },
  '+82': {
    // South Korea
    minLength: 10,
    maxLength: 11,
    pattern: /^1[0-9]{9,10}$/,
    name: 'South Korea',
    flag: '🇰🇷',
    example: '10 XXXX XXXX',
  },
};

// OTP related constants
export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_TIME: 60, // seconds
  RESEND_COOLDOWN_PERIODS: [60, 180, 300, 900], // 1min, 3min, 5min, 15min
};

// Error message mappings
export const ERROR_MESSAGES = {
  PHONE_VALIDATION: {
    INVALID_FORMAT: 'Please enter a valid phone number for {country}',
    TOO_SHORT: 'Phone number is too short',
    TOO_LONG: 'Phone number is too long',
    INVALID_CHARACTERS: 'Phone number contains invalid characters',
  },
  API: {
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    RATE_LIMITED: 'Too many attempts. Please wait {time} before trying again.',
    TWILIO_ERROR: 'Unable to send SMS. Please verify your number and try again.',
    GENERIC_ERROR: 'Something went wrong. Please try again.',
  },
  DATABASE: {
    USER_EXISTS: "You are already on our waitlist! We'll notify you when we launch.",
    AUTH_REQUIRED: 'Authentication required to join waitlist.',
    PERMISSION_DENIED: 'Permission denied. Please contact support.',
    NETWORK_ERROR: 'Database connection failed. Please try again.',
    UNKNOWN_ERROR: 'Failed to join waitlist. Please contact support.',
  },
  OTP: {
    INVALID_CODE: 'Invalid verification code. Please try again.',
    EXPIRED: 'Verification code has expired. Please request a new one.',
    MAX_ATTEMPTS: 'Too many incorrect attempts. Please request a new code.',
    REQUIRED: 'Please enter the verification code.',
  },
};
