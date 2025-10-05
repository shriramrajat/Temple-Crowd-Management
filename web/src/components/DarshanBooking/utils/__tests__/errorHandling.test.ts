import {
  createBookingError,
  isNetworkError,
  isAuthError,
  isValidationError,
  getErrorMessage,
  getErrorGuidance,
  shouldRetry,
  getRetryDelay,
  handleAuthError,
  createErrorFromException
} from '../errorHandling';
import { BookingError } from '@/types/booking';
import { BOOKING_ERROR_CODES } from '@/constants/booking';

describe('Error Handling Utilities', () => {
  describe('createBookingError', () => {
    it('creates a booking error with provided details', () => {
      const error = createBookingError(
        BOOKING_ERROR_CODES.NETWORK_ERROR,
        'Custom message',
        { extra: 'data' }
      );

      expect(error).toEqual({
        code: BOOKING_ERROR_CODES.NETWORK_ERROR,
        message: 'Custom message',
        details: { extra: 'data' }
      });
    });

    it('uses default message when none provided', () => {
      const error = createBookingError(BOOKING_ERROR_CODES.NETWORK_ERROR);

      expect(error.code).toBe(BOOKING_ERROR_CODES.NETWORK_ERROR);
      expect(error.message).toBe('Network connection failed. Please check your internet connection and try again.');
    });
  });

  describe('isNetworkError', () => {
    it('identifies network errors by code', () => {
      const networkError: BookingError = {
        code: BOOKING_ERROR_CODES.NETWORK_ERROR,
        message: 'Network failed'
      };

      expect(isNetworkError(networkError)).toBe(true);
    });

    it('identifies Firestore unavailable errors', () => {
      const firestoreError = {
        code: 'unavailable',
        message: 'Service unavailable'
      };

      expect(isNetworkError(firestoreError)).toBe(true);
    });

    it('identifies network errors by name', () => {
      const networkError = {
        name: 'NetworkError',
        message: 'Network request failed'
      };

      expect(isNetworkError(networkError)).toBe(true);
    });

    it('returns false for non-network errors', () => {
      const authError: BookingError = {
        code: BOOKING_ERROR_CODES.AUTH_REQUIRED,
        message: 'Auth required'
      };

      expect(isNetworkError(authError)).toBe(false);
    });

    it('handles null/undefined input', () => {
      expect(isNetworkError(null)).toBe(false);
      expect(isNetworkError(undefined)).toBe(false);
    });
  });

  describe('isAuthError', () => {
    it('identifies auth required errors', () => {
      const authError: BookingError = {
        code: BOOKING_ERROR_CODES.AUTH_REQUIRED,
        message: 'Auth required'
      };

      expect(isAuthError(authError)).toBe(true);
    });

    it('identifies permission denied errors', () => {
      const permissionError: BookingError = {
        code: BOOKING_ERROR_CODES.PERMISSION_DENIED,
        message: 'Permission denied'
      };

      expect(isAuthError(permissionError)).toBe(true);
    });

    it('identifies Firebase auth errors', () => {
      const firebaseAuthError = {
        code: 'auth/user-not-found',
        message: 'User not found'
      };

      expect(isAuthError(firebaseAuthError)).toBe(true);
    });

    it('identifies Firebase permission-denied errors', () => {
      const firebasePermissionError = {
        code: 'permission-denied',
        message: 'Permission denied'
      };

      expect(isAuthError(firebasePermissionError)).toBe(true);
    });

    it('returns false for non-auth errors', () => {
      const networkError: BookingError = {
        code: BOOKING_ERROR_CODES.NETWORK_ERROR,
        message: 'Network failed'
      };

      expect(isAuthError(networkError)).toBe(false);
    });
  });

  describe('isValidationError', () => {
    it('identifies validation errors', () => {
      const validationError: BookingError = {
        code: BOOKING_ERROR_CODES.INVALID_DATE,
        message: 'Invalid date'
      };

      expect(isValidationError(validationError)).toBe(true);
    });

    it('identifies slot unavailable errors', () => {
      const slotError: BookingError = {
        code: BOOKING_ERROR_CODES.SLOT_UNAVAILABLE,
        message: 'Slot unavailable'
      };

      expect(isValidationError(slotError)).toBe(true);
    });

    it('returns false for non-validation errors', () => {
      const networkError: BookingError = {
        code: BOOKING_ERROR_CODES.NETWORK_ERROR,
        message: 'Network failed'
      };

      expect(isValidationError(networkError)).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('returns custom message when provided', () => {
      const error: BookingError = {
        code: BOOKING_ERROR_CODES.NETWORK_ERROR,
        message: 'Custom network error message'
      };

      expect(getErrorMessage(error)).toBe('Custom network error message');
    });

    it('returns default message for known error codes', () => {
      const error: BookingError = {
        code: BOOKING_ERROR_CODES.NETWORK_ERROR,
        message: ''
      };

      expect(getErrorMessage(error)).toBe('Network connection failed. Please check your internet connection and try again.');
    });

    it('returns fallback message for unknown error codes', () => {
      const error: BookingError = {
        code: 'unknown_code',
        message: ''
      };

      expect(getErrorMessage(error)).toBe('An unexpected error occurred. Please try again.');
    });

    it('handles null/undefined input', () => {
      expect(getErrorMessage(null as any)).toBe('An unknown error occurred.');
    });
  });

  describe('getErrorGuidance', () => {
    it('provides network error guidance', () => {
      const networkError: BookingError = {
        code: BOOKING_ERROR_CODES.NETWORK_ERROR,
        message: 'Network failed'
      };

      expect(getErrorGuidance(networkError)).toBe('Please check your internet connection and try again.');
    });

    it('provides auth error guidance', () => {
      const authError: BookingError = {
        code: BOOKING_ERROR_CODES.AUTH_REQUIRED,
        message: 'Auth required'
      };

      expect(getErrorGuidance(authError)).toBe('Please sign in to your account and try again.');
    });

    it('provides specific validation error guidance', () => {
      const invalidDateError: BookingError = {
        code: BOOKING_ERROR_CODES.INVALID_DATE,
        message: 'Invalid date'
      };

      expect(getErrorGuidance(invalidDateError)).toBe('Please select a valid future date.');
    });

    it('provides generic guidance for unknown errors', () => {
      const unknownError: BookingError = {
        code: 'unknown_code',
        message: 'Unknown error'
      };

      expect(getErrorGuidance(unknownError)).toBe('If the problem persists, please contact temple administration.');
    });
  });

  describe('shouldRetry', () => {
    it('allows retry for network errors', () => {
      const networkError: BookingError = {
        code: BOOKING_ERROR_CODES.NETWORK_ERROR,
        message: 'Network failed'
      };

      expect(shouldRetry(networkError, 0)).toBe(true);
      expect(shouldRetry(networkError, 2)).toBe(true);
    });

    it('prevents retry when max retries reached', () => {
      const networkError: BookingError = {
        code: BOOKING_ERROR_CODES.NETWORK_ERROR,
        message: 'Network failed'
      };

      expect(shouldRetry(networkError, 3)).toBe(false);
    });

    it('prevents retry for auth errors', () => {
      const authError: BookingError = {
        code: BOOKING_ERROR_CODES.AUTH_REQUIRED,
        message: 'Auth required'
      };

      expect(shouldRetry(authError, 0)).toBe(false);
    });

    it('prevents retry for validation errors', () => {
      const validationError: BookingError = {
        code: BOOKING_ERROR_CODES.INVALID_DATE,
        message: 'Invalid date'
      };

      expect(shouldRetry(validationError, 0)).toBe(false);
    });

    it('allows retry for unknown errors', () => {
      const unknownError: BookingError = {
        code: 'unknown_code',
        message: 'Unknown error'
      };

      expect(shouldRetry(unknownError, 0)).toBe(true);
    });
  });

  describe('getRetryDelay', () => {
    it('calculates exponential backoff delay', () => {
      expect(getRetryDelay(0)).toBe(1000); // 1 second
      expect(getRetryDelay(1)).toBe(2000); // 2 seconds
      expect(getRetryDelay(2)).toBe(4000); // 4 seconds
      expect(getRetryDelay(3)).toBe(8000); // 8 seconds
    });
  });

  describe('handleAuthError', () => {
    const mockOnAuthRequired = jest.fn();
    const mockConfirm = jest.fn();
    const mockReload = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
      
      // Mock window methods
      Object.defineProperty(window, 'confirm', {
        value: mockConfirm,
        writable: true,
        configurable: true
      });
      
      // Mock location.reload
      delete (window as any).location;
      (window as any).location = { reload: mockReload };
    });

    it('calls onAuthRequired callback for auth errors', () => {
      const authError: BookingError = {
        code: BOOKING_ERROR_CODES.AUTH_REQUIRED,
        message: 'Auth required'
      };

      handleAuthError(authError, mockOnAuthRequired);
      expect(mockOnAuthRequired).toHaveBeenCalledTimes(1);
    });

    it('does not call callback for non-auth errors', () => {
      const networkError: BookingError = {
        code: BOOKING_ERROR_CODES.NETWORK_ERROR,
        message: 'Network failed'
      };

      handleAuthError(networkError, mockOnAuthRequired);
      expect(mockOnAuthRequired).not.toHaveBeenCalled();
    });

    it('shows confirm dialog when no callback provided', () => {
      const authError: BookingError = {
        code: BOOKING_ERROR_CODES.AUTH_REQUIRED,
        message: 'Auth required'
      };

      mockConfirm.mockReturnValue(true);
      handleAuthError(authError);
      
      expect(mockConfirm).toHaveBeenCalledWith(
        'You need to sign in to continue. Would you like to reload the page to sign in?'
      );
      expect(mockReload).toHaveBeenCalledTimes(1);
    });

    it('does not reload when user cancels confirm dialog', () => {
      const authError: BookingError = {
        code: BOOKING_ERROR_CODES.AUTH_REQUIRED,
        message: 'Auth required'
      };

      mockConfirm.mockReturnValue(false);
      handleAuthError(authError);
      
      expect(mockConfirm).toHaveBeenCalled();
      expect(mockReload).not.toHaveBeenCalled();
    });
  });

  describe('createErrorFromException', () => {
    it('returns existing BookingError as-is', () => {
      const existingError: BookingError = {
        code: BOOKING_ERROR_CODES.NETWORK_ERROR,
        message: 'Existing error'
      };

      const result = createErrorFromException(existingError);
      expect(result).toBe(existingError);
    });

    it('converts Firebase auth errors', () => {
      const firebaseAuthError = {
        code: 'auth/user-not-found',
        message: 'User not found'
      };

      const result = createErrorFromException(firebaseAuthError);
      expect(result.code).toBe(BOOKING_ERROR_CODES.AUTH_REQUIRED);
      expect(result.message).toBe('Authentication required to complete booking.');
      expect(result.details?.originalError).toBe(firebaseAuthError);
    });

    it('converts Firebase permission errors', () => {
      const permissionError = {
        code: 'permission-denied',
        message: 'Permission denied'
      };

      const result = createErrorFromException(permissionError);
      expect(result.code).toBe(BOOKING_ERROR_CODES.PERMISSION_DENIED);
      expect(result.message).toBe('You do not have permission to perform this action.');
    });

    it('converts Firebase unavailable errors', () => {
      const unavailableError = {
        code: 'unavailable',
        message: 'Service unavailable'
      };

      const result = createErrorFromException(unavailableError);
      expect(result.code).toBe(BOOKING_ERROR_CODES.FIRESTORE_ERROR);
      expect(result.message).toBe('Service is temporarily unavailable. Please try again.');
    });

    it('converts network TypeError', () => {
      const networkError = new TypeError('fetch failed');

      const result = createErrorFromException(networkError);
      expect(result.code).toBe(BOOKING_ERROR_CODES.NETWORK_ERROR);
    });

    it('converts timeout errors', () => {
      const timeoutError = {
        code: 'deadline-exceeded',
        message: 'Timeout'
      };

      const result = createErrorFromException(timeoutError);
      expect(result.code).toBe(BOOKING_ERROR_CODES.TIMEOUT_ERROR);
      expect(result.message).toBe('The request timed out. Please try again.');
    });

    it('creates generic error for unknown exceptions', () => {
      const unknownError = new Error('Unknown error');

      const result = createErrorFromException(unknownError);
      expect(result.code).toBe(BOOKING_ERROR_CODES.UNKNOWN_ERROR);
      expect(result.message).toBe('Unknown error');
    });

    it('handles exceptions without message', () => {
      const result = createErrorFromException({});
      expect(result.code).toBe(BOOKING_ERROR_CODES.UNKNOWN_ERROR);
      expect(result.message).toBe('An unexpected error occurred.');
    });
  });
});