/**
 * Performance Monitoring Utility
 * 
 * Tracks performance metrics for the crowd risk system to ensure
 * optimization targets are met.
 * 
 * Requirements:
 * - 17.1: Profile and optimize real-time data processing
 * - 1.1: Process density readings within 2 seconds
 * - 4.4: Sub-2-second state updates
 */

interface PerformanceMetric {
  name: string
  duration: number
  timestamp: number
  metadata?: Record<string, unknown>
}

interface PerformanceStats {
  count: number
  totalDuration: number
  averageDuration: number
  minDuration: number
  maxDuration: number
  p95Duration: number
  p99Duration: number
}

/**
 * Performance Monitor for tracking system performance
 */
export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map()
  private maxMetricsPerType = 1000 // Keep last 1000 metrics per type
  private enabled = true

  /**
   * Start a performance measurement
   * 
   * @param name - Name of the operation being measured
   * @returns Function to end the measurement
   */
  startMeasurement(name: string, metadata?: Record<string, unknown>): () => void {
    if (!this.enabled) {
      return () => {} // No-op if disabled
    }

    const startTime = performance.now()
    const startTimestamp = Date.now()

    return () => {
      const duration = performance.now() - startTime
      this.recordMetric({
        name,
        duration,
        timestamp: startTimestamp,
        metadata,
      })
    }
  }

  /**
   * Record a performance metric
   * 
   * @param metric - Performance metric to record
   */
  private recordMetric(metric: PerformanceMetric): void {
    const metrics = this.metrics.get(metric.name) || []
    metrics.push(metric)

    // Keep only the most recent metrics
    if (metrics.length > this.maxMetricsPerType) {
      metrics.shift()
    }

    this.metrics.set(metric.name, metrics)

    // Log warning if metric exceeds threshold
    this.checkThresholds(metric)
  }

  /**
   * Check if metric exceeds performance thresholds
   * 
   * @param metric - Metric to check
   */
  private checkThresholds(metric: PerformanceMetric): void {
    const thresholds: Record<string, number> = {
      'density-processing': 2000, // 2 seconds (Requirement 1.1)
      'threshold-evaluation': 2000, // 2 seconds (Requirement 1.1)
      'alert-generation': 2000, // 2 seconds
      'indicator-update': 2000, // 2 seconds (Requirement 4.4)
      'notification-delivery': 3000, // 3 seconds (admin)
      'pilgrim-notification': 5000, // 5 seconds
      'config-update': 10000, // 10 seconds (Requirement 6.3)
    }

    const threshold = thresholds[metric.name]
    if (threshold && metric.duration > threshold) {
      console.warn(`Performance threshold exceeded for ${metric.name}:`, {
        duration: metric.duration,
        threshold,
        metadata: metric.metadata,
      })
    }
  }

  /**
   * Get statistics for a specific metric type
   * 
   * @param name - Name of the metric type
   * @returns Performance statistics
   */
  getStats(name: string): PerformanceStats | null {
    const metrics = this.metrics.get(name)
    if (!metrics || metrics.length === 0) {
      return null
    }

    const durations = metrics.map(m => m.duration).sort((a, b) => a - b)
    const count = durations.length
    const totalDuration = durations.reduce((sum, d) => sum + d, 0)

    return {
      count,
      totalDuration,
      averageDuration: totalDuration / count,
      minDuration: durations[0],
      maxDuration: durations[count - 1],
      p95Duration: durations[Math.floor(count * 0.95)],
      p99Duration: durations[Math.floor(count * 0.99)],
    }
  }

  /**
   * Get all performance statistics
   * 
   * @returns Map of metric names to statistics
   */
  getAllStats(): Map<string, PerformanceStats> {
    const stats = new Map<string, PerformanceStats>()

    for (const [name] of this.metrics) {
      const metricStats = this.getStats(name)
      if (metricStats) {
        stats.set(name, metricStats)
      }
    }

    return stats
  }

  /**
   * Get recent metrics for a specific type
   * 
   * @param name - Name of the metric type
   * @param limit - Maximum number of metrics to return
   * @returns Array of recent metrics
   */
  getRecentMetrics(name: string, limit: number = 10): PerformanceMetric[] {
    const metrics = this.metrics.get(name) || []
    return metrics.slice(-limit)
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear()
  }

  /**
   * Clear metrics for a specific type
   * 
   * @param name - Name of the metric type to clear
   */
  clearMetric(name: string): void {
    this.metrics.delete(name)
  }

  /**
   * Enable or disable performance monitoring
   * 
   * @param enabled - Whether to enable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  /**
   * Check if monitoring is enabled
   * 
   * @returns True if monitoring is enabled
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Get a summary of all performance metrics
   * 
   * @returns Summary object with key metrics
   */
  getSummary(): {
    totalMetrics: number
    metricTypes: number
    slowestOperations: Array<{ name: string; duration: number }>
  } {
    let totalMetrics = 0
    const slowestOps: Array<{ name: string; duration: number }> = []

    for (const [name, metrics] of this.metrics) {
      totalMetrics += metrics.length

      const stats = this.getStats(name)
      if (stats) {
        slowestOps.push({
          name,
          duration: stats.maxDuration,
        })
      }
    }

    // Sort by duration descending
    slowestOps.sort((a, b) => b.duration - a.duration)

    return {
      totalMetrics,
      metricTypes: this.metrics.size,
      slowestOperations: slowestOps.slice(0, 5), // Top 5 slowest
    }
  }
}

/**
 * Singleton instance for global use
 */
let performanceMonitorInstance: PerformanceMonitor | null = null

/**
 * Get or create the singleton PerformanceMonitor instance
 */
export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitorInstance) {
    performanceMonitorInstance = new PerformanceMonitor()
  }
  return performanceMonitorInstance
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetPerformanceMonitor(): void {
  performanceMonitorInstance = null
}

/**
 * Decorator function to measure performance of async functions
 * 
 * @param metricName - Name of the metric
 * @returns Decorator function
 */
export function measurePerformance(metricName: string) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const monitor = getPerformanceMonitor()
      const endMeasurement = monitor.startMeasurement(metricName, {
        method: propertyKey,
      })

      try {
        const result = await originalMethod.apply(this, args)
        return result
      } finally {
        endMeasurement()
      }
    }

    return descriptor
  }
}

/**
 * Utility function to measure a synchronous operation
 * 
 * @param name - Name of the operation
 * @param fn - Function to measure
 * @returns Result of the function
 */
export function measureSync<T>(name: string, fn: () => T): T {
  const monitor = getPerformanceMonitor()
  const endMeasurement = monitor.startMeasurement(name)

  try {
    return fn()
  } finally {
    endMeasurement()
  }
}

/**
 * Utility function to measure an async operation
 * 
 * @param name - Name of the operation
 * @param fn - Async function to measure
 * @returns Promise with result of the function
 */
export async function measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const monitor = getPerformanceMonitor()
  const endMeasurement = monitor.startMeasurement(name)

  try {
    return await fn()
  } finally {
    endMeasurement()
  }
}
