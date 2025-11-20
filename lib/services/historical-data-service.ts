/**
 * Historical Data Service
 * Handles storage, retrieval, and analysis of historical crowd data
 * for predictive forecasting and pattern identification
 * Requirements: 4.1, 4.2, 4.3, 5.1, 5.3, 5.4, 5.5, 1.1
 */

import type { DbClient } from "@/lib/db";
import type { CrowdSnapshot, PeakHourPattern } from "@/lib/generated/prisma";

/**
 * Zone data structure for snapshot storage
 */
export interface ZoneData {
  zoneId: string;
  zoneName: string;
  footfall: number;
  capacity: number;
}

/**
 * Historical data query parameters
 */
export interface HistoricalDataQuery {
  zoneId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  hourRange: {
    start: number; // 0-23
    end: number; // 0-23
  };
  daysBack: number; // Number of days to look back
}

/**
 * Peak pattern analysis result
 */
export interface PeakPattern {
  zoneId: string;
  dayOfWeek: number;
  startHour: number;
  endHour: number;
  avgFootfall: number;
  confidence: number;
}

/**
 * Aggregated data statistics for pattern analysis
 */
export interface AggregatedData {
  hour: number;
  count: number;
  totalFootfall: number;
  avgFootfall: number;
  minFootfall: number;
  maxFootfall: number;
  capacity: number;
  avgOccupancyRate: number;
}

/**
 * Data variance statistics for confidence scoring
 */
export interface DataVariance {
  mean: number;
  variance: number;
  stdDev: number;
  coefficientOfVariation: number;
}

/**
 * Trend analysis result
 */
export interface TrendAnalysis {
  direction: "increasing" | "decreasing" | "stable";
  strength: number; // 0-1, where 1 is strongest trend
  slope: number; // Rate of change
}

/**
 * Historical Data Service Class
 * Provides methods for historical data operations with database abstraction
 */
export class HistoricalDataService {
  /**
   * Database client instance
   */
  private db: DbClient;

  constructor(dbClient: DbClient) {
    this.db = dbClient;
  }

  /**
   * Save a crowd snapshot to the database
   * Requirements: 4.1, 4.2
   * 
   * Stores current crowd data with timestamp and derived fields
   * for efficient querying by day of week and hour of day
   * 
   * @param zoneData - Current zone crowd data
   * @param timestamp - Timestamp of the snapshot (defaults to now)
   * @returns Created snapshot
   */
  async saveSnapshot(
    zoneData: ZoneData,
    timestamp: Date = new Date()
  ): Promise<CrowdSnapshot> {
    try {
      // Extract day of week (0-6, Sunday-Saturday)
      const dayOfWeek = timestamp.getDay();
      
      // Extract hour of day (0-23)
      const hourOfDay = timestamp.getHours();

      // Generate unique ID
      const snapshotId = `snapshot_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

      // Create snapshot record
      const snapshot = await this.db.crowd_snapshots.create({
        data: {
          id: snapshotId,
          zoneId: zoneData.zoneId,
          zoneName: zoneData.zoneName,
          footfall: zoneData.footfall,
          capacity: zoneData.capacity,
          timestamp,
          dayOfWeek,
          hourOfDay,
        },
      });

      return snapshot;
    } catch (error) {
      throw new Error(
        `Failed to save snapshot: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Save multiple snapshots in a batch operation
   * Requirements: 4.1
   * 
   * Efficiently stores multiple zone snapshots at once
   * 
   * @param zonesData - Array of zone data
   * @param timestamp - Timestamp for all snapshots (defaults to now)
   * @returns Array of created snapshots
   */
  async saveSnapshotBatch(
    zonesData: ZoneData[],
    timestamp: Date = new Date()
  ): Promise<CrowdSnapshot[]> {
    try {
      const dayOfWeek = timestamp.getDay();
      const hourOfDay = timestamp.getHours();

      // Prepare batch data
      const snapshotsData = zonesData.map((zone) => ({
        zoneId: zone.zoneId,
        zoneName: zone.zoneName,
        footfall: zone.footfall,
        capacity: zone.capacity,
        timestamp,
        dayOfWeek,
        hourOfDay,
      }));

      // Add IDs to snapshots data
      const snapshotsDataWithIds = snapshotsData.map((data) => ({
        ...data,
        id: `snapshot_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      }));

      // Use createMany for efficient batch insert
      await this.db.crowd_snapshots.createMany({
        data: snapshotsDataWithIds,
      });

      // Return the created snapshots
      const snapshots = await this.db.crowd_snapshots.findMany({
        where: {
          timestamp,
          zoneId: {
            in: zonesData.map((z) => z.zoneId),
          },
        },
      });

      return snapshots;
    } catch (error) {
      throw new Error(
        `Failed to save snapshot batch: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Query historical data for prediction analysis
   * Requirements: 4.2, 4.3
   * 
   * Retrieves historical snapshots filtered by zone, day of week,
   * and time range for pattern analysis and forecasting
   * 
   * @param query - Historical data query parameters
   * @returns Array of matching snapshots
   */
  async getHistoricalData(
    query: HistoricalDataQuery
  ): Promise<CrowdSnapshot[]> {
    try {
      // Calculate the date threshold
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - query.daysBack);

      // Build hour range filter
      const hourConditions = [];
      if (query.hourRange.start <= query.hourRange.end) {
        // Normal range (e.g., 9 to 17)
        hourConditions.push({
          hourOfDay: {
            gte: query.hourRange.start,
            lte: query.hourRange.end,
          },
        });
      } else {
        // Wrap-around range (e.g., 22 to 2)
        hourConditions.push(
          {
            hourOfDay: {
              gte: query.hourRange.start,
            },
          },
          {
            hourOfDay: {
              lte: query.hourRange.end,
            },
          }
        );
      }

      // Query with optimized indexes
      const snapshots = await this.db.crowd_snapshots.findMany({
        where: {
          zoneId: query.zoneId,
          dayOfWeek: query.dayOfWeek,
          timestamp: {
            gte: dateThreshold,
          },
          OR: hourConditions,
        },
        orderBy: {
          timestamp: "desc",
        },
      });

      return snapshots;
    } catch (error) {
      throw new Error(
        `Failed to retrieve historical data: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Query historical data for a specific time window
   * Requirements: 4.2, 4.3
   * 
   * Retrieves snapshots within a specific date/time range
   * for detailed analysis and comparison
   * 
   * @param zoneId - Zone identifier
   * @param startTime - Start of time window
   * @param endTime - End of time window
   * @returns Array of snapshots within the time window
   */
  async getHistoricalDataByTimeWindow(
    zoneId: string,
    startTime: Date,
    endTime: Date
  ): Promise<CrowdSnapshot[]> {
    try {
      const snapshots = await this.db.crowd_snapshots.findMany({
        where: {
          zoneId,
          timestamp: {
            gte: startTime,
            lte: endTime,
          },
        },
        orderBy: {
          timestamp: "asc",
        },
      });

      return snapshots;
    } catch (error) {
      throw new Error(
        `Failed to retrieve historical data by time window: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Query historical data for multiple zones
   * Requirements: 4.2
   * 
   * Retrieves snapshots for multiple zones at once
   * for efficient batch processing
   * 
   * @param zoneIds - Array of zone identifiers
   * @param startTime - Start of time window
   * @param endTime - End of time window
   * @returns Array of snapshots for all specified zones
   */
  async getHistoricalDataMultiZone(
    zoneIds: string[],
    startTime: Date,
    endTime: Date
  ): Promise<CrowdSnapshot[]> {
    try {
      const snapshots = await this.db.crowd_snapshots.findMany({
        where: {
          zoneId: {
            in: zoneIds,
          },
          timestamp: {
            gte: startTime,
            lte: endTime,
          },
        },
        orderBy: [
          { zoneId: "asc" },
          { timestamp: "asc" },
        ],
      });

      return snapshots;
    } catch (error) {
      throw new Error(
        `Failed to retrieve multi-zone historical data: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Aggregate historical data by hour for pattern analysis
   * Requirements: 4.3
   * 
   * Groups snapshots by hour and calculates statistics
   * for identifying patterns and trends
   * 
   * @param zoneId - Zone identifier
   * @param dayOfWeek - Day of week (0-6)
   * @param daysBack - Number of days to analyze
   * @returns Map of hour to aggregated statistics
   */
  async aggregateByHour(
    zoneId: string,
    dayOfWeek: number,
    daysBack: number
  ): Promise<Map<number, AggregatedData>> {
    try {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - daysBack);

      const snapshots = await this.db.crowd_snapshots.findMany({
        where: {
          zoneId,
          dayOfWeek,
          timestamp: {
            gte: dateThreshold,
          },
        },
        orderBy: {
          timestamp: "asc",
        },
      });

      // Group by hour and calculate statistics
      const hourlyData = new Map<number, AggregatedData>();

      for (const snapshot of snapshots) {
        const hour = snapshot.hourOfDay;
        
        if (!hourlyData.has(hour)) {
          hourlyData.set(hour, {
            hour,
            count: 0,
            totalFootfall: 0,
            avgFootfall: 0,
            minFootfall: snapshot.footfall,
            maxFootfall: snapshot.footfall,
            capacity: snapshot.capacity,
            avgOccupancyRate: 0,
          });
        }

        const data = hourlyData.get(hour)!;
        data.count++;
        data.totalFootfall += snapshot.footfall;
        data.minFootfall = Math.min(data.minFootfall, snapshot.footfall);
        data.maxFootfall = Math.max(data.maxFootfall, snapshot.footfall);
      }

      // Calculate averages
      for (const [hour, data] of hourlyData.entries()) {
        data.avgFootfall = data.totalFootfall / data.count;
        data.avgOccupancyRate = data.avgFootfall / data.capacity;
      }

      return hourlyData;
    } catch (error) {
      throw new Error(
        `Failed to aggregate data by hour: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Calculate weighted average for time-series prediction
   * Requirements: 4.3
   * 
   * Applies exponential decay weighting to historical data
   * where recent data is weighted more heavily
   * 
   * @param snapshots - Array of historical snapshots
   * @param decayFactor - Decay factor (default: 7 days)
   * @returns Weighted average footfall
   */
  calculateWeightedAverage(
    snapshots: CrowdSnapshot[],
    decayFactor: number = 7
  ): number {
    if (snapshots.length === 0) return 0;

    const now = new Date();
    let weightedSum = 0;
    let totalWeight = 0;

    for (const snapshot of snapshots) {
      // Calculate days difference
      const daysDiff = (now.getTime() - snapshot.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      
      // Calculate weight using exponential decay: e^(-days/decayFactor)
      const weight = Math.exp(-daysDiff / decayFactor);
      
      weightedSum += snapshot.footfall * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Calculate variance and standard deviation for confidence scoring
   * Requirements: 4.3
   * 
   * Analyzes data consistency to determine prediction confidence
   * 
   * @param snapshots - Array of historical snapshots
   * @returns Statistics object with variance and standard deviation
   */
  calculateVariance(snapshots: CrowdSnapshot[]): DataVariance {
    if (snapshots.length === 0) {
      return {
        mean: 0,
        variance: 0,
        stdDev: 0,
        coefficientOfVariation: 0,
      };
    }

    // Calculate mean
    const mean = snapshots.reduce((sum, s) => sum + s.footfall, 0) / snapshots.length;

    // Calculate variance
    const variance = snapshots.reduce((sum, s) => {
      const diff = s.footfall - mean;
      return sum + diff * diff;
    }, 0) / snapshots.length;

    // Calculate standard deviation
    const stdDev = Math.sqrt(variance);

    // Calculate coefficient of variation (relative variability)
    const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;

    return {
      mean,
      variance,
      stdDev,
      coefficientOfVariation,
    };
  }

  /**
   * Identify trend direction from historical data
   * Requirements: 4.3
   * 
   * Determines if crowd levels are increasing, decreasing, or stable
   * 
   * @param snapshots - Array of historical snapshots (should be ordered by time)
   * @returns Trend direction and strength
   */
  identifyTrend(snapshots: CrowdSnapshot[]): TrendAnalysis {
    if (snapshots.length < 2) {
      return {
        direction: "stable",
        strength: 0,
        slope: 0,
      };
    }

    // Simple linear regression to identify trend
    const n = snapshots.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
      const x = i; // Time index
      const y = snapshots[i].footfall;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    }

    // Calculate slope (m) of the trend line
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    // Determine direction and strength
    const avgFootfall = sumY / n;
    const relativeSlope = Math.abs(slope) / avgFootfall;

    let direction: "increasing" | "decreasing" | "stable";
    let strength: number;

    if (relativeSlope < 0.05) {
      direction = "stable";
      strength = 0;
    } else if (slope > 0) {
      direction = "increasing";
      strength = Math.min(relativeSlope, 1);
    } else {
      direction = "decreasing";
      strength = Math.min(relativeSlope, 1);
    }

    return {
      direction,
      strength,
      slope,
    };
  }

  /**
   * Generate simulated data based on typical patterns
   * Requirements: 5.1, 5.3, 5.4, 5.5
   * 
   * Creates realistic simulated crowd data when historical data
   * is insufficient or unavailable. Uses typical daily patterns
   * with peak hours and natural variation.
   * 
   * @param zoneId - Zone identifier
   * @param zoneName - Zone name
   * @param capacity - Zone capacity
   * @param targetTime - Target time for simulation
   * @param dataPoints - Number of data points to generate (default: 8)
   * @returns Array of simulated snapshots
   */
  async generateSimulatedData(
    zoneId: string,
    zoneName: string,
    capacity: number,
    targetTime: Date,
    dataPoints: number = 8
  ): Promise<CrowdSnapshot[]> {
    try {
      const simulatedSnapshots: CrowdSnapshot[] = [];

      // Define typical crowd patterns by hour
      // Peak hours: 10-12 AM (morning) and 6-8 PM (evening)
      const getBaseOccupancyRate = (hour: number): number => {
        if (hour >= 10 && hour <= 12) return 0.75; // Morning peak
        if (hour >= 18 && hour <= 20) return 0.85; // Evening peak
        if (hour >= 6 && hour < 10) return 0.45; // Morning ramp-up
        if (hour >= 13 && hour < 18) return 0.55; // Afternoon
        if (hour >= 21 && hour <= 23) return 0.40; // Evening wind-down
        return 0.25; // Off-peak hours
      };

      // Generate data points going back in time
      for (let i = 0; i < dataPoints; i++) {
        const pointTime = new Date(targetTime);
        pointTime.setMinutes(pointTime.getMinutes() - (i * 15)); // 15-minute intervals

        const pointHour = pointTime.getHours();
        const pointDayOfWeek = pointTime.getDay();

        // Calculate base occupancy
        let baseRate = getBaseOccupancyRate(pointHour);
        
        // Apply weekend multiplier
        const weekendAdj = (pointDayOfWeek === 0 || pointDayOfWeek === 6) ? 1.12 : 1.0;
        baseRate *= weekendAdj;

        // Add random variation (±10%)
        const variation = 0.9 + Math.random() * 0.2;
        let occupancyRate = baseRate * variation;

        // Ensure bounds (0-100%)
        occupancyRate = Math.max(0, Math.min(1, occupancyRate));

        // Calculate footfall
        const footfall = Math.round(capacity * occupancyRate);

        // Create simulated snapshot (not saved to DB)
        const snapshot: CrowdSnapshot = {
          id: `simulated-${zoneId}-${pointTime.getTime()}`,
          zoneId,
          zoneName,
          footfall,
          capacity,
          timestamp: pointTime,
          dayOfWeek: pointDayOfWeek,
          hourOfDay: pointHour,
          createdAt: new Date(),
        };

        simulatedSnapshots.push(snapshot);
      }

      // Return in chronological order (oldest first)
      return simulatedSnapshots.reverse();
    } catch (error) {
      throw new Error(
        `Failed to generate simulated data: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Blend historical and simulated data for hybrid predictions
   * Requirements: 5.3, 5.5
   * 
   * Combines historical data with simulated data when historical
   * data is insufficient, gradually transitioning over 7 days
   * 
   * @param historicalData - Array of historical snapshots
   * @param simulatedData - Array of simulated snapshots
   * @param historicalDays - Number of days of historical data available
   * @returns Blended array of snapshots
   */
  blendDataSources(
    historicalData: CrowdSnapshot[],
    simulatedData: CrowdSnapshot[],
    historicalDays: number
  ): CrowdSnapshot[] {
    // If we have 7+ days of historical data, use only historical
    if (historicalDays >= 7) {
      return historicalData;
    }

    // If we have no historical data, use only simulated
    if (historicalDays === 0 || historicalData.length === 0) {
      return simulatedData;
    }

    // Calculate blend ratio (0 to 1, where 1 is all historical)
    // Linear transition over 7 days
    const historicalWeight = historicalDays / 7;
    const simulatedWeight = 1 - historicalWeight;

    // Create blended data by averaging footfall values
    const blendedData: CrowdSnapshot[] = [];
    const maxLength = Math.max(historicalData.length, simulatedData.length);

    for (let i = 0; i < maxLength; i++) {
      const historical = historicalData[i];
      const simulated = simulatedData[i];

      if (historical && simulated) {
        // Blend both sources
        const blendedFootfall = Math.round(
          historical.footfall * historicalWeight +
          simulated.footfall * simulatedWeight
        );

        blendedData.push({
          ...historical,
          footfall: blendedFootfall,
        });
      } else if (historical) {
        // Only historical available
        blendedData.push(historical);
      } else if (simulated) {
        // Only simulated available
        blendedData.push(simulated);
      }
    }

    return blendedData;
  }

  /**
   * Analyze peak hour patterns from historical data
   * Requirements: 1.1, 4.3
   * 
   * Identifies recurring peak periods where crowd density
   * exceeds 80% of capacity, calculates average footfall
   * and confidence scores, and stores patterns in database
   * 
   * @param zoneId - Zone identifier
   * @param daysBack - Number of days to analyze (default: 30)
   * @returns Array of identified peak patterns
   */
  async analyzePeakPatterns(
    zoneId: string,
    daysBack: number = 30
  ): Promise<PeakHourPattern[]> {
    try {
      // Calculate date threshold
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - daysBack);

      // Fetch all snapshots for the zone within the time period
      const snapshots = await this.db.crowd_snapshots.findMany({
        where: {
          zoneId,
          timestamp: {
            gte: dateThreshold,
          },
        },
        orderBy: {
          timestamp: "asc",
        },
      });

      if (snapshots.length === 0) {
        return [];
      }

      // Group by day of week and hour
      const groupedData: Map<string, CrowdSnapshot[]> = new Map();

      for (const snapshot of snapshots) {
        // Only consider snapshots where occupancy >= 80%
        const occupancyRate = snapshot.footfall / snapshot.capacity;
        if (occupancyRate >= 0.8) {
          const key = `${snapshot.dayOfWeek}-${snapshot.hourOfDay}`;
          if (!groupedData.has(key)) {
            groupedData.set(key, []);
          }
          groupedData.get(key)!.push(snapshot);
        }
      }

      // Analyze each group and create peak patterns
      const peakPatterns: PeakPattern[] = [];

      for (const [key, group] of groupedData.entries()) {
        const [dayOfWeek, hourOfDay] = key.split("-").map(Number);

        // Calculate average footfall
        const avgFootfall = group.reduce((sum, s) => sum + s.footfall, 0) / group.length;

        // Calculate confidence based on data points
        // High confidence: 20+ occurrences
        // Medium confidence: 10-19 occurrences
        // Low confidence: < 10 occurrences
        const occurrences = group.length;
        const maxOccurrences = daysBack / 7; // Approximate max occurrences per week
        let confidence = Math.min(occurrences / (maxOccurrences * 3), 1.0);

        // Adjust confidence based on consistency (variance)
        const variance = group.reduce((sum, s) => {
          const diff = s.footfall - avgFootfall;
          return sum + diff * diff;
        }, 0) / group.length;
        const stdDev = Math.sqrt(variance);
        const coefficientOfVariation = stdDev / avgFootfall;

        // Reduce confidence if high variation
        if (coefficientOfVariation > 0.3) {
          confidence *= 0.7;
        } else if (coefficientOfVariation > 0.2) {
          confidence *= 0.85;
        }

        peakPatterns.push({
          zoneId,
          dayOfWeek,
          startHour: hourOfDay,
          endHour: hourOfDay + 1, // 1-hour window
          avgFootfall,
          confidence,
        });
      }

      // Merge adjacent hours into continuous peak periods
      const mergedPatterns = this.mergePeakPeriods(peakPatterns);

      // Store patterns in database
      const storedPatterns: PeakHourPattern[] = [];

      for (const pattern of mergedPatterns) {
        const patternId = `pattern_${pattern.zoneId}_${pattern.dayOfWeek}_${pattern.startHour}`;
        const stored = await this.db.peak_hour_patterns.upsert({
          where: {
            zoneId_dayOfWeek_startHour: {
              zoneId: pattern.zoneId,
              dayOfWeek: pattern.dayOfWeek,
              startHour: pattern.startHour,
            },
          },
          update: {
            endHour: pattern.endHour,
            avgFootfall: pattern.avgFootfall,
            confidence: pattern.confidence,
            updatedAt: new Date(),
          },
          create: {
            id: patternId,
            zoneId: pattern.zoneId,
            dayOfWeek: pattern.dayOfWeek,
            startHour: pattern.startHour,
            endHour: pattern.endHour,
            avgFootfall: pattern.avgFootfall,
            confidence: pattern.confidence,
            updatedAt: new Date(),
          },
        });

        storedPatterns.push(stored);
      }

      return storedPatterns;
    } catch (error) {
      throw new Error(
        `Failed to analyze peak patterns: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Merge adjacent peak hours into continuous periods
   * 
   * @param patterns - Array of individual peak patterns
   * @returns Merged peak patterns
   */
  private mergePeakPeriods(patterns: PeakPattern[]): PeakPattern[] {
    if (patterns.length === 0) return [];

    // Sort by day of week, then start hour
    const sorted = [...patterns].sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) {
        return a.dayOfWeek - b.dayOfWeek;
      }
      return a.startHour - b.startHour;
    });

    const merged: PeakPattern[] = [];
    let current = { ...sorted[0] };

    for (let i = 1; i < sorted.length; i++) {
      const next = sorted[i];

      // Check if adjacent (same day, consecutive hours)
      if (
        next.dayOfWeek === current.dayOfWeek &&
        next.startHour === current.endHour
      ) {
        // Merge: extend end hour and average the metrics
        current.endHour = next.endHour;
        current.avgFootfall = (current.avgFootfall + next.avgFootfall) / 2;
        current.confidence = (current.confidence + next.confidence) / 2;
      } else {
        // Not adjacent: save current and start new
        merged.push(current);
        current = { ...next };
      }
    }

    // Add the last pattern
    merged.push(current);

    return merged;
  }

  /**
   * Get stored peak patterns for a specific day
   * Requirements: 1.1
   * 
   * @param zoneId - Zone identifier (optional, returns all zones if not specified)
   * @param dayOfWeek - Day of week (0-6)
   * @returns Array of peak patterns
   */
  async getPeakPatterns(
    dayOfWeek: number,
    zoneId?: string
  ): Promise<PeakHourPattern[]> {
    try {
      const where: any = { dayOfWeek };
      if (zoneId) {
        where.zoneId = zoneId;
      }

      const patterns = await this.db.peak_hour_patterns.findMany({
        where,
        orderBy: [
          { zoneId: "asc" },
          { startHour: "asc" },
        ],
      });

      return patterns;
    } catch (error) {
      throw new Error(
        `Failed to retrieve peak patterns: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Clean up old snapshots beyond retention period
   * Requirements: 4.1
   * 
   * Removes snapshots older than specified days to manage storage
   * 
   * @param retentionDays - Number of days to retain (default: 90)
   * @returns Number of deleted records
   */
  async cleanupOldSnapshots(retentionDays: number = 90): Promise<number> {
    try {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - retentionDays);

      const result = await this.db.crowd_snapshots.deleteMany({
        where: {
          timestamp: {
            lt: dateThreshold,
          },
        },
      });

      return result.count;
    } catch (error) {
      throw new Error(
        `Failed to cleanup old snapshots: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
