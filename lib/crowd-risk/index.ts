/**
 * Crowd Risk Engine - Core Module
 * 
 * Central export point for all crowd risk engine types, schemas, and utilities.
 * Requirements: 1.1, 1.3, 6.1, 6.4
 */

// Export all types
export * from './types';

// Export all schemas
export * from './schemas';

// Export services
export * from './threshold-config-manager';
export * from './density-monitor';
export * from './density-context';
export * from './threshold-evaluator';
export * from './density-evaluation-service';
export * from './alert-engine';
export * from './alert-context';
export * from './admin-notifier';
export * from './pilgrim-notifier';
export * from './pilgrim-notification-context';
export * from './emergency-mode-manager';
export * from './emergency-notification-integration';
export * from './error-handler';
export * from './alert-logger';
export * from './visual-indicator-controller';

// Export performance optimization modules (Task 17.1 & 17.2)
export * from './performance-monitor';
export * from './notification-cache';
export * from './connection-pool';
export * from './performance-optimizer';
export * from './use-performance-monitor';

// Export development tools (Task 16.1)
export * from './density-simulator';

// Export authorization services (Task 15.1 & 15.2)
export * from './auth-service';
export * from './auth-middleware';
export * from './api-auth-middleware';
export * from './rate-limiter';
