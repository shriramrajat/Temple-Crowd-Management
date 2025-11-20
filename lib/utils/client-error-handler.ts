/**
 * Client-Side Error Handler Utility
 * Handles errors in client components with retry logic and user feedback
 * Requirements: 10.2, 10.3, 10.4
 */

import { toast } from 'sonner';
import { APIErrorResponse } from './api-error-handler';

/**
 * Network error class
 */
export class NetworkError extends Error {
  constructor(message: string = 'Network error. Please check your connection.') {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * API error class for client-side
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Parse API error response
 */
export async function parseAPIError(response: Response): Promise<APIError> {
  try {
    const data: APIErrorResponse = await response.json();
    return new APIError(
      data.message || 'An error occurred',
      data.statusCode || response.status,
      data.code,
      data.details
    );
  } catch {
    // If response is not JSON, use status text
    return new APIError(
      response.statusText || 'An error occurred',
      response.status
    );
  }
}

/**
 * Extract field-specific validation errors
 * Requirement 10.3 - Field-specific validation error display
 */
export function extractValidationErrors(
  error: APIError
): Record<string, string[]> | null {
  if (error.code === 'VALIDATION_ERROR' && error.details?.validationErrors) {
    return error.details.validationErrors as Record<string, string[]>;
  }
  return null;
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(
  errors: Record<string, string[]>
): string {
  const messages: string[] = [];
  
  for (const [field, fieldErrors] of Object.entries(errors)) {
    const fieldName = field.split('.').pop() || field;
    const capitalizedField = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    messages.push(`${capitalizedField}: ${fieldErrors.join(', ')}`);
  }
  
  return messages.join('\n');
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryableStatusCodes: number[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * Check if error is retryable
 */
function isRetryable(error: unknown, config: RetryConfig): boolean {
  if (error instanceof NetworkError) {
    return true;
  }

  if (error instanceof APIError) {
    return config.retryableStatusCodes.includes(error.statusCode);
  }

  return false;
}

/**
 * Calculate retry delay with exponential backoff
 */
function calculateRetryDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(2, attempt);
  return Math.min(delay, config.maxDelay);
}

/**
 * Fetch with retry logic
 * Requirement 10.4 - Network error handling with retry options
 */
export async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  retryConfig: Partial<RetryConfig> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  let lastError: unknown;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const apiError = await parseAPIError(response);
        
        // If not retryable or last attempt, throw error
        if (!isRetryable(apiError, config) || attempt === config.maxRetries) {
          throw apiError;
        }
        
        lastError = apiError;
      } else {
        return await response.json();
      }
    } catch (error) {
      // Network error (fetch failed)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = new NetworkError();
        
        // If last attempt, throw error
        if (attempt === config.maxRetries) {
          throw networkError;
        }
        
        lastError = networkError;
      } else {
        // Re-throw non-network errors
        throw error;
      }
    }

    // Wait before retrying
    if (attempt < config.maxRetries) {
      const delay = calculateRetryDelay(attempt, config);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Should never reach here, but throw last error just in case
  throw lastError;
}

/**
 * Handle error with user feedback
 * Requirement 10.2 - Descriptive error messages
 */
export function handleError(
  error: unknown,
  context?: string,
  showToast: boolean = true
): string {
  let errorMessage: string;

  if (error instanceof APIError) {
    errorMessage = error.message;
    
    // Show validation errors in a more user-friendly way
    const validationErrors = extractValidationErrors(error);
    if (validationErrors) {
      const formattedErrors = formatValidationErrors(validationErrors);
      errorMessage = formattedErrors;
    }
  } else if (error instanceof NetworkError) {
    errorMessage = error.message;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = 'An unexpected error occurred. Please try again.';
  }

  // Add context if provided
  const fullMessage = context ? `${context}: ${errorMessage}` : errorMessage;

  // Show toast notification
  if (showToast) {
    toast.error(fullMessage);
  }

  // Log error for debugging
  console.error('Client error:', {
    context,
    error,
    message: errorMessage,
  });

  return fullMessage;
}

/**
 * Handle error with retry option
 * Requirement 10.4 - Network error handling with retry options
 */
export function handleErrorWithRetry(
  error: unknown,
  onRetry: () => void,
  context?: string
): void {
  const errorMessage = handleError(error, context, false);
  
  // Check if error is retryable
  const retryable = isRetryable(error, DEFAULT_RETRY_CONFIG);

  if (retryable) {
    toast.error(errorMessage, {
      description: 'This error may be temporary.',
      action: {
        label: 'Retry',
        onClick: onRetry,
      },
      duration: 5000,
    });
  } else {
    toast.error(errorMessage, {
      duration: 5000,
    });
  }
}

/**
 * Show success message
 */
export function showSuccess(
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
 * Show info message
 */
export function showInfo(
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
 * Show warning message
 */
export function showWarning(
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
 * Async operation with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorContext?: string,
  showToast: boolean = true
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    handleError(error, errorContext, showToast);
    return null;
  }
}

/**
 * Async operation with retry
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  errorContext?: string,
  retryConfig?: Partial<RetryConfig>
): Promise<T> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  let lastError: unknown;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // If not retryable or last attempt, throw error
      if (!isRetryable(error, config) || attempt === config.maxRetries) {
        handleError(error, errorContext);
        throw error;
      }

      // Wait before retrying
      if (attempt < config.maxRetries) {
        const delay = calculateRetryDelay(attempt, config);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Form submission error handler
 * Requirement 10.3 - Field-specific validation error display
 */
export function handleFormError(
  error: unknown,
  setFieldError?: (field: string, message: string) => void
): void {
  if (error instanceof APIError) {
    const validationErrors = extractValidationErrors(error);
    
    if (validationErrors && setFieldError) {
      // Set field-specific errors
      for (const [field, messages] of Object.entries(validationErrors)) {
        setFieldError(field, messages.join(', '));
      }
      
      // Show general toast
      toast.error('Please check the form for errors.');
    } else {
      // Show error message in toast
      toast.error(error.message);
    }
  } else {
    handleError(error);
  }
}
