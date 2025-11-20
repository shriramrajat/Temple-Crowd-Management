/**
 * Booking Service Instance
 * Provides a singleton instance of the BookingService
 */

import { getDbClient } from "@/lib/db";
import { BookingService } from "./booking.service";

/**
 * Singleton booking service instance
 */
let bookingServiceInstance: BookingService | null = null;

/**
 * Get or create booking service instance
 * 
 * @returns BookingService instance
 */
export function getBookingService(): BookingService {
  if (!bookingServiceInstance) {
    const db = getDbClient();
    bookingServiceInstance = new BookingService(db);
  }
  return bookingServiceInstance;
}

/**
 * Export default instance
 */
export const bookingService = getBookingService();
