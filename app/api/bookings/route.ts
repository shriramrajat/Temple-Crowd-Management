/**
 * GET /api/bookings/[bookingId] - Fetch single booking with QR code
 * DELETE /api/bookings/[bookingId] - Cancel booking
 * Requirements: 5.3, 5.4, 5.5, 5.6, 8.5
 * 
 * Handles individual booking retrieval and cancellation
 */

import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/lib/services/booking.instance";
import { getQRService } from "@/lib/services/qr.instance";
import { notificationService } from "@/lib/services/notification.instance";
import { transformBookingToAPI } from "@/lib/services/booking.service";
import type { GetBookingResponse, DeleteBookingResponse, APIError } from "@/lib/types/api";

/**
 * GET /api/bookings/[bookingId]
 * 
 * Fetches a single booking by ID with QR code
 * Requirements: 5.3, 5.4
 * 
 * Path Parameters:
 * - bookingId: string (UUID)
 * 
 * Returns:
 * - 200: Booking details with QR code
 * - 404: Booking not found
 * - 500: Server error
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await context.params;

    // Try to fetch from guest bookings first
    let booking = await bookingService.getBookingById(bookingId);
    let isUserBooking = false;
    let userId: string | undefined;

    // If not found in guest bookings, try user bookings
    if (!booking) {
      const { db } = await import('@/lib/db');
      const userBooking = await db.userBooking.findUnique({
        where: { id: bookingId },
        include: {
          slot: true,
          user: true,
        },
      });

      if (userBooking) {
        isUserBooking = true;
        userId = userBooking.userId;
        // Transform UserBooking to BookingData format
        booking = {
          id: userBooking.id,
          slotId: userBooking.slotId,
          name: userBooking.user.name || 'Guest',
          phone: userBooking.user.phone || '',
          email: userBooking.user.email,
          numberOfPeople: userBooking.numberOfPeople,
          qrCode: userBooking.qrCode,
          status: userBooking.status as any,
          checkedInAt: userBooking.checkedInAt,
          createdAt: userBooking.createdAt,
          updatedAt: userBooking.updatedAt,
          slot: userBooking.slot,
        };
      }
    }

    if (!booking) {
      const error: APIError = {
        error: "Not Found",
        message: "Booking not found. Please check the booking ID and try again.",
        statusCode: 404,
      };
      return NextResponse.json(error, { status: 404 });
    }

    // Generate QR code for the booking
    // Requirements: 6.1, 6.2, 6.3 - Generate QR code with signed data
    const qrService = getQRService();
    const slotTime = `${booking.slot.startTime}-${booking.slot.endTime}`;
    const date = new Date(booking.slot.date).toISOString();

    const qrCodeData = await qrService.generateQRCode(
      booking.id,
      userId, // Include userId for authenticated bookings
      booking.slotId,
      booking.name,
      date,
      slotTime,
      booking.numberOfPeople
    );

    // Transform booking to API response format
    const apiBooking = transformBookingToAPI(booking);

    // Prepare response
    const response: GetBookingResponse = {
      booking: apiBooking,
      qrCodeData, // Base64 encoded QR code image
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    // Log error for debugging
    console.error("Error fetching booking:", error);

    // Return generic server error
    const apiError: APIError = {
      error: "Internal Server Error",
      message: "An error occurred while fetching the booking. Please try again later.",
      statusCode: 500,
    };

    return NextResponse.json(apiError, { status: 500 });
  }
}

/**
 * DELETE /api/bookings/[bookingId]
 * 
 * Cancels a booking with 2-hour window validation
 * Requirements: 5.5, 5.6, 8.5
 * 
 * Path Parameters:
 * - bookingId: string (UUID)
 * 
 * Validation:
 * - Booking must exist
 * - Booking must not be already cancelled
 * - Booking must not be checked-in
 * - Cancellation must be at least 2 hours before slot time
 * 
 * Side Effects:
 * - Updates booking status to 'cancelled'
 * - Decrements slot booked count
 * 
 * Returns:
 * - 200: Booking cancelled successfully
 * - 400: Invalid cancellation (within 2-hour window, already cancelled, etc.)
 * - 404: Booking not found
 * - 500: Server error
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await context.params;

    // Cancel booking with validation
    // Requirements: 5.5, 5.6
    const cancelledBooking = await bookingService.cancelBooking(bookingId);

    // Send cancellation email
    // Requirements: 4.5
    // Email failure should not block cancellation process
    try {
      const emailSent = await notificationService.sendCancellationEmail(cancelledBooking);
      
      if (emailSent) {
        console.log(`Cancellation email sent successfully to ${cancelledBooking.email}`);
      } else {
        console.warn(`Failed to send cancellation email to ${cancelledBooking.email}, but booking was cancelled`);
      }
    } catch (emailError) {
      // Log error but don't fail the cancellation
      console.error("Email sending error:", emailError);
    }

    // Transform booking to API response format
    const apiBooking = transformBookingToAPI(cancelledBooking);

    // Prepare response
    const response: DeleteBookingResponse = {
      message: "Booking cancelled successfully. The slot is now available for other devotees.",
      booking: apiBooking,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    // Handle specific business logic errors
    if (error instanceof Error) {
      // Booking not found
      if (error.message.includes("not found")) {
        const apiError: APIError = {
          error: "Not Found",
          message: error.message,
          statusCode: 404,
        };
        return NextResponse.json(apiError, { status: 404 });
      }

      // Already cancelled or checked-in
      if (
        error.message.includes("already been cancelled") ||
        error.message.includes("checked in")
      ) {
        const apiError: APIError = {
          error: "Bad Request",
          message: error.message,
          statusCode: 400,
        };
        return NextResponse.json(apiError, { status: 400 });
      }

      // Within 2-hour cancellation window
      // Requirements: 5.6
      if (error.message.includes("Cannot cancel booking within 2 hours")) {
        const apiError: APIError = {
          error: "Bad Request",
          message: error.message,
          statusCode: 400,
        };
        return NextResponse.json(apiError, { status: 400 });
      }
    }

    // Log error for debugging
    console.error("Error cancelling booking:", error);

    // Return generic server error
    const apiError: APIError = {
      error: "Internal Server Error",
      message: "An error occurred while cancelling the booking. Please try again later.",
      statusCode: 500,
    };

    return NextResponse.json(apiError, { status: 500 });
  }
}
