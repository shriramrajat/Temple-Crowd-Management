/**
 * GET /api/bookings/my-bookings - Fetch authenticated user's bookings
 * Requirements: 1.1, 3.5
 * 
 * Returns all bookings for the currently authenticated user
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { APIError } from "@/lib/types/api";

export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    
    if (!session?.user || session.user.userType !== "pilgrim") {
      const error: APIError = {
        error: "Unauthorized",
        message: "You must be logged in to view your bookings",
        statusCode: 401,
      };
      return NextResponse.json(error, { status: 401 });
    }

    // Fetch user's bookings with user data
    const userBookings = await db.userBooking.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        slot: true,
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform to API format
    const bookings = userBookings.map((booking) => ({
      id: booking.id,
      slotId: booking.slotId,
      name: booking.user?.name || "Guest",
      phone: booking.user?.phone || "",
      email: booking.user?.email || "",
      numberOfPeople: booking.numberOfPeople,
      qrCode: booking.qrCode,
      status: booking.status,
      checkedInAt: booking.checkedInAt ? booking.checkedInAt.toISOString() : null,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      slot: {
        id: booking.slot.id,
        date: booking.slot.date.toISOString().split("T")[0],
        startTime: booking.slot.startTime,
        endTime: booking.slot.endTime,
        capacity: booking.slot.capacity,
        bookedCount: booking.slot.bookedCount,
        crowdLevel: "low" as const,
        isAvailable: booking.slot.isActive && booking.slot.bookedCount < booking.slot.capacity,
        isActive: booking.slot.isActive,
      },
    }));

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user bookings:", error);

    const apiError: APIError = {
      error: "Internal Server Error",
      message: "An error occurred while fetching your bookings",
      statusCode: 500,
    };

    return NextResponse.json(apiError, { status: 500 });
  }
}
