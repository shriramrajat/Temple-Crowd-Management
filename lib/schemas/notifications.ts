/**
 * Notification Validation Schemas
 * 
 * This file contains Zod validation schemas for runtime type checking
 * and data validation for accessibility notifications and alerts.
 */

import { z } from 'zod';
import { AccessibilityCategorySchema } from './accessibility';

/**
 * Notification type enum schema
 */
export const NotificationTypeSchema = z.enum([
  'assistance-zone',
  'slot-reminder',
  'staff-dispatch',
  'emergency-contact',
  'condition-change',
  'route-update',
]);

/**
 * Notification priority enum schema
 */
export const NotificationPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

/**
 * Accessibility notification schema with validation rules
 */
export const AccessibilityNotificationSchema = z.object({
  id: z.string().min(1, 'Notification ID is required'),
  pilgrimId: z.string().min(1, 'Pilgrim ID is required'),
  type: NotificationTypeSchema,
  priority: NotificationPrioritySchema,
  title: z.string().min(1, 'Title is required').max(100),
  message: z.string().min(1, 'Message is required').max(500),
  actionable: z.boolean(),
  actionUrl: z.string().url('Invalid URL format').optional(),
  actionLabel: z.string().max(50).optional(),
  emergencyContact: z.string().optional(),
  sentAt: z.coerce.date(),
  readAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
}).refine(
  (data: { actionable: boolean; actionUrl?: string; actionLabel?: string }) => {
    if (data.actionable) {
      return data.actionUrl && data.actionLabel;
    }
    return true;
  },
  {
    message: 'Actionable notifications must have both actionUrl and actionLabel',
    path: ['actionable'],
  }
).refine(
  (data: { readAt?: Date; sentAt: Date }) => {
    if (data.readAt) {
      return data.readAt >= data.sentAt;
    }
    return true;
  },
  {
    message: 'Read time must be after sent time',
    path: ['readAt'],
  }
).refine(
  (data: { expiresAt?: Date; sentAt: Date }) => {
    if (data.expiresAt) {
      return data.expiresAt > data.sentAt;
    }
    return true;
  },
  {
    message: 'Expiration time must be after sent time',
    path: ['expiresAt'],
  }
);

/**
 * Notification trigger schema with validation rules
 */
export const NotificationTriggerSchema = z.object({
  type: NotificationTypeSchema,
  condition: z.string().min(1, 'Condition is required'),
  targetAudience: z.array(AccessibilityCategorySchema),
  maxDelay: z.number().int().positive('Max delay must be positive'),
}).refine(
  (data: { type: string; maxDelay: number }) => {
    // Validate max delay based on notification type
    const maxDelayLimits: Record<string, number> = {
      'assistance-zone': 30,
      'slot-reminder': 3600,
      'staff-dispatch': 60,
      'emergency-contact': 10,
      'condition-change': 300,
      'route-update': 120,
    };
    return data.maxDelay <= maxDelayLimits[data.type];
  },
  {
    message: 'Max delay exceeds allowed limit for notification type',
    path: ['maxDelay'],
  }
);

/**
 * Notification creation schema (for API input)
 */
export const NotificationCreateSchema = z.object({
  pilgrimId: z.string().min(1, 'Pilgrim ID is required'),
  type: NotificationTypeSchema,
  priority: NotificationPrioritySchema,
  title: z.string().min(1, 'Title is required').max(100),
  message: z.string().min(1, 'Message is required').max(500),
  actionable: z.boolean().default(false),
  actionUrl: z.string().url('Invalid URL format').optional(),
  actionLabel: z.string().max(50).optional(),
  emergencyContact: z.string().optional(),
  expiresAt: z.coerce.date().optional(),
});

/**
 * Array schemas for bulk data validation
 */
export const NotificationsArraySchema = z.array(AccessibilityNotificationSchema);
export const NotificationTriggersArraySchema = z.array(NotificationTriggerSchema);
