/**
 * Visual Indicator Controller Service
 * 
 * Centralized service for managing visual indicator states across the monitoring interface.
 * This service provides a dedicated controller for indicator state management, though the
 * functionality is also available through DensityContext and AlertContext.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { ThresholdLevel, IndicatorState } from './types';

/**
 * Visual Indicator Controller
 * 
 * Singleton service that manages indicator states for all monitored areas.
 * Provides real-time state updates with sub-2-second propagation.
 * 
 * Requirements:
 * - 4.1: Red blinking indicators for critical conditions
 * - 4.2: Color-coded severity levels (green/yellow/red)
 * - 4.3: 2 Hz blink rate for emergency conditions
 * - 4.4: Sub-2-second state updates
 * - 4.5: Consistent indicator state across all connected clients
 */
class VisualIndicatorControllerService {
  private indicatorStates: Map<string, IndicatorState> = new Map();
  private subscribers: Set<(state: IndicatorState) => void> = new Set();
  private emergencyAreas: Set<string> = new Set();
  
  /**
   * Update indicator state based on threshold level
   * 
   * Requirement 4.1: Red blinking indicators for critical conditions
   * Requirement 4.2: Color-coded severity levels
   * Requirement 4.3: 2 Hz blink rate for emergency
   * Requirement 4.4: Sub-2-second state propagation
   * 
   * @param areaId - Area identifier
   * @param level - Current threshold level
   */
  updateIndicator(areaId: string, level: ThresholdLevel): void {
    const state = this.createIndicatorState(areaId, level);
    
    // Update state in map
    this.indicatorStates.set(areaId, state);
    
    // Notify all subscribers immediately for sub-2-second propagation
    this.notifySubscribers(state);
  }
  
  /**
   * Create indicator state from threshold level
   * 
   * Maps threshold levels to visual indicator properties:
   * - Normal: Green, no blinking
   * - Warning: Yellow, no blinking
   * - Critical: Red, no blinking
   * - Emergency: Red, blinking at 2 Hz
   * 
   * @param areaId - Area identifier
   * @param level - Threshold level
   * @returns Indicator state
   */
  private createIndicatorState(areaId: string, level: ThresholdLevel): IndicatorState {
    const timestamp = Date.now();
    
    switch (level) {
      case ThresholdLevel.NORMAL:
        return {
          areaId,
          color: 'green',
          blinking: false,
          lastUpdate: timestamp,
        };
      
      case ThresholdLevel.WARNING:
        return {
          areaId,
          color: 'yellow',
          blinking: false,
          lastUpdate: timestamp,
        };
      
      case ThresholdLevel.CRITICAL:
        return {
          areaId,
          color: 'red',
          blinking: false,
          lastUpdate: timestamp,
        };
      
      case ThresholdLevel.EMERGENCY:
        // Requirement 4.3: 2 Hz blink rate for emergency
        return {
          areaId,
          color: 'red',
          blinking: true,
          blinkRate: 2, // 2 cycles per second
          lastUpdate: timestamp,
        };
      
      default:
        // Fallback to normal state
        return {
          areaId,
          color: 'green',
          blinking: false,
          lastUpdate: timestamp,
        };
    }
  }
  
  /**
   * Get current indicator state for an area
   * 
   * Requirement 4.5: Retrieve current state for display
   * 
   * @param areaId - Area identifier
   * @returns Current indicator state or default normal state
   */
  getIndicatorState(areaId: string): IndicatorState {
    const state = this.indicatorStates.get(areaId);
    
    if (state) {
      return state;
    }
    
    // Return default normal state if no state exists
    return {
      areaId,
      color: 'green',
      blinking: false,
      lastUpdate: Date.now(),
    };
  }
  
  /**
   * Get all indicator states
   * 
   * @returns Map of all indicator states
   */
  getAllIndicatorStates(): Map<string, IndicatorState> {
    return new Map(this.indicatorStates);
  }
  
  /**
   * Subscribe to indicator state updates
   * 
   * Requirement 4.4: Real-time state change notifications
   * 
   * @param callback - Function to call when indicator state changes
   * @returns Unsubscribe function
   */
  subscribeToUpdates(callback: (state: IndicatorState) => void): () => void {
    this.subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }
  
  /**
   * Notify all subscribers of state change
   * 
   * Requirement 4.4: Sub-2-second state propagation
   * 
   * @param state - Updated indicator state
   */
  private notifySubscribers(state: IndicatorState): void {
    // Notify all subscribers immediately
    this.subscribers.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('Error in indicator state subscriber:', error);
      }
    });
  }
  
  /**
   * Set emergency mode for an area
   * 
   * Forces blinking state for emergency conditions
   * 
   * @param areaId - Area identifier
   * @param isEmergency - Whether area is in emergency mode
   */
  setEmergencyMode(areaId: string, isEmergency: boolean): void {
    if (isEmergency) {
      this.emergencyAreas.add(areaId);
      // Update to emergency state
      this.updateIndicator(areaId, ThresholdLevel.EMERGENCY);
    } else {
      this.emergencyAreas.delete(areaId);
      // State will be updated by next density evaluation
    }
  }
  
  /**
   * Check if area is in emergency mode
   * 
   * @param areaId - Area identifier
   * @returns True if area is in emergency mode
   */
  isEmergencyMode(areaId: string): boolean {
    return this.emergencyAreas.has(areaId);
  }
  
  /**
   * Clear indicator state for an area
   * 
   * @param areaId - Area identifier
   */
  clearIndicator(areaId: string): void {
    this.indicatorStates.delete(areaId);
    this.emergencyAreas.delete(areaId);
    
    // Notify subscribers of cleared state (returns to normal)
    const normalState = this.getIndicatorState(areaId);
    this.notifySubscribers(normalState);
  }
  
  /**
   * Clear all indicator states
   */
  clearAll(): void {
    const areaIds = Array.from(this.indicatorStates.keys());
    this.indicatorStates.clear();
    this.emergencyAreas.clear();
    
    // Notify subscribers for each cleared area
    areaIds.forEach(areaId => {
      const normalState = this.getIndicatorState(areaId);
      this.notifySubscribers(normalState);
    });
  }
  
  /**
   * Get number of active subscribers
   * 
   * @returns Number of active subscribers
   */
  getSubscriberCount(): number {
    return this.subscribers.size;
  }
  
  /**
   * Get number of monitored areas
   * 
   * @returns Number of areas with indicator states
   */
  getMonitoredAreaCount(): number {
    return this.indicatorStates.size;
  }
}

// Singleton instance
let visualIndicatorControllerInstance: VisualIndicatorControllerService | null = null;

/**
 * Get the singleton Visual Indicator Controller instance
 * 
 * Requirement 4.5: Consistent indicator state across all connected clients
 * 
 * @returns Visual Indicator Controller instance
 */
export function getVisualIndicatorController(): VisualIndicatorControllerService {
  if (!visualIndicatorControllerInstance) {
    visualIndicatorControllerInstance = new VisualIndicatorControllerService();
  }
  
  return visualIndicatorControllerInstance;
}

/**
 * Reset the singleton instance (for testing purposes)
 * 
 * @internal
 */
export function resetVisualIndicatorController(): void {
  visualIndicatorControllerInstance = null;
}
