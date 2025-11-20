/**
 * Accessibility Analytics Validation Schemas
 * 
 * This file contains Zod validation schemas for runtime type checking
 * and data validation for accessibility monitoring and analytics.
 */

import { z } from 'zod';
import { AccessibilityCategorySchema } from './accessibility';

/**
 * Priority slot utilization schema
 */
export const PrioritySlotUtilizationSchema = z.object({
  elderly: z.number().int().nonnegative('Elderly count cannot be negative'),
  differentlyAbled: z.number().int().nonnegative('Differently-abled count cannot be negative'),
  wheelchairUser: z.number().int().nonnegative('Wheelchair user count cannot be negative'),
  total: z.number().int().nonnegative('Total count cannot be negative'),
  utilizationRate: z.number().min(0).max(100, 'Utilization rate must be between 0 and 100'),
}).refine(
  (data: { total: number; elderly: number; differentlyAbled: number; wheelchairUser: number }) => 
    data.total === data.elderly + data.differentlyAbled + data.wheelchairUser,
  {
    message: 'Total must equal sum of all categories',
    path: ['total'],
  }
);

/**
 * Wait time comparison schema
 */
export const WaitTimeComparisonSchema = z.object({
  prioritySlots: z.number().nonnegative('Priority slots wait time cannot be negative'),
  generalSlots: z.number().nonnegative('General slots wait time cannot be negative'),
  difference: z.number(),
}).refine(
  (data: { difference: number; generalSlots: number; prioritySlots: number }) => 
    Math.abs(data.difference - (data.generalSlots - data.prioritySlots)) < 0.01,
  {
    message: 'Difference must equal general slots minus priority slots',
    path: ['difference'],
  }
);

/**
 * Route metrics schema
 */
export const RouteMetricsSchema = z.object({
  accessibleRoutesGenerated: z.number().int().nonnegative('Routes generated cannot be negative'),
  recalculations: z.number().int().nonnegative('Recalculations cannot be negative'),
  averageRecalculationTime: z.number().nonnegative('Average time cannot be negative'),
}).refine(
  (data: { averageRecalculationTime: number }) => data.averageRecalculationTime <= 120,
  {
    message: 'Average recalculation time should not exceed 120 seconds',
    path: ['averageRecalculationTime'],
  }
);

/**
 * Notification metrics schema
 */
export const NotificationMetricsSchema = z.object({
  sent: z.number().int().nonnegative('Sent count cannot be negative'),
  delivered: z.number().int().nonnegative('Delivered count cannot be negative'),
  read: z.number().int().nonnegative('Read count cannot be negative'),
  actionTaken: z.number().int().nonnegative('Action taken count cannot be negative'),
}).refine(
  (data: { delivered: number; sent: number }) => data.delivered <= data.sent,
  {
    message: 'Delivered cannot exceed sent',
    path: ['delivered'],
  }
).refine(
  (data: { read: number; delivered: number }) => data.read <= data.delivered,
  {
    message: 'Read cannot exceed delivered',
    path: ['read'],
  }
).refine(
  (data: { actionTaken: number; read: number }) => data.actionTaken <= data.read,
  {
    message: 'Action taken cannot exceed read',
    path: ['actionTaken'],
  }
);

/**
 * Accessibility metrics schema with validation rules
 */
export const AccessibilityMetricsSchema = z.object({
  date: z.coerce.date(),
  prioritySlotUtilization: PrioritySlotUtilizationSchema,
  averageWaitTimes: WaitTimeComparisonSchema,
  routeMetrics: RouteMetricsSchema,
  notificationMetrics: NotificationMetricsSchema,
  assistanceRequests: z.number().int().nonnegative('Assistance requests cannot be negative'),
});

/**
 * Utilization alert schema with validation rules
 */
export const UtilizationAlertSchema = z.object({
  alertId: z.string().min(1, 'Alert ID is required'),
  category: AccessibilityCategorySchema,
  utilizationRate: z.number().min(0).max(100, 'Utilization rate must be between 0 and 100'),
  threshold: z.number().min(0).max(100, 'Threshold must be between 0 and 100'),
  consecutiveDays: z.number().int().positive('Consecutive days must be positive'),
  triggeredAt: z.coerce.date(),
  resolved: z.boolean(),
}).refine(
  (data: { resolved: boolean; utilizationRate: number; threshold: number }) => 
    !data.resolved ? data.utilizationRate < data.threshold : true,
  {
    message: 'Unresolved alerts must have utilization rate below threshold',
    path: ['utilizationRate'],
  }
).refine(
  (data: { consecutiveDays: number }) => data.consecutiveDays >= 3,
  {
    message: 'Alert requires at least 3 consecutive days',
    path: ['consecutiveDays'],
  }
);

/**
 * Array schemas for bulk data validation
 */
export const AccessibilityMetricsArraySchema = z.array(AccessibilityMetricsSchema);
export const UtilizationAlertsArraySchema = z.array(UtilizationAlertSchema);
