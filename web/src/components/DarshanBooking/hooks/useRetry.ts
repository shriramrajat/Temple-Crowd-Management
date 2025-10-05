import { useState, useCallback, useRef } from 'react';
import { BookingError } from '@/types/booking';
import { shouldRetry, getRetryDelay, logError } from '../utils/errorHandling';

interface UseRetryOptions {
  maxRetries?: number;
  onRetryExhausted?: (error: BookingError) => void;
  onRetryAttempt?: (retryCount: number, error: BookingError) => void;
}

interface UseRetryReturn {
  retryCount: number;
  isRetrying: boolean;
  executeWithRetry: <T>(
    operation: () => Promise<T>,
    context?: string
  ) => Promise<T>;
  reset: () => void;
}

/**
 * Custom hook for implementing retry logic with exponential backoff
 * Automatically retries operations that fail due to network or transient errors
 */
export const useRetry = (options: UseRetryOptions = {}): UseRetryReturn => {
  const {
    maxRetries = 3,
    onRetryExhausted,
    onRetryAttempt
  } = options;

  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Reset retry state
   */
  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Execute operation with retry logic
   */
  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> => {
    let currentRetryCount = 0;
    let lastError: BookingError | null = null;

    // Create abort controller for this operation
    abortControllerRef.current = new AbortController();

    while (currentRetryCount <= maxRetries) {
      try {
        // Check if operation was aborted
        if (abortControllerRef.current.signal.aborted) {
          throw new Error('Operation was cancelled');
        }

        // Set retry state
        setRetryCount(currentRetryCount);
        setIsRetrying(currentRetryCount > 0);

        // Execute the operation
        const result = await operation();
        
        // Success - reset state and return result
        reset();
        return result;

      } catch (error: any) {
        lastError = error as BookingError;
        
        // Log the error
        logError(lastError, `${context} - Attempt ${currentRetryCount + 1}`);

        // Check if we should retry
        if (currentRetryCount < maxRetries && shouldRetry(lastError, currentRetryCount)) {
          currentRetryCount++;
          
          // Notify about retry attempt
          onRetryAttempt?.(currentRetryCount, lastError);
          
          // Wait before retrying (exponential backoff)
          const delay = getRetryDelay(currentRetryCount - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Check if operation was aborted during delay
          if (abortControllerRef.current.signal.aborted) {
            throw new Error('Operation was cancelled');
          }
          
          continue;
        } else {
          // No more retries or shouldn't retry
          break;
        }
      }
    }

    // All retries exhausted
    setIsRetrying(false);
    setRetryCount(currentRetryCount);
    
    if (lastError) {
      onRetryExhausted?.(lastError);
      throw lastError;
    }

    throw new Error('Operation failed without error details');
  }, [maxRetries, onRetryExhausted, onRetryAttempt, reset]);

  return {
    retryCount,
    isRetrying,
    executeWithRetry,
    reset
  };
};