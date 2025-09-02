import { useState, useCallback } from 'react';
import { sendOTP } from '../services/authService';
import { checkUserExists, addUserToWaitlist } from '../services/databaseService';
import { getCurrentUser } from '../services/authService';

/**
 * Custom hook for API operations
 * @returns {Object} - API utilities and state
 */
export const useAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showApiErrorPopup, setShowApiErrorPopup] = useState(false);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);

  /**
   * Send OTP with user existence check
   */
  const sendOTPWithCheck = useCallback(async (phoneNumber) => {
    setIsLoading(true);
    setError('');
    setShowApiErrorPopup(false);
    setShowDuplicatePopup(false);

    try {
      // First check if user already exists
      const existsResult = await checkUserExists(phoneNumber);

      if (existsResult.error) {
        setError(existsResult.error);
        setShowApiErrorPopup(true);
        return { success: false, error: existsResult.error };
      }

      if (existsResult.exists) {
        setShowDuplicatePopup(true);
        return { success: false, userExists: true };
      }

      // User doesn't exist, send OTP
      const otpResult = await sendOTP(phoneNumber);

      if (otpResult.success) {
        return { success: true, data: otpResult.data };
      } else {
        setError(otpResult.error);
        setShowApiErrorPopup(true);
        return { success: false, error: otpResult.error };
      }
    } catch {
      const errorMsg = 'Something went wrong. Please try again.';
      setError(errorMsg);
      setShowApiErrorPopup(true);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Add user to waitlist after OTP verification
   */
  const addToWaitlist = useCallback(async (phoneNumber) => {
    setIsLoading(true);
    setError('');

    try {
      // Get current authenticated user with retry logic (OTP verification needs time)
      let userResult = await getCurrentUser();
      let retryCount = 0;
      const maxRetries = 3;

      while ((!userResult.success || !userResult.user) && retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        userResult = await getCurrentUser();
        retryCount++;
      }

      if (!userResult.success || !userResult.user) {
        const errorMsg = 'Authentication required to join waitlist.';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // Add to waitlist
      const result = await addUserToWaitlist(phoneNumber, userResult.user.id);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'Failed to join waitlist. Please contact support.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Close API error popup
   */
  const closeApiErrorPopup = useCallback(() => {
    setShowApiErrorPopup(false);
    setError('');
  }, []);

  /**
   * Close duplicate user popup
   */
  const closeDuplicatePopup = useCallback(() => {
    setShowDuplicatePopup(false);
  }, []);

  /**
   * Reset all API state
   */
  const resetAPIState = useCallback(() => {
    setIsLoading(false);
    setError('');
    setShowApiErrorPopup(false);
    setShowDuplicatePopup(false);
  }, []);

  return {
    // State
    isLoading,
    error,
    showApiErrorPopup,
    showDuplicatePopup,

    // Actions
    sendOTPWithCheck,
    addToWaitlist,
    closeApiErrorPopup,
    closeDuplicatePopup,
    resetAPIState,
  };
};
