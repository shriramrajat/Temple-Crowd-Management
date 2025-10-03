'use client';

import React from 'react';
import { Button } from './Button';
import { Card } from './Card';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  message?: string;
  showDetails?: boolean;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  showDetails = false,
}) => {
  return (
    <Card className="p-6 text-center max-w-md mx-auto">
      <div className="mx-auto h-12 w-12 text-red-500 mb-4">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{message}</p>

      {showDetails && error && process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-left">
          <h4 className="text-sm font-medium text-red-800 mb-1">Error Details:</h4>
          <pre className="text-xs text-red-700 whitespace-pre-wrap overflow-auto max-h-24">
            {error.message}
          </pre>
        </div>
      )}

      {resetError && (
        <Button onClick={resetError} variant="primary" className="w-full">
          Try Again
        </Button>
      )}
    </Card>
  );
};

// Minimal error fallback for inline use
export const InlineErrorFallback: React.FC<{
  error?: Error;
  resetError?: () => void;
  message?: string;
}> = ({ error, resetError, message = 'Something went wrong' }) => {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-700">{message}</p>
          {error && process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-red-600 mt-1 font-mono">{error.message}</p>
          )}
        </div>
        {resetError && (
          <div className="ml-3">
            <Button
              onClick={resetError}
              variant="secondary"
              size="sm"
              className="text-red-700 hover:text-red-800"
            >
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};