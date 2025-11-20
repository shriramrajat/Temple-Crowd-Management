/**
 * Emergency Mode Manager Service
 * 
 * Manages emergency mode state and coordinates system-wide emergency response.
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

import {
  EmergencyModeManager as IEmergencyModeManager,
  EmergencyMode,
  EmergencyTrigger,
  MonitoredArea,
  AlertEvent,
  AlertType,
  ThresholdLevel,
  Permission,
} from './types';
import { getAuthService } from './auth-service';

/**
 * Emergency state change callback type
 */
type EmergencyStateCallback = (state: EmergencyMode | null) => void;

/**
 * Emergency activation log entry
 */
interface EmergencyLogEntry {
  timestamp: number;
  action: 'activated' | 'deactivated';
  trigger: EmergencyTrigger;
  adminId?: string;
  areaId: string;
  affectedAreas: string[];
  reason?: string;
}

/**
 * Emergency activation attempt log entry
 * Task 15.1: Log all activation attempts with user ID and result
 */
interface EmergencyActivationAttempt {
  timestamp: number;
  areaId: string;
  trigger: EmergencyTrigger;
  adminId?: string;
  success: boolean;
  reason?: string;
}

/**
 * EmergencyModeManager implementation
 * 
 * Requirement 5.1: Automatic activation on emergency threshold breach
 * Requirement 5.2: Expanded notification reach to adjacent areas
 * Requirement 5.4: Manual activation by authorized admins
 * Requirement 5.5: Deactivation logging
 */
export class EmergencyModeManager implements IEmergencyModeManager {
  private emergencyState: EmergencyMode | null = null;
  private stateChangeCallbacks: Set<EmergencyStateCallback> = new Set();
  private areaRegistry: Map<string, MonitoredArea> = new Map();
  private activationLog: EmergencyLogEntry[] = [];
  private activationAttempts: EmergencyActivationAttempt[] = [];
  
  // Maximum log entries to keep
  private readonly MAX_LOG_SIZE = 500;

  /**
   * Activate emergency mode
   * 
   * Requirement 5.1: Automatic activation on emergency threshold breach
   * Requirement 5.4: Manual activation by authorized admins
   * Requirement 5.5: Log activation events
   * Task 15.1: Check ACTIVATE_EMERGENCY permission before activation
   * 
   * @param areaId - Area ID where emergency was triggered
   * @param trigger - Trigger type (automatic or manual)
   * @param adminId - Admin ID (required for manual activation)
   * @throws Error if user lacks ACTIVATE_EMERGENCY permission
   */
  activateEmergency(areaId: string, trigger: EmergencyTrigger, adminId?: string): void {
    // Validate manual activation has adminId
    if (trigger === EmergencyTrigger.MANUAL && !adminId) {
      const error = new Error('Admin ID is required for manual emergency activation');
      this.logActivationAttempt(areaId, trigger, adminId, false, error.message);
      throw error;
    }
    
    // Check permission for manual activation
    if (trigger === EmergencyTrigger.MANUAL && adminId) {
      const authService = getAuthService();
      const hasPermission = authService.checkPermission(adminId, Permission.ACTIVATE_EMERGENCY);
      
      if (!hasPermission) {
        const error = new Error(
          `User ${adminId} does not have permission to activate emergency mode`
        );
        this.logActivationAttempt(areaId, trigger, adminId, false, error.message);
        throw error;
      }
    }
    
    // If already active, don't reactivate
    if (this.emergencyState?.active) {
      console.log('Emergency mode already active');
      this.logActivationAttempt(areaId, trigger, adminId, false, 'Emergency mode already active');
      return;
    }
    
    // Get affected areas (trigger area + adjacent areas)
    const affectedAreas = this.getAffectedAreas(areaId);
    
    // Create emergency state
    this.emergencyState = {
      active: true,
      activatedAt: Date.now(),
      activatedBy: trigger,
      adminId,
      triggerAreaId: areaId,
      affectedAreas,
    };
    
    // Log activation
    this.logEmergencyAction('activated', areaId, trigger, adminId, affectedAreas);
    this.logActivationAttempt(areaId, trigger, adminId, true);
    
    // Notify state change callbacks
    this.notifyStateChange();
    
    console.log(
      `Emergency mode activated for area ${areaId} (${trigger})`,
      `Affected areas: ${affectedAreas.join(', ')}`
    );
  }

  /**
   * Deactivate emergency mode
   * 
   * Requirement 5.5: Deactivation logging and confirmation
   * 
   * @param adminId - Admin ID who deactivated
   */
  deactivateEmergency(adminId: string): void {
    if (!this.emergencyState?.active) {
      console.log('Emergency mode is not active');
      return;
    }
    
    // Log deactivation before clearing state
    const areaId = this.emergencyState.triggerAreaId;
    const affectedAreas = this.emergencyState.affectedAreas;
    
    this.logEmergencyAction(
      'deactivated',
      areaId,
      EmergencyTrigger.MANUAL,
      adminId,
      affectedAreas
    );
    
    // Clear emergency state
    this.emergencyState = null;
    
    // Notify state change callbacks
    this.notifyStateChange();
    
    console.log(`Emergency mode deactivated by admin ${adminId}`);
  }

  /**
   * Check if emergency mode is active
   * 
   * @returns True if emergency mode is active
   */
  isEmergencyActive(): boolean {
    return this.emergencyState?.active || false;
  }

  /**
   * Get current emergency state
   * 
   * @returns Emergency mode state or null
   */
  getEmergencyState(): EmergencyMode | null {
    return this.emergencyState ? { ...this.emergencyState } : null;
  }

  /**
   * Subscribe to emergency state changes
   * 
   * @param callback - Callback function called on state change
   * @returns Unsubscribe function
   */
  onEmergencyStateChange(callback: EmergencyStateCallback): () => void {
    this.stateChangeCallbacks.add(callback);
    
    return () => {
      this.stateChangeCallbacks.delete(callback);
    };
  }

  /**
   * Get affected areas for emergency (trigger area + adjacent areas)
   * 
   * Requirement 5.2: Expand notification reach to adjacent areas
   * 
   * @param areaId - Trigger area ID
   * @returns Array of affected area IDs
   */
  private getAffectedAreas(areaId: string): string[] {
    const area = this.areaRegistry.get(areaId);
    
    if (!area) {
      // If area not registered, only include the trigger area
      return [areaId];
    }
    
    // Include trigger area and all adjacent areas
    return [areaId, ...area.adjacentAreas];
  }

  /**
   * Notify all state change callbacks
   */
  private notifyStateChange(): void {
    const state = this.getEmergencyState();
    
    for (const callback of this.stateChangeCallbacks) {
      try {
        // Use setTimeout to avoid blocking
        setTimeout(() => callback(state), 0);
      } catch (error) {
        console.error('Error in emergency state change callback:', error);
      }
    }
  }

  /**
   * Log emergency action
   * 
   * Requirement 5.5: Log activation/deactivation events
   * 
   * @param action - Action type
   * @param areaId - Area ID
   * @param trigger - Trigger type
   * @param adminId - Admin ID
   * @param affectedAreas - Affected area IDs
   */
  private logEmergencyAction(
    action: 'activated' | 'deactivated',
    areaId: string,
    trigger: EmergencyTrigger,
    adminId: string | undefined,
    affectedAreas: string[]
  ): void {
    const logEntry: EmergencyLogEntry = {
      timestamp: Date.now(),
      action,
      trigger,
      adminId,
      areaId,
      affectedAreas,
    };
    
    this.activationLog.unshift(logEntry);
    
    // Limit log size
    if (this.activationLog.length > this.MAX_LOG_SIZE) {
      this.activationLog.pop();
    }
  }

  /**
   * Register a monitored area
   * Used to determine adjacent areas for emergency expansion
   * 
   * @param area - Monitored area
   */
  registerArea(area: MonitoredArea): void {
    this.areaRegistry.set(area.id, area);
  }

  /**
   * Register multiple monitored areas
   * 
   * @param areas - Array of monitored areas
   */
  registerAreas(areas: MonitoredArea[]): void {
    for (const area of areas) {
      this.registerArea(area);
    }
  }

  /**
   * Get emergency activation log
   * 
   * @param limit - Maximum number of entries to return
   * @returns Array of log entries
   */
  getActivationLog(limit?: number): EmergencyLogEntry[] {
    if (limit) {
      return this.activationLog.slice(0, limit);
    }
    return [...this.activationLog];
  }

  /**
   * Get statistics about emergency mode
   * 
   * @returns Emergency mode statistics
   */
  getStats() {
    return {
      isActive: this.isEmergencyActive(),
      totalActivations: this.activationLog.filter(e => e.action === 'activated').length,
      totalDeactivations: this.activationLog.filter(e => e.action === 'deactivated').length,
      registeredAreas: this.areaRegistry.size,
      stateChangeCallbacks: this.stateChangeCallbacks.size,
    };
  }

  /**
   * Log emergency activation attempt
   * Task 15.1: Log all activation attempts with user ID and result
   * 
   * @param areaId - Area ID
   * @param trigger - Trigger type
   * @param adminId - Admin ID
   * @param success - Whether activation was successful
   * @param reason - Reason for failure (if applicable)
   */
  private logActivationAttempt(
    areaId: string,
    trigger: EmergencyTrigger,
    adminId: string | undefined,
    success: boolean,
    reason?: string
  ): void {
    const attempt: EmergencyActivationAttempt = {
      timestamp: Date.now(),
      areaId,
      trigger,
      adminId,
      success,
      reason,
    };
    
    this.activationAttempts.unshift(attempt);
    
    // Limit log size
    if (this.activationAttempts.length > this.MAX_LOG_SIZE) {
      this.activationAttempts.pop();
    }
    
    // Log to console
    if (success) {
      console.log(`Emergency activation successful: ${areaId} by ${adminId || 'system'}`);
    } else {
      console.warn(`Emergency activation failed: ${areaId} by ${adminId || 'system'} - ${reason}`);
    }
  }

  /**
   * Get emergency activation attempts log
   * 
   * @param limit - Maximum number of entries to return
   * @returns Array of activation attempt entries
   */
  getActivationAttempts(limit?: number): EmergencyActivationAttempt[] {
    if (limit) {
      return this.activationAttempts.slice(0, limit);
    }
    return [...this.activationAttempts];
  }

  /**
   * Clear all state and logs
   * Useful for testing
   */
  clearAll(): void {
    this.emergencyState = null;
    this.activationLog = [];
    this.activationAttempts = [];
    this.stateChangeCallbacks.clear();
  }

  /**
   * Generate emergency alert event
   * Helper method to create alert events for emergency activation/deactivation
   * 
   * @param type - Alert type (emergency_activated or emergency_deactivated)
   * @param areaId - Area ID
   * @returns Alert event
   */
  generateEmergencyAlert(
    type: AlertType.EMERGENCY_ACTIVATED | AlertType.EMERGENCY_DEACTIVATED,
    areaId: string
  ): AlertEvent {
    const area = this.areaRegistry.get(areaId);
    const areaName = area?.name || areaId;
    const timestamp = Date.now();
    
    const alert: AlertEvent = {
      id: `EMERGENCY-${type}-${areaId}-${timestamp}`,
      type,
      severity: type === AlertType.EMERGENCY_ACTIVATED ? ThresholdLevel.EMERGENCY : ThresholdLevel.NORMAL,
      areaId,
      areaName,
      densityValue: 0, // Not applicable for emergency mode alerts
      threshold: 0, // Not applicable for emergency mode alerts
      timestamp,
      metadata: {
        location: area?.location ? 
          `${area.location.latitude.toFixed(6)}, ${area.location.longitude.toFixed(6)}` :
          'Unknown',
        affectedPilgrimCount: undefined,
        suggestedActions: type === AlertType.EMERGENCY_ACTIVATED ? [
          'Emergency mode activated',
          'Follow all staff instructions immediately',
          'Evacuate if instructed',
          'Stay alert for further updates',
        ] : [
          'Emergency mode deactivated',
          'Normal operations resumed',
          'Continue monitoring conditions',
        ],
        alternativeRoutes: area?.adjacentAreas.map(
          adjacentId => this.areaRegistry.get(adjacentId)?.name || adjacentId
        ),
      },
    };
    
    return alert;
  }
}

/**
 * Singleton instance for global use
 */
let emergencyModeManagerInstance: EmergencyModeManager | null = null;

/**
 * Get or create the singleton EmergencyModeManager instance
 */
export function getEmergencyModeManager(): EmergencyModeManager {
  if (!emergencyModeManagerInstance) {
    emergencyModeManagerInstance = new EmergencyModeManager();
  }
  return emergencyModeManagerInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetEmergencyModeManager(): void {
  emergencyModeManagerInstance = null;
}
