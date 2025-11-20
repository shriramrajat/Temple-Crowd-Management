/**
 * POST /api/verify - QR verification API for staff
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 * Enhanced with security features: Task 24
 * 
 * Verifies QR codes scanned by temple staff at entry points
 * Validates booking details and marks bookings as checked-in
 */

import { NextRequest, NextResponse } from "next/server";
import { getQRService } from "@/lib/services/qr.instance";
import { bookingService } from "@/lib/services/booking.instance";
import { transformBookingToAPI } from "@/lib/services/booking.service";
import type { VerifyQRRequest, VerifyQRResponse, APIError } from "@/lib/types/api";
import { ZodError } from "zod";
import { z } from "zod";
import {
  verificationRateLimiter,
  getClientIP,
  validateInputLength,
  INPUT_LENGTH_LIMITS,
} from "@/lib/security";

/**
 * Request body validation schema
 */
const verifyQRRequestSchema = z.object({
  qrData: z.string().min(1, "QR data is required"),
});

/**
 * POST /api/verify
 * 
 * Request Body:
 * - qrData: string (Base64 encoded QR data)
 * 
 * Returns:
 * - 200: QR code verified successfully, booking checked in
 * - 400: Invalid QR data format or validation errors
 * - 409: QR code already used or booking cancelled
 * - 404: Booking not found
 * - 429: Rate limit exceeded
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - Task 24: Implement rate limiting to prevent abuse
    const clientIP = getClientIP(request.headers);
    const rateLimitResult = verificationRateLimiter.check(clientIP);

    if (!rateLimitResult.allowed) {
      const error: APIError = {
        error: "Too Many Requests",
        message: `Rate limit exceeded. Please try again in ${rateLimitResult.resetIn} seconds.`,
        statusCode: 429,
        details: {
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          resetIn: rateLimitResult.resetIn,
        },
      };
      return NextResponse.json(error, { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetIn.toString(),
        },
      });
    }

    // Parse request body
    const body = await request.json();

    // Input length validation - Task 24: Add input length limits to prevent DoS attacks
    if (body.qrData && !validateInputLength(body.qrData, INPUT_LENGTH_LIMITS.GENERAL_STRING)) {
      const error: APIError = {
        error: "Bad Request",
        message: "QR data exceeds maximum length",
        statusCode: 400,
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Validate request body
    const validatedData = verifyQRRequestSchema.parse(body);

    // Get QR service instance
    const qrService = getQRService();

    // Step 1: Decode and validate QR data structure
    // Requirements: 6.1, 6.2
    let qrCodeData;
    try {
      qrCodeData = await qrService.validateQRCode(validatedData.qrData);
    } catch (error) {
      const apiError: APIError = {
        error: "Bad Request",
        message: error instanceof Error ? error.message : "Invalid QR code format",
        statusCode: 400,
      };
      return NextResponse.json(apiError, { status: 400 });
    }

    // Step 2: Verify QR code and validate booking details
    // Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
    const verificationResult = await qrService.verifyQRCode(validatedData.qrData);

    // Handle verification failure
    if (!verificationResult.valid) {
      // Determine appropriate status code based on error type
      let statusCode = 400;
      
      if (verificationResult.error === "BOOKING_NOT_FOUND") {
        statusCode = 404;
      } else if (
        verificationResult.error === "QR_ALREADY_USED" ||
        verificationResult.error === "BOOKING_CANCELLED"
      ) {
        statusCode = 409;
      } else if (
        verificationResult.error === "DATE_MISMATCH" ||
        verificationResult.error === "TIME_SLOT_MISMATCH" ||
        verificationResult.error === "WRONG_DATE"
      ) {
        statusCode = 400;
      }

      const apiError: APIError = {
        error: statusCode === 404 ? "Not Found" : statusCode === 409 ? "Conflict" : "Bad Request",
        message: verificationResult.message,
        statusCode,
      };

      return NextResponse.json(apiError, { status: statusCode });
    }

    // Step 3: Mark booking as checked-in and record timestamp
    // Requirements: 6.6
    const checkedInBooking = await bookingService.checkInBooking(qrCodeData.bookingId);

    // Transform booking to API response format
    const apiBooking = transformBookingToAPI(checkedInBooking);

    // Prepare success response
    const response: VerifyQRResponse = {
      valid: true,
      message: "QR code verified successfully. Entry granted.",
      booking: apiBooking,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const validationErrors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      const apiError: APIError = {
        error: "Bad Request",
        message: "Validation failed. Please check your input.",
        statusCode: 400,
        details: { validationErrors },
      };

      return NextResponse.json(apiError, { status: 400 });
    }

    // Handle business logic errors
    if (error instanceof Error) {
      // Check for specific error messages from booking service
      if (error.message.includes("not found")) {
        const apiError: APIError = {
          error: "Not Found",
          message: error.message,
          statusCode: 404,
        };
        return NextResponse.json(apiError, { status: 404 });
      }

      if (error.message.includes("already been checked in")) {
        const apiError: APIError = {
          error: "Conflict",
          message: error.message,
          statusCode: 409,
        };
        return NextResponse.json(apiError, { status: 409 });
      }

      if (error.message.includes("cancelled")) {
        const apiError: APIError = {
          error: "Conflict",
          message: error.message,
          statusCode: 409,
        };
        return NextResponse.json(apiError, { status: 409 });
      }
    }

    // Log error for debugging
    console.error("Error verifying QR code:", error);

    // Return generic server error
    const apiError: APIError = {
      error: "Internal Server Error",
      message: "An error occurred while verifying the QR code. Please try again later.",
      statusCode: 500,
    };

    return NextResponse.json(apiError, { status: 500 });
  }
}
