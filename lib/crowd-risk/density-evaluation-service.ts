/**
 * Density Evaluation Service
 * 
 * Integrates DensityMonitor with ThresholdEvaluator to automatically evaluate
 * density readings against thresholds and trigger alerts.
 * 
 * Requirements: 1.2, 6.3
 */

import { DensityReading, ThresholdEvaluation, ThresholdConfig } from './types';
import { getDensityMonitor } from './density-monitor';
import { getThresholdEvaluator } from './threshold-evaluator';

/**
 * Evaluation result with caching metadata
 */
interface CachedEvaluation {
  evaluation: ThresholdEvaluation;
  timestamp: number;
}

/**
 * DensityEvaluationService
 * 
 * Requirement 1.2: Connect density updates to threshold evaluation
 * Requirement 6.3: Configuration update propagation (10-second target)
 */
export class DensityEvaluationService {
  private densityMonitor = getDensityMonitor();
  private thresholdEvaluator = getThresholdEvaluator();
  
  private evaluationSubscribers: Set<(evaluation: ThresholdEvaluation) => void> = new Set();
  private evaluationCache: Map<string, CachedEvaluation> = new Map();
  private densityUnsubscribe: (() => void) | null = null;
  private isRunning = false;
  
  // Cache TTL for evaluation results (5 seconds)
  private readonly EVALUATION_CACHE_TTL_MS = 5000;
  
  /**
   * Start the evaluation service
   * Connects density monitor updates to threshold evaluation
   * 
   * Requirement 1.2: Connect density updates to threshold evaluation
   */
  start(): void {
    if (this.isRunning) {
      console.warn('DensityEvaluationService is already running');
      return;
    }
    
    // Subscribe to density updates
    this.densityUnsubscribe = this.densityMonitor.onDensityUpdate(
      this.handleDensityUpdate.bind(this)
    );
    
    this.isRunning = true;
    console.log('DensityEvaluationService started');
  }
  
  /**
   * Stop the evaluation service
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }
    
    // Unsubscribe from density updates
    if (this.densityUnsubscribe) {
      this.densityUnsubscribe();
      this.densityUnsubscribe = null;
    }
    
    this.isRunning = false;
    console.log('DensityEvaluationService stopped');
  }
  
  /**
   * Handle density update from monitor
   * Evaluates density against thresholds and notifies subscribers
   * 
   * Requirement 1.2: Automatic threshold evaluation on density updates
   */
  private handleDensityUpdate(reading: DensityReading): void {
    try {
      // Evaluate density against thresholds
      const evaluation = this.thresholdEvaluator.evaluate(reading);
      
      // Cache evaluation result
      this.cacheEvaluation(evaluation);
      
      // Update density monitor with threshold status for normalization detection
      const belowThreshold = evaluation.currentLevel === 'normal';
      this.densityMonitor.updateThresholdStatus(reading.areaId, belowThreshold);
      
      // Notify all subscribers
      this.notifySubscribers(evaluation);
    } catch (error) {
      console.error('Error evaluating density reading:', error);
    }
  }
  
  /**
   * Cache evaluation result for performance
   * 
   * Requirement 4.2: Add evaluation result caching for performance
   */
  private cacheEvaluation(evaluation: ThresholdEvaluation): void {
    this.evaluationCache.set(evaluation.areaId, {
      evaluation,
      timestamp: Date.now(),
    });
    
    // Clean up old cache entries
    this.cleanupCache();
  }
  
  /**
   * Get cached evaluation for an area
   * 
   * @param areaId - Area ID
   * @returns Cached evaluation or null if not found or expired
   */
  getCachedEvaluation(areaId: string): ThresholdEvaluation | null {
    const cached = this.evaluationCache.get(areaId);
    
    if (!cached) {
      return null;
    }
    
    // Check if cache is still valid
    const age = Date.now() - cached.timestamp;
    if (age > this.EVALUATION_CACHE_TTL_MS) {
      this.evaluationCache.delete(areaId);
      return null;
    }
    
    return cached.evaluation;
  }
  
  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    
    for (const [areaId, cached] of this.evaluationCache.entries()) {
      const age = now - cached.timestamp;
      if (age > this.EVALUATION_CACHE_TTL_MS) {
        this.evaluationCache.delete(areaId);
      }
    }
  }
  
  /**
   * Notify all subscribers of evaluation result
   */
  private notifySubscribers(evaluation: ThresholdEvaluation): void {
    for (const callback of this.evaluationSubscribers) {
      try {
        callback(evaluation);
      } catch (error) {
        console.error('Error in evaluation subscriber:', error);
      }
    }
  }
  
  /**
   * Subscribe to evaluation results
   * 
   * @param callback - Callback function called on each evaluation
   * @returns Unsubscribe function
   */
  onEvaluation(callback: (evaluation: ThresholdEvaluation) => void): () => void {
    this.evaluationSubscribers.add(callback);
    
    return () => {
      this.evaluationSubscribers.delete(callback);
    };
  }
  
  /**
   * Update threshold configuration
   * Propagates configuration updates to the threshold evaluator
   * 
   * Requirement 6.3: Configuration update propagation (10-second target)
   * 
   * @param config - New threshold configuration
   */
  async updateThresholdConfig(config: ThresholdConfig): Promise<void> {
    try {
      // Update threshold evaluator (this will update cache and persist)
      this.thresholdEvaluator.updateThresholds(config);
      
      // Clear cached evaluation for this area to force re-evaluation
      this.evaluationCache.delete(config.areaId);
      
      // Get current density for this area and re-evaluate immediately
      const currentDensity = await this.densityMonitor.getCurrentDensity(config.areaId);
      if (currentDensity) {
        const evaluation = this.thresholdEvaluator.evaluate(currentDensity);
        this.cacheEvaluation(evaluation);
        this.notifySubscribers(evaluation);
      }
      
      console.log('Threshold configuration updated:', config.areaId);
    } catch (error) {
      console.error('Error updating threshold configuration:', error);
      throw error;
    }
  }
  
  /**
   * Preload threshold configurations for multiple areas
   * Useful for initialization to avoid cache misses
   * 
   * @param areaIds - Array of area IDs to preload
   */
  async preloadConfigurations(areaIds: string[]): Promise<void> {
    await this.thresholdEvaluator.preloadConfigurations(areaIds);
  }
  
  /**
   * Get evaluation statistics
   * 
   * @returns Statistics about evaluations and cache
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      subscriberCount: this.evaluationSubscribers.size,
      cachedEvaluations: this.evaluationCache.size,
      thresholdCacheStats: this.thresholdEvaluator.getCacheStats(),
    };
  }
  
  /**
   * Clear all caches
   * Useful for testing or forcing reload
   */
  clearCaches(): void {
    this.evaluationCache.clear();
    this.thresholdEvaluator.clearCache();
  }
  
  /**
   * Check if service is running
   */
  isServiceRunning(): boolean {
    return this.isRunning;
  }
}

/**
 * Singleton instance for global use
 */
let densityEvaluationServiceInstance: DensityEvaluationService | null = null;

/**
 * Get or create the singleton DensityEvaluationService instance
 */
export function getDensityEvaluationService(): DensityEvaluationService {
  if (!densityEvaluationServiceInstance) {
    densityEvaluationServiceInstance = new DensityEvaluationService();
  }
  return densityEvaluationServiceInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetDensityEvaluationService(): void {
  if (densityEvaluationServiceInstance) {
    densityEvaluationServiceInstance.stop();
    densityEvaluationServiceInstance = null;
  }
}
