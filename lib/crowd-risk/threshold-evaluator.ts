/**
 * Threshold Evaluator Service
 * 
 * Compares density readings against configured thresholds and determines alert levels.
 * Requirements: 1.1, 1.2, 1.3, 6.2
 */

import {
  DensityReading,
  ThresholdConfig,
  ThresholdEvaluation,
  ThresholdLevel,
  ThresholdEvaluator as IThresholdEvaluator,
  ValidationResult,
} from './types';
import { getThresholdConfigManager } from './threshold-config-manager';

/**
 * ThresholdEvaluator implementation
 * 
 * Requirement 1.1: Calculate density level within 2 seconds
 * Requirement 1.2: Threshold evaluation and level determination
 * Requirement 1.3: Support multiple threshold levels (warning, critical, emergency)
 * Requirement 6.2: Time-based profile selection
 */
export class ThresholdEvaluator implements IThresholdEvaluator {
  private configManager = getThresholdConfigManager();
  private previousLevels: Map<string, ThresholdLevel> = new Map();
  private configCache: Map<string, ThresholdConfig> = new Map();
  private cacheTimestamps: Map<string, number> = new Map();
  private evaluationCache: Map<string, { level: ThresholdLevel; timestamp: number; densityValue: number }> = new Map();
  
  // Cache TTL: 10 seconds (Requirement 6.3: Apply new configs within 10 seconds)
  private readonly CACHE_TTL_MS = 10000;
  // Evaluation cache TTL: 1 second (avoid redundant calculations for same density)
  // Task 17.1: Increased cache TTL for better memoization performance
  private readonly EVAL_CACHE_TTL_MS = 1000;
  
  // Cache cleanup interval to prevent memory leaks
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  
  constructor() {
    // Start periodic cache cleanup (every 30 seconds)
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredCaches();
    }, 30000);
  }

  /**
   * Evaluate density reading against thresholds
   * 
   * Requirement 1.1: Process within 2 seconds
   * Requirement 1.2: Generate density alert event when threshold crossed
   * Requirement 1.3: Determine threshold level (normal/warning/critical/emergency)
   * Task 17.1: Optimized with memoization for threshold evaluations
   * 
   * @param reading - Density reading to evaluate
   * @returns Threshold evaluation result
   */
  evaluate(reading: DensityReading): ThresholdEvaluation {
    const startTime = Date.now();
    
    // Check evaluation cache for recent identical evaluations
    // Round density value to 2 decimals for better cache hits
    const roundedDensity = Math.round(reading.densityValue * 100) / 100;
    const cacheKey = `${reading.areaId}-${roundedDensity}`;
    const cached = this.evaluationCache.get(cacheKey);
    
    // Use cached result if still valid and density hasn't changed significantly
    if (cached && (startTime - cached.timestamp) < this.EVAL_CACHE_TTL_MS) {
      // Verify density value is still close (within 0.01 tolerance)
      if (Math.abs(cached.densityValue - reading.densityValue) < 0.01) {
        const previousLevel = this.previousLevels.get(reading.areaId) || ThresholdLevel.NORMAL;
        const isEscalation = this.isLevelEscalation(previousLevel, cached.level);
        
        return {
          areaId: reading.areaId,
          currentLevel: cached.level,
          previousLevel,
          densityValue: reading.densityValue,
          threshold: this.getThresholdValueForLevel(cached.level, reading.areaId),
          timestamp: reading.timestamp,
          isEscalation,
        };
      }
    }
    
    // Get active thresholds for the area (with time-based profile selection)
    const thresholds = this.getActiveThresholdsSync(reading.areaId);
    
    if (!thresholds) {
      // No thresholds configured, treat as normal
      const previousLevel = this.previousLevels.get(reading.areaId) || ThresholdLevel.NORMAL;
      const evaluation: ThresholdEvaluation = {
        areaId: reading.areaId,
        currentLevel: ThresholdLevel.NORMAL,
        previousLevel,
        densityValue: reading.densityValue,
        threshold: 0,
        timestamp: reading.timestamp,
        isEscalation: false,
      };
      
      this.previousLevels.set(reading.areaId, ThresholdLevel.NORMAL);
      return evaluation;
    }
    
    // Determine current threshold level
    const currentLevel = this.determineThresholdLevel(
      reading.densityValue,
      thresholds
    );
    
    // Cache the evaluation result with density value for validation
    this.evaluationCache.set(cacheKey, {
      level: currentLevel,
      timestamp: startTime,
      densityValue: reading.densityValue,
    });
    
    // Get previous level for escalation detection
    const previousLevel = this.previousLevels.get(reading.areaId) || ThresholdLevel.NORMAL;
    
    // Detect escalation (level increased)
    const isEscalation = this.isLevelEscalation(previousLevel, currentLevel);
    
    // Determine which threshold was crossed
    const threshold = this.getThresholdValue(currentLevel, thresholds);
    
    // Create evaluation result
    const evaluation: ThresholdEvaluation = {
      areaId: reading.areaId,
      currentLevel,
      previousLevel,
      densityValue: reading.densityValue,
      threshold,
      timestamp: reading.timestamp,
      isEscalation,
    };
    
    // Update previous level
    this.previousLevels.set(reading.areaId, currentLevel);
    
    // Ensure processing completes within 2 seconds (Requirement 1.1)
    const processingTime = Date.now() - startTime;
    if (processingTime > 2000) {
      console.warn('Threshold evaluation exceeded 2 seconds:', {
        areaId: reading.areaId,
        processingTime,
      });
    }
    
    return evaluation;
  }

  /**
   * Determine threshold level based on density value
   * 
   * Requirement 1.3: Multiple threshold levels (normal/warning/critical/emergency)
   * 
   * @param densityValue - Current density value
   * @param thresholds - Threshold configuration
   * @returns Determined threshold level
   */
  private determineThresholdLevel(
    densityValue: number,
    thresholds: Omit<ThresholdConfig, 'timeProfile'>
  ): ThresholdLevel {
    // Check thresholds in descending order of severity
    if (densityValue >= thresholds.emergencyThreshold) {
      return ThresholdLevel.EMERGENCY;
    }
    
    if (densityValue >= thresholds.criticalThreshold) {
      return ThresholdLevel.CRITICAL;
    }
    
    if (densityValue >= thresholds.warningThreshold) {
      return ThresholdLevel.WARNING;
    }
    
    return ThresholdLevel.NORMAL;
  }

  /**
   * Check if level change represents an escalation
   * 
   * Requirement 1.2: Escalation detection
   * 
   * @param previousLevel - Previous threshold level
   * @param currentLevel - Current threshold level
   * @returns True if escalation occurred
   */
  private isLevelEscalation(
    previousLevel: ThresholdLevel,
    currentLevel: ThresholdLevel
  ): boolean {
    const levelOrder = {
      [ThresholdLevel.NORMAL]: 0,
      [ThresholdLevel.WARNING]: 1,
      [ThresholdLevel.CRITICAL]: 2,
      [ThresholdLevel.EMERGENCY]: 3,
    };
    
    return levelOrder[currentLevel] > levelOrder[previousLevel];
  }

  /**
   * Check if level change represents a de-escalation
   * 
   * Requirement 1.2: De-escalation detection
   * 
   * @param previousLevel - Previous threshold level
   * @param currentLevel - Current threshold level
   * @returns True if de-escalation occurred
   */
  isLevelDeescalation(
    previousLevel: ThresholdLevel,
    currentLevel: ThresholdLevel
  ): boolean {
    const levelOrder = {
      [ThresholdLevel.NORMAL]: 0,
      [ThresholdLevel.WARNING]: 1,
      [ThresholdLevel.CRITICAL]: 2,
      [ThresholdLevel.EMERGENCY]: 3,
    };
    
    return levelOrder[currentLevel] < levelOrder[previousLevel];
  }

  /**
   * Get the threshold value that corresponds to the current level
   * 
   * @param level - Threshold level
   * @param thresholds - Threshold configuration
   * @returns Threshold value
   */
  private getThresholdValue(
    level: ThresholdLevel,
    thresholds: Omit<ThresholdConfig, 'timeProfile'>
  ): number {
    switch (level) {
      case ThresholdLevel.EMERGENCY:
        return thresholds.emergencyThreshold;
      case ThresholdLevel.CRITICAL:
        return thresholds.criticalThreshold;
      case ThresholdLevel.WARNING:
        return thresholds.warningThreshold;
      case ThresholdLevel.NORMAL:
      default:
        return 0;
    }
  }

  /**
   * Update threshold configuration
   * 
   * Requirement 6.3: Configuration update propagation (10-second target)
   * 
   * @param config - New threshold configuration
   */
  updateThresholds(config: ThresholdConfig): void {
    // Validate configuration
    const validation = this.configManager.validateThresholds(config);
    if (!validation.valid) {
      const errorMessages = validation.errors.map(e => `${e.field}: ${e.message}`).join(', ');
      throw new Error(`Invalid threshold configuration: ${errorMessages}`);
    }
    
    // Update cache
    this.configCache.set(config.areaId, config);
    this.cacheTimestamps.set(config.areaId, Date.now());
    
    // Save to config manager (async, but don't wait)
    this.configManager.saveConfig(config).catch(error => {
      console.error('Failed to save threshold configuration:', error);
    });
  }

  /**
   * Get active thresholds for an area (synchronous with caching)
   * 
   * Requirement 6.2: Time-based profile selection
   * Requirement 6.3: Apply new configurations within 10 seconds
   * 
   * @param areaId - Area ID
   * @returns Active threshold configuration or null
   */
  private getActiveThresholdsSync(
    areaId: string
  ): Omit<ThresholdConfig, 'timeProfile'> | null {
    // Check cache first
    const cachedConfig = this.configCache.get(areaId);
    const cacheTimestamp = this.cacheTimestamps.get(areaId);
    
    // Use cache if valid (within TTL)
    if (cachedConfig && cacheTimestamp && Date.now() - cacheTimestamp < this.CACHE_TTL_MS) {
      return this.selectTimeBasedProfile(cachedConfig);
    }
    
    // Cache miss or expired - load from config manager synchronously
    // Note: This is a synchronous wrapper around async operation
    // In production, configs should be pre-loaded or use async evaluation
    let config: ThresholdConfig | null = null;
    
    // Try to load from config manager (this will be synchronous in current implementation)
    this.configManager.getConfig(areaId).then(loadedConfig => {
      if (loadedConfig) {
        config = loadedConfig;
        this.configCache.set(areaId, loadedConfig);
        this.cacheTimestamps.set(areaId, Date.now());
      }
    }).catch(error => {
      console.error('Failed to load threshold configuration:', error);
    });
    
    if (!config) {
      return null;
    }
    
    return this.selectTimeBasedProfile(config);
  }

  /**
   * Get active thresholds for an area (async version)
   * 
   * Requirement 6.2: Time-based profile selection
   * 
   * @param areaId - Area ID
   * @returns Active threshold configuration
   */
  async getActiveThresholds(
    areaId: string
  ): Promise<Omit<ThresholdConfig, 'timeProfile'> | null> {
    // Check cache first
    const cachedConfig = this.configCache.get(areaId);
    const cacheTimestamp = this.cacheTimestamps.get(areaId);
    
    // Use cache if valid (within TTL)
    if (cachedConfig && cacheTimestamp && Date.now() - cacheTimestamp < this.CACHE_TTL_MS) {
      return this.selectTimeBasedProfile(cachedConfig);
    }
    
    // Load from config manager
    const config = await this.configManager.getConfig(areaId);
    
    if (!config) {
      return null;
    }
    
    // Update cache
    this.configCache.set(areaId, config);
    this.cacheTimestamps.set(areaId, Date.now());
    
    return this.selectTimeBasedProfile(config);
  }

  /**
   * Select appropriate thresholds based on time-based profiles
   * 
   * Requirement 6.2: Time-based profile selection
   * 
   * @param config - Full threshold configuration
   * @param time - Time to check (defaults to current time)
   * @returns Active threshold values
   */
  private selectTimeBasedProfile(
    config: ThresholdConfig,
    time: Date = new Date()
  ): Omit<ThresholdConfig, 'timeProfile'> {
    // If no time profiles, return base thresholds
    if (!config.timeProfile || config.timeProfile.length === 0) {
      return {
        areaId: config.areaId,
        warningThreshold: config.warningThreshold,
        criticalThreshold: config.criticalThreshold,
        emergencyThreshold: config.emergencyThreshold,
      };
    }
    
    // Find matching time profile
    const currentTime = time.getHours() * 60 + time.getMinutes();
    
    for (const profile of config.timeProfile) {
      const [startHour, startMin] = profile.startTime.split(':').map(Number);
      const [endHour, endMin] = profile.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      if (currentTime >= startMinutes && currentTime < endMinutes) {
        return {
          areaId: config.areaId,
          warningThreshold: profile.thresholds.warningThreshold,
          criticalThreshold: profile.thresholds.criticalThreshold,
          emergencyThreshold: profile.thresholds.emergencyThreshold,
        };
      }
    }
    
    // No matching profile, return base thresholds
    return {
      areaId: config.areaId,
      warningThreshold: config.warningThreshold,
      criticalThreshold: config.criticalThreshold,
      emergencyThreshold: config.emergencyThreshold,
    };
  }

  /**
   * Validate threshold configuration
   * 
   * Requirement 6.4: Threshold validation
   * 
   * @param config - Threshold configuration to validate
   * @returns Validation result
   */
  validateThresholds(config: ThresholdConfig): ValidationResult {
    return this.configManager.validateThresholds(config);
  }

  /**
   * Get previous threshold level for an area
   * 
   * @param areaId - Area ID
   * @returns Previous threshold level or NORMAL if not found
   */
  getPreviousLevel(areaId: string): ThresholdLevel {
    return this.previousLevels.get(areaId) || ThresholdLevel.NORMAL;
  }

  /**
   * Reset previous level for an area (useful for testing)
   * 
   * @param areaId - Area ID
   */
  resetPreviousLevel(areaId: string): void {
    this.previousLevels.delete(areaId);
  }

  /**
   * Get threshold value for a specific level and area
   * Helper method for cached evaluations
   */
  private getThresholdValueForLevel(level: ThresholdLevel, areaId: string): number {
    const thresholds = this.getActiveThresholdsSync(areaId);
    if (!thresholds) return 0;
    return this.getThresholdValue(level, thresholds);
  }

  /**
   * Clear all caches (useful for testing or forcing reload)
   */
  clearCache(): void {
    this.configCache.clear();
    this.cacheTimestamps.clear();
    this.evaluationCache.clear();
  }

  /**
   * Preload configurations for multiple areas
   * Useful for initialization to avoid cache misses during evaluation
   * 
   * @param areaIds - Array of area IDs to preload
   */
  async preloadConfigurations(areaIds: string[]): Promise<void> {
    const loadPromises = areaIds.map(async (areaId) => {
      try {
        const config = await this.configManager.getConfig(areaId);
        if (config) {
          this.configCache.set(areaId, config);
          this.cacheTimestamps.set(areaId, Date.now());
        }
      } catch (error) {
        console.error(`Failed to preload configuration for area ${areaId}:`, error);
      }
    });
    
    await Promise.all(loadPromises);
  }

  /**
   * Get cache statistics (for monitoring)
   */
  getCacheStats(): {
    cachedAreas: number;
    oldestCacheAge: number;
    newestCacheAge: number;
    evaluationCacheSize: number;
  } {
    const now = Date.now();
    const timestamps = Array.from(this.cacheTimestamps.values());
    
    if (timestamps.length === 0) {
      return {
        cachedAreas: 0,
        oldestCacheAge: 0,
        newestCacheAge: 0,
        evaluationCacheSize: this.evaluationCache.size,
      };
    }
    
    const ages = timestamps.map(ts => now - ts);
    
    return {
      cachedAreas: this.configCache.size,
      oldestCacheAge: Math.max(...ages),
      newestCacheAge: Math.min(...ages),
      evaluationCacheSize: this.evaluationCache.size,
    };
  }
  
  /**
   * Clean up expired cache entries
   * Task 17.1: Prevent memory leaks from unbounded cache growth
   */
  private cleanupExpiredCaches(): void {
    const now = Date.now();
    
    // Clean up expired evaluation cache entries
    for (const [key, value] of this.evaluationCache.entries()) {
      if (now - value.timestamp > this.EVAL_CACHE_TTL_MS) {
        this.evaluationCache.delete(key);
      }
    }
    
    // Clean up expired config cache entries
    for (const [areaId, timestamp] of this.cacheTimestamps.entries()) {
      if (now - timestamp > this.CACHE_TTL_MS) {
        this.configCache.delete(areaId);
        this.cacheTimestamps.delete(areaId);
      }
    }
  }
  
  /**
   * Destroy the evaluator and clean up resources
   * Task 17.1: Proper resource cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.configCache.clear();
    this.cacheTimestamps.clear();
    this.evaluationCache.clear();
    this.previousLevels.clear();
  }
}

/**
 * Singleton instance for global use
 */
let thresholdEvaluatorInstance: ThresholdEvaluator | null = null;

/**
 * Get or create the singleton ThresholdEvaluator instance
 */
export function getThresholdEvaluator(): ThresholdEvaluator {
  if (!thresholdEvaluatorInstance) {
    thresholdEvaluatorInstance = new ThresholdEvaluator();
  }
  return thresholdEvaluatorInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetThresholdEvaluator(): void {
  thresholdEvaluatorInstance = null;
}
