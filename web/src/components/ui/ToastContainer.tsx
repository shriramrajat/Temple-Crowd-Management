'use client';

import React from 'react';
import { useErrorContext } from '@/contexts/ErrorContext';
import { Toast } from './Toast';

export const ToastContainer: React.FC = () => {
  const { state, removeError, retryError } = useErrorContext();

  if (state.errors.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {state.errors.map((error, index) => (
        <div
          key={error.id}
          className="animate-slide-in-right"
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <Toast
            error={error}
            onDismiss={removeError}
            onRetry={error.retryable ? retryError : undefined}
            isRetrying={state.isRetrying}
          />
        </div>
      ))}
    </div>
  );
};