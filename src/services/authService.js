import { supabase } from '../config/supabase';
import { ERROR_MESSAGES } from '../constants/validation';

/**
 * Send OTP to phone number
 * @param {string} phoneNumber - Full international phone number
 * @returns {Promise<Object>} - { success: boolean, data?: any, error?: string }
 */
export const sendOTP = async (phoneNumber) => {
  try {
    console.log('Sending OTP to:', phoneNumber);

    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
    });

    if (error) {
      console.error('OTP send error:', error);
      return {
        success: false,
        error: getOTPErrorMessage(error),
      };
    }

    console.log('OTP sent successfully:', data);
    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error('Unexpected error sending OTP:', err);
    return {
      success: false,
      error: ERROR_MESSAGES.API.GENERIC_ERROR,
    };
  }
};

/**
 * Verify OTP code
 * @param {string} phoneNumber - Full international phone number
 * @param {string} token - OTP code
 * @returns {Promise<Object>} - { success: boolean, data?: any, error?: string }
 */
export const verifyOTP = async (phoneNumber, token) => {
  try {
    console.log('Verifying OTP for:', phoneNumber);

    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: token,
      type: 'sms',
    });

    if (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        error: getOTPVerificationErrorMessage(error),
      };
    }

    console.log('OTP verified successfully:', data);
    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error('Unexpected error verifying OTP:', err);
    return {
      success: false,
      error: ERROR_MESSAGES.OTP.INVALID_CODE,
    };
  }
};

/**
 * Get current authenticated user
 * @returns {Promise<Object>} - { success: boolean, user?: any, error?: string }
 */
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Error getting current user:', error);
      return {
        success: false,
        error: ERROR_MESSAGES.DATABASE.AUTH_REQUIRED,
      };
    }

    return {
      success: true,
      user,
    };
  } catch (err) {
    console.error('Unexpected error getting user:', err);
    return {
      success: false,
      error: ERROR_MESSAGES.DATABASE.AUTH_REQUIRED,
    };
  }
};

/**
 * Maps OTP send error to user-friendly message
 * @param {Object} error - Supabase error object
 * @returns {string} - User-friendly error message
 */
const getOTPErrorMessage = (error) => {
  const message = error.message?.toLowerCase() || '';

  if (message.includes('rate') || message.includes('limit') || message.includes('many')) {
    // Extract rate limit time if available
    const timeMatch = message.match(/(\d+)\s*(minute|second|hour)/i);
    if (timeMatch) {
      const time = `${timeMatch[1]} ${timeMatch[2]}${timeMatch[1] > 1 ? 's' : ''}`;
      return ERROR_MESSAGES.API.RATE_LIMITED.replace('{time}', time);
    }
    return 'Too many requests. Please wait a few minutes before trying again.';
  }

  if (message.includes('network') || message.includes('connection')) {
    return ERROR_MESSAGES.API.NETWORK_ERROR;
  }

  if (message.includes('twilio') || message.includes('sms')) {
    return ERROR_MESSAGES.API.TWILIO_ERROR;
  }

  return ERROR_MESSAGES.API.GENERIC_ERROR;
};

/**
 * Maps OTP verification error to user-friendly message
 * @param {Object} error - Supabase error object
 * @returns {string} - User-friendly error message
 */
const getOTPVerificationErrorMessage = (error) => {
  const message = error.message?.toLowerCase() || '';

  if (message.includes('invalid') || message.includes('wrong')) {
    return ERROR_MESSAGES.OTP.INVALID_CODE;
  }

  if (message.includes('expired') || message.includes('expire')) {
    return ERROR_MESSAGES.OTP.EXPIRED;
  }

  if (message.includes('attempts') || message.includes('many')) {
    return ERROR_MESSAGES.OTP.MAX_ATTEMPTS;
  }

  return ERROR_MESSAGES.OTP.INVALID_CODE;
};
