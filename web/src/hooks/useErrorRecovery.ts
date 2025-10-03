'use client';

import { useCallback, useState } from 'react';
import { useErrorContext } from '@/contexts/ErrorContext';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoffMultiplier?: number;
  onRetryFailed?: (error: Error, attempts: number) => void;
}

interface UseErrorRecoveryOptions {
  defaultRetryOptions?: RetryOptions;
  context?: Record<string, any>;
}

export const useErrorRecovery = (options: UseErrorRecoveryOptions = {}) => {
  const { showError, showWarning, showInfo } = useErrorContext();
  const [retryAttempts, setRetryAttempts] = useState<Record<string, number>>({});
  
  const { defaultRetryOptions = {}, context = {} } = options;

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string,
    retryOptions: RetryOptions = {}
  ): Promise<T | null> => {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoffMultiplier = 2,
      onRetryFailed,
    } = { ...defaultRetryOptions, ...retryOptions };

    const attemptKey = `${operationName}-${Date.now()}`;
    let currentAttempt = 0;
    let currentDelay = delay;

    const executeAttempt = async (): Promise<T | null> => {
      try {
        currentAttempt++;
        setRetryAttempts(prev => ({ ...prev, [attemptKey]: currentAttempt }));
        
        const result = await operation();
        
        // Clear retry attempts on success
        setRetryAttempts(prev => {
          const { [attemptKey]: _, ...rest } = prev;
          return rest;
        });
        
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (currentAttempt < maxAttempts) {
          // Show retry warning
          showWarning(
            `${operationName} failed (attempt ${currentAttempt}/${maxAttempts}). Retrying in ${currentDelay}ms...`,
            {
              dismissible: true,
              context: { ...context, attempt: currentAttempt, maxAttempts },
            }
          );
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, currentDelay));
          currentDelay *= backoffMultiplier;
          
          return executeAttempt();
        } else {
          // Max attempts reached
          const finalError = error instanceof Error ? error : new Error(errorMessage);
          
          if (onRetryFailed) {
            onRetryFailed(finalError, currentAttempt);
          }
          
          showError(
            `${operationName} failed after ${maxAttempts} attempts: ${errorMessage}`,
            {
              dismissible: true,
              retryable: true,
              retryAction: () => executeWithRetry(operation, operationName, retryOptions),
              context: { ...context, finalAttempt: currentAttempt, error: errorMessage },
            }
          );
          
          // Clear retry attempts
          setRetryAttempts(prev => {
            const { [attemptKey]: _, ...rest } = prev;
            return rest;
          });
          
          return null;
        }
      }
    };

    return executeAttempt();
  }, [showError, showWarning, defaultRetryOptions, context]);

  const wrapWithErrorRecovery = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    operationName: string,
    retryOptions?: RetryOptions
  ) => {
    return async (...args: T): Promise<R | null> => {
      return executeWithRetry(() => fn(...args), operationName, retryOptions);
    };
  }, [executeWithRetry]);

  const handleAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    options: {
      operationName: string;
      successMessage?: string;
      loadingMessage?: string;
      retryOptions?: RetryOptions;
    }
  ): Promise<T | null> => {
    const { operationName, successMessage, loadingMessage, retryOptions } = options;
    
    if (loadingMessage) {
      showInfo(loadingMessage, { dismissible: false });
    }
    
    try {
      const result = await executeWithRetry(operation, operationName, retryOptions);
      
      if (result !== null && successMessage) {
        showInfo(successMessage, { dismissible: true });
      }
      
      return result;
    } catch (error) {
      // Error is already handled by executeWithRetry
      return null;
    }
  }, [executeWithRetry, showInfo]);

  const createRetryableAction = useCallback((
    action: () => Promise<void> | void,
    actionName: string,
    retryOptions?: RetryOptions
  ) => {
    return async () => {
      if (typeof action === 'function') {
        const result = action();
        if (result instanceof Promise) {
          await executeWithRetry(() => result, actionName, retryOptions);
        } else {
          // Synchronous action, wrap in promise
          await executeWithRetry(() => Promise.resolve(result), actionName, retryOptions);
        }
      }
    };
  }, [executeWithRetry]);

  return {
    executeWithRetry,
    wrapWithErrorRecovery,
    handleAsyncOperation,
    createRetryableAction,
    retryAttempts,
  };
};