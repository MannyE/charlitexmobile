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
    // console.log('Verifying OTP for:', phoneNumber);

    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: token,
      type: 'sms',
    });

    if (error) {
      // console.error('OTP verification error:', error);
      return {
        success: false,
        error: getOTPVerificationErrorMessage(error),
      };
    }

    // console.log('OTP verified successfully:', data);
    return {
      success: true,
      data,
    };
  } catch {
    // console.error('Unexpected error verifying OTP:', err);
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
      // console.error('Error getting current user:', error);
      return {
        success: false,
        error: ERROR_MESSAGES.DATABASE.AUTH_REQUIRED,
      };
    }

    return {
      success: true,
      user,
    };
  } catch {
    // console.error('Unexpected error getting user:', err);
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
  const errorCode = error.errorCode || error.code || '';
  
  console.log('🔍 Analyzing OTP error:', { message, errorCode, error });

  // Handle Twilio rate limiting errors specifically
  if (errorCode === 'sms_send_failed' || message.includes('sms_send_failed')) {
    if (message.includes('too ma') || message.includes('20429')) {
      return '⏰ Too many SMS requests to this number. Please wait 15-30 minutes and try again, or use a different phone number.';
    }
    return 'SMS delivery failed. Please verify your phone number and try again.';
  }

  // Handle rate limiting in general
  if (message.includes('rate') || message.includes('limit') || message.includes('many') || message.includes('too ma')) {
    // Check if it mentions a specific time
    const timeMatch = message.match(/(\d+)\s*(minute|second|hour)/i);
    if (timeMatch) {
      const time = `${timeMatch[1]} ${timeMatch[2]}${timeMatch[1] > 1 ? 's' : ''}`;
      return `⏰ Rate limited. Please wait ${time} before trying again.`;
    }
    return '⏰ Too many requests. Please wait 15-30 minutes before trying again.';
  }

  // Handle 422 errors specifically (Unprocessable Content)
  if (message.includes('unprocessable') || errorCode === '422') {
    if (message.includes('phone')) {
      return 'Invalid phone number format. Please check your number and try again.';
    }
    return 'Phone number format not supported. Please verify your number is correct.';
  }

  if (message.includes('network') || message.includes('connection')) {
    return ERROR_MESSAGES.API.NETWORK_ERROR;
  }

  if (message.includes('twilio') || message.includes('sms')) {
    return 'SMS service error. Please verify your phone number and try again.';
  }

  if (message.includes('invalid') && message.includes('phone')) {
    return 'Invalid phone number. Please check the format and try again.';
  }

  // Provide more context for debugging
  console.warn('🤔 Unknown OTP error type:', { message, errorCode });
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
