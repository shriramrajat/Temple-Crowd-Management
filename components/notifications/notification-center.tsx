'use client';

/**
 * Notification Center Component
 * 
 * Displays accessibility notifications with priority-based sorting,
 * actionable buttons, emergency contact access, and read/unread status.
 */

import { useState, useEffect } from 'react';
import { 
  getNotifications, 
  getUnreadNotifications,
  markAsRead,
  deleteNotification,
  clearNotifications,
} from '@/lib/services/notification-service';
import type { AccessibilityNotification } from '@/lib/types/notifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  BellOff, 
  Check, 
  X, 
  ExternalLink, 
  Phone,
  AlertCircle,
  Info,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface NotificationCenterProps {
  pilgrimId: string;
  className?: string;
}

/**
 * Get icon for notification priority
 */
function getPriorityIcon(priority: AccessibilityNotification['priority']) {
  switch (priority) {
    case 'urgent':
      return AlertCircle;
    case 'high':
      return AlertTriangle;
    case 'medium':
      return Info;
    case 'low':
      return Bell;
  }
}

/**
 * Get color classes for notification priority
 */
function getPriorityColors(priority: AccessibilityNotification['priority']) {
  switch (priority) {
    case 'urgent':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-900',
        badge: 'bg-red-100 text-red-800 border-red-300',
      };
    case 'high':
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-900',
        badge: 'bg-orange-100 text-orange-800 border-orange-300',
      };
    case 'medium':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-900',
        badge: 'bg-blue-100 text-blue-800 border-blue-300',
      };
    case 'low':
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-900',
        badge: 'bg-gray-100 text-gray-800 border-gray-300',
      };
  }
}

/**
 * Format relative time
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

/**
 * Single notification item component
 */
function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: AccessibilityNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const PriorityIcon = getPriorityIcon(notification.priority);
  const colors = getPriorityColors(notification.priority);
  const isUnread = !notification.readAt;

  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-colors',
        colors.bg,
        colors.border,
        isUnread && 'border-l-4'
      )}
      role="article"
      aria-label={`Notification: ${notification.title}`}
    >
      <div className="flex items-start gap-3">
        <div className={cn('mt-0.5', colors.text)}>
          <PriorityIcon className="w-5 h-5" aria-hidden="true" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={cn('font-semibold text-sm', colors.text)}>
              {notification.title}
            </h3>
            <div className="flex items-center gap-1">
              {isUnread && (
                <Badge 
                  variant="outline" 
                  className="bg-blue-100 text-blue-800 border-blue-300 text-xs"
                  aria-label="Unread notification"
                >
                  New
                </Badge>
              )}
              <Badge 
                variant="outline" 
                className={cn('text-xs', colors.badge)}
              >
                {notification.priority}
              </Badge>
            </div>
          </div>
          
          <p className="text-sm text-gray-700 mb-2">
            {notification.message}
          </p>
          
          {notification.emergencyContact && (
            <div className="flex items-center gap-2 mb-2 p-2 bg-white rounded border border-gray-200">
              <Phone className="w-4 h-4 text-red-600" aria-hidden="true" />
              <span className="text-xs text-gray-700">
                {notification.emergencyContact}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between gap-2 mt-3">
            <span className="text-xs text-gray-500">
              {formatRelativeTime(notification.sentAt)}
            </span>
            
            <div className="flex items-center gap-2">
              {notification.actionable && notification.actionUrl && (
                <Button
                  asChild
                  size="sm"
                  variant="default"
                  className="h-7 text-xs"
                >
                  <Link href={notification.actionUrl}>
                    {notification.actionLabel}
                    <ExternalLink className="w-3 h-3 ml-1" aria-hidden="true" />
                  </Link>
                </Button>
              )}
              
              {isUnread && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => onMarkAsRead(notification.id)}
                  aria-label="Mark as read"
                >
                  <Check className="w-3 h-3 mr-1" aria-hidden="true" />
                  Mark Read
                </Button>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-gray-500 hover:text-red-600"
                onClick={() => onDelete(notification.id)}
                aria-label="Delete notification"
              >
                <Trash2 className="w-3 h-3" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Notification Center Component
 */
export function NotificationCenter({ pilgrimId, className }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<AccessibilityNotification[]>([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load notifications
  useEffect(() => {
    loadNotifications();
  }, [pilgrimId, showUnreadOnly]);

  const loadNotifications = () => {
    setIsLoading(true);
    try {
      const allNotifications = showUnreadOnly 
        ? getUnreadNotifications(pilgrimId)
        : getNotifications(pilgrimId);
      
      // Sort by priority and date
      const sorted = allNotifications.sort((a, b) => {
        // Priority order: urgent > high > medium > low
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by date (newest first)
        return b.sentAt.getTime() - a.sentAt.getTime();
      });
      
      setNotifications(sorted);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    const success = markAsRead(notificationId);
    if (success) {
      loadNotifications();
    }
  };

  const handleDelete = (notificationId: string) => {
    const success = deleteNotification(notificationId);
    if (success) {
      loadNotifications();
    }
  };

  const handleClearAll = () => {
    const success = clearNotifications(pilgrimId);
    if (success) {
      loadNotifications();
    }
  };

  const unreadCount = getUnreadNotifications(pilgrimId).length;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" aria-hidden="true" />
              Notifications
              {unreadCount > 0 && (
                <Badge 
                  variant="default" 
                  className="bg-blue-600 text-white"
                  aria-label={`${unreadCount} unread notifications`}
                >
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Stay updated on assistance, slots, and route changes
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={showUnreadOnly ? 'default' : 'outline'}
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              aria-label={showUnreadOnly ? 'Show all notifications' : 'Show unread only'}
            >
              {showUnreadOnly ? (
                <>
                  <BellOff className="w-4 h-4 mr-1" aria-hidden="true" />
                  Unread
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-1" aria-hidden="true" />
                  All
                </>
              )}
            </Button>
            
            {notifications.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearAll}
                aria-label="Clear all notifications"
              >
                <X className="w-4 h-4 mr-1" aria-hidden="true" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">Loading notifications...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BellOff className="w-12 h-12 text-gray-300 mb-3" aria-hidden="true" />
            <p className="text-sm font-medium text-gray-900">
              {showUnreadOnly ? 'No unread notifications' : 'No notifications'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {showUnreadOnly 
                ? 'All caught up! Check back later for updates.'
                : 'You\'ll receive notifications about assistance, slots, and routes here.'}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3" role="feed" aria-label="Notification list">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                  />
                  {index < notifications.length - 1 && (
                    <Separator className="my-3" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
