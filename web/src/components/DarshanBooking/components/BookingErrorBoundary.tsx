import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookingError } from '@/types/booking';
import { BOOKING_ERROR_CODES } from '@/constants/booking';
import { ErrorRecovery } from './ErrorRecovery';
import { createBookingError } from '../utils/errorHandling';

interface Props {
  children: ReactNode;
  onError?: (error: BookingError) => void;
  onAuthRequired?: () => void;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: BookingError | null;
}

/**
 * Error Boundary component for catching and handling React errors in the booking flow
 * Provides user-friendly error messages and recovery options
 */
export class BookingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Convert React error to BookingError
    const bookingError = createBookingError(
      BOOKING_ERROR_CODES.COMPONENT_ERROR,
      'Something went wrong with the booking interface. Please try again.',
      {
        originalMessage: error.message,
        stack: error.stack
      }
    );

    return {
      hasError: true,
      error: bookingError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('BookingErrorBoundary caught an error:', error, errorInfo);
    
    // Report error to parent component
    if (this.props.onError && this.state.error) {
      this.props.onError(this.state.error);
    }

    // Log error for debugging (in production, this could be sent to error tracking service)
    this.logError(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you might want to send this to an error tracking service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('Booking Error Report:', errorReport);
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI using ErrorRecovery component
      return (
        <div className="w-full max-w-md mx-auto p-4">
          <ErrorRecovery
            error={this.state.error}
            onRetry={this.handleRetry}
            onSignIn={this.props.onAuthRequired}
            onReload={this.handleReload}
            className="w-full"
          />
        </div>
      );
    }

    return this.props.children;
  }
}