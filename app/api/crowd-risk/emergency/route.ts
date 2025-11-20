/**
 * Emergency Mode API Endpoint
 * 
 * Provides API for managing emergency mode with authentication and rate limiting.
 * Task 15.2: Secure emergency mode API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEmergencyModeManager } from '@/lib/crowd-risk/emergency-mode-manager';
import { requireApiAuth } from '@/lib/crowd-risk/api-auth-middleware';
import { strictRateLimiter } from '@/lib/crowd-risk/rate-limiter';
import { Permission, EmergencyTrigger } from '@/lib/crowd-risk/types';
import { z } from 'zod';

/**
 * Request schema for emergency activation
 */
const ActivateEmergencySchema = z.object({
  areaId: z.string().min(1, 'Area ID is required'),
  adminId: z.string().min(1, 'Admin ID is required'),
  trigger: z.nativeEnum(EmergencyTrigger).default(EmergencyTrigger.MANUAL),
});

/**
 * Request schema for emergency deactivation
 */
const DeactivateEmergencySchema = z.object({
  adminId: z.string().min(1, 'Admin ID is required'),
});

/**
 * GET /api/crowd-risk/emergency
 * Get current emergency mode state
 */
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = strictRateLimiter.middleware(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Require authentication with VIEW_ONLY permission
    const authCheck = requireApiAuth(Permission.VIEW_ONLY);
    const authResponse = authCheck(request);
    if (authResponse) {
      return authResponse;
    }

    const emergencyManager = getEmergencyModeManager();
    const emergencyState = emergencyManager.getEmergencyState();
    const isActive = emergencyManager.isEmergencyActive();

    return NextResponse.json({
      isActive,
      emergencyState,
    });
  } catch (error) {
    console.error('Error fetching emergency state:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/crowd-risk/emergency/activate
 * Activate emergency mode
 */
export async function POST(request: NextRequest) {
  try {
    // Apply strict rate limiting (5 requests per minute)
    const rateLimitResponse = strictRateLimiter.middleware(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Require authentication with ACTIVATE_EMERGENCY permission
    const authCheck = requireApiAuth(Permission.ACTIVATE_EMERGENCY);
    const authResponse = authCheck(request);
    if (authResponse) {
      return authResponse;
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = ActivateEmergencySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid request body',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { areaId, adminId, trigger } = validationResult.data;

    // Activate emergency mode
    const emergencyManager = getEmergencyModeManager();
    emergencyManager.activateEmergency(areaId, trigger, adminId);

    const emergencyState = emergencyManager.getEmergencyState();

    return NextResponse.json(
      {
        success: true,
        message: 'Emergency mode activated successfully',
        emergencyState,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error activating emergency mode:', error);

    // Check if it's a permission error
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: error.message,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/crowd-risk/emergency
 * Deactivate emergency mode
 */
export async function DELETE(request: NextRequest) {
  try {
    // Apply strict rate limiting
    const rateLimitResponse = strictRateLimiter.middleware(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Require authentication with ACTIVATE_EMERGENCY permission
    const authCheck = requireApiAuth(Permission.ACTIVATE_EMERGENCY);
    const authResponse = authCheck(request);
    if (authResponse) {
      return authResponse;
    }

    // Parse request body or query params
    const { searchParams } = new URL(request.url);
    let adminId = searchParams.get('adminId');

    // Try to get from body if not in query params
    if (!adminId) {
      try {
        const body = await request.json();
        const validationResult = DeactivateEmergencySchema.safeParse(body);
        
        if (validationResult.success) {
          adminId = validationResult.data.adminId;
        }
      } catch {
        // Body parsing failed, continue with null adminId
      }
    }

    // Fallback to X-User-Id header
    if (!adminId) {
      adminId = request.headers.get('X-User-Id');
    }

    if (!adminId) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Admin ID is required',
        },
        { status: 400 }
      );
    }

    // Deactivate emergency mode
    const emergencyManager = getEmergencyModeManager();
    emergencyManager.deactivateEmergency(adminId);

    return NextResponse.json(
      {
        success: true,
        message: 'Emergency mode deactivated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deactivating emergency mode:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
