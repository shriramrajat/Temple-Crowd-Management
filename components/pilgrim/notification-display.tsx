/**
 * Pilgrim Notification Display Component
 * 
 * Displays crowd safety notifications to pilgrims.
 * Requirements: 3.3, 3.5
 */

'use client';

import { useEffect, useState } from 'react';
import { Bell, AlertTriangle, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PilgrimNotification, ThresholdLevel } from '@/lib/crowd-risk/types';

interface NotificationDisplayProps {
  notification: PilgrimNotification;
  onDismiss?: () => void;
  showDismiss?: boolean;
}

/**
 * Get severity color classes
 */
function getSeverityColors(severity: ThresholdLevel) {
  switch (severity) {
    case ThresholdLevel.EMERGENCY:
      return {
        bg: 'bg-red-50',
        border: 'border-red-500',
        text: 'text-red-900',
        icon: 'text-red-600',
        badge: 'bg-red-100 text-red-800',
      };
    case ThresholdLevel.CRITICAL:
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-500',
        text: 'text-orange-900',
        icon: 'text-orange-600',
        badge: 'bg-orange-100 text-orange-800',
      };
    case ThresholdLevel.WARNING:
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-500',
        text: 'text-yellow-900',
        icon: 'text-yellow-600',
        badge: 'bg-yellow-100 text-yellow-800',
      };
    case ThresholdLevel.NORMAL:
      return {
        bg: 'bg-green-50',
        border: 'border-green-500',
        text: 'text-green-900',
        icon: 'text-green-600',
        badge: 'bg-green-100 text-green-800',
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-500',
        text: 'text-gray-900',
        icon: 'text-gray-600',
        badge: 'bg-gray-100 text-gray-800',
      };
  }
}

/**
 * Get severity icon
 */
function getSeverityIcon(severity: ThresholdLevel) {
  switch (severity) {
    case ThresholdLevel.EMERGENCY:
    case ThresholdLevel.CRITICAL:
      return AlertTriangle;
    case ThresholdLevel.WARNING:
      return AlertCircle;
    case ThresholdLevel.NORMAL:
      return CheckCircle;
    default:
      return Bell;
  }
}

/**
 * Format timestamp to relative time
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (seconds < 60) {
    return 'Just now';
  } else if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else {
    return new Date(timestamp).toLocaleDateString();
  }
}

/**
 * Notification Display Component
 * 
 * Requirement 3.3: Display notifications in pilgrim app
 * Requirement 3.5: Show all-clear notifications
 */
export function NotificationDisplay({
  notification,
  onDismiss,
  showDismiss = true,
}: NotificationDisplayProps) {
  const colors = getSeverityColors(notification.severity);
  const Icon = getSeverityIcon(notification.severity);
  const [relativeTime, setRelativeTime] = useState(formatRelativeTime(notification.timestamp));
  
  // Update relative time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeTime(formatRelativeTime(notification.timestamp));
    }, 60000);
    
    return () => clearInterval(interval);
  }, [notification.timestamp]);
  
  return (
    <Card className={`p-4 ${colors.bg} border-2 ${colors.border} relative`}>
      {/* Dismiss button */}
      {showDismiss && onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Icon className={`w-6 h-6 ${colors.icon} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={colors.badge}>
              {notification.severity.toUpperCase()}
            </Badge>
            <span className="text-xs text-muted-foreground">{relativeTime}</span>
          </div>
          <p className={`font-medium ${colors.text}`}>{notification.message}</p>
        </div>
      </div>
      
      {/* Suggested Actions */}
      {notification.suggestedActions && notification.suggestedActions.length > 0 && (
        <div className="ml-9 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Suggested Actions:</p>
          <ul className="space-y-1">
            {notification.suggestedActions.map((action, index) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Alternative Routes */}
      {notification.alternativeRoutes && notification.alternativeRoutes.length > 0 && (
        <div className="ml-9 mt-3 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Alternative Routes:</p>
          <div className="flex flex-wrap gap-2">
            {notification.alternativeRoutes.map((route, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {route}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
