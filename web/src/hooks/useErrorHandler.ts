'use client';

import { useCallback, useEffect } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { useErrorContext } from '@/contexts/ErrorContext';
import { errorHandler, ErrorContext } from '@/lib/errorHandler';

interface UseErrorHandlerOptions {
  context?: Partial<ErrorContext>;
  throwOnError?: boolean;
  showToasts?: boolean;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const { showBoundary } = useErrorBoundary();
  const { showError, showWarning, showInfo } = useErrorContext();
  const { context = {}, throwOnError = false, showToasts = true } = options;

  // Set context when component mounts or context changes
  useEffect(() => {
    if (Object.keys(context).length > 0) {
      errorHandler.setContext(context);
    }
  }, [context]);

  const captureError = useCallback((
    error: Error, 
    additionalContext?: Partial<ErrorContext>,
    shouldThrow: boolean = throwOnError,
    showToast: boolean = showToasts
  ) => {
    // Capture the error with error handler for logging
    errorHandler.captureException(error, undefined, additionalContext);
    
    // Show toast notification if enabled
    if (showToast) {
      showError(error.message, {
        dismissible: true,
        context: additionalContext,
      });
    }
    
    // Optionally throw to error boundary
    if (shouldThrow) {
      showBoundary(error);
    }
  }, [showBoundary, throwOnError, showToasts, showError]);

  const captureMessage = useCallback((
    message: string, 
    level: 'info' | 'warning' | 'error' = 'error',
    additionalContext?: Partial<ErrorContext>,
    showToast: boolean = showToasts
  ) => {
    // Log with error handler
    errorHandler.captureMessage(message, level, additionalContext);
    
    // Show toast notification if enabled
    if (showToast) {
      switch (level) {
        case 'error':
          showError(message, { context: additionalContext });
          break;
        case 'warning':
          showWarning(message, { context: additionalContext });
          break;
        case 'info':
          showInfo(message, { context: additionalContext });
          break;
      }
    }
  }, [showToasts, showError, showWarning, showInfo]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    errorContext?: Partial<ErrorContext>,
    showToast: boolean = showToasts
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      captureError(errorObj, errorContext, false, showToast);
      return null;
    }
  }, [captureError, showToasts]);

  const wrapAsyncFunction = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    errorContext?: Partial<ErrorContext>,
    showToast: boolean = showToasts
  ) => {
    return async (...args: T): Promise<R | null> => {
      try {
        return await fn(...args);
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        captureError(errorObj, errorContext, false, showToast);
        return null;
      }
    };
  }, [captureError, showToasts]);

  const handleAsyncWithRetry = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    operationName: string,
    maxRetries: number = 3,
    errorContext?: Partial<ErrorContext>
  ): Promise<T | null> => {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await asyncFn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < maxRetries) {
          // Show warning for retry attempts
          captureMessage(
            `${operationName} failed (attempt ${attempt}/${maxRetries}). Retrying...`,
            'warning',
            { ...errorContext, attempt, maxRetries },
            true
          );
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    // All retries failed
    if (lastError) {
      captureError(
        lastError,
        { ...errorContext, operation: operationName, maxRetries },
        false,
        true
      );
    }
    
    return null;
  }, [captureError, captureMessage]);

  return {
    captureError,
    captureMessage,
    handleAsyncError,
    wrapAsyncFunction,
    handleAsyncWithRetry,
  };
};