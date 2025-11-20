/**
 * Booking Service
 * Handles all business logic related to booking management including
 * availability checking, booking creation, cancellation, and check-in operations
 * Requirements: 1.3, 1.4, 1.6, 2.6, 5.5, 5.6, 6.3, 6.4, 6.5, 6.6, 8.4, 8.5
 */

import type { DbClient } from "@/lib/db";
import type { BookingFormData } from "@/lib/validations/booking";
import type { Booking, BookingStatus } from "@/lib/types/api";

/**
 * Booking data structure from database
 */
export interface BookingData {
  id: string;
  slotId: string;
  name: string;
  phone: string;
  email: string;
  numberOfPeople: number;
  qrCode: string;
  status: BookingStatus;
  checkedInAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  slot?: any;
}

/**
 * Transform database booking to API response format
 * 
 * @param booking - Booking data from database
 * @returns Formatted booking
 */
export function transformBookingToAPI(booking: BookingData): Booking {
  return {
    id: booking.id,
    slotId: booking.slotId,
    name: booking.name,
    phone: booking.phone,
    email: booking.email,
    numberOfPeople: booking.numberOfPeople,
    qrCode: booking.qrCode,
    status: booking.status,
    checkedInAt: booking.checkedInAt ? booking.checkedInAt.toISOString() : null,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    slot: booking.slot,
  };
}

/**
 * Booking Service Class
 * Provides methods for booking operations with database abstraction
 */
export class BookingService {
  /**
   * Database client instance
   */
  private db: DbClient;

  constructor(dbClient: DbClient) {
    this.db = dbClient;
  }

  /**
   * Check if a slot is available for booking
   * Requirements: 1.3, 1.4
   * 
   * Verifies that:
   * - Slot exists and is active
   * - Slot has available capacity
   * 
   * @param slotId - ID of the slot to check
   * @returns Boolean indicating availability
   */
  async checkAvailability(slotId: string): Promise<boolean> {
    try {
      const slot = await this.db.slots.findUnique({
        where: { id: slotId },
        select: {
          isActive: true,
          capacity: true,
          bookedCount: true,
        },
      });

      if (!slot) {
        return false;
      }

      // Check if slot is active and has available capacity
      return slot.isActive && slot.bookedCount < slot.capacity;
    } catch (error) {
      throw new Error(
        `Failed to check availability: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Check for duplicate bookings
   * Requirements: 2.6
   * 
   * Prevents the same phone/email from booking the same slot
   * 
   * @param slotId - ID of the slot
   * @param phone - Phone number to check
   * @param email - Email to check
   * @returns Boolean indicating if duplicate exists
   */
  async hasDuplicateBooking(
    slotId: string,
    phone: string,
    email: string
  ): Promise<boolean> {
    try {
      const existingBooking = await this.db.bookings.findFirst({
        where: {
          slotId,
          status: {
            not: "cancelled",
          },
          OR: [
            { phone },
            { email },
          ],
        },
      });

      return existingBooking !== null;
    } catch (error) {
      throw new Error(
        `Failed to check for duplicate booking: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Create a new booking with database transaction
   * Requirements: 1.3, 1.4, 1.6, 2.6, 8.4
   * 
   * Performs atomic operation:
   * 1. Validates slot availability
   * 2. Checks for duplicate bookings
   * 3. Creates booking record
   * 4. Increments slot booked count
   * 
   * Uses database transaction to ensure atomicity
   * 
   * @param bookingData - Booking form data
   * @returns Created booking
   */
  async createBooking(bookingData: BookingFormData): Promise<BookingData> {
    try {
      // Use transaction to ensure atomicity
      const result = await this.db.$transaction(async (tx) => {
        // Step 1: Fetch and lock the slot
        const slot = await tx.slots.findUnique({
          where: { id: bookingData.slotId },
        });

        if (!slot) {
          throw new Error("Slot not found");
        }

        // Step 2: Validate slot is active
        if (!slot.isActive) {
          throw new Error("This slot is not available for booking");
        }

        // Step 3: Check availability
        if (slot.bookedCount >= slot.capacity) {
          throw new Error("This slot is fully booked");
        }

        // Step 4: Check for duplicate bookings
        const duplicateBooking = await tx.bookings.findFirst({
          where: {
            slotId: bookingData.slotId,
            status: {
              not: "cancelled",
            },
            OR: [
              { phone: bookingData.phone },
              { email: bookingData.email },
            ],
          },
        });

        if (duplicateBooking) {
          throw new Error(
            "You already have a booking for this slot. Please check your bookings or use a different contact information."
          );
        }

        // Step 5: Create booking
        const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        const booking = await tx.bookings.create({
          data: {
            id: bookingId,
            slotId: bookingData.slotId,
            name: bookingData.name,
            phone: bookingData.phone,
            email: bookingData.email,
            numberOfPeople: bookingData.numberOfPeople,
            qrCode: "", // Will be updated after QR generation
            status: "confirmed",
            updatedAt: new Date(),
          },
          include: {
            slots: true,
          },
        });

        // Step 6: Increment slot booked count atomically
        await tx.slots.update({
          where: { id: bookingData.slotId },
          data: {
            bookedCount: {
              increment: bookingData.numberOfPeople,
            },
            updatedAt: new Date(),
          },
        });

        return booking;
      });

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to create booking");
    }
  }

  /**
   * Update booking QR code
   * 
   * Updates the QR code field after generation
   * 
   * @param bookingId - ID of the booking
   * @param qrCodeDataUrl - QR code data URL (base64 encoded image)
   * @returns Updated booking
   */
  async updateBookingQRCode(bookingId: string, qrCodeDataUrl: string): Promise<BookingData> {
    try {
      const booking = await this.db.bookings.update({
        where: { id: bookingId },
        data: { qrCode: qrCodeDataUrl },
        include: {
          slots: true,
        },
      });

      return booking;
    } catch (error) {
      throw new Error(
        `Failed to update QR code: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Update user booking QR code
   * 
   * Updates the QR code field for authenticated user bookings
   * 
   * @param bookingId - ID of the user booking
   * @param qrCodeDataUrl - QR code data URL (base64 encoded image)
   * @returns Updated user booking
   */
  async updateUserBookingQRCode(bookingId: string, qrCodeDataUrl: string): Promise<any> {
    try {
      const booking = await this.db.user_bookings.update({
        where: { id: bookingId },
        data: { qrCode: qrCodeDataUrl },
        include: {
          slots: true,
          users: true,
        },
      });

      return booking;
    } catch (error) {
      throw new Error(
        `Failed to update QR code: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Cancel a booking with time validation
   * Requirements: 5.5, 5.6
   * 
   * Validates:
   * - Booking exists and is not already cancelled
   * - Cancellation is at least 2 hours before slot time
   * 
   * Performs:
   * - Updates booking status to cancelled
   * - Decrements slot booked count
   * 
   * @param bookingId - ID of the booking to cancel
   * @returns Cancelled booking
   */
  async cancelBooking(bookingId: string): Promise<BookingData> {
    try {
      // Use transaction to ensure atomicity
      const result = await this.db.$transaction(async (tx) => {
        // Step 1: Fetch booking with slot details
        const booking = await tx.bookings.findUnique({
          where: { id: bookingId },
          include: {
            slots: true,
          },
        });

        if (!booking) {
          throw new Error("Booking not found");
        }

        // Step 2: Check if already cancelled
        if (booking.status === "cancelled") {
          throw new Error("This booking has already been cancelled");
        }

        // Step 3: Check if already checked in
        if (booking.status === "checked-in") {
          throw new Error("Cannot cancel a booking that has been checked in");
        }

        // Step 4: Validate 2-hour cancellation window
        const slotDateTime = new Date(booking.slots.date);
        const [hours, minutes] = booking.slots.startTime.split(":").map(Number);
        slotDateTime.setHours(hours, minutes, 0, 0);

        const now = new Date();
        const twoHoursInMs = 2 * 60 * 60 * 1000;
        const timeUntilSlot = slotDateTime.getTime() - now.getTime();

        if (timeUntilSlot < twoHoursInMs) {
          const hoursRemaining = Math.floor(timeUntilSlot / (60 * 60 * 1000));
          const minutesRemaining = Math.floor((timeUntilSlot % (60 * 60 * 1000)) / (60 * 1000));
          throw new Error(
            `Cannot cancel booking within 2 hours of slot time. ` +
            `Time remaining: ${hoursRemaining}h ${minutesRemaining}m. ` +
            `Cancellation deadline has passed.`
          );
        }

        // Step 5: Update booking status
        const cancelledBooking = await tx.bookings.update({
          where: { id: bookingId },
          data: {
            status: "cancelled",
          },
          include: {
            slots: true,
          },
        });

        // Step 6: Decrement slot booked count
        await tx.slots.update({
          where: { id: booking.slotId },
          data: {
            bookedCount: {
              decrement: 1,
            },
          },
        });

        return cancelledBooking;
      });

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to cancel booking");
    }
  }

  /**
   * Get user bookings by phone or email
   * Requirements: 5.5
   * 
   * Retrieves all bookings for a user identified by phone or email
   * 
   * @param identifier - Phone number or email
   * @returns Array of bookings
   */
  async getUserBookings(identifier: string): Promise<BookingData[]> {
    try {
      // Determine if identifier is phone or email
      const isPhone = /^[6-9]\d{9}$/.test(identifier);
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

      if (!isPhone && !isEmail) {
        throw new Error("Invalid identifier. Please provide a valid phone number or email.");
      }

      // Build query
      const where = isPhone ? { phone: identifier } : { email: identifier };

      // Fetch bookings
      const bookings = await this.db.bookings.findMany({
        where,
        include: {
          slots: true,
        },
        orderBy: [
          { slots: { date: "desc" } },
          { slots: { startTime: "desc" } },
        ],
      });

      return bookings;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to retrieve bookings");
    }
  }

  /**
   * Get booking by ID
   * 
   * @param bookingId - ID of the booking
   * @returns Booking or null
   */
  async getBookingById(bookingId: string): Promise<BookingData | null> {
    try {
      const booking = await this.db.bookings.findUnique({
        where: { id: bookingId },
        include: {
          slots: true,
        },
      });

      return booking;
    } catch (error) {
      throw new Error(
        `Failed to retrieve booking: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Check in a booking and validate QR code
   * Requirements: 6.3, 6.4, 6.5, 6.6
   * 
   * Marks booking as checked-in and records timestamp
   * Validates:
   * - Booking exists
   * - Booking is not cancelled
   * - Booking has not been checked in already
   * 
   * @param bookingId - ID of the booking to check in
   * @returns Checked-in booking
   */
  async checkInBooking(bookingId: string): Promise<BookingData> {
    try {
      // Fetch booking
      const booking = await this.db.bookings.findUnique({
        where: { id: bookingId },
        include: {
          slots: true,
        },
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      // Validate booking status
      if (booking.status === "cancelled") {
        throw new Error("Cannot check in a cancelled booking");
      }

      if (booking.status === "checked-in") {
        throw new Error(
          `This booking has already been checked in at ${booking.checkedInAt?.toLocaleString()}`
        );
      }

      // Update booking status
      const checkedInBooking = await this.db.bookings.update({
        where: { id: bookingId },
        data: {
          status: "checked-in",
          checkedInAt: new Date(),
        },
        include: {
          slots: true,
        },
      });

      return checkedInBooking;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to check in booking");
    }
  }

  /**
   * Get all bookings (admin view)
   * 
   * @param filters - Optional filters for date, status, search
   * @returns Array of bookings
   */
  async getAllBookings(filters?: {
    date?: Date;
    status?: BookingStatus;
    search?: string;
  }): Promise<BookingData[]> {
    try {
      const where: any = {};

      // Date filter
      if (filters?.date) {
        const startOfDay = new Date(filters.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(filters.date);
        endOfDay.setHours(23, 59, 59, 999);

        where.slots = {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        };
      }

      // Status filter
      if (filters?.status) {
        where.status = filters.status;
      }

      // Search filter (name, phone, or email)
      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search, mode: "insensitive" } },
          { phone: { contains: filters.search } },
          { email: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      const bookings = await this.db.bookings.findMany({
        where,
        include: {
          slots: true,
        },
        orderBy: [
          { slots: { date: "desc" } },
          { slots: { startTime: "desc" } },
        ],
      });

      return bookings;
    } catch (error) {
      throw new Error(
        `Failed to retrieve bookings: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
