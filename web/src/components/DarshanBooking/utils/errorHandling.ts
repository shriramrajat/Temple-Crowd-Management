import { BookingError } from '@/types/booking';
import { BOOKING_ERROR_CODES, BOOKING_ERROR_MESSAGES } from '@/constants/booking';

/**
 * Error handling utilities for the booking component
 */

/**
 * Create a standardized booking error
 */
export const createBookingError = (
  code: string,
  message?: string,
  details?: any
): BookingError => {
  return {
    code,
    message: message || BOOKING_ERROR_MESSAGES[code as keyof typeof BOOKING_ERROR_MESSAGES] || 'An unknown error occurred.',
    details
  };
};

/**
 * Check if an error is a network-related error
 */
export const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  
  // Check for common network error indicators
  const networkErrorCodes = [
    BOOKING_ERROR_CODES.NETWORK_ERROR,
    BOOKING_ERROR_CODES.FIRESTORE_ERROR,
    BOOKING_ERROR_CODES.TIMEOUT_ERROR,
    BOOKING_ERROR_CODES.CONNECTION_ERROR
  ];
  
  if (error.code && networkErrorCodes.includes(error.code)) {
    return true;
  }
  
  // Check for Firebase network errors
  if (error.code && error.code.startsWith('unavailable')) {
    return true;
  }
  
  // Check for fetch/network related errors
  if (error.name === 'NetworkError' || error.message?.includes('network')) {
    return true;
  }
  
  return false;
};

/**
 * Check if an error is authentication-related
 */
export const isAuthError = (error: any): boolean => {
  if (!error) return false;
  
  const authErrorCodes = [
    BOOKING_ERROR_CODES.AUTH_REQUIRED,
    BOOKING_ERROR_CODES.PERMISSION_DENIED,
    BOOKING_ERROR_CODES.UNAUTHENTICATED
  ];
  
  if (error.code && authErrorCodes.includes(error.code)) {
    return true;
  }
  
  // Check for Firebase auth errors
  if (error.code && (
    error.code.startsWith('auth/') || 
    error.code === 'permission-denied' ||
    error.code === 'unauthenticated'
  )) {
    return true;
  }
  
  return false;
};

/**
 * Check if an error is a validation error
 */
export const isValidationError = (error: any): boolean => {
  if (!error) return false;
  
  const validationErrorCodes = [
    BOOKING_ERROR_CODES.VALIDATION_ERROR,
    BOOKING_ERROR_CODES.INVALID_DATE,
    BOOKING_ERROR_CODES.INVALID_TIME,
    BOOKING_ERROR_CODES.SLOT_UNAVAILABLE,
    BOOKING_ERROR_CODES.DUPLICATE_BOOKING
  ];
  
  return error.code && validationErrorCodes.includes(error.code);
};

/**
 * Get user-friendly error message with actionable guidance
 */
export const getErrorMessage = (error: BookingError): string => {
  if (!error) return 'An unknown error occurred.';
  
  // Return custom message if provided
  if (error.message) {
    return error.message;
  }
  
  // Fallback to code-based messages
  return BOOKING_ERROR_MESSAGES[error.code as keyof typeof BOOKING_ERROR_MESSAGES] || 
         'An unexpected error occurred. Please try again.';
};

/**
 * Get actionable guidance for error recovery
 */
export const getErrorGuidance = (error: BookingError): string => {
  if (!error) return '';
  
  if (isNetworkError(error)) {
    return 'Please check your internet connection and try again.';
  }
  
  if (isAuthError(error)) {
    switch (error.code) {
      case BOOKING_ERROR_CODES.PERMISSION_DENIED:
        return 'Please sign in with the correct account and try again.';
      case BOOKING_ERROR_CODES.UNAUTHENTICATED:
        return 'Your session has expired. Please sign in again.';
      default:
        return 'Please sign in to your account and try again.';
    }
  }
  
  if (isValidationError(error)) {
    switch (error.code) {
      case BOOKING_ERROR_CODES.INVALID_DATE:
        return 'Please select a valid future date.';
      case BOOKING_ERROR_CODES.INVALID_TIME:
        return 'Please select a valid time slot.';
      case BOOKING_ERROR_CODES.SLOT_UNAVAILABLE:
        return 'This time slot is no longer available. Please select another slot.';
      case BOOKING_ERROR_CODES.DUPLICATE_BOOKING:
        return 'You already have a booking for this time slot.';
      default:
        return 'Please check your selection and try again.';
    }
  }
  
  return 'If the problem persists, please contact temple administration.';
};

/**
 * Determine if an error should trigger a retry mechanism
 */
export const shouldRetry = (error: BookingError, retryCount: number = 0): boolean => {
  const maxRetries = 3;
  
  if (retryCount >= maxRetries) {
    return false;
  }
  
  // Retry network errors
  if (isNetworkError(error)) {
    return true;
  }
  
  // Don't retry validation or auth errors
  if (isValidationError(error) || isAuthError(error)) {
    return false;
  }
  
  // Retry unknown errors (might be transient)
  return true;
};

/**
 * Get retry delay in milliseconds (exponential backoff)
 */
export const getRetryDelay = (retryCount: number): number => {
  const baseDelay = 1000; // 1 second
  return baseDelay * Math.pow(2, retryCount);
};

/**
 * Handle authentication errors by redirecting to sign-in
 */
export const handleAuthError = (error: BookingError, onAuthRequired?: () => void): void => {
  if (isAuthError(error)) {
    console.warn('Authentication required:', error.message);
    
    // Call the provided callback for handling auth errors
    if (onAuthRequired) {
      onAuthRequired();
      return;
    }
    
    // Fallback: Try to trigger sign-in flow
    // This could be enhanced to integrate with your app's routing/auth system
    try {
      // Check if there's a global auth handler
      if (typeof window !== 'undefined' && (window as any).handleAuthRequired) {
        (window as any).handleAuthRequired();
        return;
      }
      
      // Fallback: Show alert and reload (basic implementation)
      if (typeof window !== 'undefined') {
        const shouldReload = window.confirm(
          'You need to sign in to continue. Would you like to reload the page to sign in?'
        );
        if (shouldReload) {
          window.location.reload();
        }
      }
    } catch (e) {
      console.error('Error handling auth redirect:', e);
    }
  }
};

/**
 * Log error for debugging and monitoring
 */
export const logError = (error: BookingError, context?: string): void => {
  const errorLog = {
    code: error.code,
    message: error.message,
    details: error.details,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  console.error('Booking Error:', errorLog);
  
  // In production, you might want to send this to an error tracking service
  // Example: errorTrackingService.logError(errorLog);
};

/**
 * Create error from unknown exception
 */
export const createErrorFromException = (exception: any, context?: string): BookingError => {
  // If it's already a BookingError, return as-is
  if (exception && typeof exception === 'object' && exception.code && exception.message) {
    return exception as BookingError;
  }
  
  // Handle Firebase errors
  if (exception?.code?.startsWith('auth/')) {
    return createBookingError(
      BOOKING_ERROR_CODES.AUTH_REQUIRED,
      'Authentication required to complete booking.',
      { originalError: exception }
    );
  }
  
  if (exception?.code === 'permission-denied') {
    return createBookingError(
      BOOKING_ERROR_CODES.PERMISSION_DENIED,
      'You do not have permission to perform this action.',
      { originalError: exception }
    );
  }
  
  if (exception?.code === 'unauthenticated') {
    return createBookingError(
      BOOKING_ERROR_CODES.UNAUTHENTICATED,
      'Your session has expired. Please sign in again.',
      { originalError: exception }
    );
  }
  
  if (exception?.code === 'unavailable') {
    return createBookingError(
      BOOKING_ERROR_CODES.FIRESTORE_ERROR,
      'Service is temporarily unavailable. Please try again.',
      { originalError: exception }
    );
  }
  
  if (exception?.code === 'deadline-exceeded' || exception?.name === 'TimeoutError') {
    return createBookingError(
      BOOKING_ERROR_CODES.TIMEOUT_ERROR,
      'The request timed out. Please try again.',
      { originalError: exception }
    );
  }
  
  // Handle network errors
  if (exception instanceof TypeError && exception.message.includes('fetch')) {
    return createBookingError(
      BOOKING_ERROR_CODES.NETWORK_ERROR,
      'Network connection failed. Please check your internet connection.',
      { originalError: exception }
    );
  }
  
  // Generic error fallback
  return createBookingError(
    BOOKING_ERROR_CODES.UNKNOWN_ERROR,
    exception?.message || 'An unexpected error occurred.',
    { originalError: exception, context }
  );
};