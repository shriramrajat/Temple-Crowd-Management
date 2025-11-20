/**
 * Priority Slots API Route
 * 
 * Handles server-side operations for priority slot allocation
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const SlotAllocationRequestSchema = z.object({
  slotId: z.string(),
  pilgrimId: z.string(),
  accessibilityProfile: z.object({
    pilgrimId: z.string(),
    categories: z.array(z.string()),
    mobilitySpeed: z.enum(['slow', 'moderate', 'normal']),
    requiresAssistance: z.boolean(),
  }),
});

/**
 * GET /api/accessibility/slots?pilgrimId=xxx
 * Get available priority slots for a pilgrim
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pilgrimId = searchParams.get('pilgrimId');

    if (!pilgrimId) {
      return NextResponse.json(
        { error: 'Pilgrim ID is required' },
        { status: 400 }
      );
    }

    // In production, fetch from database based on accessibility profile
    // For now, return empty array
    return NextResponse.json({ slots: [] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching priority slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slots' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/accessibility/slots/allocate
 * Allocate a priority slot to a pilgrim
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedRequest = SlotAllocationRequestSchema.parse(body);

    // In production:
    // 1. Check slot availability
    // 2. Verify pilgrim eligibility
    // 3. Create allocation record
    // 4. Update slot capacity
    // 5. Generate QR code
    // 6. Schedule notifications

    // For now, return mock allocation
    const allocation = {
      allocationId: `alloc-${Date.now()}`,
      pilgrimId: validatedRequest.pilgrimId,
      slotId: validatedRequest.slotId,
      accessibilityProfile: validatedRequest.accessibilityProfile,
      bookingTime: new Date(),
      status: 'confirmed',
      qrCode: `QR-${Date.now()}`,
      estimatedWaitTime: 15,
    };

    return NextResponse.json(
      { success: true, allocation },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid allocation request', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error allocating priority slot:', error);
    return NextResponse.json(
      { error: 'Failed to allocate slot' },
      { status: 500 }
    );
  }
}
