/**
 * Pilgrim Notification Service
 * 
 * Sends safety notifications to pilgrims in affected areas.
 * Requirements: 3.1, 3.2, 3.4, 3.5
 */

import {
  PilgrimNotifier as IPilgrimNotifier,
  AlertEvent,
  PilgrimNotification,
  ThresholdLevel,
  AlertType,
  MonitoredArea,
  NotificationChannel,
} from './types';
import { getErrorHandler } from './error-handler';
import { getConnectionPool } from './connection-pool';

/**
 * Rate limit tracking entry
 */
interface RateLimitEntry {
  pilgrimId: string;
  areaId: string;
  lastNotificationTime: number;
}

/**
 * Pilgrim notification delivery result
 */
interface PilgrimDeliveryResult {
  pilgrimId: string;
  delivered: boolean;
  deliveryTime: number;
  error?: string;
}

/**
 * PilgrimNotifier implementation
 * 
 * Requirement 3.1: Send notifications to pilgrims within area within 5 seconds
 * Requirement 3.2: Provide clear guidance with suggested actions and alternative routes
 * Requirement 3.4: Rate limiting (1 notification per 5 minutes per area)
 * Requirement 3.5: All-clear notifications when density normalizes
 */
export class PilgrimNotifier implements IPilgrimNotifier {
  private rateLimitCache: Map<string, RateLimitEntry> = new Map();
  private areaRegistry: Map<string, MonitoredArea> = new Map();
  private pilgrimRegistry: Map<string, Set<string>> = new Map(); // areaId -> Set of pilgrimIds
  private notificationHistory: PilgrimNotification[] = [];
  
  // Rate limit: 1 notification per 5 minutes per area
  private readonly RATE_LIMIT_MS = 5 * 60 * 1000;
  
  // Maximum history entries to keep
  private readonly MAX_HISTORY_SIZE = 500;
  
  // Notification delivery timeout
  private readonly DELIVERY_TIMEOUT_MS = 5000;

  /**
   * Send notifications to pilgrims in affected area
   * 
   * Requirement 3.1: Send notifications to pilgrims within area within 5 seconds
   * Requirement 3.2: Provide clear guidance and suggested actions
   * 
   * @param alert - Alert event
   * @param areaId - Area ID to notify
   * @returns Number of pilgrims notified
   */
  async notifyArea(alert: AlertEvent, areaId: string): Promise<number> {
    const errorHandler = getErrorHandler();
    
    try {
      const startTime = Date.now();
      
      // Get pilgrims in the area
      const pilgrims = this.getPilgrimsInArea(areaId);
      
      if (pilgrims.length === 0) {
        console.log(`No pilgrims in area ${areaId} to notify`);
        return 0;
      }
      
      // Filter pilgrims based on rate limiting
      const eligiblePilgrims = pilgrims.filter(pilgrimId => 
        !this.isRateLimited(pilgrimId, areaId)
      );
      
      if (eligiblePilgrims.length === 0) {
        console.log(`All pilgrims in area ${areaId} are rate limited`);
        return 0;
      }
      
      // Generate notification message
      const notification = this.createPilgrimNotification(alert, areaId);
      
      // Send notifications to eligible pilgrims
      const deliveryResults = await this.deliverNotifications(
        eligiblePilgrims,
        notification
      );
      
      // Update rate limit cache for successfully notified pilgrims
      const successfulDeliveries = deliveryResults.filter(r => r.delivered);
      successfulDeliveries.forEach(result => {
        this.updateRateLimit(result.pilgrimId, areaId);
      });
      
      // Add to history
      this.addToHistory(notification);
      
      // Log delivery metrics
      const deliveryTime = Date.now() - startTime;
      console.log(
        `Notified ${successfulDeliveries.length}/${eligiblePilgrims.length} pilgrims in area ${areaId} ` +
        `(${deliveryTime}ms)`
      );
      
      // Check if delivery time exceeded target (5 seconds)
      if (deliveryTime > 5000) {
        errorHandler.handleSystemError(
          new Error('Pilgrim notification delivery exceeded 5 second target'),
          'pilgrim-notification-delivery',
          { areaId, deliveryTime, pilgrimCount: eligiblePilgrims.length }
        );
      }
      
      return successfulDeliveries.length;
      
    } catch (error) {
      errorHandler.handleNotificationFailure(
        {
          adminId: 'pilgrim-notifier',
          channel: NotificationChannel.PUSH,
          delivered: false,
          deliveryTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { areaId, alertId: alert.id }
      );
      return 0;
    }
  }

  /**
   * Send all-clear notification when density normalizes
   * 
   * Requirement 3.5: All-clear notifications when density normalizes
   * 
   * @param areaId - Area ID
   * @returns Number of pilgrims notified
   */
  async sendAllClear(areaId: string): Promise<number> {
    try {
      const startTime = Date.now();
      
      // Get pilgrims in the area
      const pilgrims = this.getPilgrimsInArea(areaId);
      
      if (pilgrims.length === 0) {
        return 0;
      }
      
      // Create all-clear notification
      const area = this.areaRegistry.get(areaId);
      const areaName = area?.name || areaId;
      
      const notification: PilgrimNotification = {
        alertId: `ALL_CLEAR-${areaId}-${Date.now()}`,
        areaId,
        severity: ThresholdLevel.NORMAL,
        message: `All clear: ${areaName} is now safe. Normal movement permitted.`,
        suggestedActions: [
          'Area is safe to enter',
          'Normal movement permitted',
          'Continue monitoring conditions',
        ],
        timestamp: Date.now(),
      };
      
      // Send to all pilgrims (no rate limiting for all-clear)
      const deliveryResults = await this.deliverNotifications(pilgrims, notification);
      
      // Add to history
      this.addToHistory(notification);
      
      const successfulDeliveries = deliveryResults.filter(r => r.delivered);
      const deliveryTime = Date.now() - startTime;
      
      console.log(
        `Sent all-clear to ${successfulDeliveries.length}/${pilgrims.length} pilgrims in area ${areaId} ` +
        `(${deliveryTime}ms)`
      );
      
      return successfulDeliveries.length;
      
    } catch (error) {
      console.error('Error sending all-clear:', error);
      return 0;
    }
  }

  /**
   * Check if pilgrim is rate limited for an area
   * 
   * Requirement 3.4: Rate limiting (1 notification per 5 minutes per area)
   * 
   * @param pilgrimId - Pilgrim ID
   * @param areaId - Area ID
   * @returns True if rate limited
   */
  checkRateLimit(pilgrimId: string, areaId: string): boolean {
    return this.isRateLimited(pilgrimId, areaId);
  }

  /**
   * Internal rate limit check
   * 
   * @param pilgrimId - Pilgrim ID
   * @param areaId - Area ID
   * @returns True if rate limited
   */
  private isRateLimited(pilgrimId: string, areaId: string): boolean {
    const key = `${pilgrimId}-${areaId}`;
    const entry = this.rateLimitCache.get(key);
    
    if (!entry) {
      return false;
    }
    
    const timeSinceLastNotification = Date.now() - entry.lastNotificationTime;
    
    if (timeSinceLastNotification >= this.RATE_LIMIT_MS) {
      // Rate limit expired, remove from cache
      this.rateLimitCache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Update rate limit cache after successful notification
   * 
   * @param pilgrimId - Pilgrim ID
   * @param areaId - Area ID
   */
  private updateRateLimit(pilgrimId: string, areaId: string): void {
    const key = `${pilgrimId}-${areaId}`;
    
    this.rateLimitCache.set(key, {
      pilgrimId,
      areaId,
      lastNotificationTime: Date.now(),
    });
    
    // Clean up old entries periodically
    this.cleanupRateLimitCache();
  }

  /**
   * Clean up expired rate limit entries
   */
  private cleanupRateLimitCache(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.rateLimitCache.entries()) {
      const age = now - entry.lastNotificationTime;
      if (age > this.RATE_LIMIT_MS) {
        this.rateLimitCache.delete(key);
      }
    }
  }

  /**
   * Create pilgrim notification from alert event
   * 
   * Requirement 3.2: Clear guidance with suggested actions and alternative routes
   * 
   * @param alert - Alert event
   * @param areaId - Area ID
   * @returns Pilgrim notification
   */
  private createPilgrimNotification(
    alert: AlertEvent,
    areaId: string
  ): PilgrimNotification {
    const area = this.areaRegistry.get(areaId);
    const areaName = area?.name || areaId;
    
    // Generate clear, actionable message
    const message = this.generateNotificationMessage(alert, areaName);
    
    // Get suggested actions from alert metadata or generate based on severity
    const suggestedActions = alert.metadata.suggestedActions || 
      this.generateSuggestedActions(alert.severity);
    
    // Get alternative routes from alert metadata
    const alternativeRoutes = alert.metadata.alternativeRoutes;
    
    const notification: PilgrimNotification = {
      alertId: alert.id,
      areaId,
      severity: alert.severity,
      message,
      suggestedActions,
      alternativeRoutes,
      timestamp: alert.timestamp,
    };
    
    return notification;
  }

  /**
   * Generate clear notification message
   * 
   * Requirement 3.2: Clear, actionable notification messages
   * 
   * @param alert - Alert event
   * @param areaName - Area name
   * @returns Notification message
   */
  private generateNotificationMessage(alert: AlertEvent, areaName: string): string {
    switch (alert.severity) {
      case ThresholdLevel.EMERGENCY:
        return `🚨 EMERGENCY: ${areaName} has reached critical crowd levels. Evacuate immediately!`;
      
      case ThresholdLevel.CRITICAL:
        return `⚠️ CRITICAL: ${areaName} is severely crowded. Avoid this area and seek alternative routes.`;
      
      case ThresholdLevel.WARNING:
        return `⚠️ WARNING: ${areaName} is experiencing high crowd density. Consider alternative routes.`;
      
      case ThresholdLevel.NORMAL:
        return `✅ ${areaName} crowd levels are normal. Safe to proceed.`;
      
      default:
        return `Crowd alert for ${areaName}. Please follow staff guidance.`;
    }
  }

  /**
   * Generate suggested actions based on severity
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
   * Deliver notifications to pilgrims
   * Optimized: Batch processing with connection pooling
   * Task 17.2: Optimize notification queue processing (parallel delivery where possible)
   * 
   * @param pilgrimIds - Array of pilgrim IDs
   * @param notification - Notification to send
   * @returns Array of delivery results
   */
  private async deliverNotifications(
    pilgrimIds: string[],
    notification: PilgrimNotification
  ): Promise<PilgrimDeliveryResult[]> {
    const BATCH_SIZE = 100; // Process 100 pilgrims at a time
    const PARALLEL_BATCHES = 5; // Process 5 batches in parallel
    const results: PilgrimDeliveryResult[] = [];
    
    // Process in batches for better performance with large pilgrim counts
    for (let i = 0; i < pilgrimIds.length; i += BATCH_SIZE * PARALLEL_BATCHES) {
      // Create multiple batches to process in parallel
      const parallelBatches: string[][] = [];
      for (let j = 0; j < PARALLEL_BATCHES; j++) {
        const startIdx = i + (j * BATCH_SIZE);
        if (startIdx < pilgrimIds.length) {
          const batch = pilgrimIds.slice(startIdx, startIdx + BATCH_SIZE);
          if (batch.length > 0) {
            parallelBatches.push(batch);
          }
        }
      }
      
      // Process all batches in parallel
      const batchPromises = parallelBatches.map(async (batch) => {
        const deliveryPromises = batch.map(pilgrimId =>
          this.deliverToPilgrim(pilgrimId, notification)
        );
        
        // Wait for batch to complete with timeout
        const batchResults = await Promise.allSettled(deliveryPromises);
        
        return batchResults.map((result, index) => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            return {
              pilgrimId: batch[index],
              delivered: false,
              deliveryTime: 0,
              error: result.reason?.message || 'Unknown error',
            };
          }
        });
      });
      
      const parallelResults = await Promise.all(batchPromises);
      results.push(...parallelResults.flat());
    }
    
    return results;
  }

  /**
   * Deliver notification to a single pilgrim
   * Task 17.2: Use connection pooling for efficient delivery
   * 
   * @param pilgrimId - Pilgrim ID
   * @param notification - Notification to send
   * @returns Delivery result
   */
  private async deliverToPilgrim(
    pilgrimId: string,
    notification: PilgrimNotification
  ): Promise<PilgrimDeliveryResult> {
    const startTime = Date.now();
    const errorHandler = getErrorHandler();
    const pool = getConnectionPool();
    
    try {
      // Acquire connection from pool for push notifications
      const connection = await pool.acquire(NotificationChannel.PUSH);
      
      try {
        // In a real implementation, this would:
        // 1. Send push notification via mobile app using the connection
        // 2. Send SMS if configured
        // 3. Update in-app notification center
        
        // For now, simulate delivery with a small delay
        await this.simulateDelivery(notification, connection.id);
        
        const deliveryTime = Date.now() - startTime;
        
        return {
          pilgrimId,
          delivered: true,
          deliveryTime,
        };
      } finally {
        // Always release connection back to pool
        pool.release(connection);
      }
      
    } catch (error) {
      const deliveryTime = Date.now() - startTime;
      
      errorHandler.handleNotificationFailure(
        {
          adminId: pilgrimId,
          channel: NotificationChannel.PUSH,
          delivered: false,
          deliveryTime,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { areaId: notification.areaId, alertId: notification.alertId }
      );
      
      return {
        pilgrimId,
        delivered: false,
        deliveryTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Simulate notification delivery
   * In production, this would integrate with push notification service
   * 
   * @param notification - Notification to send
   * @param connectionId - Connection ID from pool
   */
  private async simulateDelivery(notification: PilgrimNotification, connectionId: string): Promise<void> {
    // Simulate network delay (10-50ms)
    const delay = Math.random() * 40 + 10;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Log notification for development
    console.log(`Pilgrim notification via connection ${connectionId}:`, {
      alertId: notification.alertId,
      areaId: notification.areaId,
      severity: notification.severity,
      message: notification.message,
    });
  }

  /**
   * Get pilgrims currently in an area
   * 
   * @param areaId - Area ID
   * @returns Array of pilgrim IDs
   */
  private getPilgrimsInArea(areaId: string): string[] {
    const pilgrims = this.pilgrimRegistry.get(areaId);
    return pilgrims ? Array.from(pilgrims) : [];
  }

  /**
   * Add notification to history
   * 
   * @param notification - Notification to add
   */
  private addToHistory(notification: PilgrimNotification): void {
    this.notificationHistory.unshift(notification);
    
    // Limit history size
    if (this.notificationHistory.length > this.MAX_HISTORY_SIZE) {
      this.notificationHistory.pop();
    }
  }

  /**
   * Register a monitored area
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
   * Register pilgrim in an area
   * Used to track which pilgrims are in which areas
   * 
   * @param pilgrimId - Pilgrim ID
   * @param areaId - Area ID
   */
  registerPilgrimInArea(pilgrimId: string, areaId: string): void {
    let pilgrims = this.pilgrimRegistry.get(areaId);
    
    if (!pilgrims) {
      pilgrims = new Set();
      this.pilgrimRegistry.set(areaId, pilgrims);
    }
    
    pilgrims.add(pilgrimId);
  }

  /**
   * Unregister pilgrim from an area
   * 
   * @param pilgrimId - Pilgrim ID
   * @param areaId - Area ID
   */
  unregisterPilgrimFromArea(pilgrimId: string, areaId: string): void {
    const pilgrims = this.pilgrimRegistry.get(areaId);
    
    if (pilgrims) {
      pilgrims.delete(pilgrimId);
      
      // Clean up empty sets
      if (pilgrims.size === 0) {
        this.pilgrimRegistry.delete(areaId);
      }
    }
  }

  /**
   * Get notification history
   * 
   * @param limit - Maximum number of notifications to return
   * @returns Array of notifications
   */
  getNotificationHistory(limit?: number): PilgrimNotification[] {
    if (limit) {
      return this.notificationHistory.slice(0, limit);
    }
    return [...this.notificationHistory];
  }

  /**
   * Get notification history for a specific area
   * 
   * @param areaId - Area ID
   * @param limit - Maximum number of notifications to return
   * @returns Array of notifications
   */
  getAreaNotificationHistory(areaId: string, limit?: number): PilgrimNotification[] {
    const areaNotifications = this.notificationHistory.filter(
      n => n.areaId === areaId
    );
    
    if (limit) {
      return areaNotifications.slice(0, limit);
    }
    return areaNotifications;
  }

  /**
   * Get statistics about the pilgrim notifier
   * 
   * @returns Pilgrim notifier statistics
   */
  getStats() {
    return {
      totalNotifications: this.notificationHistory.length,
      rateLimitedPilgrims: this.rateLimitCache.size,
      registeredAreas: this.areaRegistry.size,
      totalPilgrims: Array.from(this.pilgrimRegistry.values())
        .reduce((sum, pilgrims) => sum + pilgrims.size, 0),
      areasWithPilgrims: this.pilgrimRegistry.size,
    };
  }

  /**
   * Clear all history and caches
   * Useful for testing
   */
  clearAll(): void {
    this.notificationHistory = [];
    this.rateLimitCache.clear();
    this.pilgrimRegistry.clear();
  }
}

/**
 * Singleton instance for global use
 */
let pilgrimNotifierInstance: PilgrimNotifier | null = null;

/**
 * Get or create the singleton PilgrimNotifier instance
 */
export function getPilgrimNotifier(): PilgrimNotifier {
  if (!pilgrimNotifierInstance) {
    pilgrimNotifierInstance = new PilgrimNotifier();
  }
  return pilgrimNotifierInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetPilgrimNotifier(): void {
  pilgrimNotifierInstance = null;
}
