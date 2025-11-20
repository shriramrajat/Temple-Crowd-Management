/**
 * Density Monitor Service
 * 
 * Continuously receives and processes crowd density data with real-time monitoring.
 * Requirements: 1.1, 1.5
 */

import { DensityReading, DensityUnit, DensityMonitor as IDensityMonitor } from './types';
import { DensityReadingSchema } from './schemas';
import { getErrorHandler } from './error-handler';
import { getDensitySimulator } from './density-simulator';

/**
 * Rolling window entry for normalization detection
 */
interface WindowEntry {
  timestamp: number;
  densityValue: number;
  belowThreshold: boolean;
}

/**
 * DensityMonitor implementation
 * 
 * Requirement 1.1: Process density readings within 2 seconds
 * Requirement 1.5: Timestamp with millisecond precision
 */
export class DensityMonitor implements IDensityMonitor {
  private monitoredAreas: Set<string> = new Set();
  private currentDensities: Map<string, DensityReading> = new Map();
  private densityWindows: Map<string, WindowEntry[]> = new Map();
  private subscribers: Set<(reading: DensityReading) => void> = new Set();
  private mockDataIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();
  
  // 30-second rolling window for normalization detection (Requirement 1.4)
  private readonly NORMALIZATION_WINDOW_MS = 30000;
  
  /**
   * Start monitoring specified areas
   * Requirement 1.1: Real-time density monitoring
   */
  startMonitoring(areaIds: string[]): void {
    for (const areaId of areaIds) {
      if (!this.monitoredAreas.has(areaId)) {
        this.monitoredAreas.add(areaId);
        this.densityWindows.set(areaId, []);
        
        // Start mock data stream for development
        this.startMockDataStream(areaId);
      }
    }
  }
  
  /**
   * Stop monitoring a specific area
   */
  stopMonitoring(areaId: string): void {
    this.monitoredAreas.delete(areaId);
    this.currentDensities.delete(areaId);
    this.densityWindows.delete(areaId);
    
    // Stop mock data stream
    const interval = this.mockDataIntervals.get(areaId);
    if (interval) {
      clearInterval(interval);
      this.mockDataIntervals.delete(areaId);
    }
  }
  
  /**
   * Get current density reading for an area
   * Requirement 1.1: Current density retrieval
   */
  async getCurrentDensity(areaId: string): Promise<DensityReading | null> {
    return this.currentDensities.get(areaId) || null;
  }
  
  /**
   * Subscribe to density updates
   * Requirement 1.1: Real-time density update notifications
   * 
   * @returns Unsubscribe function
   */
  onDensityUpdate(callback: (reading: DensityReading) => void): () => void {
    this.subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }
  
  /**
   * Process incoming density reading
   * Requirement 1.1: Process within 2 seconds
   * Requirement 1.5: Millisecond precision timestamp validation
   * Optimized: Added performance monitoring
   */
  processDensityReading(reading: DensityReading): void {
    const startTime = Date.now();
    const errorHandler = getErrorHandler();
    
    try {
      // Validate reading
      const validation = DensityReadingSchema.safeParse(reading);
      if (!validation.success) {
        const error = new Error('Invalid density reading schema');
        errorHandler.handleDataStreamError(error, reading.areaId, {
          validationError: validation.error,
          reading,
        });
        return;
      }
      
      const validatedReading = validation.data;
      
      // Validate timestamp is not in the future
      const now = Date.now();
      if (validatedReading.timestamp > now) {
        const error = new Error('Density reading timestamp is in the future');
        errorHandler.handleDataStreamError(error, validatedReading.areaId, {
          timestamp: validatedReading.timestamp,
          now,
        });
        return;
      }
      
      // Validate timestamp is not too old (more than 1 minute)
      if (now - validatedReading.timestamp > 60000) {
        console.warn('Density reading timestamp is stale:', {
          timestamp: validatedReading.timestamp,
          age: now - validatedReading.timestamp,
        });
      }
      
      // Store current density
      this.currentDensities.set(validatedReading.areaId, validatedReading);
      
      // Store as last known good state
      errorHandler.storeLastKnownGoodState(
        `density-${validatedReading.areaId}`,
        validatedReading
      );
      
      // Clear stale data indicator on successful processing
      errorHandler.clearStaleDataIndicator(validatedReading.areaId);
      
      // Update rolling window for normalization detection
      this.updateRollingWindow(validatedReading.areaId, validatedReading);
      
      // Notify all subscribers
      this.notifySubscribers(validatedReading);
      
      // Ensure processing completes within 2 seconds (Requirement 1.1)
      const processingTime = Date.now() - startTime;
      if (processingTime > 2000) {
        console.warn('Density reading processing exceeded 2 seconds:', {
          areaId: validatedReading.areaId,
          processingTime,
        });
      }
    } catch (error) {
      errorHandler.handleDataStreamError(
        error instanceof Error ? error : new Error('Unknown error processing density reading'),
        reading.areaId,
        { reading, processingTime: Date.now() - startTime }
      );
    }
  }
  
  /**
   * Update 30-second rolling window for normalization detection
   * Requirement 1.4: 30-second rolling window
   * Optimized: Avoid unnecessary array filtering by removing old entries efficiently
   * Performance: O(n) where n is number of old entries to remove (typically small)
   * Task 17.1: Implement efficient density calculation algorithms
   */
  private updateRollingWindow(areaId: string, reading: DensityReading): void {
    let window = this.densityWindows.get(areaId);
    const now = reading.timestamp;
    const cutoffTime = now - this.NORMALIZATION_WINDOW_MS;
    
    // Initialize window if it doesn't exist
    if (!window) {
      window = [];
      this.densityWindows.set(areaId, window);
    }
    
    // Remove old entries from the beginning (they're ordered by timestamp)
    // This is more efficient than filtering the entire array
    // Only remove if there are old entries to avoid unnecessary operations
    if (window.length > 0 && window[0].timestamp < cutoffTime) {
      let startIndex = 0;
      while (startIndex < window.length && window[startIndex].timestamp < cutoffTime) {
        startIndex++;
      }
      
      // Mutate array in place for better performance (avoid creating new array)
      window.splice(0, startIndex);
    }
    
    // Add new entry (belowThreshold will be set by threshold evaluator)
    window.push({
      timestamp: now,
      densityValue: reading.densityValue,
      belowThreshold: false, // Will be updated by threshold evaluator
    });
    
    // Limit window size to prevent unbounded growth (max 30 seconds at 2s intervals = ~15 entries)
    // Add buffer for safety
    if (window.length > 20) {
      window.splice(0, window.length - 20);
    }
  }
  
  /**
   * Check if density has been below threshold for 30 consecutive seconds
   * Requirement 1.4: Normalization detection
   * Optimized: Avoid filtering by checking entries in reverse order
   * Performance: O(n) but typically exits early
   * Task 17.1: Optimized with early exit and minimal iterations
   */
  isNormalized(areaId: string): boolean {
    const window = this.densityWindows.get(areaId);
    if (!window || window.length === 0) {
      return false;
    }
    
    const now = Date.now();
    const cutoffTime = now - this.NORMALIZATION_WINDOW_MS;
    
    // Count recent entries and check if all are below threshold
    // Iterate in reverse for better cache locality with recent data
    let recentCount = 0;
    
    // Early exit optimization: if we find any entry not below threshold, return immediately
    for (let i = window.length - 1; i >= 0; i--) {
      const entry = window[i];
      
      // Stop when we reach entries older than cutoff
      if (entry.timestamp < cutoffTime) {
        break;
      }
      
      recentCount++;
      
      // Early exit: If any recent entry is not below threshold, not normalized
      if (!entry.belowThreshold) {
        return false;
      }
    }
    
    // Need at least 3 data points to confirm normalization (6 seconds of data at 2s intervals)
    return recentCount >= 3;
  }
  
  /**
   * Update threshold status for rolling window entries
   * Called by threshold evaluator to mark entries as below/above threshold
   */
  updateThresholdStatus(areaId: string, belowThreshold: boolean): void {
    const window = this.densityWindows.get(areaId);
    if (!window || window.length === 0) {
      return;
    }
    
    // Update the most recent entry
    const lastEntry = window[window.length - 1];
    if (lastEntry) {
      lastEntry.belowThreshold = belowThreshold;
    }
  }
  
  /**
   * Notify all subscribers of density update
   * Optimized: Use Array.from for better performance with Set iteration
   */
  private notifySubscribers(reading: DensityReading): void {
    const errorHandler = getErrorHandler();
    const subscribers = Array.from(this.subscribers);
    
    for (const callback of subscribers) {
      try {
        callback(reading);
      } catch (error) {
        errorHandler.handleSystemError(
          error instanceof Error ? error : new Error('Unknown error in density subscriber'),
          'density-subscriber-notification',
          { areaId: reading.areaId }
        );
      }
    }
  }
  
  /**
   * Start mock density data stream for development
   * Requirement: Set up mock density data stream for development
   * Integrated with DensitySimulator for realistic patterns (Task 16.1)
   */
  private startMockDataStream(areaId: string): void {
    // Generate mock data every 2 seconds
    const interval = setInterval(() => {
      const mockReading = this.generateMockDensityReading(areaId);
      this.processDensityReading(mockReading);
    }, 2000);
    
    this.mockDataIntervals.set(areaId, interval);
    
    // Generate initial reading immediately
    const initialReading = this.generateMockDensityReading(areaId);
    this.processDensityReading(initialReading);
  }
  
  /**
   * Generate mock density reading for development and testing
   * Uses DensitySimulator for realistic patterns (Task 16.1)
   */
  private generateMockDensityReading(areaId: string): DensityReading {
    const simulator = getDensitySimulator();
    return simulator.generateReading(areaId);
  }
  
  /**
   * Trigger a mock threshold violation for testing
   * Useful for development and testing alert flows
   */
  triggerMockViolation(areaId: string, densityValue: number): void {
    const mockReading: DensityReading = {
      areaId,
      timestamp: Date.now(),
      densityValue,
      unit: DensityUnit.PEOPLE_PER_SQM,
      metadata: {
        source: 'mock-violation',
        triggeredAt: new Date().toISOString(),
      },
    };
    
    this.processDensityReading(mockReading);
  }
  
  /**
   * Configure density pattern for an area using the simulator
   * Task 16.1: Integrate simulator with DensityMonitor for development mode
   * 
   * @param areaId - Area identifier
   * @param pattern - Pattern type ('normal', 'peak_hour', 'threshold_violation', 'normalization', 'spike')
   * @param targetDensity - Optional target density value
   * @param duration - Optional duration in milliseconds
   */
  configureSimulatorPattern(
    areaId: string,
    pattern: 'normal' | 'peak_hour' | 'threshold_violation' | 'normalization' | 'spike',
    targetDensity?: number,
    duration?: number
  ): void {
    const simulator = getDensitySimulator();
    simulator.configurePattern({
      areaId,
      pattern: pattern as any,
      targetDensity,
      duration,
    });
  }
  
  /**
   * Trigger a density spike for testing
   * Task 16.1: Add controllable density spike triggers
   * 
   * @param areaId - Area identifier
   * @param targetDensity - Target density value
   * @param duration - Duration of spike in milliseconds (default: 30000)
   */
  triggerDensitySpike(areaId: string, targetDensity: number, duration?: number): void {
    const simulator = getDensitySimulator();
    simulator.triggerSpike(areaId, targetDensity, duration);
  }
  
  /**
   * Trigger a threshold violation scenario
   * Task 16.1: Implement threshold violation scenarios
   * 
   * @param areaId - Area identifier
   * @param level - Threshold level ('warning', 'critical', 'emergency')
   */
  triggerThresholdViolationScenario(areaId: string, level: 'warning' | 'critical' | 'emergency'): void {
    const simulator = getDensitySimulator();
    simulator.triggerThresholdViolation(areaId, level);
  }
  
  /**
   * Trigger a normalization scenario
   * Task 16.1: Implement normalization scenarios
   * 
   * @param areaId - Area identifier
   * @param targetDensity - Target normal density (default: 0.3)
   */
  triggerNormalizationScenario(areaId: string, targetDensity?: number): void {
    const simulator = getDensitySimulator();
    simulator.triggerNormalization(areaId, targetDensity);
  }
  
  /**
   * Reset simulator pattern for an area
   * 
   * @param areaId - Area identifier
   */
  resetSimulatorPattern(areaId: string): void {
    const simulator = getDensitySimulator();
    simulator.resetPattern(areaId);
  }
  
  /**
   * Get all monitored area IDs
   */
  getMonitoredAreas(): string[] {
    return Array.from(this.monitoredAreas);
  }
  
  /**
   * Get rolling window data for an area (for debugging/monitoring)
   */
  getWindowData(areaId: string): WindowEntry[] {
    return this.densityWindows.get(areaId) || [];
  }
  
  /**
   * Clean up all resources
   */
  destroy(): void {
    // Stop all mock data streams
    for (const [areaId] of this.mockDataIntervals) {
      this.stopMonitoring(areaId);
    }
    
    // Clear all data
    this.monitoredAreas.clear();
    this.currentDensities.clear();
    this.densityWindows.clear();
    this.subscribers.clear();
  }
}

// Singleton instance for global use
let densityMonitorInstance: DensityMonitor | null = null;

/**
 * Get or create the singleton DensityMonitor instance
 */
export function getDensityMonitor(): DensityMonitor {
  if (!densityMonitorInstance) {
    densityMonitorInstance = new DensityMonitor();
  }
  return densityMonitorInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetDensityMonitor(): void {
  if (densityMonitorInstance) {
    densityMonitorInstance.destroy();
    densityMonitorInstance = null;
  }
}
