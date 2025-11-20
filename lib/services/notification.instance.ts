/**
 * Notification Service Instance
 * Singleton instance of the notification service
 */

import { NotificationService } from "./notification.service";

/**
 * Singleton instance of NotificationService
 * Can be used across the application without database dependency
 */
let notificationServiceInstance: NotificationService | null = null;

/**
 * Get or create notification service instance
 * 
 * @returns NotificationService instance
 */
export function getNotificationService(): NotificationService {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new NotificationService();
  }
  return notificationServiceInstance;
}

/**
 * Export singleton instance for direct import
 */
export const notificationService = getNotificationService();
