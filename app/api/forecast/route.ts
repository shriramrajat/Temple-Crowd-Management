/**
 * Forecast API Route
 * 
 * Generates and returns 2-hour ahead crowd predictions for all zones or a specific zone.
 * Uses PredictionService to generate forecasts with 15-minute intervals.
 * Implements caching with 5-minute expiration for performance.
 * 
 * Endpoint: GET /api/forecast
 * Query Parameters:
 *   - zoneId (optional): Filter predictions to a specific zone
 * 
 * Requirements: 2.1, 2.2, 2.4, 5.2, 5.5
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PredictionService } from '@/lib/services/prediction-service';
import type { ForecastResponse, ForecastPoint, DataSource } from '@/lib/types/forecast';

/**
 * Zone configuration for forecast generation
 */
interface ZoneConfig {
  zoneId: string;
  zoneName: string;
  capacity: number;
}

/**
 * Get zone configurations from the most recent crowd data
 * Falls back to default zones if no data is available
 */
async function getZoneConfigurations(zoneId?: string): Promise<ZoneConfig[]> {
  try {
    // Get the most recent snapshot for each zone
    const recentSnapshots = await db.crowdSnapshot.groupBy({
      by: ['zoneId'],
      _max: {
        timestamp: true,
      },
    });

    // Fetch full snapshot data for each zone
    const zones: ZoneConfig[] = [];
    
    for (const group of recentSnapshots) {
      // Skip if filtering by zoneId and this isn't the requested zone
      if (zoneId && group.zoneId !== zoneId) {
        continue;
      }

      const snapshot = await db.crowdSnapshot.findFirst({
        where: {
          zoneId: group.zoneId,
          timestamp: group._max.timestamp || undefined,
        },
      });

      if (snapshot) {
        zones.push({
          zoneId: snapshot.zoneId,
          zoneName: snapshot.zoneName,
          capacity: snapshot.capacity,
        });
      }
    }

    // If no zones found, return default zones
    if (zones.length === 0) {
      return getDefaultZones(zoneId);
    }

    return zones;
  } catch (error) {
    console.error('Error fetching zone configurations:', error);
    return getDefaultZones(zoneId);
  }
}

/**
 * Get default zone configurations as fallback
 */
function getDefaultZones(zoneId?: string): ZoneConfig[] {
  const defaultZones: ZoneConfig[] = [
    { zoneId: 'zone-main-entrance', zoneName: 'Main Entrance', capacity: 500 },
    { zoneId: 'zone-prayer-hall', zoneName: 'Prayer Hall', capacity: 500 },
    { zoneId: 'zone-east-courtyard', zoneName: 'East Courtyard', capacity: 500 },
    { zoneId: 'zone-west-courtyard', zoneName: 'West Courtyard', capacity: 500 },
    { zoneId: 'zone-inner-sanctum', zoneName: 'Inner Sanctum', capacity: 500 },
    { zoneId: 'zone-exit-area', zoneName: 'Exit Area', capacity: 500 },
  ];

  if (zoneId) {
    return defaultZones.filter(z => z.zoneId === zoneId);
  }

  return defaultZones;
}

/**
 * Determine the overall data source from individual predictions
 */
function determineDataSource(predictions: ForecastPoint[]): DataSource {
  if (predictions.length === 0) {
    return 'simulated';
  }

  // Count predictions by confidence level to infer data source
  const highConfidence = predictions.filter(p => p.confidence >= 80).length;
  const mediumConfidence = predictions.filter(p => p.confidence >= 60 && p.confidence < 80).length;
  const lowConfidence = predictions.filter(p => p.confidence < 60).length;

  // High confidence suggests historical data
  if (highConfidence > predictions.length * 0.7) {
    return 'historical';
  }

  // Low confidence suggests simulated data
  if (lowConfidence > predictions.length * 0.7) {
    return 'simulated';
  }

  // Mixed confidence suggests hybrid
  return 'hybrid';
}

/**
 * GET /api/forecast
 * 
 * Returns 2-hour forecast for all zones or a specific zone
 * Implements caching and handles errors gracefully
 */
export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const zoneId = searchParams.get('zoneId') || undefined;

    // Initialize prediction service
    const predictionService = new PredictionService(db);

    // Get zone configurations
    const zones = await getZoneConfigurations(zoneId);

    if (zones.length === 0) {
      return NextResponse.json(
        {
          error: 'No zones found',
          code: 'NO_ZONES',
          details: { zoneId },
        },
        { status: 404 }
      );
    }

    // Generate forecasts for all zones
    const startTime = new Date();
    const allPredictions: ForecastPoint[] = [];

    for (const zone of zones) {
      try {
        const forecast = await predictionService.generateForecast(
          zone.zoneId,
          zone.zoneName,
          zone.capacity,
          startTime,
          {
            intervalMinutes: 15,
            windowHours: 2,
            useCache: true,
            minConfidence: 0,
          }
        );

        // Convert Date objects to ISO strings for API response
        const serializedForecast = forecast.map(point => ({
          ...point,
          timestamp: point.timestamp.toISOString(),
        }));

        allPredictions.push(...serializedForecast);
      } catch (error) {
        console.error(`Error generating forecast for zone ${zone.zoneId}:`, error);
        // Continue with other zones even if one fails
      }
    }

    // Calculate forecast window
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 2);

    // Determine data source
    const dataSource = determineDataSource(allPredictions);

    // Build response
    const response: ForecastResponse = {
      predictions: allPredictions,
      metadata: {
        generatedAt: new Date().toISOString(),
        forecastWindow: {
          start: startTime.toISOString(),
          end: endTime.toISOString(),
        },
        dataSource,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating forecast:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate forecast',
        code: 'FORECAST_ERROR',
        details: {
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
