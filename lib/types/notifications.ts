/**
 * Notification Type Definitions
 * 
 * This file contains TypeScript interfaces and types for accessibility
 * notifications and notification management.
 */

import { z } from 'zod';
import {
  NotificationTypeSchema,
  NotificationPrioritySchema,
  NotificationCreateSchema,
} from '../schemas/notifications';
import { AccessibilityCategory } from './accessibility';

/**
 * Notification type classifications
 */
export type NotificationType = z.infer<typeof NotificationTypeSchema>;

/**
 * Notification priority levels
 */
export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;

/**
 * Accessibility notification with all metadata
 */
export interface AccessibilityNotification {
  id: string;
  pilgrimId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  actionable: boolean;
  actionUrl?: string;
  actionLabel?: string;
  emergencyContact?: string;
  sentAt: Date;
  readAt?: Date;
  expiresAt?: Date;
}

/**
 * Notification trigger configuration
 */
export interface NotificationTrigger {
  type: NotificationType;
  condition: string;
  targetAudience: AccessibilityCategory[];
  maxDelay: number; // seconds
}

/**
 * Notification creation input
 */
export type NotificationCreateInput = z.infer<typeof NotificationCreateSchema>;

/**
 * Notification queue item for processing
 */
export interface NotificationQueueItem {
  notification: AccessibilityNotification;
  scheduledFor: Date;
  attempts: number;
  lastAttempt?: Date;
  status: 'pending' | 'processing' | 'delivered' | 'failed';
  error?: string;
}

/**
 * Notification delivery result
 */
export interface NotificationDeliveryResult {
  success: boolean;
  notificationId: string;
  deliveredAt?: Date;
  error?: string;
}

/**
 * Notification statistics
 */
export interface NotificationStats {
  total: number;
  delivered: number;
  failed: number;
  pending: number;
  readRate: number;
}
