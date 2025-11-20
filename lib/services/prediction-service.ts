/**
 * Prediction Service
 * Handles crowd forecasting using time-series algorithms
 * and manages prediction caching for performance
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import type { DbClient } from "@/lib/db";
import type { CrowdSnapshot, PredictionCache } from "@/lib/generated/prisma";
import { HistoricalDataService } from "./historical-data-service";

/**
 * Forecast point representing a single prediction
 */
export interface ForecastPoint {
  zoneId: string;
  zoneName: string;
  timestamp: Date;
  predictedFootfall: number;
  confidence: number; // 0-100
  capacity: number;
}

/**
 * Forecast generation options
 */
export interface ForecastOptions {
  intervalMinutes?: number; // Default: 15
  windowHours?: number; // Default: 2
  useCache?: boolean; // Default: true
  minConfidence?: number; // Default: 0
}

/**
 * Data source type for predictions
 */
export type DataSource = "historical" | "simulated" | "hybrid";

/**
 * Forecast metadata
 */
export interface ForecastMetadata {
  generatedAt: Date;
  forecastWindow: {
    start: Date;
    end: Date;
  };
  dataSource: DataSource;
}

/**
 * Complete forecast response
 */
export interface ForecastResult {
  predictions: ForecastPoint[];
  metadata: ForecastMetadata;
}

/**
 * Prediction Service Class
 * Generates crowd forecasts using weighted moving average algorithm
 */
export class PredictionService {
  private db: DbClient;
  private historicalService: HistoricalDataService;

  // Cache expiration time in minutes
  private readonly CACHE_EXPIRATION_MINUTES = 5;

  // Minimum data points required for historical predictions
  private readonly MIN_HISTORICAL_DATA_POINTS = 10;

  // Decay factor for exponential weighting (in days)
  private readonly DECAY_FACTOR = 7;

  constructor(dbClient: DbClient) {
    this.db = dbClient;
    this.historicalService = new HistoricalDataService(dbClient);
  }

  /**
   * Generate forecast for a specific zone
   * Requirements: 2.1, 2.2
   * 
   * Creates predictions for the next 2 hours at 15-minute intervals
   * using weighted moving average of historical data
   * 
   * @param zoneId - Zone identifier
   * @param zoneName - Zone name
   * @param capacity - Zone capacity
   * @param startTime - Start time for forecast (defaults to now)
   * @param options - Forecast generation options
   * @returns Array of forecast points
   */
  async generateForecast(
    zoneId: string,
    zoneName: string,
    capacity: number,
    startTime: Date = new Date(),
    options: ForecastOptions = {}
  ): Promise<ForecastPoint[]> {
    const {
      intervalMinutes = 15,
      windowHours = 2,
      useCache = true,
      minConfidence = 0,
    } = options;

    try {
      // Check cache first if enabled
      if (useCache) {
        const cached = await this.getCachedForecast(zoneId, startTime, windowHours);
        if (cached && cached.length > 0) {
          return cached.filter((point) => point.confidence >= minConfidence);
        }
      }

      // Generate new predictions
      const predictions: ForecastPoint[] = [];
      const numIntervals = (windowHours * 60) / intervalMinutes;

      for (let i = 0; i < numIntervals; i++) {
        const targetTime = new Date(startTime);
        targetTime.setMinutes(targetTime.getMinutes() + i * intervalMinutes);

        const prediction = await this.generateSinglePrediction(
          zoneId,
          zoneName,
          capacity,
          targetTime
        );

        predictions.push(prediction);
      }

      // Cache the predictions if enabled
      if (useCache) {
        await this.cachePredictions(predictions);
      }

      // Filter by minimum confidence
      return predictions.filter((point) => point.confidence >= minConfidence);
    } catch (error) {
      throw new Error(
        `Failed to generate forecast: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Generate a single prediction point
   * Requirements: 2.1, 2.2, 2.3
   * 
   * @param zoneId - Zone identifier
   * @param zoneName - Zone name
   * @param capacity - Zone capacity
   * @param targetTime - Target time for prediction
   * @returns Single forecast point
   */
  private async generateSinglePrediction(
    zoneId: string,
    zoneName: string,
    capacity: number,
    targetTime: Date
  ): Promise<ForecastPoint> {
    // Get historical data for the same day of week and time window
    const dayOfWeek = targetTime.getDay();
    const hourOfDay = targetTime.getHours();

    // Query historical data from last 30 days
    const historicalData = await this.historicalService.getHistoricalData({
      zoneId,
      dayOfWeek,
      hourRange: {
        start: Math.max(0, hourOfDay - 1),
        end: Math.min(23, hourOfDay + 1),
      },
      daysBack: 30,
    });

    // Determine data source and calculate prediction
    let predictedFootfall: number;
    let confidence: number;
    let dataSource: DataSource;

    if (historicalData.length >= this.MIN_HISTORICAL_DATA_POINTS) {
      // Use historical data
      const result = this.calculateWeightedPrediction(historicalData, targetTime);
      predictedFootfall = result.value;
      confidence = result.confidence;
      dataSource = "historical";
    } else if (historicalData.length > 0) {
      // Hybrid: blend historical with simulated
      const simulatedData = await this.historicalService.generateSimulatedData(
        zoneId,
        zoneName,
        capacity,
        targetTime,
        8
      );

      const historicalDays = this.calculateHistoricalDays(historicalData);
      const blendedData = this.historicalService.blendDataSources(
        historicalData,
        simulatedData,
        historicalDays
      );

      const result = this.calculateWeightedPrediction(blendedData, targetTime);
      predictedFootfall = result.value;
      confidence = result.confidence * 0.8; // Reduce confidence for hybrid
      dataSource = "hybrid";
    } else {
      // Use simulated data only
      const simulatedData = await this.historicalService.generateSimulatedData(
        zoneId,
        zoneName,
        capacity,
        targetTime,
        8
      );

      const result = this.calculateWeightedPrediction(simulatedData, targetTime);
      predictedFootfall = result.value;
      confidence = Math.min(result.confidence, 60); // Cap at 60% for simulated
      dataSource = "simulated";
    }

    // Ensure predicted value is within bounds
    predictedFootfall = Math.max(0, Math.min(capacity, Math.round(predictedFootfall)));

    return {
      zoneId,
      zoneName,
      timestamp: targetTime,
      predictedFootfall,
      confidence: Math.round(confidence),
      capacity,
    };
  }

  /**
   * Calculate weighted prediction using moving average
   * Requirements: 2.1, 2.2, 2.3
   * 
   * Applies exponential decay weighting where recent data
   * is weighted more heavily than older data
   * 
   * @param snapshots - Historical snapshots
   * @param targetTime - Target time for prediction
   * @returns Predicted value and confidence score
   */
  private calculateWeightedPrediction(
    snapshots: CrowdSnapshot[],
    targetTime: Date
  ): { value: number; confidence: number } {
    if (snapshots.length === 0) {
      return { value: 0, confidence: 0 };
    }

    // Calculate weighted average
    const weightedAvg = this.historicalService.calculateWeightedAverage(
      snapshots,
      this.DECAY_FACTOR
    );

    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(snapshots);

    return {
      value: weightedAvg,
      confidence,
    };
  }

  /**
   * Calculate confidence score based on data availability and variance
   * Requirements: 2.3, 2.5
   * 
   * Confidence scoring:
   * - High (80-100%): 20+ data points, low variance (CV < 0.2)
   * - Medium (60-79%): 10-19 data points, moderate variance (CV < 0.3)
   * - Low (<60%): <10 data points or high variance (CV >= 0.3)
   * 
   * @param snapshots - Historical snapshots
   * @returns Confidence score (0-100)
   */
  private calculateConfidence(snapshots: CrowdSnapshot[]): number {
    const dataPointCount = snapshots.length;

    // Base confidence on data availability
    let confidence: number;

    if (dataPointCount >= 20) {
      confidence = 90;
    } else if (dataPointCount >= 15) {
      confidence = 80;
    } else if (dataPointCount >= 10) {
      confidence = 70;
    } else if (dataPointCount >= 5) {
      confidence = 55;
    } else {
      confidence = 40;
    }

    // Adjust based on variance
    const variance = this.historicalService.calculateVariance(snapshots);
    const cv = variance.coefficientOfVariation;

    if (cv < 0.15) {
      // Very consistent data - boost confidence
      confidence = Math.min(100, confidence + 10);
    } else if (cv < 0.2) {
      // Consistent data - slight boost
      confidence = Math.min(100, confidence + 5);
    } else if (cv >= 0.3 && cv < 0.4) {
      // Moderate variance - reduce confidence
      confidence *= 0.85;
    } else if (cv >= 0.4) {
      // High variance - significantly reduce confidence
      confidence *= 0.7;
    }

    // Consider trend stability
    const trend = this.historicalService.identifyTrend(snapshots);
    if (trend.direction === "stable") {
      confidence = Math.min(100, confidence + 5);
    } else if (trend.strength > 0.5) {
      // Strong trend (increasing or decreasing) - slightly reduce confidence
      confidence *= 0.95;
    }

    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Calculate number of days of historical data available
   * 
   * @param snapshots - Historical snapshots
   * @returns Number of days
   */
  private calculateHistoricalDays(snapshots: CrowdSnapshot[]): number {
    if (snapshots.length === 0) return 0;

    const timestamps = snapshots.map((s) => s.timestamp.getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);

    const daysDiff = (maxTime - minTime) / (1000 * 60 * 60 * 24);
    return Math.ceil(daysDiff);
  }

  /**
   * Get cached forecast if available and not expired
   * Requirements: 2.4
   * 
   * @param zoneId - Zone identifier
   * @param startTime - Start time of forecast window
   * @param windowHours - Forecast window in hours
   * @returns Cached forecast points or null
   */
  async getCachedForecast(
    zoneId: string,
    startTime: Date,
    windowHours: number = 2
  ): Promise<ForecastPoint[] | null> {
    try {
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + windowHours);

      // Query cached predictions within the time window
      const cachedPredictions = await this.db.predictionCache.findMany({
        where: {
          zoneId,
          predictedTime: {
            gte: startTime,
            lte: endTime,
          },
          expiresAt: {
            gt: new Date(), // Not expired
          },
        },
        orderBy: {
          predictedTime: "asc",
        },
      });

      // If we don't have enough cached predictions, return null
      const expectedPoints = (windowHours * 60) / 15; // 15-minute intervals
      if (cachedPredictions.length < expectedPoints * 0.8) {
        // Less than 80% coverage
        return null;
      }

      // Convert to ForecastPoint format
      // Note: We need to fetch zone name and capacity from a snapshot or pass it
      // For now, we'll fetch from the most recent snapshot
      const recentSnapshot = await this.db.crowdSnapshot.findFirst({
        where: { zoneId },
        orderBy: { timestamp: "desc" },
      });

      if (!recentSnapshot) {
        return null;
      }

      const forecastPoints: ForecastPoint[] = cachedPredictions.map((cached: PredictionCache) => ({
        zoneId: cached.zoneId,
        zoneName: recentSnapshot.zoneName,
        timestamp: cached.predictedTime,
        predictedFootfall: cached.predictedValue,
        confidence: Math.round(cached.confidence * 100),
        capacity: recentSnapshot.capacity,
      }));

      return forecastPoints;
    } catch (error) {
      // If cache retrieval fails, return null to trigger fresh generation
      console.error("Failed to retrieve cached forecast:", error);
      return null;
    }
  }

  /**
   * Cache predictions for future retrieval
   * Requirements: 2.4
   * 
   * @param predictions - Array of forecast points to cache
   */
  private async cachePredictions(predictions: ForecastPoint[]): Promise<void> {
    try {
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setMinutes(expiresAt.getMinutes() + this.CACHE_EXPIRATION_MINUTES);

      // Prepare cache records
      const cacheRecords = predictions.map((prediction) => ({
        zoneId: prediction.zoneId,
        predictedTime: prediction.timestamp,
        predictedValue: prediction.predictedFootfall,
        confidence: prediction.confidence / 100, // Store as 0-1
        generatedAt: now,
        expiresAt,
      }));

      // Batch insert cache records
      await this.db.predictionCache.createMany({
        data: cacheRecords,
        skipDuplicates: true,
      });
    } catch (error) {
      // Log error but don't throw - caching failure shouldn't break predictions
      console.error("Failed to cache predictions:", error);
    }
  }

  /**
   * Clean up expired prediction cache entries
   * Requirements: 2.4
   * 
   * Removes cache entries that have passed their expiration time
   * 
   * @returns Number of deleted records
   */
  async cleanupExpiredCache(): Promise<number> {
    try {
      const result = await this.db.predictionCache.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      return result.count;
    } catch (error) {
      throw new Error(
        `Failed to cleanup expired cache: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Invalidate cache for a specific zone
   * Requirements: 2.4
   * 
   * Removes all cached predictions for a zone to force regeneration
   * 
   * @param zoneId - Zone identifier
   * @returns Number of deleted records
   */
  async invalidateCache(zoneId: string): Promise<number> {
    try {
      const result = await this.db.predictionCache.deleteMany({
        where: { zoneId },
      });

      return result.count;
    } catch (error) {
      throw new Error(
        `Failed to invalidate cache: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Generate forecast for multiple zones
   * Requirements: 2.1, 2.2
   * 
   * @param zones - Array of zone information
   * @param startTime - Start time for forecast
   * @param options - Forecast generation options
   * @returns Map of zoneId to forecast points
   */
  async generateMultiZoneForecast(
    zones: Array<{ zoneId: string; zoneName: string; capacity: number }>,
    startTime: Date = new Date(),
    options: ForecastOptions = {}
  ): Promise<Map<string, ForecastPoint[]>> {
    const forecasts = new Map<string, ForecastPoint[]>();

    // Generate forecasts for each zone
    await Promise.all(
      zones.map(async (zone) => {
        try {
          const forecast = await this.generateForecast(
            zone.zoneId,
            zone.zoneName,
            zone.capacity,
            startTime,
            options
          );
          forecasts.set(zone.zoneId, forecast);
        } catch (error) {
          console.error(`Failed to generate forecast for zone ${zone.zoneId}:`, error);
          forecasts.set(zone.zoneId, []);
        }
      })
    );

    return forecasts;
  }

  /**
   * Check if confidence is below threshold (low confidence scenario)
   * Requirements: 2.5
   * 
   * @param confidence - Confidence score (0-100)
   * @param threshold - Threshold for low confidence (default: 60)
   * @returns True if confidence is low
   */
  isLowConfidence(confidence: number, threshold: number = 60): boolean {
    return confidence < threshold;
  }

  /**
   * Get confidence level description
   * Requirements: 2.3, 2.5
   * 
   * @param confidence - Confidence score (0-100)
   * @returns Human-readable confidence level
   */
  getConfidenceLevel(confidence: number): "high" | "medium" | "low" {
    if (confidence >= 80) return "high";
    if (confidence >= 60) return "medium";
    return "low";
  }
}
