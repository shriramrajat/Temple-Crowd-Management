/**
 * Error Handler Utility
 * 
 * Centralized error handling for accessibility features with user-friendly
 * error messages and toast notifications.
 */

import { toast } from 'sonner';

/**
 * Error types for accessibility features
 */
export enum AccessibilityErrorType {
  PROFILE_LOAD_ERROR = 'PROFILE_LOAD_ERROR',
  PROFILE_SAVE_ERROR = 'PROFILE_SAVE_ERROR',
  SLOT_ALLOCATION_ERROR = 'SLOT_ALLOCATION_ERROR',
  ROUTE_CALCULATION_ERROR = 'ROUTE_CALCULATION_ERROR',
  NOTIFICATION_ERROR = 'NOTIFICATION_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES: Record<AccessibilityErrorType, string> = {
  [AccessibilityErrorType.PROFILE_LOAD_ERROR]: 
    'Unable to load your accessibility profile. Please try again.',
  [AccessibilityErrorType.PROFILE_SAVE_ERROR]: 
    'Failed to save your accessibility profile. Please check your information and try again.',
  [AccessibilityErrorType.SLOT_ALLOCATION_ERROR]: 
    'Unable to allocate priority slot. The slot may no longer be available.',
  [AccessibilityErrorType.ROUTE_CALCULATION_ERROR]: 
    'Could not calculate an accessible route. Please try different options.',
  [AccessibilityErrorType.NOTIFICATION_ERROR]: 
    'Failed to send notification. You may not receive timely updates.',
  [AccessibilityErrorType.STORAGE_ERROR]: 
    'Unable to save data locally. Please check your browser settings.',
  [AccessibilityErrorType.VALIDATION_ERROR]: 
    'Invalid data provided. Please check your input and try again.',
  [AccessibilityErrorType.NETWORK_ERROR]: 
    'Network connection issue. Please check your internet connection.',
  [AccessibilityErrorType.UNKNOWN_ERROR]: 
    'An unexpected error occurred. Please try again later.',
};

/**
 * Error details for logging and debugging
 */
export interface ErrorDetails {
  type: AccessibilityErrorType;
  message: string;
  originalError?: Error | unknown;
  context?: Record<string, any>;
  timestamp: Date;
}

/**
 * Handle errors with user feedback
 */
export function handleAccessibilityError(
  errorType: AccessibilityErrorType,
  originalError?: Error | unknown,
  context?: Record<string, any>,
  showToast: boolean = true
): ErrorDetails {
  const errorDetails: ErrorDetails = {
    type: errorType,
    message: ERROR_MESSAGES[errorType],
    originalError,
    context,
    timestamp: new Date(),
  };

  // Log error for debugging
  console.error('[Accessibility Error]', {
    type: errorType,
    message: errorDetails.message,
    context,
    error: originalError,
  });

  // Show toast notification to user
  if (showToast) {
    toast.error(errorDetails.message, {
      description: getErrorDescription(errorType),
      duration: 5000,
    });
  }

  return errorDetails;
}

/**
 * Get additional error description for user guidance
 */
function getErrorDescription(errorType: AccessibilityErrorType): string {
  switch (errorType) {
    case AccessibilityErrorType.PROFILE_LOAD_ERROR:
      return 'Your profile data may be corrupted. Try refreshing the page.';
    case AccessibilityErrorType.PROFILE_SAVE_ERROR:
      return 'Ensure all required fields are filled correctly.';
    case AccessibilityErrorType.SLOT_ALLOCATION_ERROR:
      return 'Try selecting a different time slot or refresh the page.';
    case AccessibilityErrorType.ROUTE_CALCULATION_ERROR:
      return 'Try adjusting your route preferences or destination.';
    case AccessibilityErrorType.NOTIFICATION_ERROR:
      return 'Check your notification preferences in your profile.';
    case AccessibilityErrorType.STORAGE_ERROR:
      return 'Ensure cookies and local storage are enabled in your browser.';
    case AccessibilityErrorType.NETWORK_ERROR:
      return 'Check your internet connection and try again.';
    default:
      return 'If the problem persists, please contact support.';
  }
}

/**
 * Handle success with user feedback
 */
export function handleAccessibilitySuccess(
  message: string,
  description?: string,
  duration: number = 3000
): void {
  toast.success(message, {
    description,
    duration,
  });
}

/**
 * Handle info messages
 */
export function handleAccessibilityInfo(
  message: string,
  description?: string,
  duration: number = 4000
): void {
  toast.info(message, {
    description,
    duration,
  });
}

/**
 * Handle warning messages
 */
export function handleAccessibilityWarning(
  message: string,
  description?: string,
  duration: number = 4000
): void {
  toast.warning(message, {
    description,
    duration,
  });
}

/**
 * Graceful degradation handler
 * Returns a fallback value when a service fails
 */
export function withFallback<T>(
  operation: () => T,
  fallbackValue: T,
  errorType: AccessibilityErrorType,
  showToast: boolean = false
): T {
  try {
    return operation();
  } catch (error) {
    handleAccessibilityError(errorType, error, undefined, showToast);
    return fallbackValue;
  }
}

/**
 * Async graceful degradation handler
 */
export async function withFallbackAsync<T>(
  operation: () => Promise<T>,
  fallbackValue: T,
  errorType: AccessibilityErrorType,
  showToast: boolean = false
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    handleAccessibilityError(errorType, error, undefined, showToast);
    return fallbackValue;
  }
}

/**
 * Retry operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  errorType: AccessibilityErrorType = AccessibilityErrorType.UNKNOWN_ERROR
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  handleAccessibilityError(errorType, lastError, { maxRetries });
  throw lastError;
}
