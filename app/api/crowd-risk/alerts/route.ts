/**
 * Alert History API Route
 * 
 * Provides paginated access to alert history with filtering.
 * Task 17.2: Implement pagination for alert history to reduce query size
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAlertLogger } from '@/lib/crowd-risk/alert-logger';
import { ThresholdLevel } from '@/lib/crowd-risk/types';

/**
 * GET /api/crowd-risk/alerts
 * 
 * Query parameters:
 * - areaId: Filter by area ID (optional)
 * - severity: Filter by severity level (optional)
 * - acknowledged: Filter by acknowledgment status (optional, true/false)
 * - resolved: Filter by resolution status (optional, true/false)
 * - limit: Number of results per page (default: 20, max: 100)
 * - offset: Number of results to skip (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const areaId = searchParams.get('areaId') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const acknowledgedParam = searchParams.get('acknowledged');
    const resolvedParam = searchParams.get('resolved');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    
    // Parse boolean parameters
    const acknowledged = acknowledgedParam !== null 
      ? acknowledgedParam === 'true' 
      : undefined;
    const resolved = resolvedParam !== null 
      ? resolvedParam === 'true' 
      : undefined;
    
    // Parse pagination parameters with validation
    let limit = limitParam ? parseInt(limitParam, 10) : 20;
    let offset = offsetParam ? parseInt(offsetParam, 10) : 0;
    
    // Validate and constrain limit
    if (isNaN(limit) || limit < 1) {
      limit = 20;
    }
    if (limit > 100) {
      limit = 100; // Maximum 100 results per page
    }
    
    // Validate offset
    if (isNaN(offset) || offset < 0) {
      offset = 0;
    }
    
    // Validate severity if provided
    if (severity && !Object.values(ThresholdLevel).includes(severity as ThresholdLevel)) {
      return NextResponse.json(
        { error: 'Invalid severity level' },
        { status: 400 }
      );
    }
    
    // Get alert logger
    const alertLogger = getAlertLogger();
    
    // Query with filters using optimized indexes
    const storage = (alertLogger as any).storage;
    const alerts = await storage.query({
      areaId,
      severity,
      acknowledged,
      resolved,
      limit,
      offset,
    });
    
    // Get total count for pagination metadata (without limit/offset)
    const allAlerts = await storage.query({
      areaId,
      severity,
      acknowledged,
      resolved,
    });
    const total = allAlerts.length;
    
    // Calculate pagination metadata
    const hasMore = offset + limit < total;
    const nextOffset = hasMore ? offset + limit : null;
    const prevOffset = offset > 0 ? Math.max(0, offset - limit) : null;
    
    return NextResponse.json({
      data: alerts,
      pagination: {
        limit,
        offset,
        total,
        hasMore,
        nextOffset,
        prevOffset,
      },
    });
    
  } catch (error) {
    console.error('Error fetching alert history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alert history' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/crowd-risk/alerts/stats
 * 
 * Get alert statistics
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { areaId } = body;
    
    const alertLogger = getAlertLogger();
    const stats = await alertLogger.getAlertStats(areaId);
    
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('Error fetching alert stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alert statistics' },
      { status: 500 }
    );
  }
}
