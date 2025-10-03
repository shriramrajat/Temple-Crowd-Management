'use client';

import React, { useEffect, ReactNode } from 'react';
import { ErrorBoundaryWrapper } from '@/components/ui/ErrorBoundaryWrapper';
import { ErrorContextProvider, useErrorContext } from '@/contexts/ErrorContext';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { errorHandler } from '@/lib/errorHandler';
import { useAuth } from '@/hooks/useAuth';

interface ErrorProviderProps {
  children: ReactNode;
}

const ErrorProviderInner: React.FC<ErrorProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { showError } = useErrorContext();

  useEffect(() => {
    // Initialize error handler with user context
    errorHandler.initialize({
      userId: user?.uid,
    });
  }, [user?.uid]);

  // Update user context when user changes
  useEffect(() => {
    if (user) {
      errorHandler.setContext({
        userId: user.uid,
      });
    } else {
      errorHandler.setContext({
        userId: undefined,
      });
    }
  }, [user]);

  return (
    <ErrorBoundaryWrapper
      onError={(error, errorInfo) => {
        // Capture with error handler for logging
        errorHandler.captureException(error, errorInfo, {
          feature: 'app',
          action: 'global_error_boundary',
        });
        
        // Show user-friendly error message
        showError(
          'An unexpected error occurred. Please try refreshing the page.',
          {
            dismissible: true,
            retryable: true,
            retryAction: () => window.location.reload(),
            context: {
              errorMessage: error.message,
              componentStack: errorInfo?.componentStack,
            },
          }
        );
      }}
    >
      {children}
      <ToastContainer />
    </ErrorBoundaryWrapper>
  );
};

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  return (
    <ErrorContextProvider>
      <ErrorProviderInner>
        {children}
      </ErrorProviderInner>
    </ErrorContextProvider>
  );
};