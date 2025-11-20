/**
 * Toast Notification Helpers
 * Provides consistent toast notifications across the application
 * Requirements: 1.2, 2.2, 3.2, 3.4, 5.3
 */

import { toast } from '@/hooks/use-toast';
import { extractErrorMessage } from './error-messages';

/**
 * Show error toast notification
 * 
 * @param error - Error object, string, or unknown
 * @param title - Optional custom title
 */
export function showErrorToast(
  error: unknown,
  title: string = 'Error'
): void {
  const message = extractErrorMessage(error);
  
  toast({
    variant: 'destructive',
    title,
    description: message,
  });
}

/**
 * Show success toast notification
 * 
 * @param message - Success message
 * @param title - Optional custom title
 */
export function showSuccessToast(
  message: string,
  title: string = 'Success'
): void {
  toast({
    title,
    description: message,
  });
}

/**
 * Show info toast notification
 * 
 * @param message - Info message
 * @param title - Optional custom title
 */
export function showInfoToast(
  message: string,
  title: string = 'Info'
): void {
  toast({
    title,
    description: message,
  });
}

/**
 * Show validation error toast
 * 
 * @param message - Validation error message
 */
export function showValidationErrorToast(message: string): void {
  toast({
    variant: 'destructive',
    title: 'Validation Error',
    description: message,
  });
}

/**
 * Show authentication error toast with specific handling
 * 
 * @param error - Error object
 */
export function showAuthErrorToast(error: unknown): void {
  showErrorToast(error, 'Authentication Error');
}

/**
 * Show network error toast
 */
export function showNetworkErrorToast(): void {
  toast({
    variant: 'destructive',
    title: 'Network Error',
    description: 'Unable to connect to the server. Please check your internet connection and try again.',
  });
}

/**
 * Show rate limit error toast
 * 
 * @param retryAfter - Optional seconds until retry is allowed
 */
export function showRateLimitToast(retryAfter?: number): void {
  const message = retryAfter
    ? `Too many attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`
    : 'Too many attempts. Please wait a few minutes before trying again.';
  
  toast({
    variant: 'destructive',
    title: 'Rate Limit Exceeded',
    description: message,
  });
}
