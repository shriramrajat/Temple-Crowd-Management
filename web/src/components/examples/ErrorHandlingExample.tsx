'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useErrorContext } from '@/contexts/ErrorContext';
import { useErrorRecovery } from '@/hooks/useErrorRecovery';
import { useFirebaseErrorRecovery } from '@/hooks/useFirebaseErrorRecovery';

export const ErrorHandlingExample: React.FC = () => {
  const { showError, showWarning, showInfo, clearErrors } = useErrorContext();
  const { executeWithRetry, handleAsyncOperation } = useErrorRecovery();
  const { handleFirebaseAuth, handleFirestoreOperation } = useFirebaseErrorRecovery();
  const [isLoading, setIsLoading] = useState(false);

  // Example: Simple error toast
  const showSimpleError = () => {
    showError('This is a simple error message');
  };

  const showSimpleWarning = () => {
    showWarning('This is a warning message');
  };

  const showSimpleInfo = () => {
    showInfo('This is an info message');
  };

  // Example: Error with retry functionality
  const showRetryableError = () => {
    let attemptCount = 0;
    
    showError('Operation failed', {
      retryable: true,
      retryAction: async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error(`Retry attempt ${attemptCount} failed`);
        }
        showInfo('Operation succeeded after retry!');
      },
      context: { operation: 'retryable-example' },
    });
  };

  // Example: Async operation with automatic retry
  const simulateAsyncOperationWithRetry = async () => {
    setIsLoading(true);
    
    const result = await executeWithRetry(
      async () => {
        // Simulate random failure
        if (Math.random() < 0.7) {
          throw new Error('Random operation failure');
        }
        return 'Operation successful!';
      },
      'Simulated Async Operation',
      {
        maxAttempts: 3,
        delay: 1000,
      }
    );
    
    if (result) {
      showInfo(`Success: ${result}`);
    }
    
    setIsLoading(false);
  };

  // Example: Async operation with loading and success messages
  const simulateAsyncWithMessages = async () => {
    setIsLoading(true);
    
    await handleAsyncOperation(
      async () => {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate random failure
        if (Math.random() < 0.5) {
          throw new Error('Operation failed randomly');
        }
        
        return 'Data loaded successfully';
      },
      {
        operationName: 'Data Loading',
        loadingMessage: 'Loading data...',
        successMessage: 'Data loaded successfully!',
        retryOptions: {
          maxAttempts: 2,
        },
      }
    );
    
    setIsLoading(false);
  };

  // Example: Simulated Firebase auth operation
  const simulateFirebaseAuth = async () => {
    setIsLoading(true);
    
    const result = await handleFirebaseAuth(
      async () => {
        // Simulate Firebase auth delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate auth failure
        if (Math.random() < 0.6) {
          const error = new Error('Authentication failed') as any;
          error.code = 'auth/network-request-failed';
          throw error;
        }
        
        return { uid: 'user123', email: 'user@example.com' };
      },
      'User Authentication'
    );
    
    if (result) {
      showInfo('Authentication successful!');
    }
    
    setIsLoading(false);
  };

  // Example: Simulated Firestore operation
  const simulateFirestoreOperation = async () => {
    setIsLoading(true);
    
    const result = await handleFirestoreOperation(
      async () => {
        // Simulate Firestore delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate Firestore failure
        if (Math.random() < 0.5) {
          const error = new Error('Firestore operation failed') as any;
          error.code = 'firestore/unavailable';
          throw error;
        }
        
        return { id: 'doc123', data: { name: 'Test Document' } };
      },
      'Document Creation'
    );
    
    if (result) {
      showInfo('Document created successfully!');
    }
    
    setIsLoading(false);
  };

  // Example: Multiple errors
  const showMultipleErrors = () => {
    showError('First error message');
    setTimeout(() => showWarning('Second warning message'), 500);
    setTimeout(() => showInfo('Third info message'), 1000);
    setTimeout(() => showError('Fourth error message'), 1500);
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Error Handling Examples</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Simple Toast Messages</h3>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={showSimpleError} variant="destructive" size="sm">
              Show Error
            </Button>
            <Button onClick={showSimpleWarning} variant="outline" size="sm">
              Show Warning
            </Button>
            <Button onClick={showSimpleInfo} variant="primary" size="sm">
              Show Info
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Retryable Operations</h3>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={showRetryableError} variant="destructive" size="sm">
              Retryable Error
            </Button>
            <Button 
              onClick={simulateAsyncOperationWithRetry} 
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? 'Running...' : 'Async with Retry'}
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Advanced Operations</h3>
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={simulateAsyncWithMessages} 
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? 'Loading...' : 'Async with Messages'}
            </Button>
            <Button 
              onClick={simulateFirebaseAuth} 
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? 'Authenticating...' : 'Firebase Auth'}
            </Button>
            <Button 
              onClick={simulateFirestoreOperation} 
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? 'Saving...' : 'Firestore Operation'}
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Multiple Errors</h3>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={showMultipleErrors} variant="outline" size="sm">
              Show Multiple Errors
            </Button>
            <Button onClick={clearErrors} variant="ghost" size="sm">
              Clear All Errors
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">Instructions:</h4>
        <ul className="text-sm space-y-1 text-gray-600">
          <li>• Click buttons to trigger different types of error handling</li>
          <li>• Toast notifications will appear in the bottom-right corner</li>
          <li>• Retryable errors will show a "Retry" button</li>
          <li>• Dismissible errors can be closed with the X button</li>
          <li>• Some operations will automatically retry on failure</li>
        </ul>
      </div>
    </Card>
  );
};