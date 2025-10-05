import { BookingService } from '../bookingService';
import {
  BOOKING_STATUS,
  BOOKING_ERROR_CODES,
  FIRESTORE_COLLECTIONS,
  TIME_SLOT_CONFIG,
} from '../../../constants/booking';
import { Booking, TimeSlot, BookingError } from '../../../types/booking';

// Mock Firebase dependencies
jest.mock('../../firebase/config', () => ({
  db: {},
  auth: {},
}));

jest.mock('firebase/firestore');
jest.mock('../../firestore/firestoreService');

describe('BookingService', () => {
  let bookingService: BookingService;
  
  const testUserId = 'test-user-id';
  // Create dates that are definitely in the future
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
  futureDate.setHours(10, 0, 0, 0); // 10 AM
  const testDate = futureDate;
  const testSlotTime = new Date(futureDate);

  beforeEach(() => {
    jest.clearAllMocks();
    bookingService = new BookingService();
  });

  describe('Input validation', () => {
    it('throws error for invalid date (too far in past)', async () => {
      const pastDate = new Date('2020-01-01');

      await expect(bookingService.getAvailableSlots(pastDate))
        .rejects.toMatchObject({
          code: BOOKING_ERROR_CODES.INVALID_DATE,
          message: expect.stringContaining('advance'),
        });
    });

    it('throws error for invalid date (too far in future)', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 100); // 100 days in future

      await expect(bookingService.getAvailableSlots(futureDate))
        .rejects.toMatchObject({
          code: BOOKING_ERROR_CODES.INVALID_DATE,
          message: expect.stringContaining('advance'),
        });
    });

    it('throws error for missing userId in createBooking', async () => {
      await expect(bookingService.createBooking('', testSlotTime))
        .rejects.toMatchObject({
          code: BOOKING_ERROR_CODES.AUTH_REQUIRED,
        });
    });

    it('throws error for missing userId in getUserBookings', async () => {
      await expect(bookingService.getUserBookings(''))
        .rejects.toMatchObject({
          code: BOOKING_ERROR_CODES.AUTH_REQUIRED,
        });
    });

    it('throws error for invalid booking time (outside business hours)', async () => {
      const invalidTime = new Date(futureDate);
      invalidTime.setHours(23, 0, 0, 0); // Outside business hours (11 PM)

      await expect(bookingService.createBooking(testUserId, invalidTime))
        .rejects.toMatchObject({
          code: BOOKING_ERROR_CODES.INVALID_TIME,
        });
    });

    it('throws error for invalid booking date in createBooking', async () => {
      const pastDate = new Date('2020-01-01');

      await expect(bookingService.createBooking(testUserId, pastDate))
        .rejects.toMatchObject({
          code: BOOKING_ERROR_CODES.INVALID_DATE,
        });
    });
  });

  describe('Error handling', () => {
    it('creates proper error objects with codes and messages', async () => {
      try {
        await bookingService.createBooking('', testSlotTime);
      } catch (error: any) {
        expect(error).toHaveProperty('code');
        expect(error).toHaveProperty('message');
        expect(typeof error.code).toBe('string');
        expect(typeof error.message).toBe('string');
      }
    });

    it('validates booking status constants', () => {
      expect(BOOKING_STATUS.CONFIRMED).toBe('confirmed');
      expect(BOOKING_STATUS.CANCELLED).toBe('cancelled');
      expect(BOOKING_STATUS.COMPLETED).toBe('completed');
    });

    it('validates error code constants', () => {
      expect(BOOKING_ERROR_CODES.AUTH_REQUIRED).toBe('auth_required');
      expect(BOOKING_ERROR_CODES.INVALID_DATE).toBe('invalid_date');
      expect(BOOKING_ERROR_CODES.INVALID_TIME).toBe('invalid_time');
      expect(BOOKING_ERROR_CODES.FIRESTORE_ERROR).toBe('firestore_error');
    });

    it('validates collection name constants', () => {
      expect(FIRESTORE_COLLECTIONS.BOOKINGS).toBe('bookings');
      expect(FIRESTORE_COLLECTIONS.TIME_SLOTS).toBe('timeSlots');
    });

    it('validates time slot configuration', () => {
      expect(TIME_SLOT_CONFIG.DEFAULT_CAPACITY).toBe(50);
      expect(TIME_SLOT_CONFIG.INTERVAL_MINUTES).toBe(30);
    });
  });
});