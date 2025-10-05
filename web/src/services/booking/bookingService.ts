import {
  collection,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { firestoreService } from '../firestore/firestoreService';
import {
  Booking,
  TimeSlot,
  BookingError,
  IBookingService,
  BookingDocument,
  TimeSlotDocument,
} from '../../types/booking';
import {
  BOOKING_STATUS,
  BOOKING_ERROR_CODES,
  BOOKING_ERROR_MESSAGES,
  FIRESTORE_COLLECTIONS,
  TIME_SLOT_CONFIG,
} from '../../constants/booking';
import {
  validateBookingDate,
  validateBookingTime,
  validateSlotCapacity,
  generateTimeSlotId,
} from '../../utils/bookingValidation';

/**
 * Convert Firestore Timestamp to Date
 */
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  return new Date();
};

/**
 * Convert Firestore document to Booking
 */
const convertToBooking = (id: string, data: any): Booking => {
  return {
    id,
    userId: data.userId,
    slotTime: convertTimestamp(data.slotTime),
    status: data.status,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
  };
};

/**
 * Convert Firestore document to TimeSlot
 */
const convertToTimeSlot = (id: string, data: any): TimeSlot => {
  return {
    id,
    time: data.time,
    date: convertTimestamp(data.date),
    capacity: data.capacity,
    booked: data.booked,
    available: data.available,
  };
};

/**
 * Create a booking error with user-friendly message
 */
const createBookingError = (code: string, customMessage?: string): BookingError => {
  return {
    code,
    message: customMessage || BOOKING_ERROR_MESSAGES[code as keyof typeof BOOKING_ERROR_MESSAGES] || 'An unknown error occurred.',
  };
};

/**
 * Generate time slots for a given date
 */
const generateTimeSlotsForDate = (date: Date): { time: string; slotId: string }[] => {
  const slots: { time: string; slotId: string }[] = [];
  const startHour = 6; // 6 AM
  const endHour = 20; // 8 PM
  const intervalMinutes = TIME_SLOT_CONFIG.INTERVAL_MINUTES;

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const slotId = generateTimeSlotId(date, timeString);
      slots.push({ time: timeString, slotId });
    }
  }

  return slots;
};

/**
 * Booking Service Implementation
 */
export class BookingService implements IBookingService {
  /**
   * Get available time slots for a specific date
   */
  async getAvailableSlots(date: Date): Promise<TimeSlot[]> {
    try {
      // Validate the date
      const dateValidation = validateBookingDate(date);
      if (dateValidation) {
        throw createBookingError(dateValidation.code, dateValidation.message);
      }

      // Generate all possible time slots for the date
      const possibleSlots = generateTimeSlotsForDate(date);
      
      // Query existing time slots from Firestore
      const timeSlotsRef = collection(db, FIRESTORE_COLLECTIONS.TIME_SLOTS);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        timeSlotsRef,
        where('date', '>=', startOfDay),
        where('date', '<=', endOfDay),
        orderBy('date'),
        orderBy('time')
      );

      const querySnapshot = await getDocs(q);
      const existingSlots = new Map<string, TimeSlot>();

      querySnapshot.forEach((doc) => {
        const slot = convertToTimeSlot(doc.id, doc.data());
        existingSlots.set(slot.id, slot);
      });

      // Create time slots array with availability information
      const timeSlots: TimeSlot[] = [];

      for (const { time, slotId } of possibleSlots) {
        // Validate time is within business hours
        const timeValidation = validateBookingTime(time);
        if (timeValidation) {
          continue; // Skip invalid times
        }

        const existingSlot = existingSlots.get(slotId);
        
        if (existingSlot) {
          // Use existing slot data
          timeSlots.push(existingSlot);
        } else {
          // Create new slot with default values
          const newSlot: TimeSlot = {
            id: slotId,
            time,
            date: new Date(date),
            capacity: TIME_SLOT_CONFIG.DEFAULT_CAPACITY,
            booked: 0,
            available: true,
          };
          timeSlots.push(newSlot);
        }
      }

      return timeSlots.filter(slot => slot.available);
    } catch (error: any) {
      if (error.code) {
        throw error; // Re-throw booking errors
      }
      
      console.error('Error fetching available slots:', error);
      throw createBookingError(BOOKING_ERROR_CODES.FIRESTORE_ERROR);
    }
  }

  /**
   * Create a new booking
   */
  async createBooking(userId: string, slotTime: Date): Promise<Booking> {
    try {
      if (!userId) {
        throw createBookingError(BOOKING_ERROR_CODES.AUTH_REQUIRED);
      }

      // Validate the booking date and time
      const dateValidation = validateBookingDate(slotTime);
      if (dateValidation) {
        throw createBookingError(dateValidation.code, dateValidation.message);
      }

      const timeString = `${slotTime.getHours().toString().padStart(2, '0')}:${slotTime.getMinutes().toString().padStart(2, '0')}`;
      const timeValidation = validateBookingTime(timeString);
      if (timeValidation) {
        throw createBookingError(timeValidation.code, timeValidation.message);
      }

      // Use a transaction to ensure data consistency
      const booking = await runTransaction(db, async (transaction) => {
        // Check for duplicate booking
        const bookingsRef = collection(db, FIRESTORE_COLLECTIONS.BOOKINGS);
        const duplicateQuery = query(
          bookingsRef,
          where('userId', '==', userId),
          where('slotTime', '==', slotTime),
          where('status', '==', BOOKING_STATUS.CONFIRMED)
        );
        
        const duplicateSnapshot = await getDocs(duplicateQuery);
        if (!duplicateSnapshot.empty) {
          throw createBookingError(BOOKING_ERROR_CODES.DUPLICATE_BOOKING);
        }

        // Get or create time slot
        const slotId = generateTimeSlotId(slotTime, timeString);
        const timeSlotRef = doc(db, FIRESTORE_COLLECTIONS.TIME_SLOTS, slotId);
        const timeSlotDoc = await transaction.get(timeSlotRef);

        let currentBooked = 0;
        const capacity = TIME_SLOT_CONFIG.DEFAULT_CAPACITY;

        if (timeSlotDoc.exists()) {
          const slotData = timeSlotDoc.data();
          currentBooked = slotData.booked || 0;
          
          // Validate capacity
          const capacityValidation = validateSlotCapacity(currentBooked, capacity);
          if (capacityValidation) {
            throw createBookingError(capacityValidation.code, capacityValidation.message);
          }
        }

        // Create the booking
        const bookingData: Omit<BookingDocument, 'id' | 'createdAt' | 'updatedAt'> = {
          userId,
          slotTime,
          status: BOOKING_STATUS.CONFIRMED,
        };

        const bookingRef = doc(collection(db, FIRESTORE_COLLECTIONS.BOOKINGS));
        transaction.set(bookingRef, {
          ...bookingData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // Update or create time slot
        const newBooked = currentBooked + 1;
        const timeSlotData: Omit<TimeSlotDocument, 'createdAt' | 'updatedAt'> = {
          date: new Date(slotTime.getFullYear(), slotTime.getMonth(), slotTime.getDate()),
          time: timeString,
          capacity,
          booked: newBooked,
          available: newBooked < capacity,
        };

        if (timeSlotDoc.exists()) {
          transaction.update(timeSlotRef, {
            ...timeSlotData,
            updatedAt: serverTimestamp(),
          });
        } else {
          transaction.set(timeSlotRef, {
            ...timeSlotData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        // Return the booking with generated ID
        return {
          id: bookingRef.id,
          ...bookingData,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Booking;
      });

      return booking;
    } catch (error: any) {
      if (error.code) {
        throw error; // Re-throw booking errors
      }
      
      console.error('Error creating booking:', error);
      throw createBookingError(BOOKING_ERROR_CODES.FIRESTORE_ERROR);
    }
  }

  /**
   * Get a booking by ID
   */
  async getBooking(bookingId: string): Promise<Booking> {
    try {
      const bookingDoc = await firestoreService.getDocument<BookingDocument>(
        FIRESTORE_COLLECTIONS.BOOKINGS,
        bookingId
      );

      if (!bookingDoc) {
        throw createBookingError(BOOKING_ERROR_CODES.VALIDATION_ERROR, 'Booking not found.');
      }

      return convertToBooking(bookingDoc.id, bookingDoc);
    } catch (error: any) {
      if (error.code) {
        throw error; // Re-throw booking errors
      }
      
      console.error('Error fetching booking:', error);
      throw createBookingError(BOOKING_ERROR_CODES.FIRESTORE_ERROR);
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string): Promise<void> {
    try {
      // Use a transaction to ensure data consistency
      await runTransaction(db, async (transaction) => {
        // Get the booking
        const bookingRef = doc(db, FIRESTORE_COLLECTIONS.BOOKINGS, bookingId);
        const bookingDoc = await transaction.get(bookingRef);

        if (!bookingDoc.exists()) {
          throw createBookingError(BOOKING_ERROR_CODES.VALIDATION_ERROR, 'Booking not found.');
        }

        const bookingData = bookingDoc.data();
        if (bookingData.status !== BOOKING_STATUS.CONFIRMED) {
          throw createBookingError(BOOKING_ERROR_CODES.VALIDATION_ERROR, 'Only confirmed bookings can be cancelled.');
        }

        // Update booking status
        transaction.update(bookingRef, {
          status: BOOKING_STATUS.CANCELLED,
          updatedAt: serverTimestamp(),
        });

        // Update time slot availability
        const slotTime = convertTimestamp(bookingData.slotTime);
        const timeString = `${slotTime.getHours().toString().padStart(2, '0')}:${slotTime.getMinutes().toString().padStart(2, '0')}`;
        const slotId = generateTimeSlotId(slotTime, timeString);
        const timeSlotRef = doc(db, FIRESTORE_COLLECTIONS.TIME_SLOTS, slotId);
        const timeSlotDoc = await transaction.get(timeSlotRef);

        if (timeSlotDoc.exists()) {
          const slotData = timeSlotDoc.data();
          const newBooked = Math.max(0, (slotData.booked || 1) - 1);
          
          transaction.update(timeSlotRef, {
            booked: newBooked,
            available: newBooked < slotData.capacity,
            updatedAt: serverTimestamp(),
          });
        }
      });
    } catch (error: any) {
      if (error.code) {
        throw error; // Re-throw booking errors
      }
      
      console.error('Error cancelling booking:', error);
      throw createBookingError(BOOKING_ERROR_CODES.FIRESTORE_ERROR);
    }
  }

  /**
   * Get all bookings for a user
   */
  async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      if (!userId) {
        throw createBookingError(BOOKING_ERROR_CODES.AUTH_REQUIRED);
      }

      const bookings = await firestoreService.getCollection<BookingDocument>(
        FIRESTORE_COLLECTIONS.BOOKINGS,
        {
          where: [{ field: 'userId', operator: '==', value: userId }],
          orderBy: { field: 'slotTime', direction: 'desc' },
        }
      );

      return bookings.map(booking => convertToBooking(booking.id, booking));
    } catch (error: any) {
      if (error.code) {
        throw error; // Re-throw booking errors
      }
      
      console.error('Error fetching user bookings:', error);
      throw createBookingError(BOOKING_ERROR_CODES.FIRESTORE_ERROR);
    }
  }
}

// Create a singleton instance
const bookingServiceInstance = new BookingService();

// Export static methods for convenience
export const bookingService = {
  getAvailableSlots: (date: Date) => bookingServiceInstance.getAvailableSlots(date),
  createBooking: (userId: string, slotTime: Date) => bookingServiceInstance.createBooking(userId, slotTime),
  getBooking: (bookingId: string) => bookingServiceInstance.getBooking(bookingId),
  cancelBooking: (bookingId: string) => bookingServiceInstance.cancelBooking(bookingId),
  getUserBookings: (userId: string) => bookingServiceInstance.getUserBookings(userId),
};

export default BookingService;