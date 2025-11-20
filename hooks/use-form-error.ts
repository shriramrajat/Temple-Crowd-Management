/**
 * Form Error Handling Hook
 * Provides field-specific error handling for forms
 * Requirement 10.3 - Field-specific validation error display in forms
 */

import { useState, useCallback } from 'react';
import { APIError, extractValidationErrors } from '@/lib/utils/client-error-handler';

/**
 * Field errors type
 */
export type FieldErrors = Record<string, string>;

/**
 * Form error hook return type
 */
export interface UseFormErrorReturn {
  fieldErrors: FieldErrors;
  generalError: string | null;
  setFieldError: (field: string, message: string) => void;
  setGeneralError: (message: string | null) => void;
  clearFieldError: (field: string) => void;
  clearAllErrors: () => void;
  handleAPIError: (error: unknown) => void;
  hasErrors: boolean;
  getFieldError: (field: string) => string | undefined;
}

/**
 * Hook for managing form errors
 */
export function useFormError(): UseFormErrorReturn {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  /**
   * Set error for a specific field
   */
  const setFieldError = useCallback((field: string, message: string) => {
    setFieldErrors(prev => ({
      ...prev,
      [field]: message,
    }));
  }, []);

  /**
   * Clear error for a specific field
   */
  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
    setGeneralError(null);
  }, []);

  /**
   * Handle API error and extract field-specific errors
   */
  const handleAPIError = useCallback((error: unknown) => {
    // Clear previous errors
    clearAllErrors();

    if (error instanceof APIError) {
      const validationErrors = extractValidationErrors(error);
      
      if (validationErrors) {
        // Set field-specific errors
        const newFieldErrors: FieldErrors = {};
        for (const [field, messages] of Object.entries(validationErrors)) {
          newFieldErrors[field] = messages.join(', ');
        }
        setFieldErrors(newFieldErrors);
      } else {
        // Set general error
        setGeneralError(error.message);
      }
    } else if (error instanceof Error) {
      setGeneralError(error.message);
    } else if (typeof error === 'string') {
      setGeneralError(error);
    } else {
      setGeneralError('An unexpected error occurred. Please try again.');
    }
  }, [clearAllErrors]);

  /**
   * Get error for a specific field
   */
  const getFieldError = useCallback((field: string): string | undefined => {
    return fieldErrors[field];
  }, [fieldErrors]);

  /**
   * Check if there are any errors
   */
  const hasErrors = Object.keys(fieldErrors).length > 0 || generalError !== null;

  return {
    fieldErrors,
    generalError,
    setFieldError,
    setGeneralError,
    clearFieldError,
    clearAllErrors,
    handleAPIError,
    hasErrors,
    getFieldError,
  };
}
