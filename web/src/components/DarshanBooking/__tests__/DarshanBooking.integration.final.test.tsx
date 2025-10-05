import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DarshanBooking } from '../DarshanBooking';
import { useAuth } from '@/hooks/useAuth';
import { bookingService } from '@/services/booking/bookingService';
import { qrCodeService } from '@/services/qrcode/qrCodeService';

// Mock the auth hook
jest.mock('@/hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock services
jest.mock('@/services/booking/bookingService');
jest.mock('@/services/qrcode/qrCodeService');

// Mock UI components
jest.mock('@/components/ui/Card', () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid="card">{children}</div>
}));

jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, variant, className }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`btn ${variant} ${className}`}
      data-testid="button"
    >
      {children}
    </button>
  )
}));

jest.mock('@/components/ui/LoadingSpinner', () => ({
  LoadingSpinner: ({ size, className }: any) => (
    <div className={`spinner ${size} ${className}`} data-testid="loading-spinner">
      Loading...
    </div>
  )
}));

// Mock child components with simplified implementations
jest.mock('../components/DatePicker', () => ({
  DatePicker: ({ onDateSelect, disabled }: any) => (
    <div data-testid="date-picker">
      <button 
        onClick={() => onDateSelect(new Date('2024-12-25'))}
        disabled={disabled}
        data-testid="select-date-btn"
      >
        Select Date
      </button>
    </div>
  )
}));

jest.mock('../components/TimeSlotPicker', () => ({
  TimeSlotPicker: ({ onSlotSelect, disabled }: any) => (
    <div data-testid="time-slot-picker">
      <button 
        onClick={() => onSlotSelect({ 
          id: 'slot-1', 
          time: '10:00', 
          date: new Date('2024-12-25'),
          capacity: 50,
          booked: 10,
          available: true
        })}
        disabled={disabled}
        data-testid="select-time-btn"
      >
        Select 10:00 AM
      </button>
    </div>
  )
}));

jest.mock('../components/BookingConfirmation', () => ({
  BookingConfirmation: ({ booking, onBackToBooking }: any) => (
    <div data-testid="booking-confirmation">
      <div>Booking confirmed: {booking.id}</div>
      <button onClick={onBackToBooking} data-testid="new-booking-btn">
        New Booking
      </button>
    </div>
  )
}));

jest.mock('../components/BookingErrorBoundary', () => ({
  BookingErrorBoundary: ({ children }: any) => <div>{children}</div>
}));

jest.mock('../components/ErrorRecovery', () => ({
  ErrorRecovery: ({ error, onRetry, onSignIn }: any) => (
    <div data-testid="error-recovery">
      <div>Error: {error.message}</div>
      <button onClick={onRetry} data-testid="retry-btn">Retry</button>
      <button onClick={onSignIn} data-testid="sign-in-btn">Sign In</button>
    </div>
  )
}));

describe('DarshanBooking Integration Tests', () => {
  const mockUser = {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    createdAt: new Date(),
    lastLoginAt: new Date()
  };

  const mockBooking = {
    id: 'booking-123',
    userId: 'test-user-123',
    slotTime: new Date('2024-12-25T10:00:00'),
    status: 'confirmed' as const,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockQRCodeData = {
    bookingId: 'booking-123',
    userId: 'test-user-123',
    slotTime: '2024-12-25T10:00:00.000Z',
    status: 'confirmed' as const,
    verificationCode: 'abc123'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock booking service
    (bookingService.createBooking as jest.Mock).mockResolvedValue(mockBooking);
    
    // Mock QR code service
    (qrCodeService.createQRCodeData as jest.Mock).mockReturnValue(mockQRCodeData);
  });

  describe('Authentication Integration', () => {
    it('shows sign in prompt when not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        loading: false,
        error: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        clearError: jest.fn(),
        hasError: false,
        getUserDisplayName: jest.fn(() => ''),
        getUserEmail: jest.fn(() => ''),
        getUserPhotoURL: jest.fn(() => undefined)
      });

      render(<DarshanBooking />);

      expect(screen.getByText('Sign In Required')).toBeInTheDocument();
      expect(screen.getByText('Please sign in to book your darshan slot')).toBeInTheDocument();
    });

    it('shows booking interface when authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        loading: false,
        error: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        clearError: jest.fn(),
        hasError: false,
        getUserDisplayName: jest.fn(() => 'Test User'),
        getUserEmail: jest.fn(() => 'test@example.com'),
        getUserPhotoURL: jest.fn(() => undefined)
      });

      render(<DarshanBooking />);

      expect(screen.getByText('Book Your Darshan Slot')).toBeInTheDocument();
      expect(screen.getByTestId('date-picker')).toBeInTheDocument();
    });

    it('handles sign in process', async () => {
      const user = userEvent.setup();
      const mockSignIn = jest.fn().mockResolvedValue(undefined);
      
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        loading: false,
        error: null,
        signIn: mockSignIn,
        signOut: jest.fn(),
        clearError: jest.fn(),
        hasError: false,
        getUserDisplayName: jest.fn(() => ''),
        getUserEmail: jest.fn(() => ''),
        getUserPhotoURL: jest.fn(() => undefined)
      });

      render(<DarshanBooking />);

      const signInButton = screen.getByText('Sign In with Google');
      await user.click(signInButton);

      expect(mockSignIn).toHaveBeenCalled();
    });
  });

  describe('Complete Booking Flow', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        loading: false,
        error: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        clearError: jest.fn(),
        hasError: false,
        getUserDisplayName: jest.fn(() => 'Test User'),
        getUserEmail: jest.fn(() => 'test@example.com'),
        getUserPhotoURL: jest.fn(() => undefined)
      });
    });

    it('completes full booking flow', async () => {
      const user = userEvent.setup();
      const mockOnBookingComplete = jest.fn();

      render(<DarshanBooking onBookingComplete={mockOnBookingComplete} />);

      // Step 1: Should show date selection
      expect(screen.getByText('Book Your Darshan Slot')).toBeInTheDocument();

      // Step 2: Select date
      const selectDateBtn = screen.getByTestId('select-date-btn');
      await user.click(selectDateBtn);

      // Step 3: Navigate to time selection
      await waitFor(() => {
        expect(screen.getByText('Continue to Time Selection')).toBeInTheDocument();
      });

      const continueToTimeBtn = screen.getByText('Continue to Time Selection');
      await user.click(continueToTimeBtn);

      // Step 4: Select time slot
      await waitFor(() => {
        expect(screen.getByTestId('time-slot-picker')).toBeInTheDocument();
      });

      const selectTimeBtn = screen.getByTestId('select-time-btn');
      await user.click(selectTimeBtn);

      // Step 5: Navigate to confirmation
      await waitFor(() => {
        expect(screen.getByText('Continue to Confirmation')).toBeInTheDocument();
      });

      const continueToConfirmBtn = screen.getByText('Continue to Confirmation');
      await user.click(continueToConfirmBtn);

      // Step 6: Confirm booking
      await waitFor(() => {
        expect(screen.getByText('Confirm Booking')).toBeInTheDocument();
      });

      const confirmBookingBtn = screen.getByText('Confirm Booking');
      await user.click(confirmBookingBtn);

      // Step 7: Verify booking completion
      await waitFor(() => {
        expect(screen.getByTestId('booking-confirmation')).toBeInTheDocument();
      });

      // Verify service calls
      expect(bookingService.createBooking).toHaveBeenCalledWith(
        mockUser.uid,
        expect.any(Date)
      );
      expect(qrCodeService.createQRCodeData).toHaveBeenCalledWith(
        mockBooking.id,
        mockBooking.userId,
        mockBooking.slotTime,
        mockBooking.status
      );

      // Verify callback
      expect(mockOnBookingComplete).toHaveBeenCalledWith(mockBooking);
    });

    it('handles booking errors with retry', async () => {
      const user = userEvent.setup();
      
      // Mock booking service failure then success
      (bookingService.createBooking as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockBooking);

      render(<DarshanBooking />);

      // Navigate through booking flow
      const selectDateBtn = screen.getByTestId('select-date-btn');
      await user.click(selectDateBtn);

      await waitFor(() => {
        const continueBtn = screen.getByText('Continue to Time Selection');
        return user.click(continueBtn);
      });

      await waitFor(() => {
        const selectTimeBtn = screen.getByTestId('select-time-btn');
        return user.click(selectTimeBtn);
      });

      await waitFor(() => {
        const continueBtn = screen.getByText('Continue to Confirmation');
        return user.click(continueBtn);
      });

      await waitFor(() => {
        const confirmBtn = screen.getByText('Confirm Booking');
        return user.click(confirmBtn);
      });

      // Should show error
      await waitFor(() => {
        expect(screen.getByTestId('error-recovery')).toBeInTheDocument();
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });

      // Retry booking
      const retryBtn = screen.getByTestId('retry-btn');
      await user.click(retryBtn);

      // Should succeed on retry
      await waitFor(() => {
        expect(screen.getByTestId('booking-confirmation')).toBeInTheDocument();
      });

      expect(bookingService.createBooking).toHaveBeenCalledTimes(2);
    });
  });

  describe('Firebase Data Validation', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        loading: false,
        error: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        clearError: jest.fn(),
        hasError: false,
        getUserDisplayName: jest.fn(() => 'Test User'),
        getUserEmail: jest.fn(() => 'test@example.com'),
        getUserPhotoURL: jest.fn(() => undefined)
      });
    });

    it('validates booking data structure', async () => {
      const user = userEvent.setup();

      render(<DarshanBooking />);

      // Complete booking flow
      const selectDateBtn = screen.getByTestId('select-date-btn');
      await user.click(selectDateBtn);

      await waitFor(() => {
        const continueBtn = screen.getByText('Continue to Time Selection');
        return user.click(continueBtn);
      });

      await waitFor(() => {
        const selectTimeBtn = screen.getByTestId('select-time-btn');
        return user.click(selectTimeBtn);
      });

      await waitFor(() => {
        const continueBtn = screen.getByText('Continue to Confirmation');
        return user.click(continueBtn);
      });

      await waitFor(() => {
        const confirmBtn = screen.getByText('Confirm Booking');
        return user.click(confirmBtn);
      });

      // Verify booking service was called with correct data structure
      await waitFor(() => {
        expect(bookingService.createBooking).toHaveBeenCalledWith(
          mockUser.uid,
          expect.any(Date)
        );
      });

      const [userId, slotTime] = (bookingService.createBooking as jest.Mock).mock.calls[0];
      
      // Validate data types and structure
      expect(typeof userId).toBe('string');
      expect(slotTime).toBeInstanceOf(Date);
      expect(slotTime.getHours()).toBe(10);
      expect(slotTime.getMinutes()).toBe(0);
    });

    it('validates QR code data integrity', async () => {
      const user = userEvent.setup();

      render(<DarshanBooking />);

      // Complete booking flow
      const selectDateBtn = screen.getByTestId('select-date-btn');
      await user.click(selectDateBtn);

      await waitFor(() => {
        const continueBtn = screen.getByText('Continue to Time Selection');
        return user.click(continueBtn);
      });

      await waitFor(() => {
        const selectTimeBtn = screen.getByTestId('select-time-btn');
        return user.click(selectTimeBtn);
      });

      await waitFor(() => {
        const continueBtn = screen.getByText('Continue to Confirmation');
        return user.click(continueBtn);
      });

      await waitFor(() => {
        const confirmBtn = screen.getByText('Confirm Booking');
        return user.click(confirmBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('booking-confirmation')).toBeInTheDocument();
      });

      // Verify QR code data contains all required fields
      expect(qrCodeService.createQRCodeData).toHaveBeenCalledWith(
        mockBooking.id,
        mockBooking.userId,
        mockBooking.slotTime,
        mockBooking.status
      );

      const qrCodeData = (qrCodeService.createQRCodeData as jest.Mock).mock.results[0].value;
      expect(qrCodeData).toEqual(expect.objectContaining({
        bookingId: mockBooking.id,
        userId: mockBooking.userId,
        slotTime: expect.any(String),
        status: mockBooking.status,
        verificationCode: expect.any(String)
      }));
    });
  });

  describe('Error Scenarios', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        loading: false,
        error: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        clearError: jest.fn(),
        hasError: false,
        getUserDisplayName: jest.fn(() => 'Test User'),
        getUserEmail: jest.fn(() => 'test@example.com'),
        getUserPhotoURL: jest.fn(() => undefined)
      });
    });

    it('handles authentication errors during booking', async () => {
      const user = userEvent.setup();
      const mockOnError = jest.fn();
      
      // Mock authentication error
      (bookingService.createBooking as jest.Mock).mockRejectedValue({
        code: 'permission-denied',
        message: 'Missing or insufficient permissions'
      });

      render(<DarshanBooking onError={mockOnError} />);

      // Complete booking flow
      const selectDateBtn = screen.getByTestId('select-date-btn');
      await user.click(selectDateBtn);

      await waitFor(() => {
        const continueBtn = screen.getByText('Continue to Time Selection');
        return user.click(continueBtn);
      });

      await waitFor(() => {
        const selectTimeBtn = screen.getByTestId('select-time-btn');
        return user.click(selectTimeBtn);
      });

      await waitFor(() => {
        const continueBtn = screen.getByText('Continue to Confirmation');
        return user.click(continueBtn);
      });

      await waitFor(() => {
        const confirmBtn = screen.getByText('Confirm Booking');
        return user.click(confirmBtn);
      });

      // Should handle permission error
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringContaining('permission')
          })
        );
      });
    });

    it('handles network errors', async () => {
      const user = userEvent.setup();
      
      // Mock network error
      (bookingService.createBooking as jest.Mock).mockRejectedValue({
        code: 'unavailable',
        message: 'The service is currently unavailable'
      });

      render(<DarshanBooking />);

      // Complete booking flow
      const selectDateBtn = screen.getByTestId('select-date-btn');
      await user.click(selectDateBtn);

      await waitFor(() => {
        const continueBtn = screen.getByText('Continue to Time Selection');
        return user.click(continueBtn);
      });

      await waitFor(() => {
        const selectTimeBtn = screen.getByTestId('select-time-btn');
        return user.click(selectTimeBtn);
      });

      await waitFor(() => {
        const continueBtn = screen.getByText('Continue to Confirmation');
        return user.click(continueBtn);
      });

      await waitFor(() => {
        const confirmBtn = screen.getByText('Confirm Booking');
        return user.click(confirmBtn);
      });

      // Should show network error
      await waitFor(() => {
        expect(screen.getByText(/service is currently unavailable/i)).toBeInTheDocument();
      });
    });
  });

  describe('Session Management', () => {
    it('resets booking flow when user becomes unauthenticated', () => {
      const { rerender } = render(<DarshanBooking />);

      // Start with authenticated user
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        loading: false,
        error: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        clearError: jest.fn(),
        hasError: false,
        getUserDisplayName: jest.fn(() => 'Test User'),
        getUserEmail: jest.fn(() => 'test@example.com'),
        getUserPhotoURL: jest.fn(() => undefined)
      });

      rerender(<DarshanBooking />);
      expect(screen.getByText('Book Your Darshan Slot')).toBeInTheDocument();

      // User becomes unauthenticated
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        loading: false,
        error: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        clearError: jest.fn(),
        hasError: false,
        getUserDisplayName: jest.fn(() => ''),
        getUserEmail: jest.fn(() => ''),
        getUserPhotoURL: jest.fn(() => undefined)
      });

      rerender(<DarshanBooking />);

      // Should show sign in prompt
      expect(screen.getByText('Sign In Required')).toBeInTheDocument();
    });
  });
});