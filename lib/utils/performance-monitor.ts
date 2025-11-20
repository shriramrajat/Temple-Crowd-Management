/**
 * Performance Monitoring Utility
 * 
 * Provides performance measurement and monitoring capabilities for the SOS system.
 * Tracks key metrics like location capture time, alert submission time, and UI responsiveness.
 * 
 * Requirements: 1.1, 1.2
 * Targets:
 * - Location capture: < 3 seconds
 * - Alert submission: < 5 seconds
 * - UI responsiveness: < 100ms
 * 
 * @module performance-monitor
 */

// ============================================================================
// Types and Interfaces
// ============================================================================

export enum PerformanceMetric {
  LOCATION_CAPTURE = 'location_capture',
  ALERT_SUBMISSION = 'alert_submission',
  UI_INTERACTION = 'ui_interaction',
  API_REQUEST = 'api_request',
  COMPONENT_RENDER = 'component_render',
}

export interface PerformanceMeasurement {
  metric: PerformanceMetric;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
  success: boolean;
  threshold?: number;
  exceededThreshold?: boolean;
}

export interface PerformanceThresholds {
  [PerformanceMetric.LOCATION_CAPTURE]: number; // 3000ms
  [PerformanceMetric.ALERT_SUBMISSION]: number; // 5000ms
  [PerformanceMetric.UI_INTERACTION]: number; // 100ms
  [PerformanceMetric.API_REQUEST]: number; // 5000ms
  [PerformanceMetric.COMPONENT_RENDER]: number; // 100ms
}

export interface PerformanceReport {
  metric: PerformanceMetric;
  measurements: PerformanceMeasurement[];
  average: number;
  min: number;
  max: number;
  p95: number;
  successRate: number;
  thresholdViolations: number;
}

// ============================================================================
// Configuration
// ============================================================================

const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  [PerformanceMetric.LOCATION_CAPTURE]: 3000, // 3 seconds
  [PerformanceMetric.ALERT_SUBMISSION]: 5000, // 5 seconds
  [PerformanceMetric.UI_INTERACTION]: 100, // 100ms
  [PerformanceMetric.API_REQUEST]: 5000, // 5 seconds
  [PerformanceMetric.COMPONENT_RENDER]: 100, // 100ms
};

const MAX_MEASUREMENTS = 100; // Keep last 100 measurements per metric

// ============================================================================
// Storage
// ============================================================================

class PerformanceStore {
  private measurements: Map<PerformanceMetric, PerformanceMeasurement[]> = new Map();

  addMeasurement(measurement: PerformanceMeasurement): void {
    const metricMeasurements = this.measurements.get(measurement.metric) || [];
    metricMeasurements.push(measurement);

    // Keep only last MAX_MEASUREMENTS
    if (metricMeasurements.length > MAX_MEASUREMENTS) {
      metricMeasurements.shift();
    }

    this.measurements.set(measurement.metric, metricMeasurements);
  }

  getMeasurements(metric: PerformanceMetric): PerformanceMeasurement[] {
    return this.measurements.get(metric) || [];
  }

  getAllMeasurements(): Map<PerformanceMetric, PerformanceMeasurement[]> {
    return this.measurements;
  }

  clear(metric?: PerformanceMetric): void {
    if (metric) {
      this.measurements.delete(metric);
    } else {
      this.measurements.clear();
    }
  }
}

const performanceStore = new PerformanceStore();

// ============================================================================
// Performance Measurement
// ============================================================================

/**
 * Start a performance measurement
 * Returns a function to end the measurement
 */
export function startMeasurement(
  metric: PerformanceMetric,
  metadata?: Record<string, unknown>
): (success?: boolean) => void {
  const startTime = performance.now();
  const startTimestamp = Date.now();

  return (success: boolean = true) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    const threshold = PERFORMANCE_THRESHOLDS[metric];
    const exceededThreshold = duration > threshold;

    const measurement: PerformanceMeasurement = {
      metric,
      duration,
      timestamp: startTimestamp,
      metadata,
      success,
      threshold,
      exceededThreshold,
    };

    performanceStore.addMeasurement(measurement);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const status = exceededThreshold ? '⚠️ SLOW' : '✓';
      console.log(
        `${status} [${metric}] ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`,
        metadata
      );
    }

    // Log errors in production
    if (process.env.NODE_ENV === 'production' && exceededThreshold) {
      logPerformanceIssue(measurement);
    }
  };
}

/**
 * Measure an async function
 */
export async function measureAsync<T>(
  metric: PerformanceMetric,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const endMeasurement = startMeasurement(metric, metadata);
  
  try {
    const result = await fn();
    endMeasurement(true);
    return result;
  } catch (error) {
    endMeasurement(false);
    throw error;
  }
}

/**
 * Measure a synchronous function
 */
export function measureSync<T>(
  metric: PerformanceMetric,
  fn: () => T,
  metadata?: Record<string, unknown>
): T {
  const endMeasurement = startMeasurement(metric, metadata);
  
  try {
    const result = fn();
    endMeasurement(true);
    return result;
  } catch (error) {
    endMeasurement(false);
    throw error;
  }
}

// ============================================================================
// Performance Reporting
// ============================================================================

/**
 * Calculate statistics for a set of measurements
 */
function calculateStats(measurements: PerformanceMeasurement[]): {
  average: number;
  min: number;
  max: number;
  p95: number;
  successRate: number;
  thresholdViolations: number;
} {
  if (measurements.length === 0) {
    return {
      average: 0,
      min: 0,
      max: 0,
      p95: 0,
      successRate: 0,
      thresholdViolations: 0,
    };
  }

  const durations = measurements.map(m => m.duration).sort((a, b) => a - b);
  const successCount = measurements.filter(m => m.success).length;
  const thresholdViolations = measurements.filter(m => m.exceededThreshold).length;

  const sum = durations.reduce((acc, d) => acc + d, 0);
  const average = sum / durations.length;
  const min = durations[0];
  const max = durations[durations.length - 1];
  const p95Index = Math.floor(durations.length * 0.95);
  const p95 = durations[p95Index] || max;
  const successRate = (successCount / measurements.length) * 100;

  return {
    average,
    min,
    max,
    p95,
    successRate,
    thresholdViolations,
  };
}

/**
 * Get performance report for a specific metric
 */
export function getPerformanceReport(metric: PerformanceMetric): PerformanceReport {
  const measurements = performanceStore.getMeasurements(metric);
  const stats = calculateStats(measurements);

  return {
    metric,
    measurements,
    ...stats,
  };
}

/**
 * Get performance reports for all metrics
 */
export function getAllPerformanceReports(): PerformanceReport[] {
  const reports: PerformanceReport[] = [];
  
  for (const metric of Object.values(PerformanceMetric)) {
    reports.push(getPerformanceReport(metric));
  }

  return reports;
}

/**
 * Get performance summary
 */
export function getPerformanceSummary(): {
  totalMeasurements: number;
  criticalIssues: number;
  averageResponseTime: number;
  reports: PerformanceReport[];
} {
  const reports = getAllPerformanceReports();
  const totalMeasurements = reports.reduce((sum, r) => sum + r.measurements.length, 0);
  const criticalIssues = reports.reduce((sum, r) => sum + r.thresholdViolations, 0);
  
  const allDurations = reports.flatMap(r => r.measurements.map(m => m.duration));
  const averageResponseTime = allDurations.length > 0
    ? allDurations.reduce((sum, d) => sum + d, 0) / allDurations.length
    : 0;

  return {
    totalMeasurements,
    criticalIssues,
    averageResponseTime,
    reports,
  };
}

// ============================================================================
// Error Logging
// ============================================================================

/**
 * Log performance issue for production debugging
 */
function logPerformanceIssue(measurement: PerformanceMeasurement): void {
  const errorData = {
    type: 'performance_issue',
    metric: measurement.metric,
    duration: measurement.duration,
    threshold: measurement.threshold,
    timestamp: measurement.timestamp,
    metadata: measurement.metadata,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
  };

  // In production, this would send to a logging service
  // For now, we'll use console.error
  console.error('[Performance Issue]', errorData);

  // Store in localStorage for debugging
  try {
    const existingLogs = localStorage.getItem('performance_logs');
    const logs = existingLogs ? JSON.parse(existingLogs) : [];
    logs.push(errorData);
    
    // Keep only last 50 logs
    if (logs.length > 50) {
      logs.shift();
    }
    
    localStorage.setItem('performance_logs', JSON.stringify(logs));
  } catch (error) {
    // Ignore storage errors
  }
}

/**
 * Get performance logs from localStorage
 */
export function getPerformanceLogs(): unknown[] {
  try {
    const logs = localStorage.getItem('performance_logs');
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    return [];
  }
}

/**
 * Clear performance logs
 */
export function clearPerformanceLogs(): void {
  try {
    localStorage.removeItem('performance_logs');
  } catch (error) {
    // Ignore storage errors
  }
}

// ============================================================================
// React Hook
// ============================================================================

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor() {
  return {
    startMeasurement,
    measureAsync,
    measureSync,
    getPerformanceReport,
    getAllPerformanceReports,
    getPerformanceSummary,
    getPerformanceLogs,
    clearPerformanceLogs,
  };
}

// ============================================================================
// Exports
// ============================================================================

export { performanceStore, PERFORMANCE_THRESHOLDS };
