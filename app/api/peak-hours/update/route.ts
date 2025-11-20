/**
 * Peak Hours Update API Route
 * 
 * Updates peak hour patterns by analyzing historical data.
 * This endpoint should be called periodically (every 15 minutes)
 * to keep peak patterns up-to-date with latest crowd data.
 * 
 * Can be triggered by:
 * - Vercel Cron Jobs
 * - External schedulers
 * - Manual API calls
 * 
 * Endpoint: POST /api/peak-hours/update
 * 
 * Requirements: 1.4
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { HistoricalDataService } from '@/lib/services/historical-data-service';

/**
 * POST /api/peak-hours/update
 * 
 * Analyzes historical data and updates peak hour patterns
 * for all zones in the system
 */
export async function POST(request: Request) {
  try {
    // Initialize historical data service
    const historicalService = new HistoricalDataService(db);
    
    // Get all unique zone IDs from recent snapshots
    const zones = await db.crowdSnapshot.groupBy({
      by: ['zoneId'],
      _max: {
        timestamp: true,
      },
    });
    
    if (zones.length === 0) {
      return NextResponse.json(
        {
          message: 'No zones found to analyze',
          zonesAnalyzed: 0,
          patternsUpdated: 0,
        },
        { status: 200 }
      );
    }
    
    // Analyze peak patterns for each zone
    let totalPatternsUpdated = 0;
    const results: Array<{ zoneId: string; patterns: number; error?: string }> = [];
    
    for (const zone of zones) {
      try {
        // Analyze last 30 days of data
        const patterns = await historicalService.analyzePeakPatterns(
          zone.zoneId,
          30
        );
        
        totalPatternsUpdated += patterns.length;
        results.push({
          zoneId: zone.zoneId,
          patterns: patterns.length,
        });
      } catch (error) {
        console.error(`Error analyzing zone ${zone.zoneId}:`, error);
        results.push({
          zoneId: zone.zoneId,
          patterns: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    // Return summary
    return NextResponse.json({
      message: 'Peak patterns updated successfully',
      timestamp: new Date().toISOString(),
      zonesAnalyzed: zones.length,
      patternsUpdated: totalPatternsUpdated,
      results,
    });
  } catch (error) {
    console.error('Error updating peak patterns:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to update peak patterns',
        code: 'UPDATE_ERROR',
        details: {
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/peak-hours/update
 * 
 * Returns information about the update endpoint
 * (for testing and documentation purposes)
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/peak-hours/update',
    method: 'POST',
    description: 'Updates peak hour patterns by analyzing historical data',
    schedule: 'Should be called every 15 minutes',
    usage: {
      curl: 'curl -X POST https://your-domain.com/api/peak-hours/update',
      vercelCron: 'Add to vercel.json: { "path": "/api/peak-hours/update", "schedule": "*/15 * * * *" }',
    },
  });
}
