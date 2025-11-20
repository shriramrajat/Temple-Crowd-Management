/**
 * GET /api/slots - Public API route for slot availability
 * Requirements: 1.1, 1.2, 3.1, 3.2, 3.3, 3.4, 3.5, 8.1, 8.2
 * 
 * Fetches available slots for a given date with crowd level indicators
 * Implements caching with 30-second TTL for performance
 */

import { NextRequest, NextResponse } from "next/server";
import { slotService } from "@/lib/services/slot.instance";
import type { GetSlotsResponse, APIError } from "@/lib/types/api";

/**
 * Cache configuration
 * 30-second TTL to balance real-time updates with performance
 */
const CACHE_TTL = 30;

/**
 * GET /api/slots
 * 
 * Query Parameters:
 * - date: YYYY-MM-DD format (required)
 * 
 * Returns:
 * - 200: Array of slots with availability status
 * - 400: Invalid date format
 * - 500: Server error
 */
export async function GET(request: NextRequest) {
  try {
    // Extract date query parameter
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");

    // Validate date parameter exists
    if (!dateParam) {
      const error: APIError = {
        error: "Bad Request",
        message: "Date parameter is required. Format: YYYY-MM-DD",
        statusCode: 400,
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateParam)) {
      const error: APIError = {
        error: "Bad Request",
        message: "Invalid date format. Expected: YYYY-MM-DD",
        statusCode: 400,
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Parse date and validate it's a valid date
    const date = new Date(dateParam);
    if (isNaN(date.getTime())) {
      const error: APIError = {
        error: "Bad Request",
        message: "Invalid date value. Please provide a valid date.",
        statusCode: 400,
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Fetch slots from database using slot service
    const slots = await slotService.getAvailableSlots(date);

    // Prepare response
    const response: GetSlotsResponse = {
      slots,
    };

    // Return response with caching headers
    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=${CACHE_TTL * 2}`,
      },
    });
  } catch (error) {
    // Log error for debugging
    console.error("Error fetching slots:", error);

    // Return generic server error
    const apiError: APIError = {
      error: "Internal Server Error",
      message: "An error occurred while fetching slots. Please try again later.",
      statusCode: 500,
    };

    return NextResponse.json(apiError, { status: 500 });
  }
}
