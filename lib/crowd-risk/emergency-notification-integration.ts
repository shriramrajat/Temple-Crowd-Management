/**
 * Emergency Notification Integration Service
 * 
 * Integrates emergency mode with notification services to:
 * - Override admin notification preferences during emergency
 * - Expand pilgrim notifications to adjacent areas
 * - Send high-priority alerts to all administrators
 * - Log activation/deactivation events
 * 
 * Requirements: 5.2, 5.3, 5.5
 */

import {
  EmergencyMode,
  AlertEvent,
  AlertType,
  ThresholdLevel,
  NotificationChannel,
  AdminNotificationConfig,
} from './types';
import { getEmergencyModeManager } from './emergency-mode-manager';
import { getAdminNotifier } from './admin-notifier';
import { getPilgrimNotifier } from './pilgrim-notifier';
import { getAlertEngine } from './alert-engine';

/**
 * Emergency notification log entry
 */
interface EmergencyNotificationLog {
  timestamp: number;
  action: 'emergency_activated' | 'emergency_deactivated';
  areaId: string;
  affectedAreas: string[];
  adminNotificationsSent: number;
  pilgrimNotificationsSent: number;
  adminIds: string[];
}

/**
 * Emergency Notification Integration Service
 * 
 * Requirement 5.2: Expanded notification reach to adjacent areas
 * Requirement 5.3: Override admin notification preferences during emergency
 * Requirement 5.5: Log activation/deactivation events
 */
export class EmergencyNotificationIntegration {
  private emergencyManager = getEmergencyModeManager();
  private adminNotifier = getAdminNotifier();
  private pilgrimNotifier = getPilgrimNotifier();
  private alertEngine = getAlertEngine();
  
  private notificationLog: EmergencyNotificationLog[] = [];
  private adminRegistry: Set<string> = new Set();
  private isInitialized = false;
  
  // Maximum log entries to keep
  private readonly MAX_LOG_SIZE = 200;

  /**
   * Initialize the integration service
   * Sets up emergency state change listener
   */
  initialize(): void {
    if (this.isInitialized) {
      return;
    }

    // Subscribe to emergency state changes
    this.emergencyManager.onEmergencyStateChange((state) => {
      this.handleEmergencyStateChange(state);
    });

    this.isInitialized = true;
    console.log('Emergency notification integration initialized');
  }

  /**
   * Handle emergency state changes
   * 
   * Requirement 5.2: Expand notification reach to adjacent areas
   * Requirement 5.3: Send high-priority alerts to all administrators
   * Requirement 5.5: Log activation/deactivation events
   * 
   * @param state - Emergency mode state
   */
  private async handleEmergencyStateChange(state: EmergencyMode | null): Promise<void> {
    if (state?.active) {
      // Emergency activated
      await this.handleEmergencyActivation(state);
    } else if (state === null) {
      // Emergency deactivated
      await this.handleEmergencyDeactivation();
    }
  }

  /**
   * Handle emergency mode activation
   * 
   * Requirement 5.2: Expand notification reach to adjacent areas
   * Requirement 5.3: Send high-priority alerts to all administrators
   * Requirement 5.5: Log activation event
   * 
   * @param state - Emergency mode state
   */
  private async handleEmergencyActivation(state: EmergencyMode): Promise<void> {
    try {
      console.log('Handling emergency activation:', state);

      // Generate emergency activation alert
      const alert = this.emergencyManager.generateEmergencyAlert(
        AlertType.EMERGENCY_ACTIVATED,
        state.triggerAreaId
      );

      // Requirement 5.3: Send high-priority alerts to all administrators
      // Override notification preferences - send to ALL admins via ALL channels
      const adminIds = Array.from(this.adminRegistry);
      const adminNotificationResults = await this.sendEmergencyAlertsToAllAdmins(
        alert,
        adminIds
      );

      // Requirement 5.2: Expand pilgrim notifications to adjacent areas
      // Send notifications to trigger area AND all adjacent areas
      const pilgrimNotificationCount = await this.sendExpandedPilgrimNotifications(
        alert,
        state.affectedAreas
      );

      // Requirement 5.5: Log activation event
      this.logEmergencyNotification({
        timestamp: Date.now(),
        action: 'emergency_activated',
        areaId: state.triggerAreaId,
        affectedAreas: state.affectedAreas,
        adminNotificationsSent: adminNotificationResults.length,
        pilgrimNotificationsSent: pilgrimNotificationCount,
        adminIds,
      });

      console.log(
        `Emergency notifications sent: ${adminNotificationResults.length} admins, ` +
        `${pilgrimNotificationCount} pilgrims across ${state.affectedAreas.length} areas`
      );

    } catch (error) {
      console.error('Error handling emergency activation:', error);
    }
  }

  /**
   * Handle emergency mode deactivation
   * 
   * Requirement 5.5: Log deactivation event and send confirmation notifications
   * 
   */
  private async handleEmergencyDeactivation(): Promise<void> {
    try {
      console.log('Handling emergency deactivation');

      // Get the last emergency state from log to know which areas were affected
      const lastEmergency = this.notificationLog.find(
        log => log.action === 'emergency_activated'
      );

      if (!lastEmergency) {
        console.warn('No previous emergency activation found in log');
        return;
      }

      // Generate emergency deactivation alert
      const alert = this.emergencyManager.generateEmergencyAlert(
        AlertType.EMERGENCY_DEACTIVATED,
        lastEmergency.areaId
      );

      // Requirement 5.5: Send confirmation notifications to all administrators
      const adminIds = Array.from(this.adminRegistry);
      const adminNotificationResults = await this.sendEmergencyAlertsToAllAdmins(
        alert,
        adminIds
      );

      // Send all-clear notifications to affected areas
      const pilgrimNotificationCount = await this.sendAllClearNotifications(
        lastEmergency.affectedAreas
      );

      // Requirement 5.5: Log deactivation event
      this.logEmergencyNotification({
        timestamp: Date.now(),
        action: 'emergency_deactivated',
        areaId: lastEmergency.areaId,
        affectedAreas: lastEmergency.affectedAreas,
        adminNotificationsSent: adminNotificationResults.length,
        pilgrimNotificationsSent: pilgrimNotificationCount,
        adminIds,
      });

      console.log(
        `Emergency deactivation notifications sent: ${adminNotificationResults.length} admins, ` +
        `${pilgrimNotificationCount} pilgrims`
      );

    } catch (error) {
      console.error('Error handling emergency deactivation:', error);
    }
  }

  /**
   * Send emergency alerts to all administrators
   * Overrides notification preferences during emergency
   * 
   * Requirement 5.3: Override admin notification preferences during emergency
   * 
   * @param alert - Alert event
   * @param adminIds - Array of admin IDs
   * @returns Array of notification results
   */
  private async sendEmergencyAlertsToAllAdmins(
    alert: AlertEvent,
    adminIds: string[]
  ) {
    // Store original admin configurations
    const originalConfigs = new Map<string, AdminNotificationConfig | undefined>();
    
    // Temporarily override all admin notification preferences
    // During emergency, send to ALL admins via ALL channels
    for (const adminId of adminIds) {
      const originalConfig = this.adminNotifier.getConfig(adminId);
      originalConfigs.set(adminId, originalConfig);
      
      // Set emergency override configuration
      // All channels, no filters, emergency severity
      this.adminNotifier.configureNotifications({
        adminId,
        channels: [
          NotificationChannel.PUSH,
          NotificationChannel.SMS,
          NotificationChannel.EMAIL,
        ],
        severityFilter: [], // No filter - receive all
        areaFilter: undefined, // No filter - receive all areas
      });
    }

    // Send alerts to all admins
    const results = await this.adminNotifier.sendAlert(alert, adminIds);

    // Restore original configurations after a delay
    // This ensures emergency notifications are sent with override
    setTimeout(() => {
      for (const [adminId, originalConfig] of originalConfigs.entries()) {
        if (originalConfig) {
          this.adminNotifier.configureNotifications(originalConfig);
        }
      }
    }, 1000);

    return results;
  }

  /**
   * Send expanded pilgrim notifications to all affected areas
   * 
   * Requirement 5.2: Expand notification reach to adjacent areas
   * 
   * @param alert - Alert event
   * @param affectedAreas - Array of affected area IDs
   * @returns Total number of pilgrims notified
   */
  private async sendExpandedPilgrimNotifications(
    alert: AlertEvent,
    affectedAreas: string[]
  ): Promise<number> {
    let totalNotified = 0;

    // Send notifications to all affected areas (trigger area + adjacent areas)
    for (const areaId of affectedAreas) {
      try {
        const notifiedCount = await this.pilgrimNotifier.notifyArea(alert, areaId);
        totalNotified += notifiedCount;
      } catch (error) {
        console.error(`Error notifying area ${areaId}:`, error);
      }
    }

    return totalNotified;
  }

  /**
   * Send all-clear notifications to affected areas
   * 
   * @param affectedAreas - Array of affected area IDs
   * @returns Total number of pilgrims notified
   */
  private async sendAllClearNotifications(affectedAreas: string[]): Promise<number> {
    let totalNotified = 0;

    for (const areaId of affectedAreas) {
      try {
        const notifiedCount = await this.pilgrimNotifier.sendAllClear(areaId);
        totalNotified += notifiedCount;
      } catch (error) {
        console.error(`Error sending all-clear to area ${areaId}:`, error);
      }
    }

    return totalNotified;
  }

  /**
   * Log emergency notification event
   * 
   * Requirement 5.5: Log activation/deactivation events
   * 
   * @param log - Emergency notification log entry
   */
  private logEmergencyNotification(log: EmergencyNotificationLog): void {
    this.notificationLog.unshift(log);

    // Limit log size
    if (this.notificationLog.length > this.MAX_LOG_SIZE) {
      this.notificationLog.pop();
    }
  }

  /**
   * Register an administrator
   * Admins must be registered to receive emergency notifications
   * 
   * @param adminId - Admin ID
   */
  registerAdmin(adminId: string): void {
    this.adminRegistry.add(adminId);
  }

  /**
   * Register multiple administrators
   * 
   * @param adminIds - Array of admin IDs
   */
  registerAdmins(adminIds: string[]): void {
    for (const adminId of adminIds) {
      this.registerAdmin(adminId);
    }
  }

  /**
   * Unregister an administrator
   * 
   * @param adminId - Admin ID
   */
  unregisterAdmin(adminId: string): void {
    this.adminRegistry.delete(adminId);
  }

  /**
   * Get emergency notification log
   * 
   * @param limit - Maximum number of entries to return
   * @returns Array of log entries
   */
  getNotificationLog(limit?: number): EmergencyNotificationLog[] {
    if (limit) {
      return this.notificationLog.slice(0, limit);
    }
    return [...this.notificationLog];
  }

  /**
   * Get statistics about emergency notifications
   * 
   * @returns Emergency notification statistics
   */
  getStats() {
    const activations = this.notificationLog.filter(
      log => log.action === 'emergency_activated'
    );
    const deactivations = this.notificationLog.filter(
      log => log.action === 'emergency_deactivated'
    );

    const totalAdminNotifications = this.notificationLog.reduce(
      (sum, log) => sum + log.adminNotificationsSent,
      0
    );
    const totalPilgrimNotifications = this.notificationLog.reduce(
      (sum, log) => sum + log.pilgrimNotificationsSent,
      0
    );

    return {
      isInitialized: this.isInitialized,
      registeredAdmins: this.adminRegistry.size,
      totalActivations: activations.length,
      totalDeactivations: deactivations.length,
      totalAdminNotifications,
      totalPilgrimNotifications,
      logEntries: this.notificationLog.length,
    };
  }

  /**
   * Clear all logs and state
   * Useful for testing
   */
  clearAll(): void {
    this.notificationLog = [];
    this.adminRegistry.clear();
  }

  /**
   * Manually trigger emergency notifications
   * Useful for testing or manual emergency activation
   * 
   * @param areaId - Area ID
   * @param adminIds - Array of admin IDs to notify
   * @returns Notification results
   */
  async triggerEmergencyNotifications(
    areaId: string,
    adminIds: string[]
  ): Promise<{
    adminNotifications: number;
    pilgrimNotifications: number;
  }> {
    const state = this.emergencyManager.getEmergencyState();
    
    if (!state?.active) {
      throw new Error('Emergency mode is not active');
    }

    // Generate alert
    const alert = this.emergencyManager.generateEmergencyAlert(
      AlertType.EMERGENCY_ACTIVATED,
      areaId
    );

    // Send notifications
    const adminResults = await this.sendEmergencyAlertsToAllAdmins(alert, adminIds);
    const pilgrimCount = await this.sendExpandedPilgrimNotifications(
      alert,
      state.affectedAreas
    );

    return {
      adminNotifications: adminResults.length,
      pilgrimNotifications: pilgrimCount,
    };
  }
}

/**
 * Singleton instance for global use
 */
let emergencyNotificationIntegrationInstance: EmergencyNotificationIntegration | null = null;

/**
 * Get or create the singleton EmergencyNotificationIntegration instance
 */
export function getEmergencyNotificationIntegration(): EmergencyNotificationIntegration {
  if (!emergencyNotificationIntegrationInstance) {
    emergencyNotificationIntegrationInstance = new EmergencyNotificationIntegration();
  }
  return emergencyNotificationIntegrationInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetEmergencyNotificationIntegration(): void {
  emergencyNotificationIntegrationInstance = null;
}
