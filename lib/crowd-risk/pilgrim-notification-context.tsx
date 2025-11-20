/**
 * Pilgrim Notification Context
 * 
 * Provides pilgrim notification state and functionality to components.
 * Requirements: 3.1, 3.3, 3.5
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PilgrimNotification, AlertEvent } from './types';
import { getPilgrimNotifier } from './pilgrim-notifier';
import { toast } from 'sonner';

interface PilgrimNotificationContextValue {
  notifications: PilgrimNotification[];
  unreadCount: number;
  addNotification: (notification: PilgrimNotification) => void;
  markAsRead: (alertId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  getNotificationHistory: (limit?: number) => PilgrimNotification[];
}

const PilgrimNotificationContext = createContext<PilgrimNotificationContextValue | undefined>(
  undefined
);

interface PilgrimNotificationProviderProps {
  children: React.ReactNode;
  pilgrimId?: string;
  currentAreaId?: string;
}

/**
 * Pilgrim Notification Provider
 * 
 * Requirement 3.1: Real-time notification delivery to pilgrims
 * Requirement 3.3: Notification display and history
 * Requirement 3.5: All-clear notifications
 */
export function PilgrimNotificationProvider({
  children,
  pilgrimId,
  currentAreaId,
}: PilgrimNotificationProviderProps) {
  const [notifications, setNotifications] = useState<PilgrimNotification[]>([]);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  
  const notifier = getPilgrimNotifier();
  
  // Calculate unread count
  const unreadCount = notifications.filter(n => !readNotifications.has(n.alertId)).length;
  
  // Add notification
  const addNotification = useCallback((notification: PilgrimNotification) => {
    setNotifications(prev => {
      // Check if notification already exists
      const exists = prev.some(n => n.alertId === notification.alertId);
      if (exists) {
        return prev;
      }
      
      // Add to beginning of array (most recent first)
      return [notification, ...prev];
    });
    
    // Show toast notification
    const isAllClear = notification.severity === 'normal';
    
    if (isAllClear) {
      toast.success(notification.message, {
        description: notification.suggestedActions[0],
        duration: 5000,
      });
    } else {
      const toastFn = notification.severity === 'emergency' || notification.severity === 'critical'
        ? toast.error
        : toast.warning;
      
      toastFn(notification.message, {
        description: notification.suggestedActions[0],
        duration: notification.severity === 'emergency' ? 10000 : 7000,
      });
    }
  }, []);
  
  // Mark notification as read
  const markAsRead = useCallback((alertId: string) => {
    setReadNotifications(prev => new Set(prev).add(alertId));
  }, []);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    const allAlertIds = notifications.map(n => n.alertId);
    setReadNotifications(new Set(allAlertIds));
  }, [notifications]);
  
  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setReadNotifications(new Set());
  }, []);
  
  // Get notification history
  const getNotificationHistory = useCallback((limit?: number) => {
    if (limit) {
      return notifications.slice(0, limit);
    }
    return notifications;
  }, [notifications]);
  
  // Register pilgrim in current area
  useEffect(() => {
    if (pilgrimId && currentAreaId) {
      notifier.registerPilgrimInArea(pilgrimId, currentAreaId);
      
      return () => {
        notifier.unregisterPilgrimFromArea(pilgrimId, currentAreaId);
      };
    }
  }, [pilgrimId, currentAreaId, notifier]);
  
  // Load notification history on mount
  useEffect(() => {
    const history = notifier.getNotificationHistory(50);
    setNotifications(history);
  }, [notifier]);
  
  const value: PilgrimNotificationContextValue = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    getNotificationHistory,
  };
  
  return (
    <PilgrimNotificationContext.Provider value={value}>
      {children}
    </PilgrimNotificationContext.Provider>
  );
}

/**
 * Hook to use pilgrim notification context
 */
export function usePilgrimNotifications() {
  const context = useContext(PilgrimNotificationContext);
  
  if (context === undefined) {
    throw new Error(
      'usePilgrimNotifications must be used within a PilgrimNotificationProvider'
    );
  }
  
  return context;
}
