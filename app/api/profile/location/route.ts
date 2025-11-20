import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

/**
 * Location Update API
 * Supports both manual entry and Google Maps location
 */

const locationSchema = z.object({
  // Manual entry fields
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pinCode: z.string().max(10).optional(),
  country: z.string().max(100).optional(),
  
  // Google Maps fields
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  formattedAddress: z.string().max(500).optional(),
  placeId: z.string().max(255).optional(),
});

/**
 * PUT /api/profile/location
 * Update user location (manual or from Google Maps)
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to update location' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = locationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid location data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const locationData = validationResult.data;

    // Update user location in database
    const updatedUser = await db.users.update({
      where: { id: session.user.id },
      data: {
        address: locationData.address,
        city: locationData.city,
        state: locationData.state,
        pinCode: locationData.pinCode,
        country: locationData.country,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        formattedAddress: locationData.formattedAddress,
        placeId: locationData.placeId,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        pinCode: true,
        country: true,
        latitude: true,
        longitude: true,
        formattedAddress: true,
        placeId: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Location updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating location:', error);
    
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to update location. Please try again.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/profile/location
 * Get user location
 */
export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in' },
        { status: 401 }
      );
    }

    // Fetch user location
    const user = await db.users.findUnique({
      where: { id: session.user.id },
      select: {
        address: true,
        city: true,
        state: true,
        pinCode: true,
        country: true,
        latitude: true,
        longitude: true,
        formattedAddress: true,
        placeId: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Not Found', message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching location:', error);
    
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch location. Please try again.',
      },
      { status: 500 }
    );
  }
}
