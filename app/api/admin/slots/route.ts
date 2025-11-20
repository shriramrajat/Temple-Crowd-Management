/**
 * Admin Slot Management API Routes - Single Slot Operations
 * PUT /api/admin/slots/[slotId] - Update slot configuration
 * DELETE /api/admin/slots/[slotId] - Delete slot
 * Requirements: 7.1, 7.3, 7.4
 */

import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth, unauthorizedResponse } from "@/lib/auth-helpers";
import { slotService } from "@/lib/services/slot.instance";
import { slotConfigSchema } from "@/lib/validations/slot";
import type { UpdateSlotResponse, DeleteSlotResponse, APIError } from "@/lib/types/api";
import { ZodError } from "zod";

/**
 * PUT /api/admin/slots/[slotId]
 * 
 * Updates an existing slot configuration
 * 
 * Request Body (all fields optional):
 * - startTime: string (HH:MM)
 * - endTime: string (HH:MM)
 * - capacity: number (positive integer, must be >= current booked count)
 * - isActive: boolean
 * 
 * Returns:
 * - 200: Updated slot configuration
 * - 400: Validation errors or capacity constraint violation
 * - 401: Unauthorized
 * - 404: Slot not found
 * - 500: Server error
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { slotId: string } }
) {
  try {
    // Check authentication
    const session = await checkAdminAuth();
    if (!session) {
      return unauthorizedResponse();
    }

    const { slotId } = params;

    // Parse request body
    const body = await request.json();

    // Validate request body using partial schema
    const partialSchema = slotConfigSchema.partial();
    const validatedData = partialSchema.parse(body);

    // Update slot
    const slot = await slotService.updateSlot(slotId, validatedData);

    // Prepare response
    const response: UpdateSlotResponse = {
      slot,
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
      // Slot not found
      if (error.message.includes("not found")) {
        const apiError: APIError = {
          error: "Not Found",
          message: error.message,
          statusCode: 404,
        };
        return NextResponse.json(apiError, { status: 404 });
      }

      // Capacity constraint violation
      if (error.message.includes("Cannot reduce capacity")) {
        const apiError: APIError = {
          error: "Bad Request",
          message: error.message,
          statusCode: 400,
        };
        return NextResponse.json(apiError, { status: 400 });
      }
    }

    // Log error for debugging
    console.error("Error updating slot:", error);

    // Return generic server error
    const apiError: APIError = {
      error: "Internal Server Error",
      message: "An error occurred while updating the slot. Please try again later.",
      statusCode: 500,
    };

    return NextResponse.json(apiError, { status: 500 });
  }
}

/**
 * DELETE /api/admin/slots/[slotId]
 * 
 * Deletes a slot configuration
 * Prevents deletion if bookings exist for the slot
 * 
 * Returns:
 * - 200: Slot deleted successfully
 * - 400: Cannot delete slot with existing bookings
 * - 401: Unauthorized
 * - 404: Slot not found
 * - 500: Server error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slotId: string } }
) {
  try {
    // Check authentication
    const session = await checkAdminAuth();
    if (!session) {
      return unauthorizedResponse();
    }

    const { slotId } = params;

    // Delete slot
    await slotService.deleteSlot(slotId);

    // Prepare response
    const response: DeleteSlotResponse = {
      message: "Slot deleted successfully",
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    // Handle business logic errors
    if (error instanceof Error) {
      // Slot not found
      if (error.message.includes("not found")) {
        const apiError: APIError = {
          error: "Not Found",
          message: error.message,
          statusCode: 404,
        };
        return NextResponse.json(apiError, { status: 404 });
      }

      // Cannot delete slot with bookings
      if (error.message.includes("Cannot delete slot with existing bookings")) {
        const apiError: APIError = {
          error: "Bad Request",
          message: error.message,
          statusCode: 400,
        };
        return NextResponse.json(apiError, { status: 400 });
      }
    }

    // Log error for debugging
    console.error("Error deleting slot:", error);

    // Return generic server error
    const apiError: APIError = {
      error: "Internal Server Error",
      message: "An error occurred while deleting the slot. Please try again later.",
      statusCode: 500,
    };

    return NextResponse.json(apiError, { status: 500 });
  }
}
