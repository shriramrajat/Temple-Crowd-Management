'use client';

/**
 * Notification Toast Component
 * 
 * Provides accessibility-friendly toast notifications using Sonner library
 * with different variants for notification types and persistent urgent notifications.
 */

import { toast } from 'sonner';
import type { AccessibilityNotification, NotificationType } from '@/lib/types/notifications';
import { 
  Bell, 
  Info, 
  AlertTriangle,
  Phone,
  MapPin,
  Calendar,
  Navigation,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * Get icon for notification type
 */
function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'assistance-zone':
      return MapPin;
    case 'slot-reminder':
      return Calendar;
    case 'staff-dispatch':
      return Bell;
    case 'emergency-contact':
      return Phone;
    case 'condition-change':
      return AlertTriangle;
    case 'route-update':
      return Navigation;
    default:
      return Info;
  }
}

/**
 * Toast notification options based on priority
 */
function getToastOptions(priority: AccessibilityNotification['priority']) {
  switch (priority) {
    case 'urgent':
      return {
        duration: Infinity, // Persistent for urgent notifications
      };
    case 'high':
      return {
        duration: 10000, // 10 seconds
      };
    case 'medium':
      return {
        duration: 7000, // 7 seconds
      };
    case 'low':
      return {
        duration: 5000, // 5 seconds
      };
  }
}

/**
 * Show assistance zone notification toast
 */
export function showAssistanceZoneToast(
  zoneName: string,
  actionUrl?: string
): string | number {
  const Icon = MapPin;
  
  return toast.info(
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">Assistance Available</p>
        <p className="text-sm text-gray-600 mt-1">
          You've entered {zoneName}. Help is available nearby.
        </p>
        {actionUrl && (
          <Button asChild size="sm" variant="link" className="h-auto p-0 mt-2">
            <Link href={actionUrl}>Request Assistance →</Link>
          </Button>
        )}
      </div>
    </div>,
    {
      duration: 7000,
    }
  );
}

/**
 * Show slot reminder notification toast
 */
export function showSlotReminderToast(
  timeRemaining: string,
  slotTime: string,
  location: string,
  priority: 'high' | 'urgent',
  actionUrl?: string
): string | number {
  const Icon = Calendar;
  const options = getToastOptions(priority);
  
  return toast(
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">Priority Slot Reminder</p>
        <p className="text-sm text-gray-600 mt-1">
          Your slot is in {timeRemaining} at {slotTime}
        </p>
        <p className="text-xs text-gray-500 mt-1">Location: {location}</p>
        {actionUrl && (
          <Button asChild size="sm" variant="link" className="h-auto p-0 mt-2">
            <Link href={actionUrl}>View Details →</Link>
          </Button>
        )}
      </div>
    </div>,
    options
  );
}

/**
 * Show staff dispatch notification toast
 */
export function showStaffDispatchToast(
  location: string,
  estimatedArrival: number,
  actionUrl?: string
): string | number {
  const Icon = Bell;
  
  return toast.success(
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">Staff Dispatched</p>
        <p className="text-sm text-gray-600 mt-1">
          Help is on the way to {location}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Estimated arrival: {estimatedArrival} minutes
        </p>
        {actionUrl && (
          <Button asChild size="sm" variant="link" className="h-auto p-0 mt-2">
            <Link href={actionUrl}>Track Staff →</Link>
          </Button>
        )}
      </div>
    </div>,
    {
      duration: 10000,
    }
  );
}

/**
 * Show emergency notification toast
 */
export function showEmergencyToast(
  emergencyType: string,
  instructions: string,
  emergencyContact: string,
  actionUrl?: string
): string | number {
  const Icon = Phone;
  
  return toast.error(
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">Emergency: {emergencyType}</p>
        <p className="text-sm text-gray-600 mt-1">{instructions}</p>
        <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
          <p className="text-xs font-medium text-red-900">{emergencyContact}</p>
        </div>
        {actionUrl && (
          <Button asChild size="sm" variant="destructive" className="h-7 mt-2">
            <Link href={actionUrl}>Get Help Now</Link>
          </Button>
        )}
      </div>
    </div>,
    {
      duration: Infinity,
    }
  );
}

/**
 * Show condition change alert toast
 */
export function showConditionChangeToast(
  conditionType: string,
  description: string,
  affectedArea: string,
  severity: 'low' | 'medium' | 'high',
  actionUrl?: string
): string | number {
  const Icon = AlertTriangle;
  const options = getToastOptions(severity === 'high' ? 'high' : 'medium');
  
  return toast.warning(
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{conditionType} Alert</p>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        <p className="text-xs text-gray-500 mt-1">Area: {affectedArea}</p>
        {actionUrl && (
          <Button asChild size="sm" variant="link" className="h-auto p-0 mt-2">
            <Link href={actionUrl}>View Updated Routes →</Link>
          </Button>
        )}
      </div>
    </div>,
    options
  );
}

/**
 * Show route update notification toast
 */
export function showRouteUpdateToast(
  reason: string,
  actionUrl?: string
): string | number {
  const Icon = Navigation;
  
  return toast.info(
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">Route Updated</p>
        <p className="text-sm text-gray-600 mt-1">{reason}</p>
        {actionUrl && (
          <Button asChild size="sm" variant="link" className="h-auto p-0 mt-2">
            <Link href={actionUrl}>View New Route →</Link>
          </Button>
        )}
      </div>
    </div>,
    {
      duration: 7000,
    }
  );
}

/**
 * Show booking confirmation toast
 */
export function showBookingConfirmationToast(
  slotTime: string,
  location: string,
  actionUrl?: string
): string | number {
  const Icon = Calendar;
  
  return toast.success(
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">Booking Confirmed!</p>
        <p className="text-sm text-gray-600 mt-1">
          Your priority slot at {slotTime}
        </p>
        <p className="text-xs text-gray-500 mt-1">Location: {location}</p>
        {actionUrl && (
          <Button asChild size="sm" variant="link" className="h-auto p-0 mt-2">
            <Link href={actionUrl}>View Booking →</Link>
          </Button>
        )}
      </div>
    </div>,
    {
      duration: 8000,
      closeButton: true,
    }
  );
}

/**
 * Generic notification toast from AccessibilityNotification object
 */
export function showNotificationToast(notification: AccessibilityNotification): string | number {
  const Icon = getNotificationIcon(notification.type);
  const options = getToastOptions(notification.priority);
  
  const toastContent = (
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{notification.title}</p>
        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
        {notification.emergencyContact && (
          <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
            <p className="text-xs font-medium text-red-900">
              {notification.emergencyContact}
            </p>
          </div>
        )}
        {notification.actionable && notification.actionUrl && (
          <Button asChild size="sm" variant="link" className="h-auto p-0 mt-2">
            <Link href={notification.actionUrl}>
              {notification.actionLabel || 'View Details'} →
            </Link>
          </Button>
        )}
      </div>
    </div>
  );

  // Choose toast type based on priority
  const toastFn = notification.priority === 'urgent' || notification.priority === 'high'
    ? toast.error
    : notification.priority === 'medium'
    ? toast.warning
    : toast.info;

  return toastFn(toastContent, options);
}

/**
 * Dismiss a toast notification
 */
export function dismissToast(toastId: string | number): void {
  toast.dismiss(toastId);
}

/**
 * Dismiss all toast notifications
 */
export function dismissAllToasts(): void {
  toast.dismiss();
}
