/**
 * Threshold Configuration API Endpoint
 * 
 * Provides API for managing threshold configurations with authentication and rate limiting.
 * Task 15.2: Secure configuration API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { getThresholdConfigManager } from '@/lib/crowd-risk/threshold-config-manager';
import { requireApiAuth } from '@/lib/crowd-risk/api-auth-middleware';
import { standardRateLimiter } from '@/lib/crowd-risk/rate-limiter';
import { Permission } from '@/lib/crowd-risk/types';
import { ThresholdConfigSchema } from '@/lib/crowd-risk/schemas';
import { z } from 'zod';

/**
 * GET /api/crowd-risk/config
 * Get all threshold configurations or a specific one by areaId
 */
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = standardRateLimiter.middleware(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Require authentication with VIEW_ONLY permission
    const authCheck = requireApiAuth(Permission.VIEW_ONLY);
    const authResponse = authCheck(request);
    if (authResponse) {
      return authResponse;
    }

    const configManager = getThresholdConfigManager();
    const { searchParams } = new URL(request.url);
    const areaId = searchParams.get('areaId');

    if (areaId) {
      // Get specific configuration
      const config = await configManager.getConfig(areaId);
      
      if (!config) {
        return NextResponse.json(
          { error: 'Configuration not found', areaId },
          { status: 404 }
        );
      }

      return NextResponse.json({ config });
    } else {
      // Get all configurations
      const configs = await configManager.getAllConfigs();
      return NextResponse.json({ configs });
    }
  } catch (error) {
    console.error('Error fetching threshold configurations:', error);
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
 * POST /api/crowd-risk/config
 * Create or update a threshold configuration
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting (10 requests per minute)
    const rateLimitResponse = standardRateLimiter.middleware(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Require authentication with CONFIGURE_THRESHOLDS permission
    const authCheck = requireApiAuth(Permission.CONFIGURE_THRESHOLDS);
    const authResponse = authCheck(request);
    if (authResponse) {
      return authResponse;
    }

    // Parse and validate request body
    const body = await request.json();
    
    // Validate using Zod schema
    const validationResult = ThresholdConfigSchema.safeParse(body.config);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid threshold configuration',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const config = validationResult.data;
    const adminId = body.adminId || request.headers.get('X-User-Id') || 'api_user';
    const reason = body.reason;

    // Save configuration
    const configManager = getThresholdConfigManager();
    await configManager.saveConfig(config, adminId, reason);

    return NextResponse.json(
      {
        success: true,
        message: 'Threshold configuration saved successfully',
        config,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving threshold configuration:', error);
    
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
 * DELETE /api/crowd-risk/config
 * Delete a threshold configuration
 */
export async function DELETE(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = standardRateLimiter.middleware(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Require authentication with CONFIGURE_THRESHOLDS permission
    const authCheck = requireApiAuth(Permission.CONFIGURE_THRESHOLDS);
    const authResponse = authCheck(request);
    if (authResponse) {
      return authResponse;
    }

    const { searchParams } = new URL(request.url);
    const areaId = searchParams.get('areaId');
    const adminId = searchParams.get('adminId') || request.headers.get('X-User-Id') || 'api_user';
    const reason = searchParams.get('reason');

    if (!areaId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'areaId parameter is required' },
        { status: 400 }
      );
    }

    const configManager = getThresholdConfigManager();
    await configManager.deleteConfig(areaId, adminId, reason || undefined);

    return NextResponse.json(
      {
        success: true,
        message: 'Threshold configuration deleted successfully',
        areaId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting threshold configuration:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
