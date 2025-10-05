import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookingError } from '@/types/booking';
import { 
  isNetworkError, 
  isAuthError, 
  isValidationError,
  getErrorMessage,
  getErrorGuidance 
} from '../utils/errorHandling';

interface ErrorRecoveryProps {
  error: BookingError;
  onRetry?: () => void;
  onSignIn?: () => void;
  onGoBack?: () => void;
  onReload?: () => void;
  retryCount?: number;
  maxRetries?: number;
  className?: string;
}

/**
 * Comprehensive error recovery component that provides contextual actions
 * based on the type of error encountered
 */
export const ErrorRecovery: React.FC<ErrorRecoveryProps> = ({
  error,
  onRetry,
  onSignIn,
  onGoBack,
  onReload,
  retryCount = 0,
  maxRetries = 3,
  className
}) => {
  const canRetry = onRetry && retryCount < maxRetries && 
    (isNetworkError(error) || error.code === 'UNKNOWN_ERROR');
  
  const needsAuth = isAuthError(error);
  const isValidation = isValidationError(error);

  const getErrorIcon = () => {
    if (needsAuth) {
      return (
        <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    }
    
    if (isNetworkError(error)) {
      return (
        <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      );
    }
    
    if (isValidation) {
      return (
        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    
    return (
      <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const getErrorTitle = () => {
    if (needsAuth) return 'Authentication Required';
    if (isNetworkError(error)) return 'Connection Problem';
    if (isValidation) return 'Invalid Selection';
    return 'Something Went Wrong';
  };

  const getBorderColor = () => {
    if (needsAuth) return 'border-yellow-200';
    if (isNetworkError(error)) return 'border-orange-200';
    if (isValidation) return 'border-blue-200';
    return 'border-red-200';
  };

  const getBackgroundColor = () => {
    if (needsAuth) return 'bg-yellow-50';
    if (isNetworkError(error)) return 'bg-orange-50';
    if (isValidation) return 'bg-blue-50';
    return 'bg-red-50';
  };

  return (
    <Card variant="outlined" className={`${getBorderColor()} ${className}`}>
      <div className={`p-6 ${getBackgroundColor()}`}>
        <div className="flex items-start">
          {/* Error Icon */}
          <div className="flex-shrink-0">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-white">
              {getErrorIcon()}
            </div>
          </div>

          {/* Error Content */}
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {getErrorTitle()}
            </h3>
            
            <p className="text-sm text-gray-700 mb-3">
              {getErrorMessage(error)}
            </p>
            
            <p className="text-xs text-gray-600 mb-4">
              {getErrorGuidance(error)}
            </p>

            {/* Retry Information */}
            {retryCount > 0 && (
              <div className="mb-4 p-2 bg-white rounded border">
                <p className="text-xs text-gray-600">
                  Retry attempts: {retryCount}/{maxRetries}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Primary Action */}
              {needsAuth && onSignIn && (
                <Button
                  variant="primary"
                  onClick={onSignIn}
                  className="flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </Button>
              )}

              {canRetry && (
                <Button
                  variant="primary"
                  onClick={onRetry}
                  className="flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </Button>
              )}

              {/* Secondary Actions */}
              {onGoBack && (
                <Button
                  variant="outline"
                  onClick={onGoBack}
                  className="flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Go Back
                </Button>
              )}

              {onReload && (
                <Button
                  variant="outline"
                  onClick={onReload}
                  className="flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reload Page
                </Button>
              )}
            </div>

            {/* Help Text */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {needsAuth 
                  ? 'If you continue to have authentication issues, please contact temple administration.'
                  : isNetworkError(error)
                  ? 'If connection problems persist, please check your internet connection or try again later.'
                  : 'If the problem continues, please contact temple administration for assistance.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};