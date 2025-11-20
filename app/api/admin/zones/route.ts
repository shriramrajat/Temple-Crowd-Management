/**
 * GET /api/admin/zones
 * 
 * Returns all zones with current occupancy and density information
 * Requirements: 1.1, 4.1, 5.4
 */

import { NextResponse } from 'next/server';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import { generateMockZones } from '@/lib/mock-data/command-center-mock';
import type { Zone, ApiResponse } from '@/lib/types/command-center';

export async function GET() {
  try {
    // Requirement 5.4: Add admin role verification on all admin API endpoints
    const session = await checkAdminAuth();
    if (!session) {
      return unauthorizedResponse();
    }

    // Generate mock zones data
    const zones = generateMockZones();

    const response: ApiResponse<Zone[]> = {
      success: true,
      data: zones,
      timestamp: new Date(),
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: ApiResponse<Zone[]> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch zones',
      timestamp: new Date(),
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
