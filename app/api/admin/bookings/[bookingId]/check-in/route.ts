/**
 * Admin Booking Check-In API Route
 * POST /api/admin/bookings/[bookingId]/check-in - Manual check-in by admin
 * Requirements: 7.6
 */

import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth, unauthorizedResponse } from "@/lib/auth-helpers";
import { bookingService } from "@/lib/services/booking.instance";
import { transformBookingToAPI } from "@/lib/services/booking.service";
import type { APIError } from "@/lib/types/api";

/**
 * POST /api/admin/bookings/[bookingId]/check-in
 * 
 * Manually check in a booking (admin override)
 * 
 * Returns:
 * - 200: Booking checked in successfully
 * - 400: Invalid booking state
 * - 401: Unauthorized
 * - 404: Booking not found
 * - 500: Server error
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    // Check authentication
    const session = await checkAdminAuth();
    if (!session) {
      return unauthorizedResponse();
    }

    // Get booking ID from params
    const { bookingId } = await params;

    if (!bookingId) {
      const error: APIError = {
        error: "Bad Request",
        message: "Booking ID is required",
        statusCode: 400,
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Check in the booking
    const checkedInBooking = await bookingService.checkInBooking(bookingId);

    // Transform to API format
    const apiBooking = transformBookingToAPI(checkedInBooking);

    return NextResponse.json(
      {
        message: "Booking checked in successfully",
        booking: apiBooking,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    // Log error for debugging
    console.error("Error checking in booking:", error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        const apiError: APIError = {
          error: "Not Found",
          message: error.message,
          statusCode: 404,
        };
        return NextResponse.json(apiError, { status: 404 });
      }

      if (
        error.message.includes("cancelled") ||
        error.message.includes("already been checked in")
      ) {
        const apiError: APIError = {
          error: "Bad Request",
          message: error.message,
          statusCode: 400,
        };
        return NextResponse.json(apiError, { status: 400 });
      }
    }

    // Return generic server error
    const apiError: APIError = {
      error: "Internal Server Error",
      message: "An error occurred while checking in the booking. Please try again later.",
      statusCode: 500,
    };

    return NextResponse.json(apiError, { status: 500 });
  }
}
