import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorRecovery } from '../ErrorRecovery';
import { BookingError } from '@/types/booking';
import { BOOKING_ERROR_CODES } from '@/constants/booking';

describe('ErrorRecovery', () => {
  const mockOnRetry = jest.fn();
  const mockOnSignIn = jest.fn();
  const mockOnGoBack = jest.fn();
  const mockOnReload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Network Error Handling', () => {
    const networkError: BookingError = {
      code: BOOKING_ERROR_CODES.NETWORK_ERROR,
      message: 'Network connection failed',
      details: {}
    };

    it('renders network error with retry option', () => {
      render(
        <ErrorRecovery
          error={networkError}
          onRetry={mockOnRetry}
          onGoBack={mockOnGoBack}
          retryCount={1}
          maxRetries={3}
        />
      );

      expect(screen.getByText('Connection Problem')).toBeInTheDocument();
      expect(screen.getByText('Network connection failed')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Retry attempts: 1/3')).toBeInTheDocument();
    });

    it('calls onRetry when retry button is clicked', () => {
      render(
        <ErrorRecovery
          error={networkError}
          onRetry={mockOnRetry}
          retryCount={0}
          maxRetries={3}
        />
      );

      fireEvent.click(screen.getByText('Try Again'));
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it('does not show retry button when max retries reached', () => {
      render(
        <ErrorRecovery
          error={networkError}
          onRetry={mockOnRetry}
          retryCount={3}
          maxRetries={3}
        />
      );

      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });
  });

  describe('Authentication Error Handling', () => {
    const authError: BookingError = {
      code: BOOKING_ERROR_CODES.AUTH_REQUIRED,
      message: 'Please sign in to make a booking',
      details: {}
    };

    it('renders authentication error with sign in option', () => {
      render(
        <ErrorRecovery
          error={authError}
          onSignIn={mockOnSignIn}
          onGoBack={mockOnGoBack}
        />
      );

      expect(screen.getByText('Authentication Required')).toBeInTheDocument();
      expect(screen.getByText('Please sign in to make a booking')).toBeInTheDocument();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('calls onSignIn when sign in button is clicked', () => {
      render(
        <ErrorRecovery
          error={authError}
          onSignIn={mockOnSignIn}
        />
      );

      fireEvent.click(screen.getByText('Sign In'));
      expect(mockOnSignIn).toHaveBeenCalledTimes(1);
    });

    it('does not show retry button for auth errors', () => {
      render(
        <ErrorRecovery
          error={authError}
          onRetry={mockOnRetry}
          onSignIn={mockOnSignIn}
        />
      );

      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
  });

  describe('Validation Error Handling', () => {
    const validationError: BookingError = {
      code: BOOKING_ERROR_CODES.INVALID_DATE,
      message: 'Please select a valid date',
      details: {}
    };

    it('renders validation error without retry option', () => {
      render(
        <ErrorRecovery
          error={validationError}
          onRetry={mockOnRetry}
          onGoBack={mockOnGoBack}
        />
      );

      expect(screen.getByText('Invalid Selection')).toBeInTheDocument();
      expect(screen.getByText('Please select a valid date')).toBeInTheDocument();
      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
      expect(screen.getByText('Go Back')).toBeInTheDocument();
    });

    it('calls onGoBack when go back button is clicked', () => {
      render(
        <ErrorRecovery
          error={validationError}
          onGoBack={mockOnGoBack}
        />
      );

      fireEvent.click(screen.getByText('Go Back'));
      expect(mockOnGoBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Permission Denied Error', () => {
    const permissionError: BookingError = {
      code: BOOKING_ERROR_CODES.PERMISSION_DENIED,
      message: 'You do not have permission to perform this action',
      details: {}
    };

    it('renders permission error as authentication error', () => {
      render(
        <ErrorRecovery
          error={permissionError}
          onSignIn={mockOnSignIn}
        />
      );

      expect(screen.getByText('Authentication Required')).toBeInTheDocument();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
  });

  describe('Unknown Error Handling', () => {
    const unknownError: BookingError = {
      code: BOOKING_ERROR_CODES.UNKNOWN_ERROR,
      message: 'An unexpected error occurred',
      details: {}
    };

    it('renders unknown error with retry option', () => {
      render(
        <ErrorRecovery
          error={unknownError}
          onRetry={mockOnRetry}
          onReload={mockOnReload}
          retryCount={0}
          maxRetries={3}
        />
      );

      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Reload Page')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    const genericError: BookingError = {
      code: BOOKING_ERROR_CODES.UNKNOWN_ERROR,
      message: 'Generic error',
      details: {}
    };

    it('calls onReload when reload button is clicked', () => {
      render(
        <ErrorRecovery
          error={genericError}
          onReload={mockOnReload}
        />
      );

      fireEvent.click(screen.getByText('Reload Page'));
      expect(mockOnReload).toHaveBeenCalledTimes(1);
    });

    it('shows all provided action buttons', () => {
      render(
        <ErrorRecovery
          error={genericError}
          onRetry={mockOnRetry}
          onSignIn={mockOnSignIn}
          onGoBack={mockOnGoBack}
          onReload={mockOnReload}
          retryCount={0}
          maxRetries={3}
        />
      );

      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Go Back')).toBeInTheDocument();
      expect(screen.getByText('Reload Page')).toBeInTheDocument();
    });

    it('does not show buttons when handlers are not provided', () => {
      render(<ErrorRecovery error={genericError} />);

      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
      expect(screen.queryByText('Go Back')).not.toBeInTheDocument();
      expect(screen.queryByText('Reload Page')).not.toBeInTheDocument();
    });
  });

  describe('Visual Styling', () => {
    it('applies correct styling for network errors', () => {
      const networkError: BookingError = {
        code: BOOKING_ERROR_CODES.NETWORK_ERROR,
        message: 'Network error',
        details: {}
      };

      const { container } = render(<ErrorRecovery error={networkError} />);
      
      expect(container.querySelector('.border-orange-200')).toBeInTheDocument();
      expect(container.querySelector('.bg-orange-50')).toBeInTheDocument();
    });

    it('applies correct styling for auth errors', () => {
      const authError: BookingError = {
        code: BOOKING_ERROR_CODES.AUTH_REQUIRED,
        message: 'Auth required',
        details: {}
      };

      const { container } = render(<ErrorRecovery error={authError} />);
      
      expect(container.querySelector('.border-yellow-200')).toBeInTheDocument();
      expect(container.querySelector('.bg-yellow-50')).toBeInTheDocument();
    });

    it('applies correct styling for validation errors', () => {
      const validationError: BookingError = {
        code: BOOKING_ERROR_CODES.INVALID_DATE,
        message: 'Invalid date',
        details: {}
      };

      const { container } = render(<ErrorRecovery error={validationError} />);
      
      expect(container.querySelector('.border-blue-200')).toBeInTheDocument();
      expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    const genericError: BookingError = {
      code: BOOKING_ERROR_CODES.UNKNOWN_ERROR,
      message: 'Generic error',
      details: {}
    };

    it('has proper heading structure', () => {
      render(<ErrorRecovery error={genericError} />);
      
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(
        <ErrorRecovery
          error={genericError}
          onRetry={mockOnRetry}
          onSignIn={mockOnSignIn}
          onGoBack={mockOnGoBack}
          onReload={mockOnReload}
          retryCount={0}
          maxRetries={3}
        />
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
    });
  });
});