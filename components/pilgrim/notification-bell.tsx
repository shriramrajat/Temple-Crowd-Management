/**
 * Pilgrim Notification Bell Component
 * 
 * Displays notification bell with unread count and dropdown.
 * Requirements: 3.3
 */

'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePilgrimNotifications } from '@/lib/crowd-risk/pilgrim-notification-context';
import { NotificationDisplay } from './notification-display';

interface NotificationBellProps {
  maxNotifications?: number;
}

/**
 * Notification Bell Component
 * 
 * Requirement 3.3: Display notifications in pilgrim app
 */
export function NotificationBell({ maxNotifications = 5 }: NotificationBellProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = usePilgrimNotifications();
  
  const recentNotifications = notifications.slice(0, maxNotifications);
  
  const handleNotificationClick = (alertId: string) => {
    markAsRead(alertId);
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        {/* Notifications List */}
        {recentNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="p-2 space-y-2">
              {recentNotifications.map(notification => (
                <div
                  key={notification.alertId}
                  onClick={() => handleNotificationClick(notification.alertId)}
                  className="cursor-pointer"
                >
                  <NotificationDisplay
                    notification={notification}
                    showDismiss={false}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        {/* Footer */}
        {notifications.length > maxNotifications && (
          <div className="p-2 border-t">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              View all notifications ({notifications.length})
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
