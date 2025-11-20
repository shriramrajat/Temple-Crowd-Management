/**
 * IoT Simulator API Route
 * 
 * Generates simulated crowd data for the temple complex heatmap.
 * Maintains in-memory state for realistic data persistence between requests.
 * 
 * Endpoint: GET /api/crowd-data
 */

import { NextResponse } from 'next/server';
import type { ZoneData, CrowdDataResponse, TimeOfDay } from '@/lib/types/crowd-heatmap';
import { db } from '@/lib/db';

// ============================================================================
// In-Memory State Management
// ============================================================================

/**
 * In-memory storage for zone data persistence between requests
 * This simulates a stateful IoT system without requiring a database
 */
let zoneState: ZoneData[] = [];

/**
 * Flag to track if zones have been initialized
 */
let isInitialized = false;

// ============================================================================
// Zone Initialization
// ============================================================================

/**
 * Initialize 6 zones with temple complex layout
 * Creates realistic starting values for each zone
 */
function initializeZones(): ZoneData[] {
  const zones: ZoneData[] = [
    {
      id: 'zone-main-entrance',
      name: 'Main Entrance',
      footfall: Math.floor(Math.random() * 150) + 50, // 50-200
      position: { row: 0, col: 0 },
      capacity: 500,
      lastUpdated: new Date().toISOString(),
      trend: 'stable'
    },
    {
      id: 'zone-prayer-hall',
      name: 'Prayer Hall',
      footfall: Math.floor(Math.random() * 200) + 100, // 100-300
      position: { row: 0, col: 1 },
      capacity: 500,
      lastUpdated: new Date().toISOString(),
      trend: 'stable'
    },
    {
      id: 'zone-east-courtyard',
      name: 'East Courtyard',
      footfall: Math.floor(Math.random() * 100) + 30, // 30-130
      position: { row: 0, col: 2 },
      capacity: 500,
      lastUpdated: new Date().toISOString(),
      trend: 'stable'
    },
    {
      id: 'zone-west-courtyard',
      name: 'West Courtyard',
      footfall: Math.floor(Math.random() * 100) + 30, // 30-130
      position: { row: 1, col: 0 },
      capacity: 500,
      lastUpdated: new Date().toISOString(),
      trend: 'stable'
    },
    {
      id: 'zone-inner-sanctum',
      name: 'Inner Sanctum',
      footfall: Math.floor(Math.random() * 150) + 80, // 80-230
      position: { row: 1, col: 1 },
      capacity: 500,
      lastUpdated: new Date().toISOString(),
      trend: 'stable'
    },
    {
      id: 'zone-exit-area',
      name: 'Exit Area',
      footfall: Math.floor(Math.random() * 120) + 40, // 40-160
      position: { row: 1, col: 2 },
      capacity: 500,
      lastUpdated: new Date().toISOString(),
      trend: 'stable'
    }
  ];

  return zones;
}

// ============================================================================
// Simulation Helper Functions
// ============================================================================

/**
 * Determine current time of day based on hour
 * Used for applying realistic crowd patterns
 */
function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

/**
 * Get peak factor multiplier based on time of day
 * Simulates realistic crowd patterns throughout the day
 */
function getPeakFactor(timeOfDay: TimeOfDay): number {
  const multipliers = {
    morning: 0.7,
    afternoon: 1.2,
    evening: 0.9,
    night: 0.3
  };
  
  return multipliers[timeOfDay];
}

/**
 * Calculate gradual fluctuation with maximum 20% change
 * Ensures realistic, smooth transitions between updates
 */
function calculateFluctuation(currentValue: number, maxCapacity: number): number {
  const maxChange = currentValue * 0.20; // 20% maximum change
  const randomChange = (Math.random() * 2 - 1) * maxChange; // -20% to +20%
  
  let newValue = currentValue + randomChange;
  
  // Apply boundary validation (0 to maxCapacity)
  newValue = Math.max(0, Math.min(maxCapacity, newValue));
  
  return Math.floor(newValue);
}

/**
 * Calculate trend indicator based on previous and current values
 */
function calculateTrend(previous: number, current: number): 'increasing' | 'decreasing' | 'stable' {
  const changePercent = ((current - previous) / previous) * 100;
  
  if (changePercent > 5) return 'increasing';
  if (changePercent < -5) return 'decreasing';
  return 'stable';
}

/**
 * Update zone data with realistic simulation logic
 * Applies time-of-day factors and gradual fluctuations
 */
function updateZoneData(zones: ZoneData[]): ZoneData[] {
  const timeOfDay = getTimeOfDay();
  const peakFactor = getPeakFactor(timeOfDay);
  const now = new Date().toISOString();
  
  return zones.map(zone => {
    const previousFootfall = zone.footfall;
    
    // Calculate base fluctuation
    let newFootfall = calculateFluctuation(zone.footfall, zone.capacity);
    
    // Apply time-of-day multiplier
    newFootfall = Math.floor(newFootfall * peakFactor);
    
    // Ensure boundaries (0 to 500)
    newFootfall = Math.max(0, Math.min(500, newFootfall));
    
    // Calculate trend
    const trend = calculateTrend(previousFootfall, newFootfall);
    
    return {
      ...zone,
      footfall: newFootfall,
      lastUpdated: now,
      trend
    };
  });
}

// ============================================================================
// Database Persistence
// ============================================================================

/**
 * Save crowd snapshots to database for historical analysis
 * Extracts dayOfWeek and hourOfDay from timestamp
 */
async function saveSnapshotsToDatabase(zones: ZoneData[]): Promise<void> {
  try {
    const timestamp = new Date();
    const dayOfWeek = timestamp.getDay(); // 0-6 (Sunday-Saturday)
    const hourOfDay = timestamp.getHours(); // 0-23

    // Create snapshot records for all zones
    const snapshots = zones.map(zone => ({
      zoneId: zone.id,
      zoneName: zone.name,
      footfall: zone.footfall,
      capacity: zone.capacity,
      timestamp,
      dayOfWeek,
      hourOfDay,
    }));

    // Batch insert all snapshots
    await db.crowdSnapshot.createMany({
      data: snapshots,
    });
  } catch (error) {
    // Log error but don't fail the request
    console.error('Error saving crowd snapshots to database:', error);
  }
}

// ============================================================================
// API Route Handler
// ============================================================================

/**
 * Fetch historical data for all zones
 * Returns data from the last 24 hours
 */
async function fetchHistoricalData() {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const snapshots = await db.crowdSnapshot.findMany({
      where: {
        timestamp: {
          gte: twentyFourHoursAgo,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    return snapshots;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return [];
  }
}

/**
 * GET /api/crowd-data
 * 
 * Returns current crowd data for all zones with simulation parameters
 * Initializes zones on first request, then updates existing state
 * Saves snapshots to database for historical analysis
 * 
 * Query Parameters:
 * - includeHistory: boolean - If true, includes historical data from last 24 hours
 */
export async function GET(request?: Request) {
  try {
    // Parse query parameters if request is provided
    let includeHistory = false;
    if (request) {
      const { searchParams } = new URL(request.url);
      includeHistory = searchParams.get('includeHistory') === 'true';
    }

    // Initialize zones on first request
    if (!isInitialized) {
      zoneState = initializeZones();
      isInitialized = true;
    } else {
      // Update existing zones with new simulated data
      zoneState = updateZoneData(zoneState);
    }
    
    // Save snapshots to database for historical analysis
    await saveSnapshotsToDatabase(zoneState);
    
    // Get current simulation parameters
    const timeOfDay = getTimeOfDay();
    const peakFactor = getPeakFactor(timeOfDay);
    
    // Build base response
    const response: CrowdDataResponse = {
      zones: zoneState,
      timestamp: new Date().toISOString(),
      simulationParams: {
        timeOfDay,
        peakFactor
      }
    };

    // Include historical data if requested
    if (includeHistory) {
      const historicalData = await fetchHistoricalData();
      response.historicalData = historicalData;
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating crowd data:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate crowd data' },
      { status: 500 }
    );
  }
}
