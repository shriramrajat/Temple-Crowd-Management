/**
 * Notification Triggers Service
 * 
 * This service manages automatic notification triggers for various events
 * including assistance zone entry, slot reminders, staff dispatch, and
 * condition changes.
 */

import {
  sendNotification,
  scheduleNotification,
  sendBulkNotifications,
} from './notification-service';
import type { NotificationCreateInput } from '../types/notifications';
import type { AccessibilityProfile } from '../types/accessibility';
import type { SlotAllocation } from '../types/priority-slots';

/**
 * Trigger assistance zone entry notification
 * Must be sent within 30 seconds of zone entry
 */
export async function triggerAssistanceZoneNotification(
  pilgrimId: string,
  profile: AccessibilityProfile,
  zoneName: string,
  zoneLocation: string
): Promise<string> {
  const emergencyContact = profile.emergencyContact
    ? `Emergency Contact: ${profile.emergencyContact.name} - ${profile.emergencyContact.phone}`
    : undefined;

  const notification: NotificationCreateInput = {
    pilgrimId,
    type: 'assistance-zone',
    priority: 'medium',
    title: 'Assistance Available',
    message: `You have entered ${zoneName}. Assistance services are available at ${zoneLocation}. Staff can help with navigation, accessibility needs, and general support.`,
    actionable: true,
    actionUrl: '/assistance/request',
    actionLabel: 'Request Assistance',
    emergencyContact,
  };

  const result = await sendNotification(notification);
  return result.notificationId;
}

/**
 * Schedule slot reminder notifications
 * Sends reminders at 30 minutes and 10 minutes before slot time
 */
export function scheduleSlotReminders(
  allocation: SlotAllocation,
  slotTime: Date,
  slotLocation: string
): { reminder30: string; reminder10: string } {
  const pilgrimId = allocation.pilgrimId;
  const emergencyContact = allocation.accessibilityProfile.emergencyContact
    ? `Emergency Contact: ${allocation.accessibilityProfile.emergencyContact.name} - ${allocation.accessibilityProfile.emergencyContact.phone}`
    : undefined;

  // Calculate reminder times
  const reminder30Time = new Date(slotTime.getTime() - 30 * 60 * 1000);
  const reminder10Time = new Date(slotTime.getTime() - 10 * 60 * 1000);

  // Format slot time for display
  const slotTimeStr = slotTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // 30-minute reminder
  const notification30: NotificationCreateInput = {
    pilgrimId,
    type: 'slot-reminder',
    priority: 'high',
    title: 'Priority Slot Reminder - 30 Minutes',
    message: `Your priority darshan slot is in 30 minutes at ${slotTimeStr}. Location: ${slotLocation}. Please arrive 10 minutes early. Your QR code: ${allocation.qrCode}`,
    actionable: true,
    actionUrl: `/booking/${allocation.allocationId}`,
    actionLabel: 'View Details',
    emergencyContact,
  };

  // 10-minute reminder
  const notification10: NotificationCreateInput = {
    pilgrimId,
    type: 'slot-reminder',
    priority: 'urgent',
    title: 'Priority Slot Reminder - 10 Minutes',
    message: `Your priority darshan slot is in 10 minutes at ${slotTimeStr}. Please proceed to ${slotLocation} now. Show your QR code at the entrance.`,
    actionable: true,
    actionUrl: `/booking/${allocation.allocationId}`,
    actionLabel: 'Show QR Code',
    emergencyContact,
  };

  const reminder30Id = scheduleNotification(notification30, reminder30Time);
  const reminder10Id = scheduleNotification(notification10, reminder10Time);

  return {
    reminder30: reminder30Id,
    reminder10: reminder10Id,
  };
}

/**
 * Trigger staff dispatch notification
 * Must be sent within 1 minute of dispatch
 */
export async function triggerStaffDispatchNotification(
  pilgrimIds: string[],
  profiles: AccessibilityProfile[],
  location: string,
  estimatedArrival: number // minutes
): Promise<string[]> {
  const notifications: NotificationCreateInput[] = pilgrimIds.map((pilgrimId, index) => {
    const profile = profiles[index];
    const emergencyContact = profile?.emergencyContact
      ? `Emergency Contact: ${profile.emergencyContact.name} - ${profile.emergencyContact.phone}`
      : undefined;

    return {
      pilgrimId,
      type: 'staff-dispatch',
      priority: 'high',
      title: 'Assistance Staff Dispatched',
      message: `Assistance staff have been dispatched to ${location}. Estimated arrival: ${estimatedArrival} minutes. They will help with accessibility needs and navigation.`,
      actionable: true,
      actionUrl: '/assistance/track',
      actionLabel: 'Track Staff',
      emergencyContact,
    };
  });

  const results = await sendBulkNotifications(notifications);
  return results.map(r => r.notificationId);
}

/**
 * Trigger condition change alert
 * Must be sent within 5 minutes of condition change
 */
export async function triggerConditionChangeAlert(
  pilgrimIds: string[],
  profiles: AccessibilityProfile[],
  conditionType: 'weather' | 'path' | 'crowd' | 'facility',
  description: string,
  affectedArea: string,
  severity: 'low' | 'medium' | 'high'
): Promise<string[]> {
  const priorityMap = {
    low: 'low' as const,
    medium: 'medium' as const,
    high: 'high' as const,
  };

  const notifications: NotificationCreateInput[] = pilgrimIds.map((pilgrimId, index) => {
    const profile = profiles[index];
    const emergencyContact = profile?.emergencyContact
      ? `Emergency Contact: ${profile.emergencyContact.name} - ${profile.emergencyContact.phone}`
      : undefined;

    return {
      pilgrimId,
      type: 'condition-change',
      priority: priorityMap[severity],
      title: `${conditionType.charAt(0).toUpperCase() + conditionType.slice(1)} Alert`,
      message: `${description} in ${affectedArea}. This may affect your planned route. Please check for updated route suggestions.`,
      actionable: true,
      actionUrl: '/routes',
      actionLabel: 'View Updated Routes',
      emergencyContact,
    };
  });

  const results = await sendBulkNotifications(notifications);
  return results.map(r => r.notificationId);
}

/**
 * Trigger route update notification
 * Sent when route needs to be recalculated
 */
export async function triggerRouteUpdateNotification(
  pilgrimId: string,
  profile: AccessibilityProfile,
  reason: string,
  newRouteId: string
): Promise<string> {
  const emergencyContact = profile.emergencyContact
    ? `Emergency Contact: ${profile.emergencyContact.name} - ${profile.emergencyContact.phone}`
    : undefined;

  const notification: NotificationCreateInput = {
    pilgrimId,
    type: 'route-update',
    priority: 'medium',
    title: 'Route Updated',
    message: `Your route has been updated: ${reason}. A new accessible route has been calculated for you. Please review the updated route before proceeding.`,
    actionable: true,
    actionUrl: `/routes/${newRouteId}`,
    actionLabel: 'View New Route',
    emergencyContact,
  };

  const result = await sendNotification(notification);
  return result.notificationId;
}

/**
 * Trigger emergency contact notification
 * Highest priority, sent immediately
 */
export async function triggerEmergencyNotification(
  pilgrimId: string,
  profile: AccessibilityProfile,
  emergencyType: string,
  location: string,
  instructions: string
): Promise<string> {
  const emergencyContact = profile.emergencyContact
    ? `Emergency Contact: ${profile.emergencyContact.name} - ${profile.emergencyContact.phone}`
    : 'Emergency Services: 911';

  const notification: NotificationCreateInput = {
    pilgrimId,
    type: 'emergency-contact',
    priority: 'urgent',
    title: `Emergency: ${emergencyType}`,
    message: `${instructions} Your current location: ${location}. ${emergencyContact}`,
    actionable: true,
    actionUrl: '/emergency',
    actionLabel: 'Get Help Now',
    emergencyContact,
  };

  const result = await sendNotification(notification);
  return result.notificationId;
}

/**
 * Trigger booking confirmation notification
 * Sent immediately after successful slot allocation
 */
export async function triggerBookingConfirmation(
  allocation: SlotAllocation,
  slotTime: Date,
  slotLocation: string
): Promise<string> {
  const pilgrimId = allocation.pilgrimId;
  const emergencyContact = allocation.accessibilityProfile.emergencyContact
    ? `Emergency Contact: ${allocation.accessibilityProfile.emergencyContact.name} - ${allocation.accessibilityProfile.emergencyContact.phone}`
    : undefined;

  const slotTimeStr = slotTime.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const notification: NotificationCreateInput = {
    pilgrimId,
    type: 'slot-reminder',
    priority: 'high',
    title: 'Priority Slot Confirmed',
    message: `Your priority darshan slot has been confirmed for ${slotTimeStr} at ${slotLocation}. Estimated wait time: ${allocation.estimatedWaitTime} minutes. You will receive reminders 30 and 10 minutes before your slot.`,
    actionable: true,
    actionUrl: `/booking/${allocation.allocationId}`,
    actionLabel: 'View Booking',
    emergencyContact,
  };

  const result = await sendNotification(notification);
  return result.notificationId;
}

/**
 * Batch trigger for multiple pilgrims entering assistance zone
 */
export async function triggerBatchAssistanceZoneNotifications(
  pilgrims: Array<{ id: string; profile: AccessibilityProfile }>,
  zoneName: string,
  zoneLocation: string
): Promise<string[]> {
  const notifications: NotificationCreateInput[] = pilgrims.map(({ id, profile }) => {
    const emergencyContact = profile.emergencyContact
      ? `Emergency Contact: ${profile.emergencyContact.name} - ${profile.emergencyContact.phone}`
      : undefined;

    return {
      pilgrimId: id,
      type: 'assistance-zone',
      priority: 'medium',
      title: 'Assistance Available',
      message: `You have entered ${zoneName}. Assistance services are available at ${zoneLocation}. Staff can help with navigation, accessibility needs, and general support.`,
      actionable: true,
      actionUrl: '/assistance/request',
      actionLabel: 'Request Assistance',
      emergencyContact,
    };
  });

  const results = await sendBulkNotifications(notifications);
  return results.map(r => r.notificationId);
}

/**
 * Check and trigger capacity alert for administrators
 * (This would typically go to admin dashboard/email)
 */
export async function triggerCapacityAlert(
  utilizationRate: number,
  category: string
): Promise<void> {
  console.warn(
    `⚠️ CAPACITY ALERT: ${category} priority slots at ${utilizationRate}% utilization`
  );
  
  // In production, this would:
  // - Send email to administrators
  // - Create admin dashboard notification
  // - Log to monitoring system
  // - Trigger SMS alerts if critical
}

/**
 * Trigger low utilization alert for administrators
 * Sent when utilization falls below 50% for 3 consecutive days
 */
export async function triggerLowUtilizationAlert(
  category: string,
  utilizationRate: number,
  consecutiveDays: number
): Promise<void> {
  console.warn(
    `📊 LOW UTILIZATION ALERT: ${category} at ${utilizationRate}% for ${consecutiveDays} days`
  );
  
  // In production, this would notify administrators to review allocation policies
}
