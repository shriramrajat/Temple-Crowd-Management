/**
 * Threshold Configuration Manager
 * 
 * Manages threshold configurations with storage, retrieval, validation, and audit logging.
 * Requirements: 6.1, 6.2, 6.4, 6.5
 */

import {
  ThresholdConfig,
  ThresholdConfigManager as IThresholdConfigManager,
  ConfigAuditEntry,
  ValidationResult,
  Permission,
} from './types';
import {
  ThresholdConfigSchema,
  validateThresholdConfig,
  validateTimeProfiles,
} from './schemas';
import { getNotificationCache } from './notification-cache';
import { getAuthService } from './auth-service';

/**
 * Storage key for threshold configurations
 */
const STORAGE_KEY_CONFIGS = 'crowd-risk:threshold-configs';

/**
 * Storage key for audit logs
 */
const STORAGE_KEY_AUDIT = 'crowd-risk:config-audit';

/**
 * In-memory storage for server-side or when localStorage is unavailable
 */
class InMemoryStorage {
  private configs: Map<string, ThresholdConfig> = new Map();
  private auditLogs: Map<string, ConfigAuditEntry[]> = new Map();

  getConfigs(): Map<string, ThresholdConfig> {
    return this.configs;
  }

  setConfigs(configs: Map<string, ThresholdConfig>): void {
    this.configs = configs;
  }

  getAuditLogs(): Map<string, ConfigAuditEntry[]> {
    return this.auditLogs;
  }

  setAuditLogs(logs: Map<string, ConfigAuditEntry[]>): void {
    this.auditLogs = logs;
  }
}

/**
 * ThresholdConfigManager implementation
 * 
 * Provides storage, retrieval, validation, and audit logging for threshold configurations.
 * Uses localStorage for persistence in browser environments, with in-memory fallback.
 * 
 * Requirements:
 * - 6.1: Custom threshold values per area
 * - 6.2: Time-based threshold profiles
 * - 6.4: Threshold validation (warning < critical < emergency)
 * - 6.5: Configuration audit logging
 */
export class ThresholdConfigManager implements IThresholdConfigManager {
  private inMemoryStorage: InMemoryStorage;
  private isClient: boolean;

  constructor() {
    this.inMemoryStorage = new InMemoryStorage();
    this.isClient = typeof window !== 'undefined';
    
    // Load existing data on initialization
    if (this.isClient) {
      this.loadFromLocalStorage();
    }
  }

  /**
   * Load configurations and audit logs from localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      // Load configurations
      const configsJson = localStorage.getItem(STORAGE_KEY_CONFIGS);
      if (configsJson) {
        const configsArray = JSON.parse(configsJson) as ThresholdConfig[];
        const configsMap = new Map<string, ThresholdConfig>();
        configsArray.forEach(config => {
          configsMap.set(config.areaId, config);
        });
        this.inMemoryStorage.setConfigs(configsMap);
      }

      // Load audit logs
      const auditJson = localStorage.getItem(STORAGE_KEY_AUDIT);
      if (auditJson) {
        const auditArray = JSON.parse(auditJson) as Array<{ areaId: string; logs: ConfigAuditEntry[] }>;
        const auditMap = new Map<string, ConfigAuditEntry[]>();
        auditArray.forEach(item => {
          auditMap.set(item.areaId, item.logs);
        });
        this.inMemoryStorage.setAuditLogs(auditMap);
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  }

  /**
   * Save configurations to localStorage
   */
  private saveConfigsToLocalStorage(): void {
    if (!this.isClient) return;

    try {
      const configsArray = Array.from(this.inMemoryStorage.getConfigs().values());
      localStorage.setItem(STORAGE_KEY_CONFIGS, JSON.stringify(configsArray));
    } catch (error) {
      console.error('Failed to save configs to localStorage:', error);
    }
  }

  /**
   * Save audit logs to localStorage
   */
  private saveAuditToLocalStorage(): void {
    if (!this.isClient) return;

    try {
      const auditArray = Array.from(this.inMemoryStorage.getAuditLogs().entries()).map(
        ([areaId, logs]) => ({ areaId, logs })
      );
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(auditArray));
    } catch (error) {
      console.error('Failed to save audit logs to localStorage:', error);
    }
  }

  /**
   * Validate threshold configuration
   * 
   * Requirement 6.4: Ensure warning < critical < emergency
   * Requirement 6.2: Validate time-based profiles
   * 
   * @param config - Threshold configuration to validate
   * @returns Validation result with errors if invalid
   */
  validateThresholds(config: ThresholdConfig): ValidationResult {
    // Validate basic schema
    const schemaValidation = validateThresholdConfig(config);
    if (!schemaValidation.valid) {
      return schemaValidation;
    }

    // Validate time profiles if present
    if (config.timeProfile && config.timeProfile.length > 0) {
      const timeProfileValidation = validateTimeProfiles(config.timeProfile);
      if (!timeProfileValidation.valid) {
        return {
          valid: false,
          errors: timeProfileValidation.errors.map(error => ({
            field: 'timeProfile',
            message: error,
            code: 'INVALID_TIME_PROFILE',
          })),
        };
      }
    }

    return { valid: true, errors: [] };
  }

  /**
   * Save threshold configuration
   * 
   * Requirement 6.1: Store custom threshold values per area
   * Requirement 6.5: Log configuration changes
   * Task 15.1: Check CONFIGURE_THRESHOLDS permission before saving
   * 
   * @param config - Threshold configuration to save
   * @param adminId - ID of admin making the change (optional for initial setup)
   * @param reason - Reason for configuration change (optional)
   * @throws Error if validation fails or user lacks permission
   */
  async saveConfig(
    config: ThresholdConfig,
    adminId?: string,
    reason?: string
  ): Promise<void> {
    // Check permission if adminId is provided
    if (adminId) {
      const authService = getAuthService();
      const hasPermission = authService.checkPermission(adminId, Permission.CONFIGURE_THRESHOLDS);
      
      if (!hasPermission) {
        const error = new Error(
          `User ${adminId} does not have permission to configure thresholds`
        );
        console.error('Threshold configuration denied:', {
          adminId,
          areaId: config.areaId,
          timestamp: Date.now(),
        });
        throw error;
      }
    }
    
    // Validate configuration
    const validation = this.validateThresholds(config);
    if (!validation.valid) {
      const errorMessages = validation.errors.map(e => `${e.field}: ${e.message}`).join(', ');
      throw new Error(`Invalid threshold configuration: ${errorMessages}`);
    }

    // Get previous configuration for audit log
    const previousConfig = this.inMemoryStorage.getConfigs().get(config.areaId);

    // Save configuration
    this.inMemoryStorage.getConfigs().set(config.areaId, config);
    this.saveConfigsToLocalStorage();
    
    // Update cache
    const cache = getNotificationCache();
    cache.setAreaConfig(config.areaId, config);

    // Create audit log entry if adminId is provided
    // Task 15.1: Log all configuration changes with user ID in audit log
    if (adminId) {
      const auditEntry: ConfigAuditEntry = {
        timestamp: Date.now(),
        adminId,
        areaId: config.areaId,
        previousConfig: previousConfig || config, // Use current config if no previous
        newConfig: config,
        reason,
      };

      const areaLogs = this.inMemoryStorage.getAuditLogs().get(config.areaId) || [];
      areaLogs.push(auditEntry);
      this.inMemoryStorage.getAuditLogs().set(config.areaId, areaLogs);
      this.saveAuditToLocalStorage();
      
      console.log('Threshold configuration saved:', {
        adminId,
        areaId: config.areaId,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Get threshold configuration for a specific area
   * 
   * Requirement 6.1: Retrieve custom threshold values per area
   * Task 17.2: Use cache for frequently accessed area configs
   * 
   * @param areaId - ID of the area
   * @returns Threshold configuration or null if not found
   */
  async getConfig(areaId: string): Promise<ThresholdConfig | null> {
    const cache = getNotificationCache();
    
    // Try cache first
    const cached = cache.getAreaConfig(areaId);
    if (cached) {
      return cached;
    }
    
    // Get from storage and update cache
    const config = this.inMemoryStorage.getConfigs().get(areaId);
    if (config) {
      cache.setAreaConfig(areaId, config);
    }
    
    return config || null;
  }

  /**
   * Get all threshold configurations
   * 
   * Requirement 6.1: Retrieve all threshold configurations
   * 
   * @returns Array of all threshold configurations
   */
  async getAllConfigs(): Promise<ThresholdConfig[]> {
    return Array.from(this.inMemoryStorage.getConfigs().values());
  }

  /**
   * Get audit log for a specific area
   * 
   * Requirement 6.5: Retrieve configuration change history
   * 
   * @param areaId - ID of the area
   * @returns Array of audit log entries
   */
  async getAuditLog(areaId: string): Promise<ConfigAuditEntry[]> {
    return this.inMemoryStorage.getAuditLogs().get(areaId) || [];
  }

  /**
   * Delete threshold configuration for an area
   * 
   * @param areaId - ID of the area
   * @param adminId - ID of admin making the change
   * @param reason - Reason for deletion
   */
  async deleteConfig(areaId: string, adminId: string, reason?: string): Promise<void> {
    const previousConfig = this.inMemoryStorage.getConfigs().get(areaId);
    
    if (previousConfig) {
      // Create audit log entry for deletion
      const auditEntry: ConfigAuditEntry = {
        timestamp: Date.now(),
        adminId,
        areaId,
        previousConfig,
        newConfig: previousConfig, // Keep reference to deleted config
        reason: reason || 'Configuration deleted',
      };

      const areaLogs = this.inMemoryStorage.getAuditLogs().get(areaId) || [];
      areaLogs.push(auditEntry);
      this.inMemoryStorage.getAuditLogs().set(areaId, areaLogs);
      this.saveAuditToLocalStorage();
    }

    // Delete configuration
    this.inMemoryStorage.getConfigs().delete(areaId);
    this.saveConfigsToLocalStorage();
    
    // Invalidate cache
    const cache = getNotificationCache();
    cache.invalidateAreaConfig(areaId);
  }

  /**
   * Get active thresholds for an area at a specific time
   * 
   * Requirement 6.2: Time-based threshold profile selection
   * 
   * @param areaId - ID of the area
   * @param time - Time to check (defaults to current time)
   * @returns Active threshold values or null if no config exists
   */
  async getActiveThresholds(
    areaId: string,
    time: Date = new Date()
  ): Promise<Omit<ThresholdConfig, 'timeProfile'> | null> {
    const config = await this.getConfig(areaId);
    if (!config) return null;

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
   * Clear all configurations and audit logs (for testing/reset)
   */
  async clearAll(): Promise<void> {
    this.inMemoryStorage.setConfigs(new Map());
    this.inMemoryStorage.setAuditLogs(new Map());
    
    if (this.isClient) {
      localStorage.removeItem(STORAGE_KEY_CONFIGS);
      localStorage.removeItem(STORAGE_KEY_AUDIT);
    }
  }
}

/**
 * Singleton instance of ThresholdConfigManager
 */
let thresholdConfigManagerInstance: ThresholdConfigManager | null = null;

/**
 * Get singleton instance of ThresholdConfigManager
 * 
 * @returns ThresholdConfigManager instance
 */
export function getThresholdConfigManager(): ThresholdConfigManager {
  if (!thresholdConfigManagerInstance) {
    thresholdConfigManagerInstance = new ThresholdConfigManager();
  }
  return thresholdConfigManagerInstance;
}

/**
 * Reset singleton instance (for testing)
 */
export function resetThresholdConfigManager(): void {
  thresholdConfigManagerInstance = null;
}
