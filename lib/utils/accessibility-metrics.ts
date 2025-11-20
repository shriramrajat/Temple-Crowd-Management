/**
 * Accessibility Metrics Calculation Utilities
 * 
 * This file contains utility functions for calculating accessibility metrics,
 * utilization rates, and generating analytics data.
 */

import type {
  AccessibilityMetrics,
  PrioritySlotUtilization,
  WaitTimeComparison,
  RouteMetrics,
  NotificationMetrics,
  UtilizationAlert,
} from '../types/accessibility-analytics';
import type { AccessibilityCategory } from '../types/accessibility';
import type { SlotAllocation } from '../types/priority-slots';

/**
 * Calculate priority slot utilization by category
 */
export function calculateSlotUtilization(
  allocations: SlotAllocation[],
  totalCapacity: number
): PrioritySlotUtilization {
  const elderly = allocations.filter(a => 
    a.accessibilityProfile.categories.includes('elderly')
  ).length;
  
  const differentlyAbled = allocations.filter(a => 
    a.accessibilityProfile.categories.includes('differently-abled')
  ).length;
  
  const wheelchairUser = allocations.filter(a => 
    a.accessibilityProfile.categories.includes('wheelchair-user')
  ).length;
  
  const total = allocations.length;
  const utilizationRate = totalCapacity > 0 ? (total / totalCapacity) * 100 : 0;

  return {
    elderly,
    differentlyAbled,
    wheelchairUser,
    total,
    utilizationRate,
  };
}

/**
 * Calculate wait time comparison between priority and general slots
 */
export function calculateWaitTimeComparison(
  priorityWaitTimes: number[],
  generalWaitTimes: number[]
): WaitTimeComparison {
  const priorityAvg = priorityWaitTimes.length > 0
    ? priorityWaitTimes.reduce((sum, time) => sum + time, 0) / priorityWaitTimes.length
    : 0;
  
  const generalAvg = generalWaitTimes.length > 0
    ? generalWaitTimes.reduce((sum, time) => sum + time, 0) / generalWaitTimes.length
    : 0;

  return {
    prioritySlots: Math.round(priorityAvg),
    generalSlots: Math.round(generalAvg),
    difference: Math.round(generalAvg - priorityAvg),
  };
}

/**
 * Calculate route generation metrics
 */
export function calculateRouteMetrics(
  routesGenerated: number,
  recalculations: number,
  totalRecalculationTime: number
): RouteMetrics {
  const averageRecalculationTime = recalculations > 0
    ? totalRecalculationTime / recalculations
    : 0;

  return {
    accessibleRoutesGenerated: routesGenerated,
    recalculations,
    averageRecalculationTime: Math.round(averageRecalculationTime * 100) / 100,
  };
}

/**
 * Calculate notification delivery metrics
 */
export function calculateNotificationMetrics(
  sent: number,
  delivered: number,
  read: number,
  actionTaken: number
): NotificationMetrics {
  return {
    sent,
    delivered,
    read,
    actionTaken,
  };
}

/**
 * Generate comprehensive accessibility metrics
 */
export function generateAccessibilityMetrics(
  date: Date,
  allocations: SlotAllocation[],
  totalCapacity: number,
  priorityWaitTimes: number[],
  generalWaitTimes: number[],
  routeData: { generated: number; recalculations: number; totalTime: number },
  notificationData: { sent: number; delivered: number; read: number; actionTaken: number },
  assistanceRequests: number
): AccessibilityMetrics {
  return {
    date,
    prioritySlotUtilization: calculateSlotUtilization(allocations, totalCapacity),
    averageWaitTimes: calculateWaitTimeComparison(priorityWaitTimes, generalWaitTimes),
    routeMetrics: calculateRouteMetrics(
      routeData.generated,
      routeData.recalculations,
      routeData.totalTime
    ),
    notificationMetrics: calculateNotificationMetrics(
      notificationData.sent,
      notificationData.delivered,
      notificationData.read,
      notificationData.actionTaken
    ),
    assistanceRequests,
  };
}

/**
 * Check if utilization rate triggers an alert
 */
export function checkUtilizationAlert(
  category: AccessibilityCategory,
  utilizationRate: number,
  threshold: number = 50,
  consecutiveDays: number = 3
): boolean {
  return utilizationRate < threshold && consecutiveDays >= 3;
}

/**
 * Create a utilization alert
 */
export function createUtilizationAlert(
  category: AccessibilityCategory,
  utilizationRate: number,
  consecutiveDays: number,
  threshold: number = 50
): UtilizationAlert {
  return {
    alertId: `alert-${category}-${Date.now()}`,
    category,
    utilizationRate,
    threshold,
    consecutiveDays,
    triggeredAt: new Date(),
    resolved: false,
  };
}

/**
 * Calculate utilization trend over multiple days
 */
export function calculateUtilizationTrend(
  dailyMetrics: AccessibilityMetrics[]
): { date: Date; rate: number }[] {
  return dailyMetrics.map(metric => ({
    date: metric.date,
    rate: metric.prioritySlotUtilization.utilizationRate,
  }));
}

/**
 * Get category-wise utilization breakdown
 */
export function getCategoryBreakdown(
  utilization: PrioritySlotUtilization
): { category: string; count: number; percentage: number }[] {
  const total = utilization.total || 1; // Avoid division by zero
  
  return [
    {
      category: 'Elderly',
      count: utilization.elderly,
      percentage: Math.round((utilization.elderly / total) * 100),
    },
    {
      category: 'Differently-abled',
      count: utilization.differentlyAbled,
      percentage: Math.round((utilization.differentlyAbled / total) * 100),
    },
    {
      category: 'Wheelchair User',
      count: utilization.wheelchairUser,
      percentage: Math.round((utilization.wheelchairUser / total) * 100),
    },
  ];
}
