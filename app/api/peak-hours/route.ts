/**
 * Peak Hours API Route
 * 
 * Returns identified peak hours for the current day where crowd density
 * exceeds 80% of maximum capacity. Uses stored peak patterns from
 * historical data analysis.
 * 
 * Endpoint: GET /api/peak-hours
 * Query Parameters:
 *   - date (optional): Target date in YYYY-MM-DD format (defaults to today)
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { HistoricalDataService } from '@/lib/services/historical-data-service';
import type { PeakHoursResponse, PeakPeriod, DataSource } from '@/lib/types/forecast';

/**
 * Format hour (0-23) to HH:mm format
 * 
 * @param hour - Hour in 24-hour format (0-23)
 * @returns Formatted time string (e.g., "09:00", "14:30")
 */
function formatTime(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}

/**
 * Classify crowd level based on occupancy rate
 * 
 * @param footfall - Expected footfall
 * @param capacity - Zone capacity
 * @returns Crowd level classification
 */
function classifyCrowdLevel(footfall: number, capacity: number): 'high' | 'very-high' {
  const occupancyRate = footfall / capacity;
  return occupancyRate >= 0.9 ? 'very-high' : 'high';
}

/**
 * Parse date string in YYYY-MM-DD format
 * 
 * @param dateString - Date string to parse
 * @returns Date object or null if invalid
 */
function parseDate(dateString: string): Date | null {
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  
  const [, year, month, day] = match;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  // Validate the date
  if (isNaN(date.getTime())) return null;
  
  return date;
}

/**
 * GET /api/peak-hours
 * 
 * Returns identified peak hours for the specified date (or today)
 * Queries PeakHourPattern table for patterns where crowd exceeds 80% capacity
 */
export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    // Determine target date
    let targetDate: Date;
    if (dateParam) {
      const parsed = parseDate(dateParam);
      if (!parsed) {
        return NextResponse.json(
          {
            error: 'Invalid date format',
            code: 'INVALID_DATE',
            details: { 
              date: dateParam,
              expectedFormat: 'YYYY-MM-DD',
            },
          },
          { status: 400 }
        );
      }
      targetDate = parsed;
    } else {
      targetDate = new Date();
    }
    
    // Get day of week (0-6, Sunday-Saturday)
    const dayOfWeek = targetDate.getDay();
    
    // Initialize historical data service
    const historicalService = new HistoricalDataService(db);
    
    // Query peak patterns for the current day
    const peakPatterns = await historicalService.getPeakPatterns(dayOfWeek);
    
    // Filter patterns where crowd exceeds 80% capacity
    // and format as PeakPeriod objects
    const peaks: PeakPeriod[] = [];
    
    for (const pattern of peakPatterns) {
      // Calculate occupancy rate
      // Note: avgFootfall is already the average, we need to get capacity
      // We'll fetch the most recent snapshot for this zone to get capacity
      const recentSnapshot = await db.crowd_snapshots.findFirst({
        where: { zoneId: pattern.zoneId },
        orderBy: { timestamp: 'desc' },
        select: { zoneName: true, capacity: true },
      });
      
      if (!recentSnapshot) continue;
      
      const occupancyRate = pattern.avgFootfall / recentSnapshot.capacity;
      
      // Only include if occupancy >= 80%
      if (occupancyRate >= 0.8) {
        peaks.push({
          zoneId: pattern.zoneId,
          zoneName: recentSnapshot.zoneName,
          startTime: formatTime(pattern.startHour),
          endTime: formatTime(pattern.endHour),
          expectedFootfall: Math.round(pattern.avgFootfall),
          capacity: recentSnapshot.capacity,
          crowdLevel: classifyCrowdLevel(pattern.avgFootfall, recentSnapshot.capacity),
        });
      }
    }
    
    // Sort peaks by start time
    peaks.sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    // Determine data source based on pattern confidence
    let dataSource: DataSource = 'historical';
    if (peakPatterns.length === 0) {
      dataSource = 'simulated';
    } else {
      const avgConfidence = peakPatterns.reduce((sum, p) => sum + p.confidence, 0) / peakPatterns.length;
      if (avgConfidence < 0.6) {
        dataSource = 'simulated';
      } else if (avgConfidence < 0.8) {
        dataSource = 'hybrid';
      }
    }
    
    // Build response
    const response: PeakHoursResponse = {
      date: targetDate.toISOString().split('T')[0],
      peaks,
      metadata: {
        calculatedAt: new Date().toISOString(),
        dataSource,
      },
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error retrieving peak hours:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to retrieve peak hours',
        code: 'PEAK_HOURS_ERROR',
        details: {
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
