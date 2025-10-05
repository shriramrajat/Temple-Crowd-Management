import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DarshanBooking } from '../DarshanBooking';
import { AuthProvider } from '@/contexts/AuthContext';
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
  Card: ({ children, className }: any) => <div className={className}>{children}</div>
}));

jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, variant, className }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`${variant} ${className}`}
    >
      {children}
    </button>
  )
}));

jest.mock('@/components/ui/LoadingSpinner', () => ({
  LoadingSpinner: ({ size, className }: any) => (
    <div className={`spinner ${size} ${className}`}>Loading...</div>
  )
}));

// Mock child components
jest.mock('../components/DatePicker', () => ({
  DatePicker: ({ onDateSelect, disabled }: any) => (
    <div>
      <button 
        onClick={() => onDateSelect(new Date('2024-12-25'))}
        disabled={disabled}
      >
        Select Date
      </button>
    </div>
  )
}));

jest.mock('../components/TimeSlotPicker', () => ({
  TimeSlotPicker: ({ onSlotSelect, disabled }: any) => (
    <div>
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
      >
        Select Time Slot
      </button>
    </div>
  )
}));

jest.mock('../components/BookingConfirmation', () => ({
  BookingConfirmation: ({ booking, onBackToBooking }: any) => (
    <div>
      <div>Booking confirmed: {booking.id}</div>
      <button onClick={onBackToBooking}>New Booking</button>
    </div>
  )
}));

jest.mock('../components/BookingErrorBoundary', () => ({
  BookingErrorBoundary: ({ children }: any) => <div>{children}</div>
}));

jest.mock('../components/ErrorRecovery', () => ({
  ErrorRecovery: ({ error, onRetry, onSignIn }: any) => (
    <div>
      <div>Error: {error.message}</div>
      <button onClick={onRetry}>Retry</button>
      <button onClick={onSignIn}>Sign In</button>
    </div>
  )
}));

describe('DarshanBooking Authentication Integration', () => {
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

  describe('Authentication States', () => {
    it('shows loading state during auth initialization', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        loading: true,
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

      expect(screen.getByText('Initializing...')).toBeInTheDocument();
      expect(screen.getByText('Please wait while we set up your session')).toBeInTheDocument();
    });

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
      expect(screen.getByText('Sign In with Google')).toBeInTheDocument();
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
      expect(screen.getByText('Select Date')).toBeInTheDocument();
    });
  });

  describe('Authentication Actions', () => {
    it('calls signIn when sign in button is clicked', async () => {
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
      fireEvent.click(signInButton);

      expect(mockSignIn).toHaveBeenCalled();
    });

    it('handles sign in errors', async () => {
      const mockSignIn = jest.fn().mockRejectedValue(new Error('Sign in failed'));
      const mockOnError = jest.fn();
      
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

      render(<DarshanBooking onError={mockOnError} />);

      const signInButton = screen.getByText('Sign In with Google');
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringContaining('Sign in failed')
          })
        );
      });
    });

    it('shows auth error from context', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        loading: false,
        error: 'Authentication failed',
        signIn: jest.fn(),
        signOut: jest.fn(),
        clearError: jest.fn(),
        hasError: true,
        getUserDisplayName: jest.fn(() => ''),
        getUserEmail: jest.fn(() => ''),
        getUserPhotoURL: jest.fn(() => undefined)
      });

      render(<DarshanBooking />);

      expect(screen.getByText('Authentication failed')).toBeInTheDocument();
    });
  });

  describe('Session Management', () => {
    it('resets booking flow when user becomes unauthenticated', async () => {
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

      // Navigate to time selection
      const selectDateButton = screen.getByText('Select Date');
      fireEvent.click(selectDateButton);

      await waitFor(() => {
        expect(screen.getByText('Continue to Time Selection')).toBeInTheDocument();
      });

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

    it('prevents booking when not authenticated', async () => {
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

      const mockOnAuthRequired = jest.fn();
      
      render(<DarshanBooking onAuthRequired={mockOnAuthRequired} />);

      // Should show sign in prompt instead of booking interface
      expect(screen.getByText('Sign In Required')).toBeInTheDocument();
      expect(screen.queryByText('Book Your Darshan Slot')).not.toBeInTheDocument();
    });

    it('uses authenticated user ID for booking', async () => {
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

      // Navigate through booking flow
      const selectDateButton = screen.getByText('Select Date');
      fireEvent.click(selectDateButton);

      await waitFor(() => {
        const continueButton = screen.getByText('Continue to Time Selection');
        fireEvent.click(continueButton);
      });

      await waitFor(() => {
        const selectTimeButton = screen.getByText('Select Time Slot');
        fireEvent.click(selectTimeButton);
      });

      await waitFor(() => {
        const continueButton = screen.getByText('Continue to Confirmation');
        fireEvent.click(continueButton);
      });

      await waitFor(() => {
        const confirmButton = screen.getByText('Confirm Booking');
        fireEvent.click(confirmButton);
      });

      // Verify booking service was called with authenticated user ID
      await waitFor(() => {
        expect(bookingService.createBooking).toHaveBeenCalledWith(
          mockUser.uid,
          expect.any(Date)
        );
      });
    });
  });

  describe('Custom onAuthRequired Handler', () => {
    it('calls custom onAuthRequired when provided', async () => {
      const mockOnAuthRequired = jest.fn();
      
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

      render(<DarshanBooking onAuthRequired={mockOnAuthRequired} />);

      const signInButton = screen.getByText('Sign In with Google');
      fireEvent.click(signInButton);

      expect(mockOnAuthRequired).toHaveBeenCalled();
    });
  });
});