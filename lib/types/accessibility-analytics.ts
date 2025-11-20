/**
 * Accessibility Analytics Type Definitions
 * 
 * This file contains TypeScript interfaces and types for monitoring and
 * analytics of accessibility features and priority access utilization.
 */

import type { AccessibilityCategory } from './accessibility';

/**
 * Priority slot utilization by category
 */
export interface PrioritySlotUtilization {
  elderly: number;
  differentlyAbled: number;
  wheelchairUser: number;
  total: number;
  utilizationRate: number;
}

/**
 * Wait time comparison metrics
 */
export interface WaitTimeComparison {
  prioritySlots: number;
  generalSlots: number;
  difference: number;
}

/**
 * Route generation metrics
 */
export interface RouteMetrics {
  accessibleRoutesGenerated: number;
  recalculations: number;
  averageRecalculationTime: number;
}

/**
 * Notification delivery metrics
 */
export interface NotificationMetrics {
  sent: number;
  delivered: number;
  read: number;
  actionTaken: number;
}

/**
 * Comprehensive accessibility metrics
 */
export interface AccessibilityMetrics {
  date: Date;
  prioritySlotUtilization: PrioritySlotUtilization;
  averageWaitTimes: WaitTimeComparison;
  routeMetrics: RouteMetrics;
  notificationMetrics: NotificationMetrics;
  assistanceRequests: number;
}

/**
 * Utilization alert for low usage
 */
export interface UtilizationAlert {
  alertId: string;
  category: AccessibilityCategory;
  utilizationRate: number;
  threshold: number;
  consecutiveDays: number;
  triggeredAt: Date;
  resolved: boolean;
}
