'use client';

import React, { ReactNode, ErrorInfo } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './ErrorFallback';

interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number | boolean | null | undefined>;
}

export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({
  children,
  fallback,
  onError,
  resetKeys,
}) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log error details
    console.error('ErrorBoundaryWrapper caught an error:', error, errorInfo);
    
    // Report error to logging service
    reportError(error, errorInfo);
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
  };

  const reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Placeholder for error reporting service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack || undefined,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    console.error('Error Report:', errorReport);
    
    // TODO: Send to error reporting service
    // Example: errorReportingService.captureException(error, { extra: errorReport });
  };

  const ErrorFallbackComponent = ({ error, resetErrorBoundary }: { 
    error: Error; 
    resetErrorBoundary: () => void; 
  }) => {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <ErrorFallback
        error={error}
        resetError={resetErrorBoundary}
        showDetails={process.env.NODE_ENV === 'development'}
      />
    );
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallbackComponent}
      onError={handleError}
      resetKeys={resetKeys}
    >
      {children}
    </ReactErrorBoundary>
  );
};