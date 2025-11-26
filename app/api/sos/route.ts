/**
 * SOS Alert API Route
 * 
 * Handles creation and retrieval of SOS alerts.
 * 
 * Endpoints:
 * - POST /api/sos - Create a new SOS alert
 * - GET /api/sos - Get pending alerts (admin only)
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSOSAlert } from '@/lib/services/sos-service';
import { z } from 'zod';

/**
 * Validation schema for creating SOS alert
 */
const CreateSOSAlertSchema = z.object({
  emergencyType: z.string().min(1, 'Emergency type is required'),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).nullable().optional(),
  manualLocation: z.string().max(500).nullable().optional(),
  message: z.string().max(1000).nullable().optional(),
  userName: z.string().max(100).nullable().optional(),
  userPhone: z.string().max(15).nullable().optional(),
  userEmail: z.string().email().max(255).nullable().optional(),
  userId: z.string().nullable().optional(),
}).refine(
  (data) => data.location || data.manualLocation,
  {
    message: 'Either location or manualLocation must be provided',
    path: ['location'],
  }
);

/**
 * POST /api/sos - Create a new SOS alert
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
export async function POST(request: NextRequest) {
  try {
    // Get session (optional - guest users can also send SOS)
    const session = await auth();
    const userId = session?.user?.id || null;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = CreateSOSAlertSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { 
      emergencyType, 
      location, 
      manualLocation, 
      message,
      userName,
      userPhone,
      userEmail,
    } = validationResult.data;

    // Create SOS alert using service
    const result = await createSOSAlert({
      emergencyType,
      location: location || undefined,
      manualLocation: manualLocation || undefined,
      message: message || undefined,
      userName: userName || undefined,
      userPhone: userPhone || undefined,
      userEmail: userEmail || undefined,
      userId: userId || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to create SOS alert',
          errorCode: result.errorCode,
        },
        { status: result.errorCode === 'MISSING_LOCATION' || result.errorCode === 'MISSING_EMERGENCY_TYPE' ? 400 : 500 }
      );
    }

    // Fetch the created alert if we have the ID
    let alert = null;
    if (result.alertId) {
      try {
        const { getSOSAlertById } = await import('@/lib/services/sos-service');
        alert = await getSOSAlertById(result.alertId);
      } catch (err) {
        console.error('Error fetching created alert:', err);
        // Continue without the full alert object
      }
    }

    return NextResponse.json({
      success: true,
      message: 'SOS alert created successfully',
      alert: alert || { id: result.alertId },
      alertId: result.alertId,
    });
  } catch (error) {
    console.error('Error creating SOS alert:', error);

    // Handle specific error types
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create SOS alert',
        message: 'An unexpected error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sos - Get pending SOS alerts (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.userType !== 'admin' && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      );
    }

    // Import service function dynamically to avoid circular dependencies
    const { getPendingSOSAlerts } = await import('@/lib/services/sos-service');
    const alerts = await getPendingSOSAlerts();

    return NextResponse.json({
      success: true,
      alerts,
      count: alerts.length,
    });
  } catch (error) {
    console.error('Error fetching SOS alerts:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch SOS alerts',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}