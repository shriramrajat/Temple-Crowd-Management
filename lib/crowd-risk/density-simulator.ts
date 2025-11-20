/**
 * Density Simulator for Development and Testing
 * 
 * Generates realistic crowd density patterns for development and testing purposes.
 * Supports various scenarios including normal patterns, peak hours, threshold violations,
 * and normalization scenarios.
 * 
 * Requirements: 1.1, 1.2
 */

import { DensityReading, DensityUnit } from './types';

/**
 * Density pattern types
 */
export enum DensityPattern {
  NORMAL = 'normal',
  PEAK_HOUR = 'peak_hour',
  THRESHOLD_VIOLATION = 'threshold_violation',
  NORMALIZATION = 'normalization',
  SPIKE = 'spike',
}

/**
 * Simulator configuration
 */
export interface SimulatorConfig {
  areaId: string;
  pattern: DensityPattern;
  baselineDensity?: number;
  targetDensity?: number;
  duration?: number; // milliseconds
  variationAmount?: number; // random variation range
}

/**
 * Pattern state for tracking simulation progress
 */
interface PatternState {
  startTime: number;
  startDensity: number;
  targetDensity: number;
  duration: number;
  pattern: DensityPattern;
}

/**
 * DensitySimulator class
 * 
 * Generates realistic density patterns with controllable scenarios for testing.
 * Requirement 1.1: Real-time density data generation
 * Requirement 1.2: Threshold violation scenarios
 */
export class DensitySimulator {
  private patternStates: Map<string, PatternState> = new Map();
  private currentDensities: Map<string, number> = new Map();
  private readonly DEFAULT_BASELINE = 0.3;
  private readonly DEFAULT_VARIATION = 0.1;
  
  /**
   * Generate a density reading based on configured pattern
   * 
   * @param areaId - Area identifier
   * @returns DensityReading with realistic values
   */
  generateReading(areaId: string): DensityReading {
    const patternState = this.patternStates.get(areaId);
    let densityValue: number;
    
    if (patternState) {
      densityValue = this.calculatePatternDensity(areaId, patternState);
    } else {
      // Default to normal pattern if no pattern configured
      densityValue = this.generateNormalPattern(areaId);
    }
    
    // Store current density
    this.currentDensities.set(areaId, densityValue);
    
    return {
      areaId,
      timestamp: Date.now(),
      densityValue: Math.round(densityValue * 100) / 100, // Round to 2 decimals
      unit: DensityUnit.PEOPLE_PER_SQM,
      metadata: {
        source: 'simulator',
        pattern: patternState?.pattern || DensityPattern.NORMAL,
        generatedAt: new Date().toISOString(),
      },
    };
  }
  
  /**
   * Configure a density pattern for an area
   * 
   * @param config - Simulator configuration
   */
  configurePattern(config: SimulatorConfig): void {
    const currentDensity = this.currentDensities.get(config.areaId) || config.baselineDensity || this.DEFAULT_BASELINE;
    
    const state: PatternState = {
      startTime: Date.now(),
      startDensity: currentDensity,
      targetDensity: config.targetDensity || this.getDefaultTargetDensity(config.pattern),
      duration: config.duration || this.getDefaultDuration(config.pattern),
      pattern: config.pattern,
    };
    
    this.patternStates.set(config.areaId, state);
  }
  
  /**
   * Trigger a density spike for testing
   * 
   * @param areaId - Area identifier
   * @param targetDensity - Target density value
   * @param duration - Duration of spike in milliseconds
   */
  triggerSpike(areaId: string, targetDensity: number, duration: number = 30000): void {
    this.configurePattern({
      areaId,
      pattern: DensityPattern.SPIKE,
      targetDensity,
      duration,
    });
  }
  
  /**
   * Trigger a threshold violation scenario
   * 
   * @param areaId - Area identifier
   * @param level - 'warning' | 'critical' | 'emergency'
   */
  triggerThresholdViolation(areaId: string, level: 'warning' | 'critical' | 'emergency'): void {
    const targetDensities = {
      warning: 0.7,
      critical: 1.0,
      emergency: 1.3,
    };
    
    this.configurePattern({
      areaId,
      pattern: DensityPattern.THRESHOLD_VIOLATION,
      targetDensity: targetDensities[level],
      duration: 20000, // 20 seconds to reach target
    });
  }
  
  /**
   * Trigger a normalization scenario (density returning to normal)
   * 
   * @param areaId - Area identifier
   * @param targetDensity - Target normal density (default: 0.3)
   */
  triggerNormalization(areaId: string, targetDensity: number = 0.3): void {
    this.configurePattern({
      areaId,
      pattern: DensityPattern.NORMALIZATION,
      targetDensity,
      duration: 40000, // 40 seconds to normalize (ensures 30+ seconds below threshold)
    });
  }
  
  /**
   * Reset pattern for an area to normal
   * 
   * @param areaId - Area identifier
   */
  resetPattern(areaId: string): void {
    this.patternStates.delete(areaId);
  }
  
  /**
   * Reset all patterns
   */
  resetAll(): void {
    this.patternStates.clear();
    this.currentDensities.clear();
  }
  
  /**
   * Calculate density based on pattern state
   */
  private calculatePatternDensity(areaId: string, state: PatternState): number {
    const elapsed = Date.now() - state.startTime;
    const progress = Math.min(elapsed / state.duration, 1.0);
    
    let baseDensity: number;
    
    switch (state.pattern) {
      case DensityPattern.NORMAL:
        baseDensity = this.generateNormalPattern(areaId);
        break;
        
      case DensityPattern.PEAK_HOUR:
        baseDensity = this.generatePeakHourPattern(state, progress);
        break;
        
      case DensityPattern.THRESHOLD_VIOLATION:
        baseDensity = this.generateThresholdViolationPattern(state, progress);
        break;
        
      case DensityPattern.NORMALIZATION:
        baseDensity = this.generateNormalizationPattern(state, progress);
        break;
        
      case DensityPattern.SPIKE:
        baseDensity = this.generateSpikePattern(state, progress);
        break;
        
      default:
        baseDensity = this.generateNormalPattern(areaId);
    }
    
    // Add random variation for realism
    const variation = (Math.random() - 0.5) * this.DEFAULT_VARIATION;
    const densityWithVariation = baseDensity + variation;
    
    // Ensure density stays within realistic bounds (0 to 2.0)
    return Math.max(0, Math.min(2.0, densityWithVariation));
  }
  
  /**
   * Generate normal pattern with gradual increases/decreases
   * Requirement: Implement normal pattern (gradual increases/decreases)
   */
  private generateNormalPattern(areaId: string): number {
    const currentDensity = this.currentDensities.get(areaId) || this.DEFAULT_BASELINE;
    
    // Gradual change: -0.05 to +0.05 per reading
    const change = (Math.random() - 0.5) * 0.1;
    const newDensity = currentDensity + change;
    
    // Keep within normal range (0.2 to 0.6)
    return Math.max(0.2, Math.min(0.6, newDensity));
  }
  
  /**
   * Generate peak hour pattern with rapid increases
   * Requirement: Implement peak hour pattern (rapid increases during specific times)
   */
  private generatePeakHourPattern(state: PatternState, progress: number): number {
    // Rapid increase using exponential curve
    const curve = Math.pow(progress, 0.5); // Square root for faster initial increase
    const density = state.startDensity + (state.targetDensity - state.startDensity) * curve;
    
    return density;
  }
  
  /**
   * Generate threshold violation pattern
   * Requirement: Implement threshold violation scenarios (warning, critical, emergency)
   */
  private generateThresholdViolationPattern(state: PatternState, progress: number): number {
    // Smooth increase to target threshold
    const curve = this.easeInOutCubic(progress);
    const density = state.startDensity + (state.targetDensity - state.startDensity) * curve;
    
    return density;
  }
  
  /**
   * Generate normalization pattern (density returning to normal)
   * Requirement: Implement normalization scenarios (density returning to normal)
   */
  private generateNormalizationPattern(state: PatternState, progress: number): number {
    // Gradual decrease to normal levels
    const curve = this.easeOutQuad(progress);
    const density = state.startDensity + (state.targetDensity - state.startDensity) * curve;
    
    return density;
  }
  
  /**
   * Generate spike pattern with rapid increase and decrease
   * Requirement: Add controllable density spike triggers
   */
  private generateSpikePattern(state: PatternState, progress: number): number {
    // Spike up quickly, then return to baseline
    let density: number;
    
    if (progress < 0.3) {
      // Rapid increase (first 30% of duration)
      const spikeProgress = progress / 0.3;
      density = state.startDensity + (state.targetDensity - state.startDensity) * spikeProgress;
    } else {
      // Gradual decrease back to baseline (remaining 70% of duration)
      const returnProgress = (progress - 0.3) / 0.7;
      density = state.targetDensity - (state.targetDensity - state.startDensity) * returnProgress;
    }
    
    return density;
  }
  
  /**
   * Get default target density for pattern type
   */
  private getDefaultTargetDensity(pattern: DensityPattern): number {
    switch (pattern) {
      case DensityPattern.NORMAL:
        return 0.4;
      case DensityPattern.PEAK_HOUR:
        return 0.9;
      case DensityPattern.THRESHOLD_VIOLATION:
        return 1.0;
      case DensityPattern.NORMALIZATION:
        return 0.3;
      case DensityPattern.SPIKE:
        return 1.2;
      default:
        return 0.4;
    }
  }
  
  /**
   * Get default duration for pattern type
   */
  private getDefaultDuration(pattern: DensityPattern): number {
    switch (pattern) {
      case DensityPattern.NORMAL:
        return 60000; // 1 minute
      case DensityPattern.PEAK_HOUR:
        return 120000; // 2 minutes
      case DensityPattern.THRESHOLD_VIOLATION:
        return 20000; // 20 seconds
      case DensityPattern.NORMALIZATION:
        return 40000; // 40 seconds
      case DensityPattern.SPIKE:
        return 30000; // 30 seconds
      default:
        return 60000;
    }
  }
  
  /**
   * Easing function: ease-in-out cubic
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  /**
   * Easing function: ease-out quadratic
   */
  private easeOutQuad(t: number): number {
    return 1 - (1 - t) * (1 - t);
  }
  
  /**
   * Get current density for an area
   */
  getCurrentDensity(areaId: string): number | undefined {
    return this.currentDensities.get(areaId);
  }
  
  /**
   * Get pattern state for an area
   */
  getPatternState(areaId: string): PatternState | undefined {
    return this.patternStates.get(areaId);
  }
}

// Singleton instance for global use
let densitySimulatorInstance: DensitySimulator | null = null;

/**
 * Get or create the singleton DensitySimulator instance
 */
export function getDensitySimulator(): DensitySimulator {
  if (!densitySimulatorInstance) {
    densitySimulatorInstance = new DensitySimulator();
  }
  return densitySimulatorInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetDensitySimulator(): void {
  if (densitySimulatorInstance) {
    densitySimulatorInstance.resetAll();
    densitySimulatorInstance = null;
  }
}
