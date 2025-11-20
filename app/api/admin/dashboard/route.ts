/**
 * GET /api/admin/dashboard - Admin dashboard statistics
 * Requirements: 7.1, 7.5
 * 
 * Returns dashboard statistics including today's bookings count,
 * total capacity, slots overview, and capacity utilization
 */

import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth, unauthorizedResponse } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import type { GetDashboardResponse, APIError, DashboardStats } from "@/lib/types/api";

/**
 * GET /api/admin/dashboard
 * 
 * Returns:
 * - 200: Dashboard statistics
 * - 401: Unauthorized (not authenticated)
 * - 500: Server error
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await checkAdminAuth();
    if (!session) {
      return unauthorizedResponse();
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's slots with bookings
    const todaySlots = await db.slot.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Calculate statistics
    const totalCapacity = todaySlots.reduce((sum, slot) => sum + slot.capacity, 0);
    const totalBooked = todaySlots.reduce((sum, slot) => sum + slot.bookedCount, 0);
    const capacityUtilization = totalCapacity > 0 
      ? Math.round((totalBooked / totalCapacity) * 100) 
      : 0;
    const activeSlots = todaySlots.filter(slot => slot.isActive).length;

    // Build slot breakdown
    const slotBreakdown = todaySlots.map(slot => ({
      slotTime: `${slot.startTime}-${slot.endTime}`,
      bookedCount: slot.bookedCount,
      capacity: slot.capacity,
      utilizationPercentage: slot.capacity > 0 
        ? Math.round((slot.bookedCount / slot.capacity) * 100) 
        : 0,
    }));

    // Prepare response
    const stats: DashboardStats = {
      todayBookingsCount: totalBooked,
      totalCapacity,
      capacityUtilization,
      activeSlots,
      slotBreakdown,
    };

    const response: GetDashboardResponse = {
      stats,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    // Log error for debugging
    console.error("Error fetching dashboard stats:", error);

    // Return generic server error
    const apiError: APIError = {
      error: "Internal Server Error",
      message: "An error occurred while fetching dashboard statistics. Please try again later.",
      statusCode: 500,
    };

    return NextResponse.json(apiError, { status: 500 });
  }
}
