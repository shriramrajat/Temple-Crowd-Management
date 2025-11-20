/**
 * Admin Notification Service
 * 
 * Delivers high-priority alerts to administrators through configured channels.
 * Requirements: 2.1, 2.2, 2.5
 */

import { toast } from 'sonner';
import {
  AdminNotifier as IAdminNotifier,
  AdminNotificationConfig,
  AlertEvent,
  NotificationResult,
  NotificationStats,
  NotificationChannel,
  ThresholdLevel,
  RetryConfig,
} from './types';
import { getErrorHandler } from './error-handler';
import { getAlertLogger } from './alert-logger';
import { getNotificationCache } from './notification-cache';
import { getConnectionPool } from './connection-pool';

/**
 * Notification queue entry
 */
interface NotificationQueueEntry {
  alert: AlertEvent;
  adminId: string;
  channel: NotificationChannel;
  attempts: number;
  lastAttempt?: number;
}

/**
 * AdminNotifier implementation
 * 
 * Requirement 2.1: Deliver notifications to Admin Dashboard within 3 seconds
 * Requirement 2.2: Include location, density, threshold, timestamp in notifications
 * Requirement 2.5: Multi-channel delivery with configurable preferences
 */
export class AdminNotifier implements IAdminNotifier {
  private configs: Map<string, AdminNotificationConfig> = new Map();
  private deliveryHistory: NotificationResult[] = [];
  private notificationQueue: NotificationQueueEntry[] = [];
  private isProcessingQueue = false;
  private batchQueue: Map<NotificationChannel, NotificationQueueEntry[]> = new Map();
  private batchTimer: NodeJS.Timeout | null = null;
  
  // Retry configuration
  private readonly retryConfig: RetryConfig = {
    maxAttempts: 3,
    backoffMs: 1000,
    backoffMultiplier: 2,
  };
  
  // Maximum history entries to keep
  private readonly MAX_HISTORY_SIZE = 1000;
  
  // Batch processing configuration
  private readonly BATCH_WINDOW_MS = 100; // 100ms batch window
  private readonly MAX_BATCH_SIZE = 50; // Maximum notifications per batch

  /**
   * Send alert to specified admins
   * Requirement 2.1: Deliver within 3 seconds
   * Requirement 2.2: Include all required metadata
   * Optimized: Batch notifications by channel for parallel delivery
   */
  async sendAlert(alert: AlertEvent, admins: string[]): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    const startTime = Date.now();
    
    // Group notifications by channel for batch processing
    const channelGroups = new Map<NotificationChannel, Array<{ adminId: string; config?: AdminNotificationConfig }>>();

    for (const adminId of admins) {
      const config = this.getAdminConfig(adminId);
      
      // Determine which channels to use
      const channels = this.getChannelsForAlert(alert, config);
      
      for (const channel of channels) {
        if (!channelGroups.has(channel)) {
          channelGroups.set(channel, []);
        }
        channelGroups.get(channel)!.push({ adminId, config });
      }
    }

    // Process each channel group in parallel
    const channelPromises = Array.from(channelGroups.entries()).map(async ([channel, adminGroup]) => {
      // For emergency alerts or small batches, send immediately
      if (alert.severity === 'emergency' || adminGroup.length <= 3) {
        return Promise.all(
          adminGroup.map(async ({ adminId }) => {
            const result = await this.sendToChannel(alert, adminId, channel, startTime);
            this.addToHistory(result);
            
            if (!result.delivered) {
              this.queueForRetry(alert, adminId, channel);
            }
            
            return result;
          })
        );
      }
      
      // For larger batches, use batch processing
      return this.sendBatchToChannel(alert, adminGroup.map(g => g.adminId), channel, startTime);
    });

    // Wait for all channels to complete
    const channelResults = await Promise.all(channelPromises);
    results.push(...channelResults.flat());

    // Update AlertLogger with notification results
    const alertLogger = getAlertLogger();
    alertLogger.updateNotificationResults(alert.id, results, 0).catch(error => {
      const errorHandler = getErrorHandler();
      errorHandler.handleSystemError(
        error instanceof Error ? error : new Error('Failed to update notification results'),
        'notification-results-logging',
        { alertId: alert.id }
      );
    });

    // Process retry queue asynchronously
    this.processQueue();

    return results;
  }

  /**
   * Configure notification preferences for an admin
   * Requirement 2.5: Configurable notification channels and preferences
   * Task 17.2: Cache admin preferences for faster access
   */
  configureNotifications(config: AdminNotificationConfig): void {
    this.configs.set(config.adminId, config);
    
    // Update cache
    const cache = getNotificationCache();
    cache.setAdminPrefs(config.adminId, config);
  }

  /**
   * Get delivery statistics
   * Requirement 2.4: Monitor 99.5% delivery success rate
   */
  async getDeliveryStats(): Promise<NotificationStats> {
    const totalSent = this.deliveryHistory.length;
    
    if (totalSent === 0) {
      return {
        totalSent: 0,
        successRate: 0,
        averageDeliveryTime: 0,
        failuresByChannel: {},
      };
    }

    const successful = this.deliveryHistory.filter(r => r.delivered).length;
    const successRate = (successful / totalSent) * 100;
    
    const totalDeliveryTime = this.deliveryHistory
      .filter(r => r.delivered)
      .reduce((sum, r) => sum + r.deliveryTime, 0);
    const averageDeliveryTime = successful > 0 ? totalDeliveryTime / successful : 0;

    const failuresByChannel: Record<string, number> = {};
    this.deliveryHistory
      .filter(r => !r.delivered)
      .forEach(r => {
        failuresByChannel[r.channel] = (failuresByChannel[r.channel] || 0) + 1;
      });

    return {
      totalSent,
      successRate,
      averageDeliveryTime,
      failuresByChannel,
    };
  }

  /**
   * Determine which channels to use for an alert based on config and severity
   * Task 17.2: Use cached admin preferences
   */
  private getChannelsForAlert(
    alert: AlertEvent,
    config?: AdminNotificationConfig
  ): NotificationChannel[] {
    // If no config, use push notification as default
    if (!config) {
      return [NotificationChannel.PUSH];
    }

    // Check severity filter
    if (config.severityFilter.length > 0 && !config.severityFilter.includes(alert.severity)) {
      return [];
    }

    // Check area filter
    if (config.areaFilter && config.areaFilter.length > 0 && !config.areaFilter.includes(alert.areaId)) {
      return [];
    }

    // Return configured channels
    return config.channels.length > 0 ? config.channels : [NotificationChannel.PUSH];
  }
  
  /**
   * Get admin configuration with caching
   * Task 17.2: Use cache for frequently accessed admin preferences
   */
  private getAdminConfig(adminId: string): AdminNotificationConfig | undefined {
    const cache = getNotificationCache();
    
    // Try cache first
    const cached = cache.getAdminPrefs(adminId);
    if (cached) {
      return cached;
    }
    
    // Get from memory and update cache
    const config = this.configs.get(adminId);
    if (config) {
      cache.setAdminPrefs(adminId, config);
    }
    
    return config;
  }

  /**
   * Send notification to a specific channel
   */
  private async sendToChannel(
    alert: AlertEvent,
    adminId: string,
    channel: NotificationChannel,
    startTime: number
  ): Promise<NotificationResult> {
    const errorHandler = getErrorHandler();
    
    try {
      switch (channel) {
        case NotificationChannel.PUSH:
          await this.sendPushNotification(alert, adminId);
          break;
        case NotificationChannel.SMS:
          await this.sendSMSNotification(alert, adminId);
          break;
        case NotificationChannel.EMAIL:
          await this.sendEmailNotification(alert, adminId);
          break;
      }

      const deliveryTime = Date.now() - startTime;
      
      return {
        adminId,
        channel,
        delivered: true,
        deliveryTime,
      };
    } catch (error) {
      const deliveryTime = Date.now() - startTime;
      
      const result: NotificationResult = {
        adminId,
        channel,
        delivered: false,
        deliveryTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      
      // Handle notification failure with error handler
      errorHandler.handleNotificationFailure(result, {
        alertId: alert.id,
        areaId: alert.areaId,
        severity: alert.severity,
      });
      
      return result;
    }
  }

  /**
   * Send push notification using Sonner
   * Requirement 2.1: In-app push notifications
   */
  private async sendPushNotification(alert: AlertEvent, adminId: string): Promise<void> {
    const message = this.formatAlertMessage(alert);
    
    // Use Sonner toast for in-app notifications
    // Severity determines toast type
    switch (alert.severity) {
      case ThresholdLevel.EMERGENCY:
        toast.error(message, {
          duration: Infinity, // Emergency alerts stay until dismissed
          description: `Area: ${alert.areaName} | Density: ${alert.densityValue}`,
          action: {
            label: 'View Details',
            onClick: () => {
              // This will be handled by the UI component
              console.log('View alert details:', alert.id);
            },
          },
        });
        break;
      
      case ThresholdLevel.CRITICAL:
        toast.error(message, {
          duration: 10000, // 10 seconds
          description: `Area: ${alert.areaName} | Density: ${alert.densityValue}`,
        });
        break;
      
      case ThresholdLevel.WARNING:
        toast.warning(message, {
          duration: 5000, // 5 seconds
          description: `Area: ${alert.areaName} | Density: ${alert.densityValue}`,
        });
        break;
      
      default:
        toast.info(message, {
          duration: 3000,
          description: `Area: ${alert.areaName}`,
        });
    }

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  /**
   * Send SMS notification (mock implementation)
   * Requirement 2.5: SMS channel support
   * Task 17.2: Use connection pooling for SMS delivery
   */
  private async sendSMSNotification(alert: AlertEvent, adminId: string): Promise<void> {
    const message = this.formatAlertMessage(alert);
    const pool = getConnectionPool();
    
    // Acquire connection from pool
    const connection = await pool.acquire(NotificationChannel.SMS);
    
    try {
      // Mock SMS delivery - in production, integrate with SMS gateway (Twilio, AWS SNS, etc.)
      console.log(`[SMS] Sending to admin ${adminId} via connection ${connection.id}:`, message);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Mock success (95% success rate)
      if (Math.random() < 0.95) {
        console.log(`[SMS] Delivered successfully to admin ${adminId}`);
      } else {
        throw new Error('SMS delivery failed');
      }
    } finally {
      // Always release connection back to pool
      pool.release(connection);
    }
  }

  /**
   * Send email notification (mock implementation)
   * Requirement 2.5: Email channel support
   * Task 17.2: Use connection pooling for email delivery
   */
  private async sendEmailNotification(alert: AlertEvent, adminId: string): Promise<void> {
    const message = this.formatAlertMessage(alert);
    const htmlContent = this.formatEmailHTML(alert);
    const pool = getConnectionPool();
    
    // Acquire connection from pool
    const connection = await pool.acquire(NotificationChannel.EMAIL);
    
    try {
      // Mock email delivery - in production, integrate with email service (SendGrid, AWS SES, etc.)
      console.log(`[EMAIL] Sending to admin ${adminId} via connection ${connection.id}:`, message);
      console.log(`[EMAIL] HTML Content:`, htmlContent);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Mock success (98% success rate)
      if (Math.random() < 0.98) {
        console.log(`[EMAIL] Delivered successfully to admin ${adminId}`);
      } else {
        throw new Error('Email delivery failed');
      }
    } finally {
      // Always release connection back to pool
      pool.release(connection);
    }
  }

  /**
   * Format alert message for notifications
   * Requirement 2.2: Include location, density, threshold, timestamp
   */
  private formatAlertMessage(alert: AlertEvent): string {
    const severityLabel = alert.severity.toUpperCase();
    const time = new Date(alert.timestamp).toLocaleTimeString();
    
    switch (alert.type) {
      case 'threshold_violation':
        return `${severityLabel} ALERT: ${alert.areaName} - Density ${alert.densityValue} exceeds threshold ${alert.threshold} at ${time}`;
      
      case 'density_normalized':
        return `ALL CLEAR: ${alert.areaName} - Density normalized to ${alert.densityValue} at ${time}`;
      
      case 'emergency_activated':
        return `EMERGENCY MODE ACTIVATED: ${alert.areaName} at ${time}`;
      
      case 'emergency_deactivated':
        return `EMERGENCY MODE DEACTIVATED: ${alert.areaName} at ${time}`;
      
      default:
        return `Alert: ${alert.areaName} at ${time}`;
    }
  }

  /**
   * Format email HTML content
   */
  private formatEmailHTML(alert: AlertEvent): string {
    const time = new Date(alert.timestamp).toLocaleString();
    const severityColor = this.getSeverityColor(alert.severity);
    
    return `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <div style="background-color: ${severityColor}; color: white; padding: 20px;">
            <h1>${alert.severity.toUpperCase()} ALERT</h1>
          </div>
          <div style="padding: 20px;">
            <h2>${alert.areaName}</h2>
            <p><strong>Location:</strong> ${alert.metadata.location}</p>
            <p><strong>Current Density:</strong> ${alert.densityValue}</p>
            <p><strong>Threshold:</strong> ${alert.threshold}</p>
            <p><strong>Time:</strong> ${time}</p>
            ${alert.metadata.suggestedActions ? `
              <h3>Suggested Actions:</h3>
              <ul>
                ${alert.metadata.suggestedActions.map(action => `<li>${action}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Get color for severity level
   */
  private getSeverityColor(severity: ThresholdLevel): string {
    switch (severity) {
      case ThresholdLevel.EMERGENCY:
        return '#dc2626'; // red-600
      case ThresholdLevel.CRITICAL:
        return '#ea580c'; // orange-600
      case ThresholdLevel.WARNING:
        return '#ca8a04'; // yellow-600
      default:
        return '#16a34a'; // green-600
    }
  }

  /**
   * Add notification result to history
   */
  private addToHistory(result: NotificationResult): void {
    this.deliveryHistory.push(result);
    
    // Trim history if it exceeds max size
    if (this.deliveryHistory.length > this.MAX_HISTORY_SIZE) {
      this.deliveryHistory = this.deliveryHistory.slice(-this.MAX_HISTORY_SIZE);
    }
  }

  /**
   * Queue notification for retry
   */
  private queueForRetry(alert: AlertEvent, adminId: string, channel: NotificationChannel): void {
    this.notificationQueue.push({
      alert,
      adminId,
      channel,
      attempts: 0,
      lastAttempt: Date.now(),
    });
  }

  /**
   * Process retry queue with exponential backoff
   * Task 17.2: Optimize retry queue processing with parallel delivery
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.notificationQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    const errorHandler = getErrorHandler();

    try {
      // Group entries by channel for parallel processing
      const channelQueues = new Map<NotificationChannel, NotificationQueueEntry[]>();
      
      for (const entry of this.notificationQueue) {
        if (!channelQueues.has(entry.channel)) {
          channelQueues.set(entry.channel, []);
        }
        channelQueues.get(entry.channel)!.push(entry);
      }
      
      // Clear the main queue
      this.notificationQueue = [];
      
      // Process each channel queue in parallel
      const channelPromises = Array.from(channelQueues.entries()).map(async ([channel, entries]) => {
        const failedEntries: NotificationQueueEntry[] = [];
        
        // Process entries in batches of 5 for parallel delivery
        const BATCH_SIZE = 5;
        for (let i = 0; i < entries.length; i += BATCH_SIZE) {
          const batch = entries.slice(i, i + BATCH_SIZE);
          
          const batchPromises = batch.map(async (entry) => {
            // Check if enough time has passed for retry
            const backoffTime = this.retryConfig.backoffMs * Math.pow(this.retryConfig.backoffMultiplier, entry.attempts);
            const timeSinceLastAttempt = Date.now() - (entry.lastAttempt || 0);
            
            if (timeSinceLastAttempt < backoffTime) {
              // Not ready for retry yet, add back to failed entries
              failedEntries.push(entry);
              return;
            }

            // Check if max attempts reached
            if (entry.attempts >= this.retryConfig.maxAttempts) {
              console.error(`Max retry attempts reached for admin ${entry.adminId} on channel ${entry.channel}`);
              return;
            }

            // Retry delivery
            entry.attempts++;
            entry.lastAttempt = Date.now();
            
            try {
              const result = await this.sendToChannel(entry.alert, entry.adminId, entry.channel, Date.now());
              this.addToHistory(result);

              // If still failed, add back to queue
              if (!result.delivered) {
                failedEntries.push(entry);
              }
            } catch (error) {
              console.error(`Retry failed for admin ${entry.adminId}:`, error);
              failedEntries.push(entry);
            }
          });
          
          await Promise.all(batchPromises);
        }
        
        return failedEntries;
      });
      
      // Wait for all channels to complete
      const allFailedEntries = await Promise.all(channelPromises);
      
      // Add failed entries back to queue
      allFailedEntries.flat().forEach(entry => {
        this.notificationQueue.push(entry);
      });
      
    } catch (error) {
      errorHandler.handleSystemError(
        error instanceof Error ? error : new Error('Unknown error processing notification queue'),
        'notification-queue-processing',
        { queueSize: this.notificationQueue.length }
      );
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Get notification configuration for an admin
   */
  getConfig(adminId: string): AdminNotificationConfig | undefined {
    return this.configs.get(adminId);
  }

  /**
   * Get delivery history
   * Returns a copy of the delivery history
   */
  getDeliveryHistory(limit?: number): NotificationResult[] {
    const history = [...this.deliveryHistory];
    return limit ? history.slice(-limit) : history;
  }

  /**
   * Send notifications to multiple admins in batch
   * Optimized: Batch processing for improved performance
   */
  private async sendBatchToChannel(
    alert: AlertEvent,
    adminIds: string[],
    channel: NotificationChannel,
    startTime: number
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    const errorHandler = getErrorHandler();
    
    try {
      // Process in batches of MAX_BATCH_SIZE
      for (let i = 0; i < adminIds.length; i += this.MAX_BATCH_SIZE) {
        const batch = adminIds.slice(i, i + this.MAX_BATCH_SIZE);
        
        // Send to all admins in batch concurrently
        const batchResults = await Promise.all(
          batch.map(async (adminId) => {
            try {
              const result = await this.sendToChannel(alert, adminId, channel, startTime);
              this.addToHistory(result);
              
              if (!result.delivered) {
                this.queueForRetry(alert, adminId, channel);
              }
              
              return result;
            } catch (error) {
              const deliveryTime = Date.now() - startTime;
              const result: NotificationResult = {
                adminId,
                channel,
                delivered: false,
                deliveryTime,
                error: error instanceof Error ? error.message : 'Unknown error',
              };
              
              this.addToHistory(result);
              this.queueForRetry(alert, adminId, channel);
              
              return result;
            }
          })
        );
        
        results.push(...batchResults);
      }
    } catch (error) {
      errorHandler.handleSystemError(
        error instanceof Error ? error : new Error('Batch notification processing failed'),
        'batch-notification-processing',
        { alertId: alert.id, channel, adminCount: adminIds.length }
      );
    }
    
    return results;
  }

  /**
   * Clear delivery history (for testing/maintenance)
   */
  clearHistory(): void {
    this.deliveryHistory = [];
  }
  
  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    this.batchQueue.clear();
    this.notificationQueue = [];
  }
}


// Singleton instance
let adminNotifierInstance: AdminNotifier | null = null;

/**
 * Get the singleton AdminNotifier instance
 */
export function getAdminNotifier(): AdminNotifier {
  if (!adminNotifierInstance) {
    adminNotifierInstance = new AdminNotifier();
  }
  return adminNotifierInstance;
}
