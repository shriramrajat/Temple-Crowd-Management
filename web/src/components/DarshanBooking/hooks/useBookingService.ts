'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { bookingService } from '../../../services/booking/bookingService';
import { useAuth } from '../../../hooks/useAuth';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { Booking, TimeSlot, BookingError } from '../../../types/booking';

interface CachedSlots {
  date: string;
  slots: TimeSlot[];
  timestamp: number;
}

interface UseBookingServiceReturn {
  // State
  availableSlots: TimeSlot[];
  currentBooking: Booking | null;
  userBookings: Booking[];
  loading: boolean;
  error: BookingError | null;
  
  // Actions
  getAvailableSlots: (date: Date) => Promise<void>;
  createBooking: (slotTime: Date) => Promise<Booking | null>;
  getBooking: (bookingId: string) => Promise<Booking | null>;
  cancelBooking: (bookingId: string) => Promise<void>;
  getUserBookings: () => Promise<void>;
  clearError: () => void;
  clearCache: () => void;
  
  // Computed properties
  isLoading: boolean;
  hasError: boolean;
  hasAvailableSlots: boolean;
  canCreateBooking: boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Custom hook for booking service operations
 * Provides loading states, error handling, and caching for available slots data
 */
export function useBookingService(): UseBookingServiceReturn {
  const { user, isAuthenticated } = useAuth();
  const { captureError, handleAsyncError } = useErrorHandler({
    context: { component: 'useBookingService' }
  });

  // State
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<BookingError | null>(null);

  // Cache for available slots
  const slotsCache = useRef<Map<string, CachedSlots>>(new Map());

  /**
   * Clear error state
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  /**
   * Clear slots cache
   */
  const clearCache = useCallback((): void => {
    slotsCache.current.clear();
  }, []);

  /**
   * Check if cached data is still valid
   */
  const isCacheValid = useCallback((timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION;
  }, []);

  /**
   * Get cache key for a date
   */
  const getCacheKey = useCallback((date: Date): string => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }, []);

  /**
   * Get available slots for a specific date with caching
   */
  const getAvailableSlots = useCallback(async (date: Date): Promise<void> => {
    const cacheKey = getCacheKey(date);
    const cached = slotsCache.current.get(cacheKey);

    // Return cached data if valid
    if (cached && isCacheValid(cached.timestamp)) {
      setAvailableSlots(cached.slots);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await handleAsyncError(
      async () => {
        const slots = await bookingService.getAvailableSlots(date);
        
        // Cache the results
        slotsCache.current.set(cacheKey, {
          date: cacheKey,
          slots,
          timestamp: Date.now()
        });

        setAvailableSlots(slots);
        return slots;
      },
      { operation: 'getAvailableSlots', date: date.toISOString() }
    );

    if (!result) {
      setError({
        code: 'fetch_slots_error',
        message: 'Failed to fetch available slots. Please try again.'
      });
      setAvailableSlots([]);
    }

    setLoading(false);
  }, [getCacheKey, isCacheValid, handleAsyncError]);

  /**
   * Create a new booking
   */
  const createBooking = useCallback(async (slotTime: Date): Promise<Booking | null> => {
    if (!isAuthenticated || !user?.uid) {
      setError({
        code: 'auth_required',
        message: 'You must be signed in to create a booking.'
      });
      return null;
    }

    setLoading(true);
    setError(null);

    const result = await handleAsyncError(
      async () => {
        const booking = await bookingService.createBooking(user.uid, slotTime);
        setCurrentBooking(booking);
        
        // Clear cache for the booking date to refresh availability
        const cacheKey = getCacheKey(slotTime);
        slotsCache.current.delete(cacheKey);
        
        return booking;
      },
      { operation: 'createBooking', slotTime: slotTime.toISOString(), userId: user.uid }
    );

    if (!result) {
      setError({
        code: 'create_booking_error',
        message: 'Failed to create booking. Please try again.'
      });
    }

    setLoading(false);
    return result;
  }, [isAuthenticated, user?.uid, handleAsyncError, getCacheKey]);

  /**
   * Get a specific booking by ID
   */
  const getBooking = useCallback(async (bookingId: string): Promise<Booking | null> => {
    setLoading(true);
    setError(null);

    const result = await handleAsyncError(
      async () => {
        const booking = await bookingService.getBooking(bookingId);
        setCurrentBooking(booking);
        return booking;
      },
      { operation: 'getBooking', bookingId }
    );

    if (!result) {
      setError({
        code: 'fetch_booking_error',
        message: 'Failed to fetch booking details. Please try again.'
      });
    }

    setLoading(false);
    return result;
  }, [handleAsyncError]);

  /**
   * Cancel a booking
   */
  const cancelBooking = useCallback(async (bookingId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    const result = await handleAsyncError(
      async () => {
        await bookingService.cancelBooking(bookingId);
        
        // Update current booking if it's the one being cancelled
        if (currentBooking?.id === bookingId) {
          setCurrentBooking(prev => prev ? { ...prev, status: 'cancelled' } : null);
        }
        
        // Update user bookings list
        setUserBookings(prev => 
          prev.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: 'cancelled' as const }
              : booking
          )
        );
        
        // Clear cache to refresh availability
        clearCache();
      },
      { operation: 'cancelBooking', bookingId }
    );

    if (!result) {
      setError({
        code: 'cancel_booking_error',
        message: 'Failed to cancel booking. Please try again.'
      });
    }

    setLoading(false);
  }, [handleAsyncError, currentBooking?.id, clearCache]);

  /**
   * Get all bookings for the current user
   */
  const getUserBookings = useCallback(async (): Promise<void> => {
    if (!isAuthenticated || !user?.uid) {
      setError({
        code: 'auth_required',
        message: 'You must be signed in to view your bookings.'
      });
      return;
    }

    setLoading(true);
    setError(null);

    const result = await handleAsyncError(
      async () => {
        const bookings = await bookingService.getUserBookings(user.uid);
        setUserBookings(bookings);
        return bookings;
      },
      { operation: 'getUserBookings', userId: user.uid }
    );

    if (!result) {
      setError({
        code: 'fetch_user_bookings_error',
        message: 'Failed to fetch your bookings. Please try again.'
      });
      setUserBookings([]);
    }

    setLoading(false);
  }, [isAuthenticated, user?.uid, handleAsyncError]);

  // Computed properties
  const isLoading = useMemo(() => loading, [loading]);
  const hasError = useMemo(() => !!error, [error]);
  const hasAvailableSlots = useMemo(() => availableSlots.length > 0, [availableSlots.length]);
  const canCreateBooking = useMemo(() => 
    isAuthenticated && !loading && !error && hasAvailableSlots, 
    [isAuthenticated, loading, error, hasAvailableSlots]
  );

  return {
    // State
    availableSlots,
    currentBooking,
    userBookings,
    loading,
    error,
    
    // Actions
    getAvailableSlots,
    createBooking,
    getBooking,
    cancelBooking,
    getUserBookings,
    clearError,
    clearCache,
    
    // Computed properties
    isLoading,
    hasError,
    hasAvailableSlots,
    canCreateBooking,
  };
}

export default useBookingService;