/**
 * Accessibility Profile API Route
 * 
 * Handles server-side operations for accessibility profiles
 */

import { NextRequest, NextResponse } from 'next/server';
import { AccessibilityProfileSchema } from '@/lib/schemas/accessibility';
import { z } from 'zod';

/**
 * GET /api/accessibility/profile?pilgrimId=xxx
 * Retrieve accessibility profile for a pilgrim
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

    // In production, fetch from database
    // For now, return mock data or null
    return NextResponse.json({ profile: null }, { status: 200 });
  } catch (error) {
    console.error('Error fetching accessibility profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/accessibility/profile
 * Create or update accessibility profile
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedProfile = AccessibilityProfileSchema.parse(body);

    // In production, save to database
    // For now, return the validated profile
    return NextResponse.json(
      { 
        success: true, 
        profile: validatedProfile 
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid profile data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error saving accessibility profile:', error);
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/accessibility/profile?pilgrimId=xxx
 * Delete accessibility profile
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pilgrimId = searchParams.get('pilgrimId');

    if (!pilgrimId) {
      return NextResponse.json(
        { error: 'Pilgrim ID is required' },
        { status: 400 }
      );
    }

    // In production, delete from database
    return NextResponse.json(
      { success: true, message: 'Profile deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting accessibility profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile' },
      { status: 500 }
    );
  }
}
