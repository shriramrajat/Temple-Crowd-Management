/**
 * Accessibility Monitoring Service
 * 
 * This service handles monitoring and analytics for accessibility features,
 * including daily report generation, utilization tracking, and alert management.
 */

import type {
  AccessibilityMetrics,
  UtilizationAlert,
  PrioritySlotUtilization,
} from '../types/accessibility-analytics';
import type { AccessibilityCategory } from '../types/accessibility';
import type { SlotAllocation } from '../types/priority-slots';
import {
  generateAccessibilityMetrics,
  checkUtilizationAlert,
  createUtilizationAlert,
  calculateUtilizationTrend,
} from '../utils/accessibility-metrics';

/**
 * Storage keys for monitoring data
 */
const STORAGE_KEYS = {
  DAILY_METRICS: 'accessibility_daily_metrics',
  UTILIZATION_ALERTS: 'accessibility_utilization_alerts',
  AUDIT_LOG: 'accessibility_audit_log',
  ROUTE_TRACKING: 'accessibility_route_tracking',
  NOTIFICATION_TRACKING: 'accessibility_notification_tracking',
} as const;

/**
 * Audit log entry interface
 */
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  operation: string;
  category: AccessibilityCategory | 'system';
  pilgrimId?: string;
  details: Record<string, unknown>;
  success: boolean;
}

/**
 * Route tracking data
 */
interface RouteTrackingData {
  generated: number;
  recalculations: number;
  totalTime: number;
}

/**
 * Notification tracking data
 */
interface NotificationTrackingData {
  sent: number;
  delivered: number;
  read: number;
  actionTaken: number;
}

/**
 * Daily utilization history for alert detection
 */
interface DailyUtilizationHistory {
  date: string;
  category: AccessibilityCategory;
  utilizationRate: number;
}

/**
 * Generate daily accessibility metrics report
 */
export function generateDailyReport(
  date: Date,
  allocations: SlotAllocation[],
  totalCapacity: number,
  priorityWaitTimes: number[],
  generalWaitTimes: number[],
  assistanceRequests: number
): AccessibilityMetrics {
  // Get route tracking data
  const routeData = getRouteTrackingData();
  
  // Get notification tracking data
  const notificationData = getNotificationTrackingData();
  
  // Generate comprehensive metrics
  const metrics = generateAccessibilityMetrics(
    date,
    allocations,
    totalCapacity,
    priorityWaitTimes,
    generalWaitTimes,
    routeData,
    notificationData,
    assistanceRequests
  );
  
  // Store metrics
  storeDailyMetrics(metrics);
  
  // Reset daily tracking counters
  resetDailyTracking();
  
  // Log report generation
  logAuditEntry({
    operation: 'generate_daily_report',
    category: 'system',
    details: { date: date.toISOString(), metricsGenerated: true },
    success: true,
  });
  
  return metrics;
}

/**
 * Calculate utilization rate by category
 */
export function calculateUtilizationByCategory(
  allocations: SlotAllocation[],
  category: AccessibilityCategory,
  totalCapacity: number
): number {
  const categoryAllocations = allocations.filter(a =>
    a.accessibilityProfile.categories.includes(category)
  );
  
  return totalCapacity > 0
    ? (categoryAllocations.length / totalCapacity) * 100
    : 0;
}

/**
 * Track wait time for comparison
 */
export function trackWaitTime(
  isPrioritySlot: boolean,
  waitTimeMinutes: number
): void {
  const key = isPrioritySlot ? 'priority_wait_times' : 'general_wait_times';
  const stored = localStorage.getItem(key);
  const waitTimes: number[] = stored ? JSON.parse(stored) : [];
  
  waitTimes.push(waitTimeMinutes);
  localStorage.setItem(key, JSON.stringify(waitTimes));
}

/**
 * Get wait times for comparison
 */
function getWaitTimes(): { priority: number[]; general: number[] } {
  const priorityStored = localStorage.getItem('priority_wait_times');
  const generalStored = localStorage.getItem('general_wait_times');
  
  return {
    priority: priorityStored ? JSON.parse(priorityStored) : [],
    general: generalStored ? JSON.parse(generalStored) : [],
  };
}

/**
 * Detect low utilization and create alerts
 */
export function detectLowUtilization(
  allocations: SlotAllocation[],
  totalCapacity: number
): UtilizationAlert[] {
  const alerts: UtilizationAlert[] = [];
  const categories: AccessibilityCategory[] = [
    'elderly',
    'differently-abled',
    'wheelchair-user',
  ];
  
  const today = new Date().toISOString().split('T')[0];
  
  for (const category of categories) {
    const utilizationRate = calculateUtilizationByCategory(
      allocations,
      category,
      totalCapacity
    );
    
    // Store today's utilization
    storeDailyUtilization(today, category, utilizationRate);
    
    // Check consecutive days
    const consecutiveDays = getConsecutiveLowUtilizationDays(category, 50);
    
    if (checkUtilizationAlert(category, utilizationRate, 50, consecutiveDays)) {
      const alert = createUtilizationAlert(category, utilizationRate, consecutiveDays);
      alerts.push(alert);
      storeUtilizationAlert(alert);
      
      // Log alert creation
      logAuditEntry({
        operation: 'low_utilization_alert',
        category,
        details: {
          utilizationRate,
          consecutiveDays,
          threshold: 50,
        },
        success: true,
      });
    }
  }
  
  return alerts;
}

/**
 * Store daily utilization for trend tracking
 */
function storeDailyUtilization(
  date: string,
  category: AccessibilityCategory,
  utilizationRate: number
): void {
  const key = `daily_utilization_${category}`;
  const stored = localStorage.getItem(key);
  const history: DailyUtilizationHistory[] = stored ? JSON.parse(stored) : [];
  
  // Add or update today's entry
  const existingIndex = history.findIndex(h => h.date === date);
  if (existingIndex >= 0) {
    history[existingIndex].utilizationRate = utilizationRate;
  } else {
    history.push({ date, category, utilizationRate });
  }
  
  // Keep only last 30 days
  const sortedHistory = history
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 30);
  
  localStorage.setItem(key, JSON.stringify(sortedHistory));
}

/**
 * Get consecutive days of low utilization
 */
function getConsecutiveLowUtilizationDays(
  category: AccessibilityCategory,
  threshold: number
): number {
  const key = `daily_utilization_${category}`;
  const stored = localStorage.getItem(key);
  const history: DailyUtilizationHistory[] = stored ? JSON.parse(stored) : [];
  
  if (history.length === 0) return 0;
  
  // Sort by date descending
  const sortedHistory = history.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let consecutiveDays = 0;
  for (const entry of sortedHistory) {
    if (entry.utilizationRate < threshold) {
      consecutiveDays++;
    } else {
      break;
    }
  }
  
  return consecutiveDays;
}

/**
 * Log audit entry for accessibility operations
 */
export function logAuditEntry(
  entry: Omit<AuditLogEntry, 'id' | 'timestamp'>
): void {
  const auditEntry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    ...entry,
  };
  
  const stored = localStorage.getItem(STORAGE_KEYS.AUDIT_LOG);
  const logs: AuditLogEntry[] = stored ? JSON.parse(stored) : [];
  
  logs.push(auditEntry);
  
  // Keep only last 1000 entries
  const trimmedLogs = logs.slice(-1000);
  
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(trimmedLogs));
}

/**
 * Get audit logs with optional filtering
 */
export function getAuditLogs(
  filters?: {
    startDate?: Date;
    endDate?: Date;
    category?: AccessibilityCategory | 'system';
    operation?: string;
  }
): AuditLogEntry[] {
  const stored = localStorage.getItem(STORAGE_KEYS.AUDIT_LOG);
  let logs: AuditLogEntry[] = stored ? JSON.parse(stored) : [];
  
  // Parse dates
  logs = logs.map(log => ({
    ...log,
    timestamp: new Date(log.timestamp),
  }));
  
  // Apply filters
  if (filters) {
    if (filters.startDate) {
      logs = logs.filter(log => log.timestamp >= filters.startDate!);
    }
    if (filters.endDate) {
      logs = logs.filter(log => log.timestamp <= filters.endDate!);
    }
    if (filters.category) {
      logs = logs.filter(log => log.category === filters.category);
    }
    if (filters.operation) {
      logs = logs.filter(log => log.operation === filters.operation);
    }
  }
  
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Track route generation
 */
export function trackRouteGeneration(recalculation: boolean = false, timeMs: number = 0): void {
  const data = getRouteTrackingData();
  
  data.generated++;
  if (recalculation) {
    data.recalculations++;
    data.totalTime += timeMs / 1000; // Convert to seconds
  }
  
  localStorage.setItem(STORAGE_KEYS.ROUTE_TRACKING, JSON.stringify(data));
}

/**
 * Get route tracking data
 */
function getRouteTrackingData(): RouteTrackingData {
  const stored = localStorage.getItem(STORAGE_KEYS.ROUTE_TRACKING);
  return stored
    ? JSON.parse(stored)
    : { generated: 0, recalculations: 0, totalTime: 0 };
}

/**
 * Track notification delivery
 */
export function trackNotification(
  stage: 'sent' | 'delivered' | 'read' | 'actionTaken'
): void {
  const data = getNotificationTrackingData();
  
  data[stage]++;
  
  localStorage.setItem(STORAGE_KEYS.NOTIFICATION_TRACKING, JSON.stringify(data));
}

/**
 * Get notification tracking data
 */
function getNotificationTrackingData(): NotificationTrackingData {
  const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_TRACKING);
  return stored
    ? JSON.parse(stored)
    : { sent: 0, delivered: 0, read: 0, actionTaken: 0 };
}

/**
 * Store daily metrics
 */
function storeDailyMetrics(metrics: AccessibilityMetrics): void {
  const stored = localStorage.getItem(STORAGE_KEYS.DAILY_METRICS);
  const allMetrics: AccessibilityMetrics[] = stored ? JSON.parse(stored) : [];
  
  allMetrics.push(metrics);
  
  // Keep only last 90 days
  const sortedMetrics = allMetrics
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 90);
  
  localStorage.setItem(STORAGE_KEYS.DAILY_METRICS, JSON.stringify(sortedMetrics));
}

/**
 * Get daily metrics with optional date range
 */
export function getDailyMetrics(
  startDate?: Date,
  endDate?: Date
): AccessibilityMetrics[] {
  const stored = localStorage.getItem(STORAGE_KEYS.DAILY_METRICS);
  let metrics: AccessibilityMetrics[] = stored ? JSON.parse(stored) : [];
  
  // Parse dates
  metrics = metrics.map(m => ({
    ...m,
    date: new Date(m.date),
  }));
  
  // Apply date filters
  if (startDate) {
    metrics = metrics.filter(m => m.date >= startDate);
  }
  if (endDate) {
    metrics = metrics.filter(m => m.date <= endDate);
  }
  
  return metrics.sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Store utilization alert
 */
function storeUtilizationAlert(alert: UtilizationAlert): void {
  const stored = localStorage.getItem(STORAGE_KEYS.UTILIZATION_ALERTS);
  const alerts: UtilizationAlert[] = stored ? JSON.parse(stored) : [];
  
  alerts.push(alert);
  
  localStorage.setItem(STORAGE_KEYS.UTILIZATION_ALERTS, JSON.stringify(alerts));
}

/**
 * Get utilization alerts
 */
export function getUtilizationAlerts(includeResolved: boolean = false): UtilizationAlert[] {
  const stored = localStorage.getItem(STORAGE_KEYS.UTILIZATION_ALERTS);
  let alerts: UtilizationAlert[] = stored ? JSON.parse(stored) : [];
  
  // Parse dates
  alerts = alerts.map(alert => ({
    ...alert,
    triggeredAt: new Date(alert.triggeredAt),
  }));
  
  if (!includeResolved) {
    alerts = alerts.filter(alert => !alert.resolved);
  }
  
  return alerts.sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime());
}

/**
 * Resolve utilization alert
 */
export function resolveUtilizationAlert(alertId: string): boolean {
  const stored = localStorage.getItem(STORAGE_KEYS.UTILIZATION_ALERTS);
  const alerts: UtilizationAlert[] = stored ? JSON.parse(stored) : [];
  
  const alert = alerts.find(a => a.alertId === alertId);
  if (alert) {
    alert.resolved = true;
    localStorage.setItem(STORAGE_KEYS.UTILIZATION_ALERTS, JSON.stringify(alerts));
    
    logAuditEntry({
      operation: 'resolve_utilization_alert',
      category: alert.category,
      details: { alertId },
      success: true,
    });
    
    return true;
  }
  
  return false;
}

/**
 * Reset daily tracking counters
 */
function resetDailyTracking(): void {
  localStorage.setItem(STORAGE_KEYS.ROUTE_TRACKING, JSON.stringify({
    generated: 0,
    recalculations: 0,
    totalTime: 0,
  }));
  
  localStorage.setItem(STORAGE_KEYS.NOTIFICATION_TRACKING, JSON.stringify({
    sent: 0,
    delivered: 0,
    read: 0,
    actionTaken: 0,
  }));
  
  localStorage.removeItem('priority_wait_times');
  localStorage.removeItem('general_wait_times');
}

/**
 * Get real-time statistics
 */
export function getRealTimeStats(): {
  activePrioritySlots: number;
  assistanceRequests: number;
  routeRecalculations: number;
} {
  const routeData = getRouteTrackingData();
  
  // These would typically come from real-time data sources
  // For now, using stored data
  return {
    activePrioritySlots: 0, // Would be calculated from current slot allocations
    assistanceRequests: 0, // Would be tracked separately
    routeRecalculations: routeData.recalculations,
  };
}
