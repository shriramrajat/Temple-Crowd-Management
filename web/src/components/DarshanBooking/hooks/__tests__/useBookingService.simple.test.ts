import { renderHook } from '@testing-library/react';

// Simple test to verify basic hook functionality
describe('useBookingService - Simple Tests', () => {
  // Mock all dependencies at the top level
  const mockBookingService = {
    getAvailableSlots: jest.fn(),
    createBooking: jest.fn(),
    getBooking: jest.fn(),
    cancelBooking: jest.fn(),
    getUserBookings: jest.fn(),
  };

  const mockUseAuth = jest.fn();
  const mockUseErrorHandler = jest.fn();

  beforeAll(() => {
    // Mock modules before importing the hook
    jest.doMock('../../../../services/booking/bookingService', () => ({
      bookingService: mockBookingService,
    }));

    jest.doMock('../../../../hooks/useAuth', () => ({
      useAuth: mockUseAuth,
    }));

    jest.doMock('../../../../hooks/useErrorHandler', () => ({
      useErrorHandler: mockUseErrorHandler,
    }));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user' },
      isAuthenticated: true,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
      isLoading: false,
      hasError: false,
      clearError: jest.fn(),
      getUserDisplayName: jest.fn(() => 'Test User'),
      getUserEmail: jest.fn(() => 'test@example.com'),
      getUserPhotoURL: jest.fn(() => undefined)
    });

    mockUseErrorHandler.mockReturnValue({
      captureError: jest.fn(),
      handleAsyncError: jest.fn(async (fn) => {
        try {
          return await fn();
        } catch (error) {
          return null;
        }
      })
    });
  });

  it('should initialize with default values', async () => {
    // Dynamic import to ensure mocks are applied
    const { useBookingService } = await import('../useBookingService');
    const { result } = renderHook(() => useBookingService());

    expect(result.current.availableSlots).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});