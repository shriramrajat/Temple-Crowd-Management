/**
 * GET /api/admin/footfall
 * 
 * Returns footfall data with time range and zone filters
 * Requirements: 3.1, 5.4
 * 
 * Query Parameters:
 * - timeRange: 'hourly' | 'daily' | 'weekly' (default: 'daily')
 * - zoneId: optional zone filter
 */

import { NextResponse } from 'next/server';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import { generateMockFootfallData } from '@/lib/mock-data/command-center-mock';
import type { FootfallDataPoint, ApiResponse, TimeRange } from '@/lib/types/command-center';

export async function GET(request: Request) {
  try {
    // Requirement 5.4: Add admin role verification on all admin API endpoints
    const session = await checkAdminAuth();
    if (!session) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const timeRangeParam = searchParams.get('timeRange') as TimeRange | null;
    const zoneId = searchParams.get('zoneId') || undefined;

    // Validate and set default time range
    const validTimeRanges: TimeRange[] = ['hourly', 'daily', 'weekly'];
    const timeRange: TimeRange = 
      timeRangeParam && validTimeRanges.includes(timeRangeParam) 
        ? timeRangeParam 
        : 'daily';

    // Generate mock footfall data
    const footfallData = generateMockFootfallData(timeRange, zoneId);

    const response: ApiResponse<FootfallDataPoint[]> = {
      success: true,
      data: footfallData,
      timestamp: new Date(),
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: ApiResponse<FootfallDataPoint[]> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch footfall data',
      timestamp: new Date(),
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
