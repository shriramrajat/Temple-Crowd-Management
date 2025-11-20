/**
 * Error Handler Service
 * 
 * Centralized error handling infrastructure with categorized error handling,
 * retry logic with exponential backoff, and fallback mechanisms.
 * Requirements: 2.4, 3.4
 */

import { NotificationResult } from './types';

/**
 * Error categories for different types of failures
 */
export enum ErrorCategory {
  DATA_STREAM = 'data_stream',
  NOTIFICATION = 'notification',
  CONFIGURATION = 'configuration',
  SYSTEM = 'system',
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error log entry
 */
export interface ErrorLogEntry {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  error: Error;
  context: Record<string, unknown>;
  timestamp: number;
  stackTrace?: string;
  retryCount?: number;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  backoffMs: number;
  backoffMultiplier: number;
}

/**
 * Fallback state
 */
export interface FallbackState {
  degradedMode: boolean;
  staleDataIndicators: Map<string, { timestamp: number; value: unknown }>;
  lastKnownGoodState: Map<string, unknown>;
}

/**
 * Error handler callback type
 */
type ErrorCallback = (entry: ErrorLogEntry) => void;

/**
 * ErrorHandler service class
 * 
 * Provides centralized error handling with:
 * - Categorized error handling methods
 * - Retry logic with exponential backoff (1s, 2s, 4s, 8s)
 * - Fallback mechanisms (stale data indicators, degraded mode)
 * - Error logging with context and stack traces
 */
export class ErrorHandler {
  private errorLog: ErrorLogEntry[] = [];
  private errorCallbacks: Set<ErrorCallback> = new Set();
  private fallbackState: FallbackState = {
    degradedMode: false,
    staleDataIndicators: new Map(),
    lastKnownGoodState: new Map(),
  };
  
  // Default retry configuration: 1s, 2s, 4s, 8s
  private readonly defaultRetryConfig: RetryConfig = {
    maxAttempts: 4,
    backoffMs: 1000,
    backoffMultiplier: 2,
  };
  
  // Maximum error log entries to keep
  private readonly MAX_LOG_SIZE = 1000;

  /**
   * Handle data stream errors
   * 
   * Requirement 2.4: Handle density stream failures with fallback
   * 
   * @param error - Error object
   * @param areaId - Area ID where error occurred
   * @param context - Additional context
   */
  handleDataStreamError(
    error: Error,
    areaId: string,
    context?: Record<string, unknown>
  ): void {
    const entry = this.createErrorLogEntry(
      ErrorCategory.DATA_STREAM,
      ErrorSeverity.HIGH,
      `Data stream error for area ${areaId}`,
      error,
      { areaId, ...context }
    );
    
    this.logError(entry);
    
    // Enable degraded mode if multiple stream errors
    const recentStreamErrors = this.getRecentErrors(ErrorCategory.DATA_STREAM, 60000);
    if (recentStreamErrors.length >= 3) {
      this.enableDegradedMode();
    }
    
    // Mark data as stale for this area
    this.markDataAsStale(areaId);
  }

  /**
   * Handle notification delivery failures
   * 
   * Requirement 2.4: Handle notification failures with retry
   * 
   * @param result - Notification result with failure details
   * @param context - Additional context
   * @returns Retry function or null if max retries exceeded
   */
  handleNotificationFailure(
    result: NotificationResult,
    context?: Record<string, unknown>
  ): (() => Promise<void>) | null {
    const error = new Error(result.error || 'Notification delivery failed');
    
    const entry = this.createErrorLogEntry(
      ErrorCategory.NOTIFICATION,
      ErrorSeverity.MEDIUM,
      `Notification failed for admin ${result.adminId} on channel ${result.channel}`,
      error,
      { result, ...context }
    );
    
    this.logError(entry);
    
    // Return retry function if not exceeded max attempts
    const retryCount = (context?.retryCount as number) || 0;
    if (retryCount < this.defaultRetryConfig.maxAttempts) {
      return () => this.retryWithBackoff(
        async () => {
          // Retry logic will be implemented by the caller
          throw new Error('Retry function must be implemented by caller');
        },
        retryCount
      );
    }
    
    return null;
  }

  /**
   * Handle configuration validation errors
   * 
   * @param error - Error object
   * @param configType - Type of configuration that failed
   * @param context - Additional context
   */
  handleConfigurationError(
    error: Error,
    configType: string,
    context?: Record<string, unknown>
  ): void {
    const entry = this.createErrorLogEntry(
      ErrorCategory.CONFIGURATION,
      ErrorSeverity.HIGH,
      `Configuration error for ${configType}`,
      error,
      { configType, ...context }
    );
    
    this.logError(entry);
    
    // Configuration errors are critical - log prominently
    console.error('❌ Configuration Error:', {
      type: configType,
      message: error.message,
      context,
    });
  }

  /**
   * Handle general system errors
   * 
   * @param error - Error object
   * @param operation - Operation that failed
   * @param context - Additional context
   */
  handleSystemError(
    error: Error,
    operation: string,
    context?: Record<string, unknown>
  ): void {
    const entry = this.createErrorLogEntry(
      ErrorCategory.SYSTEM,
      ErrorSeverity.CRITICAL,
      `System error during ${operation}`,
      error,
      { operation, ...context }
    );
    
    this.logError(entry);
    
    // System errors might require degraded mode
    const recentSystemErrors = this.getRecentErrors(ErrorCategory.SYSTEM, 60000);
    if (recentSystemErrors.length >= 2) {
      this.enableDegradedMode();
    }
  }

  /**
   * Retry operation with exponential backoff
   * 
   * Implements retry logic: 1s, 2s, 4s, 8s
   * 
   * @param operation - Async operation to retry
   * @param currentAttempt - Current attempt number (0-indexed)
   * @param config - Optional retry configuration
   * @returns Promise that resolves when operation succeeds
   */
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    currentAttempt: number = 0,
    config: RetryConfig = this.defaultRetryConfig
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      // Check if we've exceeded max attempts
      if (currentAttempt >= config.maxAttempts - 1) {
        throw error;
      }
      
      // Calculate backoff time: backoffMs * (backoffMultiplier ^ currentAttempt)
      const backoffTime = config.backoffMs * Math.pow(config.backoffMultiplier, currentAttempt);
      
      console.log(
        `Retry attempt ${currentAttempt + 1}/${config.maxAttempts} ` +
        `after ${backoffTime}ms backoff`
      );
      
      // Wait for backoff period
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      
      // Retry with incremented attempt count
      return this.retryWithBackoff(operation, currentAttempt + 1, config);
    }
  }

  /**
   * Create error log entry
   * 
   * @param category - Error category
   * @param severity - Error severity
   * @param message - Error message
   * @param error - Error object
   * @param context - Additional context
   * @returns Error log entry
   */
  private createErrorLogEntry(
    category: ErrorCategory,
    severity: ErrorSeverity,
    message: string,
    error: Error,
    context: Record<string, unknown>
  ): ErrorLogEntry {
    return {
      id: this.generateErrorId(),
      category,
      severity,
      message,
      error,
      context,
      timestamp: Date.now(),
      stackTrace: error.stack,
      retryCount: (context.retryCount as number) || 0,
    };
  }

  /**
   * Log error entry
   * 
   * @param entry - Error log entry
   */
  private logError(entry: ErrorLogEntry): void {
    // Add to error log
    this.errorLog.unshift(entry);
    
    // Trim log if exceeds max size
    if (this.errorLog.length > this.MAX_LOG_SIZE) {
      this.errorLog = this.errorLog.slice(0, this.MAX_LOG_SIZE);
    }
    
    // Log to console with appropriate level
    const logLevel = this.getConsoleLogLevel(entry.severity);
    console[logLevel](`[${entry.category}] ${entry.message}`, {
      error: entry.error.message,
      context: entry.context,
      timestamp: new Date(entry.timestamp).toISOString(),
    });
    
    // Notify callbacks
    this.notifyErrorCallbacks(entry);
  }

  /**
   * Get console log level for severity
   * 
   * @param severity - Error severity
   * @returns Console log level
   */
  private getConsoleLogLevel(severity: ErrorSeverity): 'error' | 'warn' | 'log' {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      default:
        return 'log';
    }
  }

  /**
   * Generate unique error ID
   * 
   * @returns Unique error ID
   */
  private generateErrorId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `ERR-${timestamp}-${random}`;
  }

  /**
   * Get recent errors by category
   * 
   * @param category - Error category
   * @param timeWindowMs - Time window in milliseconds
   * @returns Array of recent error entries
   */
  private getRecentErrors(category: ErrorCategory, timeWindowMs: number): ErrorLogEntry[] {
    const cutoffTime = Date.now() - timeWindowMs;
    return this.errorLog.filter(
      entry => entry.category === category && entry.timestamp >= cutoffTime
    );
  }

  /**
   * Enable degraded mode
   * 
   * Fallback mechanism when multiple errors occur
   */
  private enableDegradedMode(): void {
    if (!this.fallbackState.degradedMode) {
      this.fallbackState.degradedMode = true;
      console.warn('⚠️ System entering degraded mode due to multiple errors');
      
      // Notify callbacks about degraded mode
      const entry = this.createErrorLogEntry(
        ErrorCategory.SYSTEM,
        ErrorSeverity.HIGH,
        'System entered degraded mode',
        new Error('Multiple errors detected'),
        { degradedMode: true }
      );
      this.notifyErrorCallbacks(entry);
    }
  }

  /**
   * Disable degraded mode
   */
  disableDegradedMode(): void {
    if (this.fallbackState.degradedMode) {
      this.fallbackState.degradedMode = false;
      console.log('✅ System exiting degraded mode');
    }
  }

  /**
   * Check if system is in degraded mode
   * 
   * @returns True if in degraded mode
   */
  isDegradedMode(): boolean {
    return this.fallbackState.degradedMode;
  }

  /**
   * Mark data as stale for an area
   * 
   * @param areaId - Area ID
   * @param value - Optional last known value
   */
  private markDataAsStale(areaId: string, value?: unknown): void {
    this.fallbackState.staleDataIndicators.set(areaId, {
      timestamp: Date.now(),
      value: value || null,
    });
  }

  /**
   * Check if data is stale for an area
   * 
   * @param areaId - Area ID
   * @param maxAgeMs - Maximum age in milliseconds (default: 60 seconds)
   * @returns True if data is stale
   */
  isDataStale(areaId: string, maxAgeMs: number = 60000): boolean {
    const indicator = this.fallbackState.staleDataIndicators.get(areaId);
    if (!indicator) {
      return false;
    }
    
    const age = Date.now() - indicator.timestamp;
    return age < maxAgeMs;
  }

  /**
   * Clear stale data indicator for an area
   * 
   * @param areaId - Area ID
   */
  clearStaleDataIndicator(areaId: string): void {
    this.fallbackState.staleDataIndicators.delete(areaId);
  }

  /**
   * Store last known good state
   * 
   * @param key - State key
   * @param value - State value
   */
  storeLastKnownGoodState(key: string, value: unknown): void {
    this.fallbackState.lastKnownGoodState.set(key, value);
  }

  /**
   * Get last known good state
   * 
   * @param key - State key
   * @returns Last known good state or undefined
   */
  getLastKnownGoodState(key: string): unknown {
    return this.fallbackState.lastKnownGoodState.get(key);
  }

  /**
   * Subscribe to error events
   * 
   * @param callback - Callback function
   * @returns Unsubscribe function
   */
  onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.add(callback);
    
    return () => {
      this.errorCallbacks.delete(callback);
    };
  }

  /**
   * Notify error callbacks
   * 
   * @param entry - Error log entry
   */
  private notifyErrorCallbacks(entry: ErrorLogEntry): void {
    for (const callback of this.errorCallbacks) {
      try {
        callback(entry);
      } catch (error) {
        console.error('Error in error callback:', error);
      }
    }
  }

  /**
   * Get error log
   * 
   * @param limit - Maximum number of entries to return
   * @param category - Optional category filter
   * @returns Array of error log entries
   */
  getErrorLog(limit?: number, category?: ErrorCategory): ErrorLogEntry[] {
    let log = this.errorLog;
    
    if (category) {
      log = log.filter(entry => entry.category === category);
    }
    
    if (limit) {
      return log.slice(0, limit);
    }
    
    return [...log];
  }

  /**
   * Get error statistics
   * 
   * @returns Error statistics
   */
  getErrorStats() {
    const stats = {
      totalErrors: this.errorLog.length,
      degradedMode: this.fallbackState.degradedMode,
      staleDataAreas: this.fallbackState.staleDataIndicators.size,
      errorsByCategory: {} as Record<ErrorCategory, number>,
      errorsBySeverity: {} as Record<ErrorSeverity, number>,
      recentErrors: {
        last5Minutes: 0,
        last15Minutes: 0,
        lastHour: 0,
      },
    };
    
    const now = Date.now();
    
    for (const entry of this.errorLog) {
      // Count by category
      stats.errorsByCategory[entry.category] = 
        (stats.errorsByCategory[entry.category] || 0) + 1;
      
      // Count by severity
      stats.errorsBySeverity[entry.severity] = 
        (stats.errorsBySeverity[entry.severity] || 0) + 1;
      
      // Count recent errors
      const age = now - entry.timestamp;
      if (age < 5 * 60 * 1000) {
        stats.recentErrors.last5Minutes++;
      }
      if (age < 15 * 60 * 1000) {
        stats.recentErrors.last15Minutes++;
      }
      if (age < 60 * 60 * 1000) {
        stats.recentErrors.lastHour++;
      }
    }
    
    return stats;
  }

  /**
   * Clear error log
   * Useful for testing
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Reset fallback state
   * Useful for testing
   */
  resetFallbackState(): void {
    this.fallbackState = {
      degradedMode: false,
      staleDataIndicators: new Map(),
      lastKnownGoodState: new Map(),
    };
  }

  /**
   * Clear all state
   * Useful for testing
   */
  clearAll(): void {
    this.clearErrorLog();
    this.resetFallbackState();
    this.errorCallbacks.clear();
  }
}

/**
 * Singleton instance for global use
 */
let errorHandlerInstance: ErrorHandler | null = null;

/**
 * Get or create the singleton ErrorHandler instance
 */
export function getErrorHandler(): ErrorHandler {
  if (!errorHandlerInstance) {
    errorHandlerInstance = new ErrorHandler();
  }
  return errorHandlerInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetErrorHandler(): void {
  if (errorHandlerInstance) {
    errorHandlerInstance.clearAll();
  }
  errorHandlerInstance = null;
}
