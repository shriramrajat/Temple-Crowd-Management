/**
 * Integration tests for DarshanBooking component
 * Tests complete booking flow from date selection to confirmation
 * Verifies error handling and recovery mechanisms
 * Tests component integration and state management
 * 
 * Requirements covered:
 * - 1.1: Date and time slot selection
 * - 1.2: Time slot availability display
 * - 1.3: Booking confirmation flow
 * - 2.1: Booking data storage
 * - 2.2: Booking status management
 * - 5.1: Error handling and user feedback
 */

import React from 'react';
import { render, screen, waitFor } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { DarshanBooking } from '../DarshanBooking';
import { Booking, BookingError, QRCodeData } from '@/types/booking';
import { BOOKING_STATUS, BOOKING_ERROR_CODES } from '@/constants/booking';

// Mock external dependencies
jest.mock('@/services/booking/bookingService', () => ({
  bookingService: {
    createBooking: jest.fn(),
    getAvailableSlots: jest.fn()
  }
}));

jest.mock('@/services/qrcode/qrCodeService', () => ({
  qrCodeService: {
    createQRCodeData: jest.fn()
  }
}));

jest.mock('@/utils/dateUtils', () => ({
  formatDisplayDate: jest.fn()
}));

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).flat().join(' ')
}));

// Mock UI components
jest.mock('@/components/ui/Card', () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">{children}</div>
  )
}));

jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, variant, className, ...props }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={className}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  )
}));

jest.mock('@/components/ui/LoadingSpinner', () => ({
  LoadingSpinner: ({ size, className }: any) => (
    <div data-testid="loading-spinner" className={className} data-size={size}>
      Loading...
    </div>
  )
}));

// Mock child components
jest.mock('../components/DatePicker', () => ({
  DatePicker: ({ selectedDate, onDateSelect, loading, error, disabled }: any) => (
    <div data-testid="date-picker">
      <div>Date Picker</div>
      {loading && <div data-testid="date-picker-loading">Loading dates...</div>}
      {error && <div data-testid="date-picker-error">{error}</div>}
      <button 
        onClick={() => onDateSelect(new Date('2024-02-15T10:00:00Z'))}
        disabled={disabled}
        data-testid="select-date-btn"
      >
        Select Feb 15, 2024
      </button>
      {selectedDate && (
        <div data-testid="selected-date">
          Selected: {selectedDate.toDateString()}
        </div>
      )}
    </div>
  )
}));

jest.mock('../components/TimeSlotPicker', () => ({
  TimeSlotPicker: ({ date, selectedSlot, onSlotSelect, loading, error, disabled }: any) => (
    <div data-testid="time-slot-picker">
      <div>Time Slot Picker for {date.toDateString()}</div>
      {loading && <div data-testid="time-slot-loading">Loading slots...</div>}
      {error && <div data-testid="time-slot-error">{error.message}</div>}
      <button 
        onClick={() => onSlotSelect({
          id: 'slot-1',
          time: '10:00',
          date: date,
          capacity: 50,
          booked: 25,
          available: true
        })}
        disabled={disabled}
        data-testid="select-slot-btn"
      >
        Select 10:00 AM
      </button>
      {selectedSlot && (
        <div data-testid="selected-slot">
          Selected: {selectedSlot.time}
        </div>
      )}
    </div>
  )
}));

jest.mock('../components/BookingConfirmation', () => ({
  BookingConfirmation: ({ booking, qrCodeData, onBackToBooking, onDownloadQR }: any) => (
    <div data-testid="booking-confirmation">
      <div>Booking Confirmed!</div>
      <div data-testid="booking-id">Booking ID: {booking.id}</div>
      <div data-testid="qr-code">QR Code: {qrCodeData.verificationCode}</div>
      <button onClick={onBackToBooking} data-testid="new-booking-btn">
        New Booking
      </button>
      <button onClick={onDownloadQR} data-testid="download-qr-btn">
        Download QR
      </button>
    </div>
  )
}));

jest.mock('../components/BookingErrorBoundary', () => ({
  BookingErrorBoundary: ({ children }: any) => <div>{children}</div>
}));

jest.mock('../components/ErrorRecovery', () => ({
  ErrorRecovery: ({ error, onRetry, onSignIn, onGoBack, onReload, retryCount, maxRetries }: any) => (
    <div data-testid="error-recovery">
      <div data-testid="error-message">{error.message}</div>
      <div data-testid="retry-count">Retry: {retryCount}/{maxRetries}</div>
      <button onClick={onRetry} data-testid="retry-btn">Retry</button>
      <button onClick={onSignIn} data-testid="sign-in-btn">Sign In</button>
      <button onClick={onGoBack} data-testid="go-back-btn">Go Back</button>
      <button onClick={onReload} data-testid="reload-btn">Reload</button>
    </div>
  )
}));

// Mock the retry hook
jest.mock('../hooks/useRetry', () => ({
  useRetry: jest.fn()
}));

describe('DarshanBooking Integration Tests', () => {
  const mockUserId = 'test-user-123';
  const mockOnBookingComplete = jest.fn();
  const mockOnError = jest.fn();
  const mockOnAuthRequired = jest.fn();

  const mockBooking: Booking = {
    id: 'booking-123',
    userId: mockUserId,
    slotTime: new Date('2024-02-15T10:00:00Z'),
    status: BOOKING_STATUS.CONFIRMED,
    createdAt: new Date('2024-02-14T12:00:00Z'),
    updatedAt: new Date('2024-02-14T12:00:00Z')
  };

  const mockQRCodeData: QRCodeData = {
    bookingId: 'booking-123',
    userId: mockUserId,
    slotTime: '2024-02-15T10:00:00.000Z',
    status: BOOKING_STATUS.CONFIRMED,
    verificationCode: 'abc12345'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup service mocks
    const { bookingService } = require('@/services/booking/bookingService');
    const { qrCodeService } = require('@/services/qrcode/qrCodeService');
    const { formatDisplayDate } = require('@/utils/dateUtils');
    const { useRetry } = require('../hooks/useRetry');
    
    bookingService.createBooking.mockResolvedValue(mockBooking);
    qrCodeService.createQRCodeData.mockReturnValue(mockQRCodeData);
    formatDisplayDate.mockReturnValue('February 15, 2024');
    
    useRetry.mockReturnValue({
      executeWithRetry: jest.fn().mockImplementation((fn) => fn()),
      isRetrying: false,
      retryCount: 0,
      reset: jest.fn()
    });
  });

  describe('Complete Booking Flow - Requirements 1.1, 1.2, 1.3, 2.1, 2.2', () => {
    it('should complete the full booking flow from date selection to confirmation', async () => {
      const user = userEvent.setup();
      
      render(
        <DarshanBooking
          userId={mockUserId}
          onBookingComplete={mockOnBookingComplete}
          onError={mockOnError}
          onAuthRequired={mockOnAuthRequired}
        />
      );

      // Step 1: Initial state - should show date selection (Requirement 1.1)
      expect(screen.getByText('Book Your Darshan Slot')).toBeInTheDocument();
      expect(screen.getByTestId('date-picker')).toBeInTheDocument();
      expect(screen.queryByTestId('time-slot-picker')).not.toBeInTheDocument();

      // Step 2: Select a date (Requirement 1.1)
      const selectDateBtn = screen.getByTestId('select-date-btn');
      await user.click(selectDateBtn);

      // Should show selected date and continue button
      await waitFor(() => {
        expect(screen.getByTestId('selected-date')).toBeInTheDocument();
        expect(screen.getByText('Continue to Time Selection')).toBeInTheDocument();
      });

      // Step 3: Navigate to time selection (Requirement 1.2)
      const continueToTimeBtn = screen.getByText('Continue to Time Selection');
      await user.click(continueToTimeBtn);

      // Should show time slot picker
      await waitFor(() => {
        expect(screen.getByText('Select Time Slot')).toBeInTheDocument();
        expect(screen.getByTestId('time-slot-picker')).toBeInTheDocument();
      });

      // Step 4: Select a time slot (Requirement 1.2)
      const selectSlotBtn = screen.getByTestId('select-slot-btn');
      await user.click(selectSlotBtn);

      // Should show selected slot and continue button
      await waitFor(() => {
        expect(screen.getByTestId('selected-slot')).toBeInTheDocument();
        expect(screen.getByText('Continue to Confirmation')).toBeInTheDocument();
      });

      // Step 5: Navigate to booking confirmation (Requirement 1.3)
      const continueToConfirmBtn = screen.getByText('Continue to Confirmation');
      await user.click(continueToConfirmBtn);

      // Should show booking confirmation screen
      await waitFor(() => {
        expect(screen.getByText('Confirm Your Booking')).toBeInTheDocument();
        expect(screen.getByText('Booking Summary')).toBeInTheDocument();
        expect(screen.getByText('February 15, 2024')).toBeInTheDocument();
        expect(screen.getByText('10:00')).toBeInTheDocument();
      });

      // Step 6: Confirm the booking (Requirements 2.1, 2.2)
      const confirmBookingBtn = screen.getByText('Confirm Booking');
      await user.click(confirmBookingBtn);

      // Should show processing state
      await waitFor(() => {
        expect(screen.getByText('Processing Your Booking')).toBeInTheDocument();
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      });

      // Step 7: Should show booking confirmation
      await waitFor(() => {
        expect(screen.getByTestId('booking-confirmation')).toBeInTheDocument();
        expect(screen.getByText('Booking Confirmed!')).toBeInTheDocument();
        expect(screen.getByTestId('booking-id')).toHaveTextContent('booking-123');
        expect(screen.getByTestId('qr-code')).toHaveTextContent('abc12345');
      });

      // Verify service calls (Requirements 2.1, 2.2)
      const { bookingService } = require('@/services/booking/bookingService');
      const { qrCodeService } = require('@/services/qrcode/qrCodeService');
      
      expect(bookingService.createBooking).toHaveBeenCalledWith(
        mockUserId,
        expect.any(Date)
      );
      expect(qrCodeService.createQRCodeData).toHaveBeenCalledWith(
        mockBooking.id,
        mockBooking.userId,
        mockBooking.slotTime,
        mockBooking.status
      );
      expect(mockOnBookingComplete).toHaveBeenCalledWith(mockBooking);
    });

    it('should allow navigation back and forth between steps', async () => {
      const user = userEvent.setup();
      
      render(
        <DarshanBooking
          userId={mockUserId}
          onBookingComplete={mockOnBookingComplete}
          onError={mockOnError}
        />
      );

      // Select date and navigate to time selection
      await user.click(screen.getByTestId('select-date-btn'));
      await user.click(screen.getByText('Continue to Time Selection'));

      // Navigate back to date selection
      await user.click(screen.getByText('Back to Date Selection'));
      
      await waitFor(() => {
        expect(screen.getByText('Book Your Darshan Slot')).toBeInTheDocument();
        expect(screen.getByTestId('date-picker')).toBeInTheDocument();
      });

      // Navigate forward again
      await user.click(screen.getByText('Continue to Time Selection'));
      
      // Select time slot and navigate to confirmation
      await user.click(screen.getByTestId('select-slot-btn'));
      await user.click(screen.getByText('Continue to Confirmation'));

      // Navigate back to time selection
      await user.click(screen.getByText('Back to Time Selection'));
      
      await waitFor(() => {
        expect(screen.getByText('Select Time Slot')).toBeInTheDocument();
        expect(screen.getByTestId('time-slot-picker')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Recovery - Requirement 5.1', () => {
    it('should handle booking creation errors with retry mechanism', async () => {
      const user = userEvent.setup();
      const bookingError: BookingError = {
        code: BOOKING_ERROR_CODES.NETWORK_ERROR,
        message: 'Network connection failed'
      };

      // Mock booking service to fail
      const { bookingService } = require('@/services/booking/bookingService');
      bookingService.createBooking.mockRejectedValue(bookingError);

      // Mock retry hook to simulate retry behavior
      const { useRetry } = require('../hooks/useRetry');
      const mockExecuteWithRetry = jest.fn().mockRejectedValue(bookingError);
      useRetry.mockReturnValue({
        executeWithRetry: mockExecuteWithRetry,
        isRetrying: false,
        retryCount: 1,
        reset: jest.fn()
      });

      render(
        <DarshanBooking
          userId={mockUserId}
          onBookingComplete={mockOnBookingComplete}
          onError={mockOnError}
        />
      );

      // Navigate to confirmation and attempt booking
      await user.click(screen.getByTestId('select-date-btn'));
      await user.click(screen.getByText('Continue to Time Selection'));
      await user.click(screen.getByTestId('select-slot-btn'));
      await user.click(screen.getByText('Continue to Confirmation'));
      await user.click(screen.getByText('Confirm Booking'));

      // Should show error recovery component
      await waitFor(() => {
        expect(screen.getByTestId('error-recovery')).toBeInTheDocument();
        expect(screen.getByTestId('error-message')).toHaveTextContent('Network connection failed');
        expect(screen.getByTestId('retry-count')).toHaveTextContent('Retry: 1/3');
      });

      expect(mockOnError).toHaveBeenCalledWith(bookingError);
    });

    it('should handle authentication errors', async () => {
      const user = userEvent.setup();
      const authError: BookingError = {
        code: BOOKING_ERROR_CODES.AUTH_REQUIRED,
        message: 'Please sign in to make a booking'
      };

      const { bookingService } = require('@/services/booking/bookingService');
      bookingService.createBooking.mockRejectedValue(authError);

      const { useRetry } = require('../hooks/useRetry');
      const mockExecuteWithRetry = jest.fn().mockRejectedValue(authError);
      useRetry.mockReturnValue({
        executeWithRetry: mockExecuteWithRetry,
        isRetrying: false,
        retryCount: 0,
        reset: jest.fn()
      });

      render(
        <DarshanBooking
          userId={mockUserId}
          onBookingComplete={mockOnBookingComplete}
          onError={mockOnError}
          onAuthRequired={mockOnAuthRequired}
        />
      );

      // Navigate to confirmation and attempt booking
      await user.click(screen.getByTestId('select-date-btn'));
      await user.click(screen.getByText('Continue to Time Selection'));
      await user.click(screen.getByTestId('select-slot-btn'));
      await user.click(screen.getByText('Continue to Confirmation'));
      await user.click(screen.getByText('Confirm Booking'));

      // Should show error recovery with sign-in option
      await waitFor(() => {
        expect(screen.getByTestId('error-recovery')).toBeInTheDocument();
        expect(screen.getByTestId('sign-in-btn')).toBeInTheDocument();
      });

      expect(mockOnError).toHaveBeenCalledWith(authError);
    });

    it('should handle validation errors', async () => {
      const user = userEvent.setup();
      
      render(
        <DarshanBooking
          userId="" // Empty userId should cause validation error
          onBookingComplete={mockOnBookingComplete}
          onError={mockOnError}
        />
      );

      // Navigate to confirmation and attempt booking
      await user.click(screen.getByTestId('select-date-btn'));
      await user.click(screen.getByText('Continue to Time Selection'));
      await user.click(screen.getByTestId('select-slot-btn'));
      await user.click(screen.getByText('Continue to Confirmation'));
      await user.click(screen.getByText('Confirm Booking'));

      // Should show error recovery for validation error
      await waitFor(() => {
        expect(screen.getByTestId('error-recovery')).toBeInTheDocument();
        expect(mockOnError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Missing required booking information'
          })
        );
      });
    });
  });

  describe('Component Integration and State Management', () => {
    it('should properly manage flow state transitions', async () => {
      const user = userEvent.setup();
      
      render(
        <DarshanBooking
          userId={mockUserId}
          onBookingComplete={mockOnBookingComplete}
          onError={mockOnError}
        />
      );

      // Initial state: date-selection
      expect(screen.getByText('Book Your Darshan Slot')).toBeInTheDocument();
      expect(screen.getByTestId('date-picker')).toBeInTheDocument();

      // Select date - should auto-advance to time-selection
      await user.click(screen.getByTestId('select-date-btn'));
      
      await waitFor(() => {
        expect(screen.getByText('Select Time Slot')).toBeInTheDocument();
        expect(screen.getByTestId('time-slot-picker')).toBeInTheDocument();
      });

      // Select slot - should enable confirmation button
      await user.click(screen.getByTestId('select-slot-btn'));
      
      await waitFor(() => {
        expect(screen.getByText('Continue to Confirmation')).toBeEnabled();
      });

      // Navigate to confirmation
      await user.click(screen.getByText('Continue to Confirmation'));
      
      await waitFor(() => {
        expect(screen.getByText('Confirm Your Booking')).toBeInTheDocument();
      });
    });

    it('should reset slot selection when date changes', async () => {
      const user = userEvent.setup();
      
      render(
        <DarshanBooking
          userId={mockUserId}
          onBookingComplete={mockOnBookingComplete}
          onError={mockOnError}
        />
      );

      // Select date and time slot
      await user.click(screen.getByTestId('select-date-btn'));
      await user.click(screen.getByTestId('select-slot-btn'));
      
      expect(screen.getByTestId('selected-slot')).toBeInTheDocument();

      // Go back and select date again
      await user.click(screen.getByText('Back to Date Selection'));
      await user.click(screen.getByTestId('select-date-btn'));

      // Slot selection should be reset
      await waitFor(() => {
        expect(screen.queryByTestId('selected-slot')).not.toBeInTheDocument();
      });
    });
  });
});