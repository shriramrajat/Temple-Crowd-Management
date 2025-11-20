/**
 * Notification Service
 * 
 * This service manages accessibility notifications including scheduling,
 * delivery tracking, queue management, and preference checking.
 */

import {
  AccessibilityNotification,
  NotificationCreateInput,
  NotificationQueueItem,
  NotificationDeliveryResult,
  NotificationType,
} from '../types/notifications';
import { AccessibilityPreferences } from '../types/accessibility';
import { AccessibilityNotificationSchema, NotificationCreateSchema } from '../schemas/notifications';

/**
 * Storage keys for local storage
 */
const STORAGE_KEYS = {
  NOTIFICATIONS: 'accessibility_notifications',
  QUEUE: 'notification_queue',
  PREFERENCES: 'notification_preferences',
} as const;

/**
 * Maximum retry attempts for failed notifications
 */
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Notification queue for managing scheduled and pending notifications
 */
class NotificationQueue {
  private queue: NotificationQueueItem[] = [];
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadQueue();
    this.startProcessing();
  }

  /**
   * Load queue from storage
   */
  private loadQueue(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.QUEUE);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.queue = parsed.map((item: NotificationQueueItem) => ({
          ...item,
          notification: {
            ...item.notification,
            sentAt: new Date(item.notification.sentAt),
            readAt: item.notification.readAt ? new Date(item.notification.readAt) : undefined,
            expiresAt: item.notification.expiresAt ? new Date(item.notification.expiresAt) : undefined,
          },
          scheduledFor: new Date(item.scheduledFor),
          lastAttempt: item.lastAttempt ? new Date(item.lastAttempt) : undefined,
        }));
      }
    } catch (error) {
      console.error('Failed to load notification queue:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to storage
   */
  private saveQueue(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save notification queue:', error);
    }
  }

  /**
   * Add notification to queue
   */
  add(notification: AccessibilityNotification, scheduledFor: Date = new Date()): void {
    const queueItem: NotificationQueueItem = {
      notification,
      scheduledFor,
      attempts: 0,
      status: 'pending',
    };

    this.queue.push(queueItem);
    this.saveQueue();
  }

  /**
   * Get pending notifications ready for delivery
   */
  getPending(): NotificationQueueItem[] {
    const now = new Date();
    return this.queue.filter(
      item => 
        item.status === 'pending' && 
        item.scheduledFor <= now &&
        item.attempts < MAX_RETRY_ATTEMPTS
    );
  }

  /**
   * Update queue item status
   */
  updateStatus(
    notificationId: string, 
    status: NotificationQueueItem['status'],
    error?: string
  ): void {
    const item = this.queue.find(i => i.notification.id === notificationId);
    if (item) {
      item.status = status;
      item.attempts += 1;
      item.lastAttempt = new Date();
      if (error) {
        item.error = error;
      }
      this.saveQueue();
    }
  }

  /**
   * Remove delivered or expired notifications from queue
   */
  cleanup(): void {
    const now = new Date();
    this.queue = this.queue.filter(item => {
      // Keep pending and processing items
      if (item.status === 'pending' || item.status === 'processing') {
        return true;
      }
      
      // Remove delivered items older than 1 hour
      if (item.status === 'delivered' && item.lastAttempt) {
        const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        return item.lastAttempt > hourAgo;
      }
      
      // Remove failed items that exceeded retry attempts
      if (item.status === 'failed' && item.attempts >= MAX_RETRY_ATTEMPTS) {
        return false;
      }
      
      return true;
    });
    this.saveQueue();
  }

  /**
   * Start processing queue at regular intervals
   */
  private startProcessing(): void {
    if (typeof window === 'undefined') return;
    
    // Process queue every 5 seconds
    this.processingInterval = setInterval(() => {
      this.cleanup();
    }, 5000);
  }

  /**
   * Stop processing queue
   */
  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }
}

/**
 * Singleton notification queue instance
 */
const notificationQueue = new NotificationQueue();

/**
 * Generate unique notification ID
 */
function generateNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get all notifications for a pilgrim
 */
export function getNotifications(pilgrimId: string): AccessibilityNotification[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!stored) return [];
    
    const allNotifications = JSON.parse(stored);
    return allNotifications
      .filter((n: AccessibilityNotification) => n.pilgrimId === pilgrimId)
      .map((n: AccessibilityNotification) => ({
        ...n,
        sentAt: new Date(n.sentAt),
        readAt: n.readAt ? new Date(n.readAt) : undefined,
        expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined,
      }))
      .sort((a: AccessibilityNotification, b: AccessibilityNotification) => 
        b.sentAt.getTime() - a.sentAt.getTime()
      );
  } catch (error) {
    console.error('Failed to get notifications:', error);
    return [];
  }
}

/**
 * Get unread notifications for a pilgrim
 */
export function getUnreadNotifications(pilgrimId: string): AccessibilityNotification[] {
  return getNotifications(pilgrimId).filter(n => !n.readAt);
}

/**
 * Mark notification as read
 */
export function markAsRead(notificationId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!stored) return false;
    
    const notifications = JSON.parse(stored);
    const notification = notifications.find((n: AccessibilityNotification) => n.id === notificationId);
    
    if (notification && !notification.readAt) {
      notification.readAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return false;
  }
}

/**
 * Get notification preferences for a pilgrim
 */
export function getNotificationPreferences(pilgrimId: string): AccessibilityPreferences {
  if (typeof window === 'undefined') {
    return getDefaultPreferences();
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (!stored) return getDefaultPreferences();
    
    const allPreferences = JSON.parse(stored);
    return allPreferences[pilgrimId] || getDefaultPreferences();
  } catch (error) {
    console.error('Failed to get notification preferences:', error);
    return getDefaultPreferences();
  }
}

/**
 * Update notification preferences for a pilgrim
 */
export function updateNotificationPreferences(
  pilgrimId: string,
  preferences: AccessibilityPreferences
): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    const allPreferences = stored ? JSON.parse(stored) : {};
    
    allPreferences[pilgrimId] = preferences;
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(allPreferences));
    return true;
  } catch (error) {
    console.error('Failed to update notification preferences:', error);
    return false;
  }
}

/**
 * Get default notification preferences
 */
function getDefaultPreferences(): AccessibilityPreferences {
  return {
    notifyOnAssistanceZone: true,
    prioritySlotReminders: true,
    weatherAlerts: true,
    routeRecalculationAlerts: true,
  };
}

/**
 * Check if notification should be sent based on preferences
 */
export function shouldSendNotification(
  pilgrimId: string,
  notificationType: NotificationType
): boolean {
  const preferences = getNotificationPreferences(pilgrimId);
  
  switch (notificationType) {
    case 'assistance-zone':
      return preferences.notifyOnAssistanceZone;
    case 'slot-reminder':
      return preferences.prioritySlotReminders;
    case 'condition-change':
      return preferences.weatherAlerts;
    case 'route-update':
      return preferences.routeRecalculationAlerts;
    case 'staff-dispatch':
    case 'emergency-contact':
      // Always send critical notifications
      return true;
    default:
      return true;
  }
}

/**
 * Create and store a notification
 */
function createNotification(input: NotificationCreateInput): AccessibilityNotification {
  // Validate input
  const validated = NotificationCreateSchema.parse(input);
  
  const notification: AccessibilityNotification = {
    id: generateNotificationId(),
    ...validated,
    sentAt: new Date(),
  };
  
  // Validate complete notification
  AccessibilityNotificationSchema.parse(notification);
  
  // Store notification
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const notifications = stored ? JSON.parse(stored) : [];
      notifications.push(notification);
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to store notification:', error);
    }
  }
  
  return notification;
}

/**
 * Schedule a notification for future delivery
 */
export function scheduleNotification(
  input: NotificationCreateInput,
  scheduledFor: Date
): string {
  // Check preferences before scheduling
  if (!shouldSendNotification(input.pilgrimId, input.type)) {
    console.log(`Notification skipped due to user preferences: ${input.type}`);
    return '';
  }
  
  const notification = createNotification(input);
  notificationQueue.add(notification, scheduledFor);
  
  return notification.id;
}

/**
 * Send a notification immediately
 */
export async function sendNotification(
  input: NotificationCreateInput
): Promise<NotificationDeliveryResult> {
  try {
    // Check preferences before sending
    if (!shouldSendNotification(input.pilgrimId, input.type)) {
      return {
        success: false,
        notificationId: '',
        error: 'Notification blocked by user preferences',
      };
    }
    
    const notification = createNotification(input);
    
    // Add to queue for immediate processing
    notificationQueue.add(notification, new Date());
    
    // Simulate delivery (in real implementation, this would call notification service)
    await simulateDelivery(notification);
    
    // Update queue status
    notificationQueue.updateStatus(notification.id, 'delivered');
    
    return {
      success: true,
      notificationId: notification.id,
      deliveredAt: new Date(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to send notification:', errorMessage);
    
    return {
      success: false,
      notificationId: '',
      error: errorMessage,
    };
  }
}

/**
 * Simulate notification delivery (placeholder for actual delivery mechanism)
 */
async function simulateDelivery(notification: AccessibilityNotification): Promise<void> {
  // In a real implementation, this would:
  // - Send push notifications
  // - Send SMS
  // - Send email
  // - Trigger in-app notifications
  
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Notification delivered: ${notification.type} to ${notification.pilgrimId}`);
      resolve();
    }, 100);
  });
}

/**
 * Send bulk notifications
 */
export async function sendBulkNotifications(
  inputs: NotificationCreateInput[]
): Promise<NotificationDeliveryResult[]> {
  const results: NotificationDeliveryResult[] = [];
  
  for (const input of inputs) {
    const result = await sendNotification(input);
    results.push(result);
  }
  
  return results;
}

/**
 * Get notification by ID
 */
export function getNotificationById(notificationId: string): AccessibilityNotification | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!stored) return null;
    
    const notifications = JSON.parse(stored);
    const notification = notifications.find((n: AccessibilityNotification) => n.id === notificationId);
    
    if (notification) {
      return {
        ...notification,
        sentAt: new Date(notification.sentAt),
        readAt: notification.readAt ? new Date(notification.readAt) : undefined,
        expiresAt: notification.expiresAt ? new Date(notification.expiresAt) : undefined,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get notification:', error);
    return null;
  }
}

/**
 * Delete notification
 */
export function deleteNotification(notificationId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!stored) return false;
    
    const notifications = JSON.parse(stored);
    const filtered = notifications.filter((n: AccessibilityNotification) => n.id !== notificationId);
    
    if (filtered.length < notifications.length) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(filtered));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return false;
  }
}

/**
 * Clear all notifications for a pilgrim
 */
export function clearNotifications(pilgrimId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!stored) return true;
    
    const notifications = JSON.parse(stored);
    const filtered = notifications.filter((n: AccessibilityNotification) => n.pilgrimId !== pilgrimId);
    
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to clear notifications:', error);
    return false;
  }
}

/**
 * Get notification queue for debugging/monitoring
 */
export function getNotificationQueue(): NotificationQueueItem[] {
  return notificationQueue.getPending();
}

/**
 * Cleanup notification queue
 */
export function cleanupNotificationQueue(): void {
  notificationQueue.cleanup();
}
