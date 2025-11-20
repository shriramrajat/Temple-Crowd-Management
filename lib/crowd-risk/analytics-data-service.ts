/**
 * Analytics Data Service
 * 
 * Provides historical density data and alert statistics for analytics dashboard.
 * Requirements: 1.1, 1.4
 */

import {
  DensityReading,
  AlertEvent,
  ThresholdLevel,
  DensityHistoryEntry,
} from './types';
import { getAlertEngine } from './alert-engine';
import { getDensityMonitor } from './density-monitor';

/**
 * Time range options for historical data
 */
export type TimeRange = '1h' | '6h' | '24h' | '7d';

/**
 * Density history data point for charting
 */
export interface DensityDataPoint {
  timestamp: number;
  areaId: string;
  areaName: string;
  densityValue: number;
  thresholdLevel: ThresholdLevel;
}

/**
 * Alert frequency statistics
 */
export interface AlertFrequencyStats {
  areaId: string;
  areaName: string;
  totalAlerts: number;
  byLevel: Record<ThresholdLevel, number>;
  lastAlertTime?: number;
}

/**
 * Threshold breach event for timeline
 */
export interface ThresholdBreachEvent {
  id: string;
  timestamp: number;
  areaId: string;
  areaName: string;
  level: ThresholdLevel;
  densityValue: number;
  threshold: number;
}

/**
 * Export data format
 */
export interface ExportData {
  exportDate: string;
  timeRange: TimeRange;
  densityHistory: DensityDataPoint[];
  alerts: AlertEvent[];
  breachEvents: ThresholdBreachEvent[];
  statistics: {
    totalAlerts: number;
    alertsByLevel: Record<ThresholdLevel, number>;
    alertsByArea: AlertFrequencyStats[];
  };
}

/**
 * Analytics Data Service
 * 
 * Requirement 1.1: Historical density tracking
 * Requirement 1.4: Alert history and statistics
 */
export class AnalyticsDataService {
  private densityHistory: Map<string, DensityHistoryEntry[]> = new Map();
  private readonly MAX_HISTORY_ENTRIES = 10000;

  /**
   * Record a density reading for historical tracking
   */
  recordDensityReading(
    reading: DensityReading,
    thresholdLevel: ThresholdLevel
  ): void {
    const history = this.densityHistory.get(reading.areaId) || [];
    
    const entry: DensityHistoryEntry = {
      areaId: reading.areaId,
      timestamp: reading.timestamp,
      densityValue: reading.densityValue,
      thresholdLevel,
    };
    
    history.push(entry);
    
    // Limit history size
    if (history.length > this.MAX_HISTORY_ENTRIES) {
      history.shift();
    }
    
    this.densityHistory.set(reading.areaId, history);
  }

  /**
   * Get density history for specified time range
   * 
   * Requirement 1.1: Historical density data retrieval
   */
  async getDensityHistory(
    areaIds: string[],
    timeRange: TimeRange,
    areaNames?: Map<string, string>
  ): Promise<DensityDataPoint[]> {
    const now = Date.now();
    const startTime = this.getStartTimeForRange(now, timeRange);
    
    const dataPoints: DensityDataPoint[] = [];
    
    for (const areaId of areaIds) {
      const history = this.densityHistory.get(areaId) || [];
      const areaName = areaNames?.get(areaId) || areaId;
      
      const filteredHistory = history.filter(
        entry => entry.timestamp >= startTime && entry.timestamp <= now
      );
      
      for (const entry of filteredHistory) {
        dataPoints.push({
          timestamp: entry.timestamp,
          areaId: entry.areaId,
          areaName,
          densityValue: entry.densityValue,
          thresholdLevel: entry.thresholdLevel,
        });
      }
    }
    
    // Sort by timestamp
    return dataPoints.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get threshold breach events for timeline visualization
   * 
   * Requirement 1.4: Alert history for breach timeline
   */
  async getThresholdBreaches(
    areaIds: string[],
    timeRange: TimeRange,
    areaNames?: Map<string, string>
  ): Promise<ThresholdBreachEvent[]> {
    const alertEngine = getAlertEngine();
    const now = Date.now();
    const startTime = this.getStartTimeForRange(now, timeRange);
    
    const breaches: ThresholdBreachEvent[] = [];
    
    for (const areaId of areaIds) {
      const alerts = await alertEngine.getAlertHistory(areaId, 1000);
      const areaName = areaNames?.get(areaId) || areaId;
      
      const filteredAlerts = alerts.filter(
        alert =>
          alert.timestamp >= startTime &&
          alert.timestamp <= now &&
          alert.type === 'threshold_violation'
      );
      
      for (const alert of filteredAlerts) {
        breaches.push({
          id: alert.id,
          timestamp: alert.timestamp,
          areaId: alert.areaId,
          areaName,
          level: alert.severity,
          densityValue: alert.densityValue,
          threshold: alert.threshold,
        });
      }
    }
    
    // Sort by timestamp
    return breaches.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get alert frequency statistics by area and severity
   * 
   * Requirement 1.4: Alert frequency statistics
   */
  async getAlertFrequencyStats(
    areaIds: string[],
    timeRange: TimeRange,
    areaNames?: Map<string, string>
  ): Promise<AlertFrequencyStats[]> {
    const alertEngine = getAlertEngine();
    const now = Date.now();
    const startTime = this.getStartTimeForRange(now, timeRange);
    
    const stats: AlertFrequencyStats[] = [];
    
    for (const areaId of areaIds) {
      const alerts = await alertEngine.getAlertHistory(areaId, 1000);
      const areaName = areaNames?.get(areaId) || areaId;
      
      const filteredAlerts = alerts.filter(
        alert => alert.timestamp >= startTime && alert.timestamp <= now
      );
      
      const byLevel: Record<ThresholdLevel, number> = {
        [ThresholdLevel.NORMAL]: 0,
        [ThresholdLevel.WARNING]: 0,
        [ThresholdLevel.CRITICAL]: 0,
        [ThresholdLevel.EMERGENCY]: 0,
      };
      
      let lastAlertTime: number | undefined;
      
      for (const alert of filteredAlerts) {
        byLevel[alert.severity]++;
        if (!lastAlertTime || alert.timestamp > lastAlertTime) {
          lastAlertTime = alert.timestamp;
        }
      }
      
      stats.push({
        areaId,
        areaName,
        totalAlerts: filteredAlerts.length,
        byLevel,
        lastAlertTime,
      });
    }
    
    // Sort by total alerts descending
    return stats.sort((a, b) => b.totalAlerts - a.totalAlerts);
  }

  /**
   * Export analytics data for download
   * 
   * Requirement: Add export functionality for historical data
   */
  async exportData(
    areaIds: string[],
    timeRange: TimeRange,
    areaNames?: Map<string, string>
  ): Promise<ExportData> {
    const alertEngine = getAlertEngine();
    const now = Date.now();
    const startTime = this.getStartTimeForRange(now, timeRange);
    
    // Get density history
    const densityHistory = await this.getDensityHistory(areaIds, timeRange, areaNames);
    
    // Get all alerts
    const allAlerts: AlertEvent[] = [];
    for (const areaId of areaIds) {
      const alerts = await alertEngine.getAlertHistory(areaId, 1000);
      const filteredAlerts = alerts.filter(
        alert => alert.timestamp >= startTime && alert.timestamp <= now
      );
      allAlerts.push(...filteredAlerts);
    }
    
    // Get breach events
    const breachEvents = await this.getThresholdBreaches(areaIds, timeRange, areaNames);
    
    // Calculate statistics
    const alertsByLevel: Record<ThresholdLevel, number> = {
      [ThresholdLevel.NORMAL]: 0,
      [ThresholdLevel.WARNING]: 0,
      [ThresholdLevel.CRITICAL]: 0,
      [ThresholdLevel.EMERGENCY]: 0,
    };
    
    for (const alert of allAlerts) {
      alertsByLevel[alert.severity]++;
    }
    
    const alertsByArea = await this.getAlertFrequencyStats(areaIds, timeRange, areaNames);
    
    return {
      exportDate: new Date().toISOString(),
      timeRange,
      densityHistory,
      alerts: allAlerts.sort((a, b) => a.timestamp - b.timestamp),
      breachEvents,
      statistics: {
        totalAlerts: allAlerts.length,
        alertsByLevel,
        alertsByArea,
      },
    };
  }

  /**
   * Get start timestamp for time range
   */
  private getStartTimeForRange(now: number, timeRange: TimeRange): number {
    switch (timeRange) {
      case '1h':
        return now - 60 * 60 * 1000;
      case '6h':
        return now - 6 * 60 * 60 * 1000;
      case '24h':
        return now - 24 * 60 * 60 * 1000;
      case '7d':
        return now - 7 * 24 * 60 * 60 * 1000;
      default:
        return now - 24 * 60 * 60 * 1000;
    }
  }

  /**
   * Clear all history data
   */
  clearHistory(): void {
    this.densityHistory.clear();
  }

  /**
   * Get statistics about stored data
   */
  getStorageStats() {
    let totalEntries = 0;
    for (const history of this.densityHistory.values()) {
      totalEntries += history.length;
    }
    
    return {
      areasTracked: this.densityHistory.size,
      totalEntries,
      maxEntriesPerArea: this.MAX_HISTORY_ENTRIES,
    };
  }
}

/**
 * Singleton instance
 */
let analyticsDataServiceInstance: AnalyticsDataService | null = null;

/**
 * Get or create the singleton instance
 */
export function getAnalyticsDataService(): AnalyticsDataService {
  if (!analyticsDataServiceInstance) {
    analyticsDataServiceInstance = new AnalyticsDataService();
  }
  return analyticsDataServiceInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetAnalyticsDataService(): void {
  analyticsDataServiceInstance = null;
}
