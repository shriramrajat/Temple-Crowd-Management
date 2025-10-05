import { renderHook, act } from '@testing-library/react';
import { useBookingService } from '../useBookingService';
import { Booking, TimeSlot, BookingStatus } from '../../../../types/booking';

// Mock dependencies
jest.mock('../../../../services/booking/bookingService', () => ({
  bookingService: {
    getAvailableSlots: jest.fn(),
    createBooking: jest.fn(),
    getBooking: jest.fn(),
    cancelBooking: jest.fn(),
    getUserBookings: jest.fn(),
  },
}));

jest.mock('../../../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../../hooks/useErrorHandler', () => ({
  useErrorHandler: jest.fn(),
}));

// Import mocked modules
import { bookingService } from '../../../../services/booking/bookingService';
import { useAuth } from '../../../../hooks/useAuth';
import { useErrorHandler } from '../../../../hooks/useErrorHandler';

const mockBookingService = bookingService as jest.Mocked<typeof bookingService>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseErrorHandler = useErrorHandler as jest.MockedFunction<typeof useErrorHandler>;

describe('useBookingService', () => {
  const mockUser = {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User'
  };

  const mockTimeSlots: TimeSlot[] = [
    {
      id: '2024-12-25-10-00',
      time: '10:00',
      date: new Date('2024-12-25'),
      capacity: 50,
      booked: 10,
      available: true
    },
    {
      id: '2024-12-25-10-30',
      time: '10:30',
      date: new Date('2024-12-25'),
      capacity: 50,
      booked: 45,
      available: true
    }
  ];

  const mockBooking: Booking = {
    id: 'booking-123',
    userId: 'test-user-id',
    slotTime: new Date('2024-12-25T10:00:00.000Z'),
    status: 'confirmed' as BookingStatus,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockErrorHandler = {
    captureError: jest.fn(),
    handleAsyncError: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
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

    mockUseErrorHandler.mockReturnValue(mockErrorHandler);
    
    // Mock handleAsyncError to execute the function by default
    mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => {
      try {
        return await fn();
      } catch (error) {
        return null;
      }
    });
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useBookingService());

      expect(result.current.availableSlots).toEqual([]);
      expect(result.current.currentBooking).toBeNull();
      expect(result.current.userBookings).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.hasError).toBe(false);
      expect(result.current.hasAvailableSlots).toBe(false);
      expect(result.current.canCreateBooking).toBe(false);
    });
  });

  describe('getAvailableSlots', () => {
    it('should fetch and cache available slots successfully', async () => {
      mockBookingService.getAvailableSlots.mockResolvedValue(mockTimeSlots);
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());

      const { result } = renderHook(() => useBookingService());
      const testDate = new Date('2024-12-25');

      await act(async () => {
        await result.current.getAvailableSlots(testDate);
      });

      expect(result.current.availableSlots).toEqual(mockTimeSlots);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.hasAvailableSlots).toBe(true);
      expect(mockBookingService.getAvailableSlots).toHaveBeenCalledWith(testDate);
    });

    it('should return cached data when available and valid', async () => {
      mockBookingService.getAvailableSlots.mockResolvedValue(mockTimeSlots);
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());

      const { result } = renderHook(() => useBookingService());
      const testDate = new Date('2024-12-25');

      // First call - should fetch from service
      await act(async () => {
        await result.current.getAvailableSlots(testDate);
      });

      expect(mockBookingService.getAvailableSlots).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      await act(async () => {
        await result.current.getAvailableSlots(testDate);
      });

      expect(mockBookingService.getAvailableSlots).toHaveBeenCalledTimes(1); // Still only called once
      expect(result.current.availableSlots).toEqual(mockTimeSlots);
    });

    it('should handle errors and set error state', async () => {
      const mockError = new Error('Network error');
      mockErrorHandler.handleAsyncError.mockResolvedValue(null);

      const { result } = renderHook(() => useBookingService());
      const testDate = new Date('2024-12-25');

      await act(async () => {
        await result.current.getAvailableSlots(testDate);
      });

      expect(result.current.availableSlots).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toEqual({
        code: 'fetch_slots_error',
        message: 'Failed to fetch available slots. Please try again.'
      });
      expect(result.current.hasError).toBe(true);
    });

    it('should set loading state during fetch', async () => {
      let resolvePromise: (value: TimeSlot[]) => void;
      const promise = new Promise<TimeSlot[]>((resolve) => {
        resolvePromise = resolve;
      });
      
      mockBookingService.getAvailableSlots.mockReturnValue(promise);
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());

      const { result } = renderHook(() => useBookingService());
      const testDate = new Date('2024-12-25');

      act(() => {
        result.current.getAvailableSlots(testDate);
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolvePromise!(mockTimeSlots);
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('createBooking', () => {
    it('should create booking successfully when authenticated', async () => {
      mockBookingService.createBooking.mockResolvedValue(mockBooking);
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());

      const { result } = renderHook(() => useBookingService());
      const slotTime = new Date('2024-12-25T10:00:00.000Z');

      await act(async () => {
        const booking = await result.current.createBooking(slotTime);
        expect(booking).toEqual(mockBooking);
      });

      expect(result.current.currentBooking).toEqual(mockBooking);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockBookingService.createBooking).toHaveBeenCalledWith(mockUser.uid, slotTime);
    });

    it('should handle authentication error', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        isLoading: false,
        hasError: false,
        clearError: jest.fn(),
        getUserDisplayName: jest.fn(() => ''),
        getUserEmail: jest.fn(() => ''),
        getUserPhotoURL: jest.fn(() => undefined)
      });

      const { result } = renderHook(() => useBookingService());
      const slotTime = new Date('2024-12-25T10:00:00.000Z');

      await act(async () => {
        const booking = await result.current.createBooking(slotTime);
        expect(booking).toBeNull();
      });

      expect(result.current.error).toEqual({
        code: 'auth_required',
        message: 'You must be signed in to create a booking.'
      });
    });

    it('should handle booking creation errors', async () => {
      mockErrorHandler.handleAsyncError.mockResolvedValue(null);

      const { result } = renderHook(() => useBookingService());
      const slotTime = new Date('2024-12-25T10:00:00.000Z');

      await act(async () => {
        const booking = await result.current.createBooking(slotTime);
        expect(booking).toBeNull();
      });

      expect(result.current.error).toEqual({
        code: 'create_booking_error',
        message: 'Failed to create booking. Please try again.'
      });
    });

    it('should clear cache after successful booking creation', async () => {
      mockBookingService.createBooking.mockResolvedValue(mockBooking);
      mockBookingService.getAvailableSlots.mockResolvedValue(mockTimeSlots);
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());

      const { result } = renderHook(() => useBookingService());
      const testDate = new Date('2024-12-25');
      const slotTime = new Date('2024-12-25T10:00:00.000Z');

      // First, populate cache
      await act(async () => {
        await result.current.getAvailableSlots(testDate);
      });

      expect(mockBookingService.getAvailableSlots).toHaveBeenCalledTimes(1);

      // Create booking (should clear cache)
      await act(async () => {
        await result.current.createBooking(slotTime);
      });

      // Fetch slots again (should call service again due to cleared cache)
      await act(async () => {
        await result.current.getAvailableSlots(testDate);
      });

      expect(mockBookingService.getAvailableSlots).toHaveBeenCalledTimes(2);
    });
  });

  describe('getBooking', () => {
    it('should fetch booking successfully', async () => {
      mockBookingService.getBooking.mockResolvedValue(mockBooking);
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());

      const { result } = renderHook(() => useBookingService());

      await act(async () => {
        const booking = await result.current.getBooking('booking-123');
        expect(booking).toEqual(mockBooking);
      });

      expect(result.current.currentBooking).toEqual(mockBooking);
      expect(mockBookingService.getBooking).toHaveBeenCalledWith('booking-123');
    });

    it('should handle fetch booking errors', async () => {
      mockErrorHandler.handleAsyncError.mockResolvedValue(null);

      const { result } = renderHook(() => useBookingService());

      await act(async () => {
        const booking = await result.current.getBooking('booking-123');
        expect(booking).toBeNull();
      });

      expect(result.current.error).toEqual({
        code: 'fetch_booking_error',
        message: 'Failed to fetch booking details. Please try again.'
      });
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking successfully', async () => {
      mockBookingService.cancelBooking.mockResolvedValue();
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());

      const { result } = renderHook(() => useBookingService());

      // Set current booking first by calling getBooking
      await act(async () => {
        mockBookingService.getBooking.mockResolvedValue(mockBooking);
        await result.current.getBooking('booking-123');
      });

      await act(async () => {
        await result.current.cancelBooking('booking-123');
      });

      expect(mockBookingService.cancelBooking).toHaveBeenCalledWith('booking-123');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle cancel booking errors', async () => {
      mockErrorHandler.handleAsyncError.mockResolvedValue(null);

      const { result } = renderHook(() => useBookingService());

      await act(async () => {
        await result.current.cancelBooking('booking-123');
      });

      expect(result.current.error).toEqual({
        code: 'cancel_booking_error',
        message: 'Failed to cancel booking. Please try again.'
      });
    });

    it('should update user bookings list when cancelling', async () => {
      mockBookingService.cancelBooking.mockResolvedValue();
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());

      const { result } = renderHook(() => useBookingService());

      // Set user bookings first using a ref or state setter
      // Note: We can't directly set result.current.userBookings as it's read-only
      // Instead, we'll test the behavior after getUserBookings is called
      await act(async () => {
        // Mock getUserBookings to return the booking
        mockBookingService.getUserBookings.mockResolvedValue([mockBooking]);
        await result.current.getUserBookings();
      });

      await act(async () => {
        await result.current.cancelBooking('booking-123');
      });

      expect(result.current.userBookings[0].status).toBe('cancelled');
    });
  });

  describe('getUserBookings', () => {
    it('should fetch user bookings successfully when authenticated', async () => {
      const mockUserBookings = [mockBooking];
      mockBookingService.getUserBookings.mockResolvedValue(mockUserBookings);
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());

      const { result } = renderHook(() => useBookingService());

      await act(async () => {
        await result.current.getUserBookings();
      });

      expect(result.current.userBookings).toEqual(mockUserBookings);
      expect(mockBookingService.getUserBookings).toHaveBeenCalledWith(mockUser.uid);
    });

    it('should handle authentication error', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        isLoading: false,
        hasError: false,
        clearError: jest.fn(),
        getUserDisplayName: jest.fn(() => ''),
        getUserEmail: jest.fn(() => ''),
        getUserPhotoURL: jest.fn(() => undefined)
      });

      const { result } = renderHook(() => useBookingService());

      await act(async () => {
        await result.current.getUserBookings();
      });

      expect(result.current.error).toEqual({
        code: 'auth_required',
        message: 'You must be signed in to view your bookings.'
      });
    });

    it('should handle fetch user bookings errors', async () => {
      mockErrorHandler.handleAsyncError.mockResolvedValue(null);

      const { result } = renderHook(() => useBookingService());

      await act(async () => {
        await result.current.getUserBookings();
      });

      expect(result.current.error).toEqual({
        code: 'fetch_user_bookings_error',
        message: 'Failed to fetch your bookings. Please try again.'
      });
      expect(result.current.userBookings).toEqual([]);
    });
  });

  describe('Utility functions', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => useBookingService());

      // Set an error first by triggering an error condition
      mockErrorHandler.handleAsyncError.mockResolvedValue(null);
      await act(async () => {
        await result.current.getAvailableSlots(new Date());
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should clear cache', async () => {
      mockBookingService.getAvailableSlots.mockResolvedValue(mockTimeSlots);
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());

      const { result } = renderHook(() => useBookingService());
      const testDate = new Date('2024-12-25');

      // Populate cache
      await act(async () => {
        await result.current.getAvailableSlots(testDate);
      });

      expect(mockBookingService.getAvailableSlots).toHaveBeenCalledTimes(1);

      // Clear cache
      act(() => {
        result.current.clearCache();
      });

      // Fetch again (should call service again)
      await act(async () => {
        await result.current.getAvailableSlots(testDate);
      });

      expect(mockBookingService.getAvailableSlots).toHaveBeenCalledTimes(2);
    });
  });

  describe('Computed properties', () => {
    it('should compute canCreateBooking correctly', () => {
      const { result } = renderHook(() => useBookingService());

      // Initially false (no available slots)
      expect(result.current.canCreateBooking).toBe(false);

      // Set available slots by calling getAvailableSlots
      mockBookingService.getAvailableSlots.mockResolvedValue(mockTimeSlots);
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());
      
      await act(async () => {
        await result.current.getAvailableSlots(new Date());
      });

      expect(result.current.canCreateBooking).toBe(true);

      // Test loading state by triggering a long-running operation
      let resolvePromise: (value: TimeSlot[]) => void;
      const promise = new Promise<TimeSlot[]>((resolve) => {
        resolvePromise = resolve;
      });
      
      mockBookingService.getAvailableSlots.mockReturnValue(promise);
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());

      act(() => {
        result.current.getAvailableSlots(new Date());
      });

      expect(result.current.canCreateBooking).toBe(false);
    });

    it('should compute hasAvailableSlots correctly', () => {
      const { result } = renderHook(() => useBookingService());

      expect(result.current.hasAvailableSlots).toBe(false);

      // Set available slots by calling getAvailableSlots
      mockBookingService.getAvailableSlots.mockResolvedValue(mockTimeSlots);
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());
      
      await act(async () => {
        await result.current.getAvailableSlots(new Date());
      });

      expect(result.current.hasAvailableSlots).toBe(true);
    });

    it('should compute hasError correctly', () => {
      const { result } = renderHook(() => useBookingService());

      expect(result.current.hasError).toBe(false);

      // Set error by triggering an error condition
      mockErrorHandler.handleAsyncError.mockResolvedValue(null);
      await act(async () => {
        await result.current.getAvailableSlots(new Date());
      });

      expect(result.current.hasError).toBe(true);
    });
  });
});