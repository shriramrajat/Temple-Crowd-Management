'use client';

import { useCallback } from 'react';
import { useErrorRecovery } from './useErrorRecovery';
import { FirebaseError } from 'firebase/app';

interface FirebaseErrorRecoveryOptions {
  maxAttempts?: number;
  showUserFriendlyMessages?: boolean;
}

export const useFirebaseErrorRecovery = (options: FirebaseErrorRecoveryOptions = {}) => {
  const { maxAttempts = 3, showUserFriendlyMessages = true } = options;
  const { executeWithRetry, handleAsyncOperation } = useErrorRecovery({
    defaultRetryOptions: { maxAttempts },
  });

  const getFirebaseErrorMessage = useCallback((error: FirebaseError): string => {
    if (!showUserFriendlyMessages) {
      return error.message;
    }

    switch (error.code) {
      // Auth errors
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled. Please try again.';
      case 'auth/popup-blocked':
        return 'Pop-up was blocked. Please allow pop-ups and try again.';
      
      // Firestore errors
      case 'firestore/permission-denied':
        return 'You do not have permission to perform this action.';
      case 'firestore/not-found':
        return 'The requested document was not found.';
      case 'firestore/already-exists':
        return 'A document with this ID already exists.';
      case 'firestore/resource-exhausted':
        return 'Service is temporarily unavailable. Please try again later.';
      case 'firestore/failed-precondition':
        return 'Operation failed due to a conflict. Please refresh and try again.';
      case 'firestore/aborted':
        return 'Operation was aborted due to a conflict. Please try again.';
      case 'firestore/out-of-range':
        return 'Invalid input provided. Please check your data and try again.';
      case 'firestore/unimplemented':
        return 'This feature is not yet available.';
      case 'firestore/internal':
        return 'An internal error occurred. Please try again.';
      case 'firestore/unavailable':
        return 'Service is temporarily unavailable. Please try again later.';
      case 'firestore/data-loss':
        return 'Data loss detected. Please contact support.';
      case 'firestore/unauthenticated':
        return 'Please sign in to continue.';
      case 'firestore/deadline-exceeded':
        return 'Request timed out. Please try again.';
      
      // Network errors
      case 'auth/network-request-failed':
      case 'firestore/unavailable':
        return 'Network connection issue. Please check your internet and try again.';
      
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }, [showUserFriendlyMessages]);

  const isRetryableError = useCallback((error: FirebaseError): boolean => {
    const retryableCodes = [
      'auth/network-request-failed',
      'firestore/unavailable',
      'firestore/deadline-exceeded',
      'firestore/aborted',
      'firestore/internal',
      'auth/too-many-requests',
    ];
    
    return retryableCodes.includes(error.code);
  }, []);

  const executeFirebaseOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string,
    options: {
      retryOnlyRetryableErrors?: boolean;
      customRetryLogic?: (error: FirebaseError, attempt: number) => boolean;
    } = {}
  ): Promise<T | null> => {
    const { retryOnlyRetryableErrors = true, customRetryLogic } = options;

    return executeWithRetry(
      operation,
      operationName,
      {
        maxAttempts,
        delay: 1000,
        backoffMultiplier: 2,
        onRetryFailed: (error: Error, attempts: number) => {
          console.error(`Firebase operation "${operationName}" failed after ${attempts} attempts:`, error);
        },
      }
    );
  }, [executeWithRetry, maxAttempts]);

  const handleFirebaseAuth = useCallback(async <T>(
    authOperation: () => Promise<T>,
    operationName: string = 'Authentication'
  ): Promise<T | null> => {
    return handleAsyncOperation(authOperation, {
      operationName,
      retryOptions: {
        maxAttempts: 2, // Auth operations typically shouldn't be retried as much
        delay: 500,
      },
    });
  }, [handleAsyncOperation]);

  const handleFirestoreOperation = useCallback(async <T>(
    firestoreOperation: () => Promise<T>,
    operationName: string = 'Database operation'
  ): Promise<T | null> => {
    return handleAsyncOperation(firestoreOperation, {
      operationName,
      retryOptions: {
        maxAttempts,
        delay: 1000,
        backoffMultiplier: 1.5,
      },
    });
  }, [handleAsyncOperation, maxAttempts]);

  const createRetryableFirebaseAction = useCallback((
    operation: () => Promise<void>,
    operationName: string
  ) => {
    return async () => {
      try {
        await executeFirebaseOperation(operation, operationName);
      } catch (error) {
        // Error is already handled by executeFirebaseOperation
        console.error(`Retryable Firebase action "${operationName}" failed:`, error);
      }
    };
  }, [executeFirebaseOperation]);

  return {
    executeFirebaseOperation,
    handleFirebaseAuth,
    handleFirestoreOperation,
    createRetryableFirebaseAction,
    getFirebaseErrorMessage,
    isRetryableError,
  };
};