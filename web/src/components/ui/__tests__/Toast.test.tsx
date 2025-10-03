import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toast } from '../Toast';
import { AppError } from '@/contexts/ErrorContext';

const mockError: AppError = {
  id: 'test-error',
  message: 'Test error message',
  type: 'error',
  timestamp: new Date(),
  dismissible: true,
  retryable: false,
};

const mockOnDismiss = jest.fn();
const mockOnRetry = jest.fn();

describe('Toast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders error toast correctly', () => {
    render(
      <Toast
        error={mockError}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    render(
      <Toast
        error={mockError}
        onDismiss={mockOnDismiss}
      />
    );

    const dismissButton = screen.getByRole('button');
    fireEvent.click(dismissButton);

    expect(mockOnDismiss).toHaveBeenCalledWith('test-error');
  });

  it('shows retry button for retryable errors', () => {
    const retryableError: AppError = {
      ...mockError,
      retryable: true,
    };

    render(
      <Toast
        error={retryableError}
        onDismiss={mockOnDismiss}
        onRetry={mockOnRetry}
      />
    );

    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const retryableError: AppError = {
      ...mockError,
      retryable: true,
    };

    render(
      <Toast
        error={retryableError}
        onDismiss={mockOnDismiss}
        onRetry={mockOnRetry}
      />
    );

    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalledWith('test-error');
  });

  it('shows warning toast with correct styling', () => {
    const warningError: AppError = {
      ...mockError,
      type: 'warning',
    };

    const { container } = render(
      <Toast
        error={warningError}
        onDismiss={mockOnDismiss}
      />
    );

    const toast = container.firstChild as HTMLElement;
    expect(toast).toHaveClass('bg-yellow-50', 'border-yellow-500');
  });

  it('shows info toast with correct styling', () => {
    const infoError: AppError = {
      ...mockError,
      type: 'info',
    };

    const { container } = render(
      <Toast
        error={infoError}
        onDismiss={mockOnDismiss}
      />
    );

    const toast = container.firstChild as HTMLElement;
    expect(toast).toHaveClass('bg-blue-50', 'border-blue-500');
  });

  it('displays context information when provided', () => {
    const errorWithContext: AppError = {
      ...mockError,
      context: {
        operation: 'test-operation',
        userId: 'user123',
      },
    };

    render(
      <Toast
        error={errorWithContext}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText(/operation:/)).toBeInTheDocument();
    expect(screen.getByText(/test-operation/)).toBeInTheDocument();
    expect(screen.getByText(/userId:/)).toBeInTheDocument();
    expect(screen.getByText(/user123/)).toBeInTheDocument();
  });

  it('disables retry button when retrying', () => {
    const retryableError: AppError = {
      ...mockError,
      retryable: true,
    };

    render(
      <Toast
        error={retryableError}
        onDismiss={mockOnDismiss}
        onRetry={mockOnRetry}
        isRetrying={true}
      />
    );

    const retryButton = screen.getByText('Retrying...');
    expect(retryButton).toBeDisabled();
  });
});