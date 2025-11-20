/**
 * Alert Engine Service
 * 
 * Generates and routes alert events based on threshold evaluations.
 * Requirements: 1.2, 1.4, 2.3, 2.4
 */

import {
  AlertEngine as IAlertEngine,
  AlertEvent,
  AlertType,
  ThresholdEvaluation,
  ThresholdLevel,
  MonitoredArea,
  EmergencyTrigger,
} from './types';
import { getEmergencyModeManager } from './emergency-mode-manager';
import { getErrorHandler } from './error-handler';
import { getAlertLogger } from './alert-logger';

/**
 * Alert subscriber callback type
 */
type AlertSubscriber = (alert: AlertEvent) => void;

/**
 * Alert deduplication entry
 */
interface DeduplicationEntry {
  alertId: string;
  timestamp: number;
  areaId: string;
  type: AlertType;
  severity: ThresholdLevel;
}

/**
 * AlertEngine implementation
 * 
 * Requirement 1.2: Generate alert events when thresholds are crossed
 * Requirement 1.4: Alert history and tracking
 * Requirement 2.3: Severity-based prioritization
 * Requirement 2.4: Alert acknowledgment workflow
 */
export class AlertEngine implements IAlertEngine {
  private subscribers: Set<AlertSubscriber> = new Set();
  private alertHistory: Map<string, AlertEvent[]> = new Map();
  private acknowledgments: Map<string, { adminId: string; timestamp: number }[]> = new Map();
  private deduplicationCache: Map<string, DeduplicationEntry> = new Map();
  private areaRegistry: Map<string, MonitoredArea> = new Map();
  private activeAlertsCache: { alerts: AlertEvent[]; timestamp: number } | null = null;
  
  // Deduplication window: 30 seconds
  private readonly DEDUPLICATION_WINDOW_MS = 30000;
  
  // Maximum history entries per area
  private readonly MAX_HISTORY_PER_AREA = 100;
  
  // Active alerts cache TTL: 1 second
  private readonly ACTIVE_ALERTS_CACHE_TTL_MS = 1000;

  /**
   * Process threshold evaluation and generate alerts
   * 
   * Requirement 1.2: Generate density alert event when threshold crossed
   * Requirement 5.1: Automatic emergency activation on emergency threshold breach
   * 
   * @param evaluation - Threshold evaluation result
   */
  processEvaluation(evaluation: ThresholdEvaluation): void {
    const errorHandler = getErrorHandler();
    
    try {
      // Determine alert type based on evaluation
      const alertType = this.determineAlertType(evaluation);
      
      // Skip if no alert needed (e.g., staying at normal level)
      if (!alertType) {
        return;
      }
      
      // Check for duplicate alerts
      if (this.isDuplicateAlert(evaluation.areaId, alertType, evaluation.currentLevel)) {
        return;
      }
      
      // Generate alert event
      const alert = this.generateAlertEvent(evaluation, alertType);
      
      // Add to deduplication cache
      this.addToDeduplicationCache(alert);
      
      // Store in history
      this.addToHistory(alert);
      
      // Log alert to AlertLogger (auto-logging integration)
      // Notification results will be updated later by AdminNotifier integration
      const alertLogger = getAlertLogger();
      alertLogger.logAlert(alert, [], 0).catch(error => {
        errorHandler.handleSystemError(
          error instanceof Error ? error : new Error('Failed to log alert'),
          'alert-auto-logging',
          { alertId: alert.id }
        );
      });
      
      // Requirement 5.1: Automatically activate emergency mode on emergency threshold breach
      if (evaluation.currentLevel === ThresholdLevel.EMERGENCY && evaluation.isEscalation) {
        const emergencyManager = getEmergencyModeManager();
        if (!emergencyManager.isEmergencyActive()) {
          emergencyManager.activateEmergency(
            evaluation.areaId,
            EmergencyTrigger.AUTOMATIC
          );
        }
      }
      
      // Notify subscribers with severity-based prioritization
      this.notifySubscribers(alert);
      
    } catch (error) {
      errorHandler.handleSystemError(
        error instanceof Error ? error : new Error('Unknown error processing evaluation'),
        'alert-evaluation-processing',
        { evaluation }
      );
    }
  }

  /**
   * Determine alert type based on evaluation
   * 
   * Requirement 1.2: Alert type determination (threshold_violation, density_normalized, etc.)
   * 
   * @param evaluation - Threshold evaluation result
   * @returns Alert type or null if no alert needed
   */
  private determineAlertType(evaluation: ThresholdEvaluation): AlertType | null {
    const { currentLevel, previousLevel, isEscalation } = evaluation;
    
    // Threshold violation: level escalated from normal or increased severity
    if (isEscalation && currentLevel !== ThresholdLevel.NORMAL) {
      return AlertType.THRESHOLD_VIOLATION;
    }
    
    // Density normalized: returned to normal from elevated level
    if (currentLevel === ThresholdLevel.NORMAL && previousLevel !== ThresholdLevel.NORMAL) {
      return AlertType.DENSITY_NORMALIZED;
    }
    
    // No alert needed for staying at same level or de-escalation within elevated levels
    return null;
  }

  /**
   * Generate alert event with unique ID and metadata
   * 
   * Requirement 1.2: Generate unique alert IDs and enrich with metadata
   * Requirement 1.4: Alert metadata and context
   * 
   * @param evaluation - Threshold evaluation result
   * @param type - Alert type
   * @returns Generated alert event
   */
  private generateAlertEvent(
    evaluation: ThresholdEvaluation,
    type: AlertType
  ): AlertEvent {
    // Generate unique alert ID
    const alertId = this.generateAlertId(evaluation.areaId, evaluation.timestamp);
    
    // Get area information
    const area = this.areaRegistry.get(evaluation.areaId);
    const areaName = area?.name || evaluation.areaId;
    
    // Generate suggested actions based on severity
    const suggestedActions = this.generateSuggestedActions(evaluation.currentLevel);
    
    // Generate alternative routes if available
    const alternativeRoutes = area?.adjacentAreas.map(
      adjacentId => this.areaRegistry.get(adjacentId)?.name || adjacentId
    );
    
    // Create alert event
    const alert: AlertEvent = {
      id: alertId,
      type,
      severity: evaluation.currentLevel,
      areaId: evaluation.areaId,
      areaName,
      densityValue: evaluation.densityValue,
      threshold: evaluation.threshold,
      timestamp: evaluation.timestamp,
      metadata: {
        location: area?.location ? 
          `${area.location.latitude.toFixed(6)}, ${area.location.longitude.toFixed(6)}` :
          'Unknown',
        affectedPilgrimCount: this.estimateAffectedPilgrims(evaluation, area),
        suggestedActions,
        alternativeRoutes,
      },
    };
    
    return alert;
  }

  /**
   * Generate unique alert ID
   * 
   * Requirement 1.2: Generate unique alert IDs for tracking
   * 
   * @param areaId - Area ID
   * @param timestamp - Timestamp
   * @returns Unique alert ID
   */
  private generateAlertId(areaId: string, timestamp: number): string {
    // Format: ALERT-{areaId}-{timestamp}-{random}
    const random = Math.random().toString(36).substring(2, 8);
    return `ALERT-${areaId}-${timestamp}-${random}`;
  }

  /**
   * Generate suggested actions based on severity level
   * 
   * Requirement 3.2: Clear guidance and suggested actions
   * 
   * @param severity - Threshold level
   * @returns Array of suggested actions
   */
  private generateSuggestedActions(severity: ThresholdLevel): string[] {
    switch (severity) {
      case ThresholdLevel.EMERGENCY:
        return [
          'Evacuate the area immediately',
          'Follow staff instructions',
          'Move to designated safe zones',
          'Do not return until all-clear is given',
        ];
      
      case ThresholdLevel.CRITICAL:
        return [
          'Avoid entering this area',
          'If in the area, move to less crowded zones',
          'Follow staff guidance',
          'Stay alert for further updates',
        ];
      
      case ThresholdLevel.WARNING:
        return [
          'Consider alternative routes',
          'Proceed with caution',
          'Monitor crowd conditions',
          'Be prepared to change plans',
        ];
      
      case ThresholdLevel.NORMAL:
        return [
          'Area is safe to enter',
          'Normal movement permitted',
          'Continue monitoring conditions',
        ];
      
      default:
        return ['Monitor conditions and follow staff guidance'];
    }
  }

  /**
   * Estimate affected pilgrim count based on density and area capacity
   * 
   * @param evaluation - Threshold evaluation
   * @param area - Monitored area
   * @returns Estimated pilgrim count
   */
  private estimateAffectedPilgrims(
    evaluation: ThresholdEvaluation,
    area?: MonitoredArea
  ): number | undefined {
    if (!area) {
      return undefined;
    }
    
    // If density is in percentage, calculate based on capacity
    // Otherwise, estimate based on area size (assuming reasonable area size)
    const estimatedCount = Math.round(evaluation.densityValue * area.capacity / 100);
    
    return estimatedCount > 0 ? estimatedCount : undefined;
  }

  /**
   * Check if alert is a duplicate within deduplication window
   * 
   * Requirement 1.2: Add alert deduplication logic
   * 
   * @param areaId - Area ID
   * @param type - Alert type
   * @param severity - Severity level
   * @returns True if duplicate
   */
  private isDuplicateAlert(
    areaId: string,
    type: AlertType,
    severity: ThresholdLevel
  ): boolean {
    const key = `${areaId}-${type}-${severity}`;
    const cached = this.deduplicationCache.get(key);
    
    if (!cached) {
      return false;
    }
    
    // Check if within deduplication window
    const age = Date.now() - cached.timestamp;
    if (age > this.DEDUPLICATION_WINDOW_MS) {
      // Expired, remove from cache
      this.deduplicationCache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Add alert to deduplication cache
   * 
   * @param alert - Alert event
   */
  private addToDeduplicationCache(alert: AlertEvent): void {
    const key = `${alert.areaId}-${alert.type}-${alert.severity}`;
    
    this.deduplicationCache.set(key, {
      alertId: alert.id,
      timestamp: alert.timestamp,
      areaId: alert.areaId,
      type: alert.type,
      severity: alert.severity,
    });
    
    // Clean up old entries
    this.cleanupDeduplicationCache();
  }

  /**
   * Clean up expired deduplication cache entries
   */
  private cleanupDeduplicationCache(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.deduplicationCache.entries()) {
      const age = now - entry.timestamp;
      if (age > this.DEDUPLICATION_WINDOW_MS) {
        this.deduplicationCache.delete(key);
      }
    }
  }

  /**
   * Add alert to history
   * 
   * Requirement 1.4: Alert history tracking
   * Optimized: Invalidate active alerts cache when new alert is added
   * 
   * @param alert - Alert event
   */
  private addToHistory(alert: AlertEvent): void {
    const history = this.alertHistory.get(alert.areaId) || [];
    
    // Add to beginning of array (most recent first)
    history.unshift(alert);
    
    // Limit history size
    if (history.length > this.MAX_HISTORY_PER_AREA) {
      history.pop();
    }
    
    this.alertHistory.set(alert.areaId, history);
    
    // Invalidate active alerts cache
    this.activeAlertsCache = null;
  }

  /**
   * Notify subscribers with severity-based prioritization
   * 
   * Requirement 2.3: Severity-based prioritization
   * 
   * @param alert - Alert event
   */
  private notifySubscribers(alert: AlertEvent): void {
    const errorHandler = getErrorHandler();
    
    // Emergency alerts are processed immediately
    // Other alerts can be batched if needed in future
    
    for (const callback of this.subscribers) {
      try {
        // Use setTimeout to avoid blocking
        setTimeout(() => {
          try {
            callback(alert);
          } catch (error) {
            errorHandler.handleSystemError(
              error instanceof Error ? error : new Error('Unknown error in alert subscriber'),
              'alert-subscriber-notification',
              { alertId: alert.id, areaId: alert.areaId }
            );
          }
        }, 0);
      } catch (error) {
        errorHandler.handleSystemError(
          error instanceof Error ? error : new Error('Unknown error scheduling alert notification'),
          'alert-subscriber-scheduling',
          { alertId: alert.id }
        );
      }
    }
  }

  /**
   * Subscribe to alert events
   * 
   * Requirement 2.3: Observer pattern for alert distribution
   * 
   * @param callback - Callback function called on each alert
   * @returns Unsubscribe function
   */
  subscribeToAlerts(callback: AlertSubscriber): () => void {
    this.subscribers.add(callback);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Get alert history for an area
   * 
   * Requirement 1.4: Alert history retrieval
   * 
   * @param areaId - Area ID
   * @param limit - Maximum number of alerts to return
   * @returns Array of alert events
   */
  async getAlertHistory(areaId: string, limit: number): Promise<AlertEvent[]> {
    const history = this.alertHistory.get(areaId) || [];
    return history.slice(0, limit);
  }

  /**
   * Acknowledge an alert
   * 
   * Requirement 2.4: Alert acknowledgment workflow
   * Optimized: Invalidate active alerts cache when alert is acknowledged
   * 
   * @param alertId - Alert ID
   * @param adminId - Admin ID who acknowledged
   */
  async acknowledgeAlert(alertId: string, adminId: string): Promise<void> {
    const acknowledgments = this.acknowledgments.get(alertId) || [];
    
    // Check if already acknowledged by this admin
    const alreadyAcknowledged = acknowledgments.some(ack => ack.adminId === adminId);
    if (alreadyAcknowledged) {
      return;
    }
    
    // Add acknowledgment
    acknowledgments.push({
      adminId,
      timestamp: Date.now(),
    });
    
    this.acknowledgments.set(alertId, acknowledgments);
    
    // Invalidate active alerts cache
    this.activeAlertsCache = null;
    
    // Log acknowledgment to AlertLogger
    const alertLogger = getAlertLogger();
    try {
      await alertLogger.logAcknowledgment(alertId, adminId);
    } catch (error) {
      const errorHandler = getErrorHandler();
      errorHandler.handleSystemError(
        error instanceof Error ? error : new Error('Failed to log acknowledgment'),
        'acknowledgment-logging-integration',
        { alertId, adminId }
      );
    }
  }

  /**
   * Check if alert is acknowledged
   * 
   * @param alertId - Alert ID
   * @returns True if acknowledged
   */
  isAlertAcknowledged(alertId: string): boolean {
    const acknowledgments = this.acknowledgments.get(alertId);
    return acknowledgments !== undefined && acknowledgments.length > 0;
  }

  /**
   * Get acknowledgments for an alert
   * 
   * @param alertId - Alert ID
   * @returns Array of acknowledgments
   */
  getAlertAcknowledgments(alertId: string): { adminId: string; timestamp: number }[] {
    return this.acknowledgments.get(alertId) || [];
  }

  /**
   * Register a monitored area
   * Used to enrich alerts with area information
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
   * Get statistics about the alert engine
   * 
   * @returns Alert engine statistics
   */
  getStats() {
    return {
      subscriberCount: this.subscribers.size,
      totalHistoryEntries: Array.from(this.alertHistory.values())
        .reduce((sum, history) => sum + history.length, 0),
      areasWithHistory: this.alertHistory.size,
      deduplicationCacheSize: this.deduplicationCache.size,
      registeredAreas: this.areaRegistry.size,
      totalAcknowledgments: Array.from(this.acknowledgments.values())
        .reduce((sum, acks) => sum + acks.length, 0),
    };
  }

  /**
   * Clear all history and caches
   * Useful for testing
   */
  clearAll(): void {
    this.alertHistory.clear();
    this.acknowledgments.clear();
    this.deduplicationCache.clear();
    this.activeAlertsCache = null;
  }

  /**
   * Get all active (unacknowledged) alerts across all areas
   * Optimized: Cache active alerts to reduce computation
   * 
   * @returns Array of unacknowledged alerts
   */
  getActiveAlerts(): AlertEvent[] {
    const now = Date.now();
    
    // Check cache
    if (this.activeAlertsCache && 
        (now - this.activeAlertsCache.timestamp) < this.ACTIVE_ALERTS_CACHE_TTL_MS) {
      return this.activeAlertsCache.alerts;
    }
    
    const allAlerts: AlertEvent[] = [];
    
    for (const history of this.alertHistory.values()) {
      // Get recent alerts (last 5 minutes) that are not acknowledged
      const recentAlerts = history.filter(alert => {
        const age = now - alert.timestamp;
        const isRecent = age < 5 * 60 * 1000; // 5 minutes
        const isUnacknowledged = !this.isAlertAcknowledged(alert.id);
        return isRecent && isUnacknowledged;
      });
      
      allAlerts.push(...recentAlerts);
    }
    
    // Sort by severity (emergency first) then by timestamp (newest first)
    const sortedAlerts = allAlerts.sort((a, b) => {
      const severityOrder = {
        [ThresholdLevel.EMERGENCY]: 0,
        [ThresholdLevel.CRITICAL]: 1,
        [ThresholdLevel.WARNING]: 2,
        [ThresholdLevel.NORMAL]: 3,
      };
      
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) {
        return severityDiff;
      }
      
      return b.timestamp - a.timestamp;
    });
    
    // Update cache
    this.activeAlertsCache = {
      alerts: sortedAlerts,
      timestamp: now,
    };
    
    return sortedAlerts;
  }
}

/**
 * Singleton instance for global use
 */
let alertEngineInstance: AlertEngine | null = null;

/**
 * Get or create the singleton AlertEngine instance
 */
export function getAlertEngine(): AlertEngine {
  if (!alertEngineInstance) {
    alertEngineInstance = new AlertEngine();
  }
  return alertEngineInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetAlertEngine(): void {
  alertEngineInstance = null;
}
