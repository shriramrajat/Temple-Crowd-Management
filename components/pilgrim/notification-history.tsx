/**
 * Pilgrim Notification History Component
 * 
 * Displays history of crowd safety notifications.
 * Requirements: 3.3
 */

'use client';

import { useState, useMemo } from 'react';
import { Bell, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PilgrimNotification, ThresholdLevel } from '@/lib/crowd-risk/types';
import { NotificationDisplay } from './notification-display';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationHistoryProps {
  notifications: PilgrimNotification[];
  maxHeight?: string;
}

/**
 * Notification History Component
 * 
 * Requirement 3.3: Add notification history view
 */
export function NotificationHistory({
  notifications,
  maxHeight = '600px',
}: NotificationHistoryProps) {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  
  // Filter notifications by severity
  const filteredNotifications = useMemo(() => {
    if (severityFilter === 'all') {
      return notifications;
    }
    return notifications.filter(n => n.severity === severityFilter);
  }, [notifications, severityFilter]);
  
  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, PilgrimNotification[]> = {};
    
    filteredNotifications.forEach(notification => {
      const date = new Date(notification.timestamp);
      const dateKey = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(notification);
    });
    
    return groups;
  }, [filteredNotifications]);
  
  const dateKeys = Object.keys(groupedNotifications).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB.getTime() - dateA.getTime();
  });
  
  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Notification History</h3>
          <Badge variant="secondary">{filteredNotifications.length}</Badge>
        </div>
        
        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value={ThresholdLevel.EMERGENCY}>Emergency</SelectItem>
              <SelectItem value={ThresholdLevel.CRITICAL}>Critical</SelectItem>
              <SelectItem value={ThresholdLevel.WARNING}>Warning</SelectItem>
              <SelectItem value={ThresholdLevel.NORMAL}>Normal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No notifications to display</p>
          {severityFilter !== 'all' && (
            <Button
              variant="link"
              onClick={() => setSeverityFilter('all')}
              className="mt-2"
            >
              Clear filter
            </Button>
          )}
        </div>
      ) : (
        <ScrollArea style={{ maxHeight }}>
          <div className="space-y-6">
            {dateKeys.map(dateKey => (
              <div key={dateKey}>
                {/* Date Header */}
                <div className="sticky top-0 bg-background py-2 mb-3">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    {dateKey}
                  </h4>
                </div>
                
                {/* Notifications for this date */}
                <div className="space-y-3">
                  {groupedNotifications[dateKey].map(notification => (
                    <NotificationDisplay
                      key={notification.alertId}
                      notification={notification}
                      showDismiss={false}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}
