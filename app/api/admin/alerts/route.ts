/**
 * GET /api/admin/alerts
 * 
 * Returns recent alerts with optional limit parameter
 * Requirements: 2.2, 5.4
 */

import { NextResponse } from 'next/server';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import { generateMockAlerts } from '@/lib/mock-data/command-center-mock';
import type { Alert, ApiResponse } from '@/lib/types/command-center';

export async function GET(request: Request) {
  try {
    // Requirement 5.4: Add admin role verification on all admin API endpoints
    const session = await checkAdminAuth();
    if (!session) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    // Generate mock alerts
    const alerts = generateMockAlerts(limit);

    const response: ApiResponse<Alert[]> = {
      success: true,
      data: alerts,
      timestamp: new Date(),
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: ApiResponse<Alert[]> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch alerts',
      timestamp: new Date(),
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
