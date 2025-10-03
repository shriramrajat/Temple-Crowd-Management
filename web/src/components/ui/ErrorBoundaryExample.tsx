'use client';

import React, { useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorBoundaryWrapper } from './ErrorBoundaryWrapper';
import { InlineErrorFallback } from './ErrorFallback';
import { Button } from './Button';
import { Card } from './Card';
import { useErrorHandler } from '@/hooks/useErrorHandler';

// Component that can throw errors for demonstration
const ErrorProneComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('This is a demonstration error');
  }
  return <div className="p-4 bg-green-100 text-green-800 rounded">Component working correctly!</div>;
};

// Component that demonstrates async error handling
const AsyncErrorComponent: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { handleAsyncError, captureError } = useErrorHandler({
    context: { feature: 'error-demo', action: 'async-operation' }
  });

  const handleAsyncOperation = async () => {
    setLoading(true);
    setError(null);

    const result = await handleAsyncError(async () => {
      // Simulate async operation that might fail
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (Math.random() > 0.5) {
        throw new Error('Random async error occurred');
      }
      return 'Success!';
    });

    setLoading(false);
    
    if (!result) {
      setError(new Error('Async operation failed'));
    }
  };

  const handleManualError = () => {
    const error = new Error('Manually triggered error');
    captureError(error, { action: 'manual-trigger' });
    setError(error);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Button 
          onClick={handleAsyncOperation} 
          loading={loading}
          disabled={loading}
        >
          Test Async Operation
        </Button>
        <Button 
          onClick={handleManualError}
          variant="secondary"
        >
          Trigger Manual Error
        </Button>
      </div>
      
      {error && (
        <InlineErrorFallback 
          error={error} 
          resetError={() => setError(null)}
          message="An error occurred in the async operation"
        />
      )}
    </div>
  );
};

export const ErrorBoundaryExample: React.FC = () => {
  const [throwError, setThrowError] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const handleReset = () => {
    setThrowError(false);
    setResetKey(prev => prev + 1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Error Boundary Examples</h1>
        <p className="text-gray-600 mb-6">
          This page demonstrates different error boundary implementations and error handling patterns.
        </p>
      </div>

      {/* Class-based Error Boundary Example */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Class-based Error Boundary</h2>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Button 
              onClick={() => setThrowError(true)}
              variant="destructive"
            >
              Trigger Error
            </Button>
            <Button 
              onClick={handleReset}
              variant="secondary"
            >
              Reset
            </Button>
          </div>
          
          <ErrorBoundary
            key={resetKey}
            onError={(error, errorInfo) => {
              console.log('Custom error handler called:', error, errorInfo);
            }}
          >
            <ErrorProneComponent shouldThrow={throwError} />
          </ErrorBoundary>
        </div>
      </Card>

      {/* Hook-based Error Boundary Example */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Hook-based Error Boundary (react-error-boundary)</h2>
        <ErrorBoundaryWrapper
          resetKeys={[resetKey]}
          onError={(error, errorInfo) => {
            console.log('Hook-based error handler called:', error, errorInfo);
          }}
        >
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Button 
                onClick={() => setThrowError(true)}
                variant="destructive"
              >
                Trigger Error
              </Button>
              <Button 
                onClick={handleReset}
                variant="secondary"
              >
                Reset
              </Button>
            </div>
            <ErrorProneComponent shouldThrow={throwError} />
          </div>
        </ErrorBoundaryWrapper>
      </Card>

      {/* Async Error Handling Example */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Async Error Handling</h2>
        <p className="text-sm text-gray-600 mb-4">
          This example shows how to handle errors in async operations without crashing the component.
        </p>
        <AsyncErrorComponent />
      </Card>

      {/* Development Tools */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <h2 className="text-lg font-semibold mb-4">Development Tools</h2>
          <p className="text-sm text-gray-600 mb-4">
            These tools are only available in development mode.
          </p>
          <div className="flex space-x-2">
            <Button 
              onClick={() => {
                const errorHandler = require('@/lib/errorHandler').errorHandler;
                console.log('Stored error reports:', errorHandler.getStoredErrorReports());
              }}
              variant="outline"
              size="sm"
            >
              View Error Reports
            </Button>
            <Button 
              onClick={() => {
                const errorHandler = require('@/lib/errorHandler').errorHandler;
                errorHandler.clearStoredErrorReports();
                console.log('Error reports cleared');
              }}
              variant="outline"
              size="sm"
            >
              Clear Error Reports
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};