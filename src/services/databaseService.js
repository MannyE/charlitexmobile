import { supabase } from '../config/supabase';
import { ERROR_MESSAGES } from '../constants/validation';

/**
 * Check if user exists in waitlist
 * @param {string} phoneNumber - Full international phone number
 * @returns {Promise<Object>} - { exists: boolean, error?: string }
 */
export const checkUserExists = async (phoneNumber) => {
  try {
    console.log('Checking if user exists:', phoneNumber);

    const { data, error } = await supabase.from('waitlist').select('phone').eq('phone', phoneNumber).single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found
      console.error('Error checking user existence:', error);
      return {
        exists: false,
        error: getDatabaseErrorMessage(error),
      };
    }

    const exists = !!data;
    console.log(`User ${exists ? 'exists' : 'does not exist'} in waitlist`);

    return { exists };
  } catch (err) {
    console.error('Unexpected error checking user existence:', err);
    return {
      exists: false,
      error: ERROR_MESSAGES.DATABASE.NETWORK_ERROR,
    };
  }
};

/**
 * Add user to waitlist
 * @param {string} phoneNumber - Full international phone number
 * @param {string} userId - User ID from authentication
 * @returns {Promise<Object>} - { success: boolean, data?: any, error?: string }
 */
export const addUserToWaitlist = async (phoneNumber, userId) => {
  try {
    console.log('Adding user to waitlist:', { phoneNumber, userId });

    const { data, error } = await supabase
      .from('waitlist')
      .insert([
        {
          user_id: userId,
          phone: phoneNumber,
          consent: true,
        },
      ])
      .select();

    if (error) {
      console.error('Error adding user to waitlist:', error);
      return {
        success: false,
        error: getDatabaseErrorMessage(error),
      };
    }

    console.log('User added to waitlist successfully:', data);
    return {
      success: true,
      data: data[0],
    };
  } catch (err) {
    console.error('Unexpected error adding user to waitlist:', err);
    return {
      success: false,
      error: ERROR_MESSAGES.DATABASE.UNKNOWN_ERROR,
    };
  }
};

/**
 * Maps database error to user-friendly message
 * @param {Object} error - Supabase error object
 * @returns {string} - User-friendly error message
 */
const getDatabaseErrorMessage = (error) => {
  const code = error.code;
  const message = error.message?.toLowerCase() || '';

  // Handle specific error codes
  switch (code) {
    case 'PGRST116': // No rows found
      return 'User not found';

    case '42P01': // Table does not exist
      return 'Database setup incomplete. Please contact support.';

    case '23505': // Unique constraint violation
      if (message.includes('phone')) {
        return ERROR_MESSAGES.DATABASE.USER_EXISTS;
      }
      return 'User already exists in our system.';

    case 'PGRST301': // Forbidden
      return ERROR_MESSAGES.DATABASE.PERMISSION_DENIED;

    case '08000': // Connection error
    case '08003': // Connection does not exist
    case '08006': // Connection failure
      return ERROR_MESSAGES.DATABASE.NETWORK_ERROR;

    default:
      // Handle common message patterns
      if (message.includes('permission') || message.includes('forbidden')) {
        return ERROR_MESSAGES.DATABASE.PERMISSION_DENIED;
      }

      if (message.includes('network') || message.includes('connection')) {
        return ERROR_MESSAGES.DATABASE.NETWORK_ERROR;
      }

      if (message.includes('unique') || message.includes('duplicate')) {
        return ERROR_MESSAGES.DATABASE.USER_EXISTS;
      }

      if (message.includes('auth')) {
        return ERROR_MESSAGES.DATABASE.AUTH_REQUIRED;
      }

      return ERROR_MESSAGES.DATABASE.UNKNOWN_ERROR;
  }
};
