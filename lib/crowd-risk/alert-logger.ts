/**
 * Alert Logger Service
 * 
 * Persistent alert storage and logging system for tracking alert history,
 * acknowledgments, and resolutions.
 * Requirements: 1.4, 2.1
 */

import {
  AlertEvent,
  AlertLogEntry,
  AlertAcknowledgment,
  AlertResolution,
  NotificationResult,
} from './types';
import { getErrorHandler } from './error-handler';

/**
 * Storage interface for alert logs
 * Allows for different storage implementations (in-memory, database, etc.)
 */
interface AlertLogStorage {
  save(entry: AlertLogEntry): Promise<void>;
  get(alertId: string): Promise<AlertLogEntry | null>;
  getAll(options?: {
    areaId?: string;
    limit?: number;
    offset?: number;
  }): Promise<AlertLogEntry[]>;
  update(alertId: string, updates: Partial<AlertLogEntry>): Promise<void>;
}

/**
 * In-memory storage implementation with optimized indexing
 * Requirement: Add storage mechanism (in-memory with persistence option)
 * Task 17.2: Add database indexes for alert history queries
 */
class InMemoryAlertLogStorage implements AlertLogStorage {
  private logs: Map<string, AlertLogEntry> = new Map();
  private persistenceEnabled: boolean;
  private persistenceKey = 'crowd-risk-alert-logs';
  
  // Indexes for optimized queries
  private areaIndex: Map<string, Set<string>> = new Map(); // areaId -> Set of alertIds
  private timestampIndex: AlertLogEntry[] = []; // Sorted by timestamp
  private severityIndex: Map<string, Set<string>> = new Map(); // severity -> Set of alertIds
  private acknowledgedIndex: Set<string> = new Set(); // Set of acknowledged alertIds
  private resolvedIndex: Set<string> = new Set(); // Set of resolved alertIds

  constructor(enablePersistence = false) {
    this.persistenceEnabled = enablePersistence;
    
    // Load from localStorage if persistence is enabled
    if (this.persistenceEnabled && typeof window !== 'undefined') {
      this.loadFromPersistence();
    }
  }

  async save(entry: AlertLogEntry): Promise<void> {
    this.logs.set(entry.id, entry);
    
    // Update indexes
    this.updateIndexes(entry);
    
    if (this.persistenceEnabled) {
      await this.saveToPersistence();
    }
  }

  async get(alertId: string): Promise<AlertLogEntry | null> {
    return this.logs.get(alertId) || null;
  }

  async getAll(options?: {
    areaId?: string;
    limit?: number;
    offset?: number;
  }): Promise<AlertLogEntry[]> {
    let entries: AlertLogEntry[];

    // Use area index if filtering by area
    if (options?.areaId) {
      const alertIds = this.areaIndex.get(options.areaId);
      if (!alertIds || alertIds.size === 0) {
        return [];
      }
      entries = Array.from(alertIds)
        .map(id => this.logs.get(id))
        .filter((entry): entry is AlertLogEntry => entry !== undefined);
      
      // Sort by timestamp (newest first)
      entries.sort((a, b) => b.alertEvent.timestamp - a.alertEvent.timestamp);
    } else {
      // Use timestamp index for full queries
      entries = [...this.timestampIndex];
    }

    // Apply pagination
    const offset = options?.offset || 0;
    const limit = options?.limit || entries.length;
    
    return entries.slice(offset, offset + limit);
  }

  async update(alertId: string, updates: Partial<AlertLogEntry>): Promise<void> {
    const existing = this.logs.get(alertId);
    if (!existing) {
      throw new Error(`Alert log entry not found: ${alertId}`);
    }

    const updated = { ...existing, ...updates };
    this.logs.set(alertId, updated);
    
    // Update indexes
    this.updateIndexes(updated);

    if (this.persistenceEnabled) {
      await this.saveToPersistence();
    }
  }
  
  /**
   * Update all indexes for an entry
   * Task 17.2: Maintain indexes for optimized queries
   */
  private updateIndexes(entry: AlertLogEntry): void {
    // Update area index
    const areaId = entry.alertEvent.areaId;
    if (!this.areaIndex.has(areaId)) {
      this.areaIndex.set(areaId, new Set());
    }
    this.areaIndex.get(areaId)!.add(entry.id);
    
    // Update severity index
    const severity = entry.alertEvent.severity;
    if (!this.severityIndex.has(severity)) {
      this.severityIndex.set(severity, new Set());
    }
    this.severityIndex.get(severity)!.add(entry.id);
    
    // Update acknowledged index
    if (entry.acknowledgments.length > 0) {
      this.acknowledgedIndex.add(entry.id);
    } else {
      this.acknowledgedIndex.delete(entry.id);
    }
    
    // Update resolved index
    if (entry.resolution) {
      this.resolvedIndex.add(entry.id);
    } else {
      this.resolvedIndex.delete(entry.id);
    }
    
    // Update timestamp index
    const existingIndex = this.timestampIndex.findIndex(e => e.id === entry.id);
    if (existingIndex !== -1) {
      this.timestampIndex[existingIndex] = entry;
    } else {
      this.timestampIndex.push(entry);
    }
    
    // Keep timestamp index sorted
    this.timestampIndex.sort((a, b) => b.alertEvent.timestamp - a.alertEvent.timestamp);
  }
  
  /**
   * Rebuild all indexes from current logs
   */
  private rebuildIndexes(): void {
    this.areaIndex.clear();
    this.severityIndex.clear();
    this.acknowledgedIndex.clear();
    this.resolvedIndex.clear();
    this.timestampIndex = [];
    
    for (const entry of this.logs.values()) {
      this.updateIndexes(entry);
    }
  }

  /**
   * Load logs from localStorage
   */
  private loadFromPersistence(): void {
    try {
      const stored = localStorage.getItem(this.persistenceKey);
      if (stored) {
        const entries: AlertLogEntry[] = JSON.parse(stored);
        entries.forEach(entry => {
          this.logs.set(entry.id, entry);
        });
        // Rebuild indexes after loading
        this.rebuildIndexes();
      }
    } catch (error) {
      console.error('Failed to load alert logs from persistence:', error);
    }
  }

  /**
   * Save logs to localStorage
   */
  private async saveToPersistence(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const entries = Array.from(this.logs.values());
      localStorage.setItem(this.persistenceKey, JSON.stringify(entries));
    } catch (error) {
      console.error('Failed to save alert logs to persistence:', error);
    }
  }

  /**
   * Clear all logs (useful for testing)
   */
  clear(): void {
    this.logs.clear();
    this.areaIndex.clear();
    this.severityIndex.clear();
    this.acknowledgedIndex.clear();
    this.resolvedIndex.clear();
    this.timestampIndex = [];
    
    if (this.persistenceEnabled && typeof window !== 'undefined') {
      localStorage.removeItem(this.persistenceKey);
    }
  }

  /**
   * Get storage statistics
   */
  getStats() {
    return {
      totalEntries: this.logs.size,
      persistenceEnabled: this.persistenceEnabled,
      indexSizes: {
        areas: this.areaIndex.size,
        severities: this.severityIndex.size,
        acknowledged: this.acknowledgedIndex.size,
        resolved: this.resolvedIndex.size,
        timestampIndex: this.timestampIndex.length,
      },
    };
  }
  
  /**
   * Query alerts with advanced filtering using indexes
   * Task 17.2: Optimized queries using indexes
   */
  async query(filters: {
    areaId?: string;
    severity?: string;
    acknowledged?: boolean;
    resolved?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<AlertLogEntry[]> {
    let candidateIds: Set<string> | null = null;
    
    // Apply filters using indexes
    if (filters.areaId) {
      candidateIds = this.areaIndex.get(filters.areaId) || new Set();
    }
    
    if (filters.severity) {
      const severityIds = this.severityIndex.get(filters.severity) || new Set();
      candidateIds = candidateIds 
        ? new Set([...candidateIds].filter(id => severityIds.has(id)))
        : severityIds;
    }
    
    if (filters.acknowledged !== undefined) {
      const acknowledgedIds = filters.acknowledged ? this.acknowledgedIndex : 
        new Set([...this.logs.keys()].filter(id => !this.acknowledgedIndex.has(id)));
      candidateIds = candidateIds
        ? new Set([...candidateIds].filter(id => acknowledgedIds.has(id)))
        : acknowledgedIds;
    }
    
    if (filters.resolved !== undefined) {
      const resolvedIds = filters.resolved ? this.resolvedIndex :
        new Set([...this.logs.keys()].filter(id => !this.resolvedIndex.has(id)));
      candidateIds = candidateIds
        ? new Set([...candidateIds].filter(id => resolvedIds.has(id)))
        : resolvedIds;
    }
    
    // Get entries
    let entries: AlertLogEntry[];
    if (candidateIds) {
      entries = Array.from(candidateIds)
        .map(id => this.logs.get(id))
        .filter((entry): entry is AlertLogEntry => entry !== undefined);
      
      // Sort by timestamp
      entries.sort((a, b) => b.alertEvent.timestamp - a.alertEvent.timestamp);
    } else {
      entries = [...this.timestampIndex];
    }
    
    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || entries.length;
    
    return entries.slice(offset, offset + limit);
  }
}

/**
 * AlertLogger service class
 * 
 * Requirement 1.4: Alert history and tracking
 * Requirement 2.1: Alert acknowledgment workflow
 */
export class AlertLogger {
  private storage: AlertLogStorage;

  constructor(storage?: AlertLogStorage, enablePersistence = false) {
    this.storage = storage || new InMemoryAlertLogStorage(enablePersistence);
  }

  /**
   * Log an alert event with notification results
   * 
   * Requirement: Implement logAlert method to store AlertLogEntry with notification results
   * 
   * @param alert - Alert event to log
   * @param adminNotifications - Admin notification results
   * @param pilgrimCount - Number of pilgrims notified
   */
  async logAlert(
    alert: AlertEvent,
    adminNotifications: NotificationResult[],
    pilgrimCount: number
  ): Promise<void> {
    const errorHandler = getErrorHandler();

    try {
      const logEntry: AlertLogEntry = {
        id: alert.id,
        alertEvent: alert,
        notificationResults: {
          adminNotifications,
          pilgrimCount,
        },
        acknowledgments: [],
        resolution: undefined,
      };

      await this.storage.save(logEntry);
    } catch (error) {
      errorHandler.handleSystemError(
        error instanceof Error ? error : new Error('Failed to log alert'),
        'alert-logging',
        { alertId: alert.id }
      );
      throw error;
    }
  }

  /**
   * Update notification results for an existing alert log
   * Used when notification results are available after initial logging
   * 
   * @param alertId - Alert ID
   * @param adminNotifications - Admin notification results
   * @param pilgrimCount - Number of pilgrims notified
   */
  async updateNotificationResults(
    alertId: string,
    adminNotifications: NotificationResult[],
    pilgrimCount: number
  ): Promise<void> {
    const errorHandler = getErrorHandler();

    try {
      const existing = await this.storage.get(alertId);
      if (!existing) {
        // If log doesn't exist yet, this might be called before logAlert
        // Just log a warning and return
        console.warn(`Alert log not found for updating notification results: ${alertId}`);
        return;
      }

      await this.storage.update(alertId, {
        notificationResults: {
          adminNotifications: [
            ...existing.notificationResults.adminNotifications,
            ...adminNotifications,
          ],
          pilgrimCount: existing.notificationResults.pilgrimCount + pilgrimCount,
        },
      });
    } catch (error) {
      errorHandler.handleSystemError(
        error instanceof Error ? error : new Error('Failed to update notification results'),
        'notification-results-update',
        { alertId }
      );
      throw error;
    }
  }

  /**
   * Log an acknowledgment for an alert
   * 
   * Requirement: Implement logAcknowledgment method to record admin acknowledgments
   * 
   * @param alertId - Alert ID
   * @param adminId - Admin ID who acknowledged
   */
  async logAcknowledgment(alertId: string, adminId: string): Promise<void> {
    const errorHandler = getErrorHandler();

    try {
      const existing = await this.storage.get(alertId);
      if (!existing) {
        throw new Error(`Alert log entry not found: ${alertId}`);
      }

      // Check if already acknowledged by this admin
      const alreadyAcknowledged = existing.acknowledgments.some(
        ack => ack.adminId === adminId
      );

      if (alreadyAcknowledged) {
        // Already acknowledged, no need to log again
        return;
      }

      const acknowledgment: AlertAcknowledgment = {
        adminId,
        timestamp: Date.now(),
      };

      await this.storage.update(alertId, {
        acknowledgments: [...existing.acknowledgments, acknowledgment],
      });
    } catch (error) {
      errorHandler.handleSystemError(
        error instanceof Error ? error : new Error('Failed to log acknowledgment'),
        'acknowledgment-logging',
        { alertId, adminId }
      );
      throw error;
    }
  }

  /**
   * Log a resolution for an alert
   * 
   * Requirement: Implement logResolution method to record alert resolutions
   * 
   * @param alertId - Alert ID
   * @param resolvedBy - Admin ID who resolved the alert
   * @param notes - Resolution notes
   */
  async logResolution(
    alertId: string,
    resolvedBy: string,
    notes: string
  ): Promise<void> {
    const errorHandler = getErrorHandler();

    try {
      const existing = await this.storage.get(alertId);
      if (!existing) {
        throw new Error(`Alert log entry not found: ${alertId}`);
      }

      if (existing.resolution) {
        throw new Error(`Alert already resolved: ${alertId}`);
      }

      const resolution: AlertResolution = {
        resolvedAt: Date.now(),
        resolvedBy,
        notes,
      };

      await this.storage.update(alertId, {
        resolution,
      });
    } catch (error) {
      errorHandler.handleSystemError(
        error instanceof Error ? error : new Error('Failed to log resolution'),
        'resolution-logging',
        { alertId, resolvedBy }
      );
      throw error;
    }
  }

  /**
   * Get alert log entry by ID
   * 
   * @param alertId - Alert ID
   * @returns Alert log entry or null if not found
   */
  async getAlertLog(alertId: string): Promise<AlertLogEntry | null> {
    try {
      return await this.storage.get(alertId);
    } catch (error) {
      const errorHandler = getErrorHandler();
      errorHandler.handleSystemError(
        error instanceof Error ? error : new Error('Failed to get alert log'),
        'alert-log-retrieval',
        { alertId }
      );
      return null;
    }
  }

  /**
   * Get alert logs with optional filtering
   * 
   * @param options - Filter options
   * @returns Array of alert log entries
   */
  async getAlertLogs(options?: {
    areaId?: string;
    limit?: number;
    offset?: number;
  }): Promise<AlertLogEntry[]> {
    try {
      return await this.storage.getAll(options);
    } catch (error) {
      const errorHandler = getErrorHandler();
      errorHandler.handleSystemError(
        error instanceof Error ? error : new Error('Failed to get alert logs'),
        'alert-logs-retrieval',
        { options }
      );
      return [];
    }
  }

  /**
   * Get unresolved alerts
   * 
   * @param areaId - Optional area ID filter
   * @returns Array of unresolved alert log entries
   */
  async getUnresolvedAlerts(areaId?: string): Promise<AlertLogEntry[]> {
    const allLogs = await this.getAlertLogs({ areaId });
    return allLogs.filter(log => !log.resolution);
  }

  /**
   * Get unacknowledged alerts
   * 
   * @param areaId - Optional area ID filter
   * @returns Array of unacknowledged alert log entries
   */
  async getUnacknowledgedAlerts(areaId?: string): Promise<AlertLogEntry[]> {
    const allLogs = await this.getAlertLogs({ areaId });
    return allLogs.filter(log => log.acknowledgments.length === 0);
  }

  /**
   * Get alert statistics
   * 
   * @param areaId - Optional area ID filter
   * @returns Alert statistics
   */
  async getAlertStats(areaId?: string): Promise<{
    total: number;
    acknowledged: number;
    unacknowledged: number;
    resolved: number;
    unresolved: number;
    bySeverity: Record<string, number>;
  }> {
    const allLogs = await this.getAlertLogs({ areaId });

    const stats = {
      total: allLogs.length,
      acknowledged: allLogs.filter(log => log.acknowledgments.length > 0).length,
      unacknowledged: allLogs.filter(log => log.acknowledgments.length === 0).length,
      resolved: allLogs.filter(log => log.resolution !== undefined).length,
      unresolved: allLogs.filter(log => log.resolution === undefined).length,
      bySeverity: {} as Record<string, number>,
    };

    // Count by severity
    allLogs.forEach(log => {
      const severity = log.alertEvent.severity;
      stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear all logs (useful for testing)
   */
  clearAll(): void {
    if (this.storage instanceof InMemoryAlertLogStorage) {
      this.storage.clear();
    }
  }

  /**
   * Get storage statistics
   */
  getStorageStats() {
    if (this.storage instanceof InMemoryAlertLogStorage) {
      return this.storage.getStats();
    }
    return { totalEntries: 0, persistenceEnabled: false };
  }

  /**
   * Get filtered alert history with advanced filtering
   * 
   * Task 14.2: Create getFilteredAlertHistory method to support filtering
   * 
   * @param filters - Filter options
   * @returns Filtered alert log entries
   */
  async getFilteredAlertHistory(filters: {
    areaIds?: string[];
    severities?: string[];
    alertTypes?: string[];
    acknowledgmentStatus?: 'all' | 'acknowledged' | 'unacknowledged';
    startTime?: number;
    endTime?: number;
    limit?: number;
    offset?: number;
  }): Promise<AlertLogEntry[]> {
    try {
      // Get all logs (or use optimized query if available)
      let logs: AlertLogEntry[];
      
      if (this.storage instanceof InMemoryAlertLogStorage) {
        // Use optimized query method
        logs = await this.storage.query({
          limit: filters.limit,
          offset: filters.offset,
        });
      } else {
        logs = await this.storage.getAll({
          limit: filters.limit,
          offset: filters.offset,
        });
      }

      // Apply filters
      let filtered = logs;

      // Filter by area IDs
      if (filters.areaIds && filters.areaIds.length > 0) {
        filtered = filtered.filter(log => 
          filters.areaIds!.includes(log.alertEvent.areaId)
        );
      }

      // Filter by severities
      if (filters.severities && filters.severities.length > 0) {
        filtered = filtered.filter(log =>
          filters.severities!.includes(log.alertEvent.severity)
        );
      }

      // Filter by alert types
      if (filters.alertTypes && filters.alertTypes.length > 0) {
        filtered = filtered.filter(log =>
          filters.alertTypes!.includes(log.alertEvent.type)
        );
      }

      // Filter by acknowledgment status
      if (filters.acknowledgmentStatus && filters.acknowledgmentStatus !== 'all') {
        if (filters.acknowledgmentStatus === 'acknowledged') {
          filtered = filtered.filter(log => log.acknowledgments.length > 0);
        } else if (filters.acknowledgmentStatus === 'unacknowledged') {
          filtered = filtered.filter(log => log.acknowledgments.length === 0);
        }
      }

      // Filter by time range
      if (filters.startTime !== undefined) {
        filtered = filtered.filter(log => 
          log.alertEvent.timestamp >= filters.startTime!
        );
      }

      if (filters.endTime !== undefined) {
        filtered = filtered.filter(log =>
          log.alertEvent.timestamp <= filters.endTime!
        );
      }

      return filtered;
    } catch (error) {
      const errorHandler = getErrorHandler();
      errorHandler.handleSystemError(
        error instanceof Error ? error : new Error('Failed to get filtered alert history'),
        'filtered-alert-history-retrieval',
        { filters }
      );
      return [];
    }
  }
}

/**
 * Singleton instance for global use
 */
let alertLoggerInstance: AlertLogger | null = null;

/**
 * Get or create the singleton AlertLogger instance
 * 
 * @param enablePersistence - Enable localStorage persistence (default: false)
 */
export function getAlertLogger(enablePersistence = false): AlertLogger {
  if (!alertLoggerInstance) {
    alertLoggerInstance = new AlertLogger(undefined, enablePersistence);
  }
  return alertLoggerInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetAlertLogger(): void {
  alertLoggerInstance = null;
}

/**
 * Export storage interface for custom implementations
 */
export type { AlertLogStorage };
