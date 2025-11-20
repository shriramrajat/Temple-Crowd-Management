/**
 * QR Code Service
 * Handles QR code generation, validation, and verification for darshan bookings
 * Requirements: 4.1, 4.2, 4.3, 6.1, 6.2
 * Enhanced with security features: Task 24
 */

import QRCode from "qrcode";
import type { QRCodeData } from "@/lib/types/api";
import type { DbClient } from "@/lib/db";
import { qrCodeDataSchema } from "@/lib/validations/qr";
import {
  createSecureQRData,
  validateSecureQRData,
  type SecureQRCodeData,
} from "@/lib/security/qr-security";

/**
 * QR Code Service Class
 * Provides methods for QR code operations including generation, validation, and verification
 */
export class QRService {
  /**
   * Database client instance
   */
  private db: DbClient;

  constructor(dbClient: DbClient) {
    this.db = dbClient;
  }

  /**
   * Generate QR code for a booking
   * Requirements: 4.1, 4.2, 6.1, 6.2, 6.3
   * Enhanced with security features: Task 24 - timestamp validation and hash verification
   * 
   * Encodes booking data to Base64 and generates QR code image
   * 
   * @param bookingId - Unique booking identifier
   * @param userId - User ID (optional for guest bookings)
   * @param slotId - Slot ID
   * @param name - Name of the devotee
   * @param date - Date of the darshan (ISO format)
   * @param slotTime - Time slot in "HH:MM-HH:MM" format
   * @param numberOfPeople - Number of people in the booking
   * @returns Base64 encoded QR code image (data URL)
   */
  async generateQRCode(
    bookingId: string,
    userId: string | undefined,
    slotId: string,
    name: string,
    date: string,
    slotTime: string,
    numberOfPeople: number
  ): Promise<string> {
    // Create QR data structure with timestamp for verification
    // Requirements: 6.3 - QR code data structure with bookingId, userId, slotId, timestamp, signature
    const qrDataBase = {
      bookingId,
      userId,
      slotId,
      name,
      date,
      slotTime,
      numberOfPeople,
      timestamp: Date.now(),
    };

    // Create secure QR data with hash for integrity verification
    // Requirements: 6.3 - HMAC-SHA256 signature
    const secureQRData = createSecureQRData(qrDataBase);

    // Validate QR data structure
    const validatedData = qrCodeDataSchema.parse(qrDataBase);

    // Convert to JSON and encode to Base64
    const jsonString = JSON.stringify(secureQRData);
    const base64Data = Buffer.from(jsonString).toString("base64");

    // Generate QR code image as data URL
    // Requirements: 6.2 - Store QR code data URL
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(base64Data, {
        errorCorrectionLevel: "H", // High error correction
        type: "image/png",
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      return qrCodeDataUrl;
    } catch (error) {
      throw new Error(
        `Failed to generate QR code: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Validate and decode QR code data
   * Requirements: 6.1, 6.2, 6.3
   * Enhanced with security features: Task 24 - timestamp validation and hash verification
   * 
   * Decodes Base64 QR data and validates the structure, hash, and timestamp
   * 
   * @param qrDataString - Base64 encoded QR data string
   * @returns Decoded and validated QR code data
   * @throws Error if QR data is invalid or malformed
   */
  async validateQRCode(qrDataString: string): Promise<QRCodeData> {
    try {
      // Decode Base64 to JSON string
      const jsonString = Buffer.from(qrDataString, "base64").toString("utf-8");

      // Parse JSON
      const parsedData = JSON.parse(jsonString) as SecureQRCodeData;

      // Validate security features (hash and timestamp)
      // Requirements: 6.3 - Verify HMAC signature
      const securityValidation = validateSecureQRData(parsedData);
      if (!securityValidation.valid) {
        throw new Error(`QR code security validation failed: ${securityValidation.errors.join(', ')}`);
      }

      // Extract base QR data (without hash)
      const qrData: QRCodeData = {
        bookingId: parsedData.bookingId,
        userId: parsedData.userId,
        slotId: parsedData.slotId,
        name: parsedData.name,
        date: parsedData.date,
        slotTime: parsedData.slotTime,
        numberOfPeople: parsedData.numberOfPeople,
        timestamp: parsedData.timestamp,
      };

      // Validate against schema
      const validatedData = qrCodeDataSchema.parse(qrData);

      return validatedData;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Invalid QR code data: ${error.message}`);
      }
      throw new Error("Invalid QR code data: Unable to decode or parse");
    }
  }

  /**
   * Check if QR code has already been used
   * Requirements: 6.3, 6.4
   * 
   * Verifies booking status to determine if QR code was already scanned
   * 
   * @param bookingId - Booking ID from QR code
   * @returns Boolean indicating if QR code has been used
   */
  async isQRCodeUsed(bookingId: string): Promise<boolean> {
    try {
      // Fetch booking from database
      const booking = await this.db.booking.findUnique({
        where: { id: bookingId },
        select: {
          status: true,
          checkedInAt: true,
        },
      });

      // If booking doesn't exist, consider it invalid/used
      if (!booking) {
        return true;
      }

      // Check if booking has been checked in
      return booking.status === "checked-in" && booking.checkedInAt !== null;
    } catch (error) {
      throw new Error(
        `Failed to check QR code status: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Verify QR code and validate booking details
   * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
   * 
   * Comprehensive verification including:
   * - QR data decoding and validation
   * - Booking existence check
   * - Date and time slot validation
   * - Usage status check
   * 
   * @param qrDataString - Base64 encoded QR data string
   * @param currentDate - Current date for validation (defaults to now)
   * @returns Verification result with booking details or error
   */
  async verifyQRCode(
    qrDataString: string,
    currentDate: Date = new Date()
  ): Promise<{
    valid: boolean;
    message: string;
    booking?: any;
    error?: string;
  }> {
    try {
      // Step 1: Decode and validate QR data structure
      const qrData = await this.validateQRCode(qrDataString);

      // Step 2: Fetch booking from database
      const booking = await this.db.booking.findUnique({
        where: { id: qrData.bookingId },
        include: {
          slot: true,
        },
      });

      // Step 3: Check if booking exists
      if (!booking) {
        return {
          valid: false,
          message: "Booking not found",
          error: "BOOKING_NOT_FOUND",
        };
      }

      // Step 4: Check if booking is cancelled
      if (booking.status === "cancelled") {
        return {
          valid: false,
          message: "This booking has been cancelled",
          error: "BOOKING_CANCELLED",
        };
      }

      // Step 5: Check if QR code has already been used
      if (booking.status === "checked-in" && booking.checkedInAt) {
        return {
          valid: false,
          message: `QR code already used. Checked in at: ${new Date(booking.checkedInAt).toLocaleString()}`,
          error: "QR_ALREADY_USED",
          booking,
        };
      }

      // Step 6: Validate booking date matches QR data
      const bookingDate = new Date(booking.slot.date).toISOString().split("T")[0];
      const qrDate = new Date(qrData.date).toISOString().split("T")[0];

      if (bookingDate !== qrDate) {
        return {
          valid: false,
          message: `Invalid date. Booking is for ${bookingDate}, QR shows ${qrDate}`,
          error: "DATE_MISMATCH",
        };
      }

      // Step 7: Validate time slot matches
      const slotTime = `${booking.slot.startTime}-${booking.slot.endTime}`;
      if (slotTime !== qrData.slotTime) {
        return {
          valid: false,
          message: `Invalid time slot. Booking is for ${slotTime}, QR shows ${qrData.slotTime}`,
          error: "TIME_SLOT_MISMATCH",
        };
      }

      // Step 8: Validate booking is for current date (optional - can be configured)
      const currentDateStr = currentDate.toISOString().split("T")[0];
      if (bookingDate !== currentDateStr) {
        return {
          valid: false,
          message: `Booking is for ${bookingDate}, but today is ${currentDateStr}`,
          error: "WRONG_DATE",
        };
      }

      // Step 9: All validations passed
      return {
        valid: true,
        message: "QR code verified successfully",
        booking,
      };
    } catch (error) {
      return {
        valid: false,
        message: error instanceof Error ? error.message : "QR code verification failed",
        error: "VERIFICATION_ERROR",
      };
    }
  }

  /**
   * Mark booking as checked-in after successful QR verification
   * Requirements: 6.6
   * 
   * Updates booking status and records check-in timestamp
   * 
   * @param bookingId - Booking ID to check in
   * @returns Updated booking
   */
  async checkInBooking(bookingId: string): Promise<any> {
    try {
      const updatedBooking = await this.db.booking.update({
        where: { id: bookingId },
        data: {
          status: "checked-in",
          checkedInAt: new Date(),
        },
        include: {
          slot: true,
        },
      });

      return updatedBooking;
    } catch (error) {
      throw new Error(
        `Failed to check in booking: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Generate QR code from existing booking
   * Requirements: 4.3, 6.1, 6.2, 6.3
   * 
   * Retrieves booking details and generates QR code
   * 
   * @param bookingId - Booking ID
   * @returns Base64 encoded QR code image
   */
  async generateQRCodeFromBooking(bookingId: string): Promise<string> {
    // Fetch booking details
    const booking = await this.db.booking.findUnique({
      where: { id: bookingId },
      include: {
        slot: true,
      },
    });

    if (!booking) {
      throw new Error(`Booking with ID ${bookingId} not found`);
    }

    // Format slot time
    const slotTime = `${booking.slot.startTime}-${booking.slot.endTime}`;

    // Format date
    const date = new Date(booking.slot.date).toISOString();

    // Generate QR code with all required fields
    return this.generateQRCode(
      booking.id,
      undefined, // Guest bookings don't have userId
      booking.slotId,
      booking.name,
      date,
      slotTime,
      booking.numberOfPeople
    );
  }

  /**
   * Generate QR code from existing user booking
   * Requirements: 4.3, 6.1, 6.2, 6.3
   * 
   * Retrieves user booking details and generates QR code
   * 
   * @param bookingId - User Booking ID
   * @returns Base64 encoded QR code image
   */
  async generateQRCodeFromUserBooking(bookingId: string): Promise<string> {
    // Fetch user booking details
    const booking = await this.db.userBooking.findUnique({
      where: { id: bookingId },
      include: {
        slot: true,
        user: true,
      },
    });

    if (!booking) {
      throw new Error(`User booking with ID ${bookingId} not found`);
    }

    // Format slot time
    const slotTime = `${booking.slot.startTime}-${booking.slot.endTime}`;

    // Format date
    const date = new Date(booking.slot.date).toISOString();

    // Generate QR code with all required fields including userId
    return this.generateQRCode(
      booking.id,
      booking.userId,
      booking.slotId,
      booking.user.name || "Guest",
      date,
      slotTime,
      booking.numberOfPeople
    );
  }
}
