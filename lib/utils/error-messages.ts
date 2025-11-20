/**
 * Error Messages Utility
 * Maps error codes to user-friendly messages
 * Requirements: 1.2, 2.2, 3.2, 3.4, 5.3
 */

import { AuthErrorCode } from '@/lib/types/auth';

/**
 * Map of error codes to user-friendly messages
 */
export const ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  [AuthErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password. Please try again.',
  [AuthErrorCode.EMAIL_ALREADY_EXISTS]: 'An account with this email already exists. Please log in instead.',
  [AuthErrorCode.ACCOUNT_LOCKED]: 'Your account has been temporarily locked due to too many failed login attempts. Please try again later.',
  [AuthErrorCode.INVALID_TOKEN]: 'This link is invalid or has already been used. Please request a new one.',
  [AuthErrorCode.TOKEN_EXPIRED]: 'This link has expired. Please request a new one.',
  [AuthErrorCode.WEAK_PASSWORD]: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.',
  [AuthErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many attempts. Please wait a few minutes before trying again.',
  [AuthErrorCode.INVALID_EMAIL]: 'Please enter a valid email address.',
  [AuthErrorCode.USER_NOT_FOUND]: 'No account found with this email address.',
  [AuthErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
};

/**
 * Get user-friendly error message from error code
 * 
 * @param code - Error code
 * @param fallbackMessage - Optional fallback message if code not found
 * @returns User-friendly error message
 */
export function getErrorMessage(
  code: AuthErrorCode | string,
  fallbackMessage: string = 'An unexpected error occurred. Please try again.'
): string {
  if (code in ERROR_MESSAGES) {
    return ERROR_MESSAGES[code as AuthErrorCode];
  }
  return fallbackMessage;
}

/**
 * Extract error message from various error types
 * 
 * @param error - Error object, string, or unknown
 * @returns User-friendly error message
 */
export function extractErrorMessage(error: unknown): string {
  // Handle AuthError with error code
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    const message = (error as { message?: string }).message;
    return getErrorMessage(code, message);
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle API error responses
  if (error && typeof error === 'object' && 'error' in error) {
    const errorObj = error as { error: { code?: string; message?: string } };
    if (errorObj.error.code) {
      return getErrorMessage(errorObj.error.code, errorObj.error.message);
    }
    if (errorObj.error.message) {
      return errorObj.error.message;
    }
  }

  // Default fallback
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Check if error is a specific auth error code
 * 
 * @param error - Error object
 * @param code - Error code to check
 * @returns True if error matches the code
 */
export function isAuthError(error: unknown, code: AuthErrorCode): boolean {
  if (error && typeof error === 'object' && 'code' in error) {
    return (error as { code: string }).code === code;
  }
  return false;
}

/**
 * Format validation errors from Zod or similar validators
 * 
 * @param errors - Validation errors object
 * @returns Formatted error message
 */
export function formatValidationErrors(
  errors: Record<string, string[] | string | undefined>
): string {
  const messages: string[] = [];
  
  for (const [field, error] of Object.entries(errors)) {
    if (Array.isArray(error)) {
      messages.push(...error);
    } else if (typeof error === 'string') {
      messages.push(error);
    }
  }
  
  return messages.join('. ');
}
