import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Components
import { DatePicker } from './components/DatePicker';
import { TimeSlotPicker } from './components/TimeSlotPicker';
import { BookingConfirmation } from './components/BookingConfirmation';
import { BookingErrorBoundary } from './components/BookingErrorBoundary';
import { ErrorRecovery } from './components/ErrorRecovery';

// Authentication
import { useAuth } from '@/hooks/useAuth';

// Types and services
import { 
  DarshanBookingProps, 
  Booking, 
  TimeSlot, 
  BookingError, 
  QRCodeData 
} from '@/types/booking';
import { bookingService } from '@/services/booking/bookingService';
import { qrCodeService } from '@/services/qrcode/qrCodeService';

// Utils and hooks
import { formatDisplayDate } from '@/utils/dateUtils';
import { useRetry } from './hooks/useRetry';
import { 
  createErrorFromException, 
  isAuthError, 
  isNetworkError,
  getErrorMessage,
  getErrorGuidance,
  handleAuthError,
  logError
} from './utils/errorHandling';

// Booking flow states
type BookingFlowState = 
  | 'date-selection'
  | 'time-selection' 
  | 'booking-confirmation'
  | 'processing'
  | 'confirmation';

interface BookingFlowData {
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
  booking: Booking | null;
  qrCodeData: QRCodeData | null;
}

/**
 * Main DarshanBooking component that manages the complete booking flow
 * Integrates DatePicker, TimeSlotPicker, and BookingConfirmation components
 * Now integrated with authentication system
 */
export const DarshanBooking: React.FC<DarshanBookingProps> = ({
  userId: propUserId,
  onBookingComplete,
  onError,
  onAuthRequired,
  className
}) => {
  // Authentication integration
  const { 
    user, 
    isAuthenticated, 
    isLoading: authLoading, 
    signIn, 
    signOut,
    error: authError,
    clearError: clearAuthError
  } = useAuth();

  // Use authenticated user ID or fallback to prop
  const userId = user?.uid || propUserId;
  // Booking flow state management
  const [flowState, setFlowState] = useState<BookingFlowState>('date-selection');
  const [flowData, setFlowData] = useState<BookingFlowData>({
    selectedDate: null,
    selectedSlot: null,
    booking: null,
    qrCodeData: null
  });

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<BookingError | null>(null);

  // Retry mechanism
  const { executeWithRetry, isRetrying, retryCount, reset: resetRetry } = useRetry({
    maxRetries: 3,
    onRetryAttempt: (count, error) => {
      console.log(`Retry attempt ${count} for error:`, error.message);
    },
    onRetryExhausted: (error) => {
      console.error('All retry attempts exhausted:', error);
      setError(error);
    }
  });

  // Derived state for UI
  const isProcessing = flowState === 'processing' || isRetrying;
  const canProceedToTimeSelection = flowData.selectedDate !== null;
  const canProceedToConfirmation = flowData.selectedDate !== null && flowData.selectedSlot !== null;
  
  // Authentication state
  const isAuthenticatedAndReady = isAuthenticated && userId && !authLoading;
  const shouldShowAuthPrompt = !authLoading && !isAuthenticated;

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
    resetRetry();
    clearAuthError();
  }, [resetRetry, clearAuthError]);

  /**
   * Handle authentication state changes
   */
  useEffect(() => {
    // If user becomes unauthenticated during booking flow, reset to initial state
    if (!authLoading && !isAuthenticated && flowState !== 'date-selection') {
      setFlowData({
        selectedDate: null,
        selectedSlot: null,
        booking: null,
        qrCodeData: null
      });
      setFlowState('date-selection');
      clearError();
    }
  }, [isAuthenticated, authLoading, flowState, clearError]);

  /**
   * Handle authentication errors
   */
  useEffect(() => {
    if (authError) {
      const bookingError = createErrorFromException(
        new Error(authError),
        'authentication'
      );
      setError(bookingError);
      onError?.(bookingError);
    }
  }, [authError, onError]);

  /**
   * Handle sign in
   */
  const handleSignIn = useCallback(async () => {
    try {
      clearError();
      await signIn();
    } catch (err: any) {
      const authError = createErrorFromException(err, 'authentication');
      setError(authError);
      onError?.(authError);
    }
  }, [signIn, clearError, onError]);

  /**
   * Handle authentication requirement
   */
  const handleAuthRequired = useCallback(() => {
    if (onAuthRequired) {
      onAuthRequired();
    } else {
      handleSignIn();
    }
  }, [onAuthRequired, handleSignIn]);

  /**
   * Handle date selection
   */
  const handleDateSelect = useCallback((date: Date) => {
    setFlowData(prev => ({
      ...prev,
      selectedDate: date,
      selectedSlot: null // Reset slot when date changes
    }));
    
    // Auto-advance to time selection if we have a date
    if (flowState === 'date-selection') {
      setFlowState('time-selection');
    }
    
    clearError();
  }, [flowState, clearError]);

  /**
   * Handle time slot selection
   */
  const handleSlotSelect = useCallback((slot: TimeSlot) => {
    setFlowData(prev => ({
      ...prev,
      selectedSlot: slot
    }));
    
    clearError();
  }, [clearError]);

  /**
   * Handle booking confirmation with retry logic
   */
  const handleConfirmBooking = useCallback(async () => {
    // Check authentication first
    if (!isAuthenticatedAndReady) {
      handleAuthRequired();
      return;
    }

    if (!flowData.selectedDate || !flowData.selectedSlot || !userId) {
      const validationError = createErrorFromException(
        new Error('Missing required booking information'),
        'booking-confirmation'
      );
      setError(validationError);
      return;
    }

    setFlowState('processing');
    setLoading(true);
    clearError();

    try {
      const result = await executeWithRetry(async () => {
        // Create the booking
        const slotDateTime = new Date(flowData.selectedDate!);
        const [hours, minutes] = flowData.selectedSlot!.time.split(':').map(Number);
        slotDateTime.setHours(hours, minutes, 0, 0);

        const booking = await bookingService.createBooking(userId, slotDateTime);

        // Generate QR code data
        const qrCodeData = qrCodeService.createQRCodeData(
          booking.id,
          booking.userId,
          booking.slotTime,
          booking.status
        );

        return { booking, qrCodeData };
      }, 'booking-confirmation');

      // Update flow data
      setFlowData(prev => ({
        ...prev,
        booking: result.booking,
        qrCodeData: result.qrCodeData
      }));

      // Advance to confirmation screen
      setFlowState('confirmation');

      // Notify parent component
      onBookingComplete?.(result.booking);

    } catch (err: any) {
      const bookingError = createErrorFromException(err, 'booking-confirmation');
      
      // Log the error
      logError(bookingError, 'booking-confirmation');
      
      // Handle authentication errors
      if (isAuthError(bookingError)) {
        handleAuthError(bookingError, handleAuthRequired);
      }
      
      setError(bookingError);
      setFlowState('booking-confirmation');
      onError?.(bookingError);
    } finally {
      setLoading(false);
    }
  }, [flowData.selectedDate, flowData.selectedSlot, userId, executeWithRetry, onBookingComplete, onError, clearError, isAuthenticatedAndReady, handleAuthRequired]);

  /**
   * Handle back navigation
   */
  const handleBackToDateSelection = useCallback(() => {
    setFlowState('date-selection');
    clearError();
  }, [clearError]);

  const handleBackToTimeSelection = useCallback(() => {
    setFlowState('time-selection');
    clearError();
  }, [clearError]);

  /**
   * Handle starting a new booking
   */
  const handleNewBooking = useCallback(() => {
    setFlowData({
      selectedDate: null,
      selectedSlot: null,
      booking: null,
      qrCodeData: null
    });
    setFlowState('date-selection');
    clearError();
  }, [clearError]);

  /**
   * Handle retry after error
   */
  const handleRetry = useCallback(() => {
    clearError();
    if (flowState === 'booking-confirmation' && canProceedToConfirmation) {
      handleConfirmBooking();
    }
  }, [flowState, canProceedToConfirmation, handleConfirmBooking, clearError]);

  // Render authentication prompt
  const renderAuthPrompt = () => (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <svg 
            className="w-16 h-16 mx-auto text-gray-400 mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Sign In Required
          </h2>
          <p className="text-gray-600">
            Please sign in to book your darshan slot
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error.message}</p>
          </div>
        )}
        
        <Button
          variant="primary"
          onClick={handleSignIn}
          disabled={authLoading}
          className="min-w-32"
        >
          {authLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Signing In...
            </>
          ) : (
            'Sign In with Google'
          )}
        </Button>
      </div>
    </div>
  );

  // Render loading state during auth initialization
  const renderAuthLoading = () => (
    <div className="text-center py-12">
      <LoadingSpinner size="lg" className="mb-6" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Initializing...
      </h2>
      <p className="text-gray-600">
        Please wait while we set up your session
      </p>
    </div>
  );

  // Render different states of the booking flow
  const renderFlowContent = () => {
    // Show loading during auth initialization
    if (authLoading) {
      return renderAuthLoading();
    }

    // Show auth prompt if not authenticated
    if (shouldShowAuthPrompt) {
      return renderAuthPrompt();
    }

    // Show booking flow if authenticated
    switch (flowState) {
      case 'date-selection':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Book Your Darshan Slot
              </h1>
              <p className="text-gray-600">
                Select your preferred date to view available time slots
              </p>
            </div>
            
            <DatePicker
              selectedDate={flowData.selectedDate || undefined}
              onDateSelect={handleDateSelect}
              loading={loading}
              error={error?.message}
              disabled={isProcessing}
            />
            
            {canProceedToTimeSelection && (
              <div className="text-center">
                <Button
                  variant="primary"
                  onClick={() => setFlowState('time-selection')}
                  disabled={isProcessing}
                  className="min-w-32"
                >
                  Continue to Time Selection
                </Button>
              </div>
            )}
          </div>
        );

      case 'time-selection':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Select Time Slot
              </h1>
              <p className="text-gray-600">
                Choose your preferred time for {flowData.selectedDate && formatDisplayDate(flowData.selectedDate)}
              </p>
            </div>
            
            {flowData.selectedDate && (
              <TimeSlotPicker
                date={flowData.selectedDate}
                selectedSlot={flowData.selectedSlot}
                onSlotSelect={handleSlotSelect}
                loading={loading}
                error={error}
                disabled={isProcessing}
              />
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={handleBackToDateSelection}
                disabled={isProcessing}
              >
                Back to Date Selection
              </Button>
              
              {canProceedToConfirmation && (
                <Button
                  variant="primary"
                  onClick={() => setFlowState('booking-confirmation')}
                  disabled={isProcessing}
                  className="min-w-32"
                >
                  Continue to Confirmation
                </Button>
              )}
            </div>
          </div>
        );

      case 'booking-confirmation':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Confirm Your Booking
              </h1>
              <p className="text-gray-600">
                Please review your booking details before confirming
              </p>
            </div>
            
            {/* Booking Summary */}
            <Card className="max-w-md mx-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Booking Summary
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-gray-900">
                      {flowData.selectedDate && formatDisplayDate(flowData.selectedDate)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium text-gray-900">
                      {flowData.selectedSlot?.time}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Availability:</span>
                    <span className="font-medium text-green-600">
                      {flowData.selectedSlot && 
                        `${flowData.selectedSlot.capacity - flowData.selectedSlot.booked}/${flowData.selectedSlot.capacity} slots available`
                      }
                    </span>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Error Display */}
            {error && (
              <ErrorRecovery
                error={error}
                onRetry={handleRetry}
                onSignIn={handleAuthRequired}
                onGoBack={handleBackToTimeSelection}
                onReload={() => window.location.reload()}
                retryCount={retryCount}
                maxRetries={3}
                className="max-w-md mx-auto"
              />
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={handleBackToTimeSelection}
                disabled={isProcessing}
              >
                Back to Time Selection
              </Button>
              
              <Button
                variant="primary"
                onClick={error ? handleRetry : handleConfirmBooking}
                disabled={isProcessing || !canProceedToConfirmation}
                className="min-w-32"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {error ? 'Retrying...' : 'Confirming...'}
                  </>
                ) : (
                  error ? 'Retry Booking' : 'Confirm Booking'
                )}
              </Button>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" className="mb-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Processing Your Booking
            </h2>
            <p className="text-gray-600">
              Please wait while we confirm your darshan slot...
            </p>
          </div>
        );

      case 'confirmation':
        return flowData.booking && flowData.qrCodeData ? (
          <BookingConfirmation
            booking={flowData.booking}
            qrCodeData={flowData.qrCodeData}
            onBackToBooking={handleNewBooking}
            onDownloadQR={() => {
              // Optional callback for tracking QR downloads
            }}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <BookingErrorBoundary onError={onError} onAuthRequired={handleAuthRequired}>
      <div 
        className={cn('w-full max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8', className)}
        role="main"
        aria-label="Darshan booking interface"
      >
        {/* Progress Indicator */}
        {flowState !== 'confirmation' && (
          <div className="mb-6 sm:mb-8" role="navigation" aria-label="Booking progress">
            {/* Mobile Progress Indicator */}
            <div className="block sm:hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-gray-900" aria-live="polite">
                  Step {flowState === 'date-selection' ? '1' : flowState === 'time-selection' ? '2' : '3'} of 3
                </div>
                <div className="text-sm text-gray-500">
                  {flowState === 'date-selection' ? 'Select Date' : 
                   flowState === 'time-selection' ? 'Select Time' : 'Confirm'}
                </div>
              </div>
              <div 
                className="w-full bg-gray-200 rounded-full h-2"
                role="progressbar"
                aria-valuenow={flowState === 'date-selection' ? 33 : flowState === 'time-selection' ? 66 : 100}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Booking progress: ${flowState === 'date-selection' ? '33' : flowState === 'time-selection' ? '66' : '100'}% complete`}
              >
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: flowState === 'date-selection' ? '33%' : 
                           flowState === 'time-selection' ? '66%' : '100%' 
                  }}
                />
              </div>
            </div>

            {/* Desktop Progress Indicator */}
            <div className="hidden sm:block">
              <ol className="flex items-center justify-center space-x-2 lg:space-x-4" role="list">
                {/* Step 1: Date Selection */}
                <li className="flex items-center">
                  <div 
                    className={cn(
                      'w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-sm lg:text-base font-medium transition-colors',
                      {
                        'bg-blue-600 text-white': flowState === 'date-selection',
                        'bg-green-600 text-white': ['time-selection', 'booking-confirmation', 'processing'].includes(flowState),
                        'bg-gray-200 text-gray-600': false
                      }
                    )}
                    aria-current={flowState === 'date-selection' ? 'step' : undefined}
                    aria-label={`Step 1: Select Date ${['time-selection', 'booking-confirmation', 'processing'].includes(flowState) ? '(completed)' : flowState === 'date-selection' ? '(current)' : ''}`}
                  >
                    {['time-selection', 'booking-confirmation', 'processing'].includes(flowState) ? (
                      <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : '1'}
                  </div>
                  <span className="ml-2 text-sm lg:text-base font-medium text-gray-700 hidden md:inline">
                    Select Date
                  </span>
                </li>

                <div className="w-6 lg:w-8 h-px bg-gray-300" aria-hidden="true"></div>

                {/* Step 2: Time Selection */}
                <li className="flex items-center">
                  <div 
                    className={cn(
                      'w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-sm lg:text-base font-medium transition-colors',
                      {
                        'bg-blue-600 text-white': flowState === 'time-selection',
                        'bg-green-600 text-white': ['booking-confirmation', 'processing'].includes(flowState),
                        'bg-gray-200 text-gray-600': flowState === 'date-selection'
                      }
                    )}
                    aria-current={flowState === 'time-selection' ? 'step' : undefined}
                    aria-label={`Step 2: Select Time ${['booking-confirmation', 'processing'].includes(flowState) ? '(completed)' : flowState === 'time-selection' ? '(current)' : ''}`}
                  >
                    {['booking-confirmation', 'processing'].includes(flowState) ? (
                      <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : '2'}
                  </div>
                  <span className="ml-2 text-sm lg:text-base font-medium text-gray-700 hidden md:inline">
                    Select Time
                  </span>
                </li>

                <div className="w-6 lg:w-8 h-px bg-gray-300" aria-hidden="true"></div>

                {/* Step 3: Confirmation */}
                <li className="flex items-center">
                  <div 
                    className={cn(
                      'w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-sm lg:text-base font-medium transition-colors',
                      {
                        'bg-blue-600 text-white': ['booking-confirmation', 'processing'].includes(flowState),
                        'bg-gray-200 text-gray-600': ['date-selection', 'time-selection'].includes(flowState)
                      }
                    )}
                    aria-current={['booking-confirmation', 'processing'].includes(flowState) ? 'step' : undefined}
                    aria-label={`Step 3: Confirm ${['booking-confirmation', 'processing'].includes(flowState) ? '(current)' : ''}`}
                  >
                    3
                  </div>
                  <span className="ml-2 text-sm lg:text-base font-medium text-gray-700 hidden md:inline">
                    Confirm
                  </span>
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div 
          className="min-h-[24rem] sm:min-h-96"
          role="region"
          aria-label={`Booking step: ${flowState === 'date-selection' ? 'Select Date' : 
                       flowState === 'time-selection' ? 'Select Time' : 
                       flowState === 'booking-confirmation' ? 'Confirm Booking' :
                       flowState === 'processing' ? 'Processing' : 'Confirmation'}`}
          aria-live="polite"
        >
          {renderFlowContent()}
        </div>
      </div>
    </BookingErrorBoundary>
  );
};