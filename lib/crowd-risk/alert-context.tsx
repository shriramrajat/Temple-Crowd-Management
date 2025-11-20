/**
 * Alert Context and Hooks
 * 
 * Provides React context and hooks for managing alert state in the UI.
 * Requirements: 2.1, 2.2
 * Task 12.1: Updated to use SSE for real-time alert updates
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  AlertEvent,
  AlertContextState,
  EmergencyMode,
  IndicatorState,
  EmergencyTrigger,
} from './types';
import { getAlertEngine } from './alert-engine';
import { getAdminNotifier } from './admin-notifier';
import { getEmergencyModeManager } from './emergency-mode-manager';
import { getEmergencyNotificationIntegration } from './emergency-notification-integration';
import { getVisualIndicatorController } from './visual-indicator-controller';
import { getErrorHandler } from './error-handler';

/**
 * Connection state for SSE
 * Task 12.1: Track SSE connection state
 */
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting';

/**
 * Alert context type
 * Task 12.1: Added connection state
 */
interface AlertContextType extends AlertContextState {
  acknowledgeAlert: (alertId: string, adminId: string) => Promise<void>;
  refreshAlerts: () => void;
  activateEmergency: (areaId: string, adminId?: string) => void;
  deactivateEmergency: (adminId: string) => void;
  connectionState: ConnectionState;
}

/**
 * Alert context
 */
const AlertContext = createContext<AlertContextType | undefined>(undefined);

/**
 * Alert provider props
 */
interface AlertProviderProps {
  children: React.ReactNode;
  adminId?: string;
}

/**
 * Alert Provider Component
 * 
 * Requirement 2.1: Create AlertContext for global alert state
 * Requirement 2.2: Real-time alert updates
 * Task 12.1: Updated to use SSE for real-time alert updates
 */
export function AlertProvider({ children, adminId }: AlertProviderProps) {
  const [activeAlerts, setActiveAlerts] = useState<AlertEvent[]>([]);
  const [emergencyMode, setEmergencyMode] = useState<EmergencyMode | null>(null);
  const [indicatorStates, setIndicatorStates] = useState<Map<string, IndicatorState>>(new Map());
  const [unacknowledgedCount, setUnacknowledgedCount] = useState(0);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  
  const alertEngine = getAlertEngine();
  const adminNotifier = getAdminNotifier();
  const emergencyManager = getEmergencyModeManager();
  const emergencyIntegration = getEmergencyNotificationIntegration();
  const visualIndicatorController = getVisualIndicatorController();
  const errorHandler = getErrorHandler();
  
  // SSE connection management
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxReconnectAttempts = 5;

  /**
   * Refresh active alerts from alert engine
   */
  const refreshAlerts = useCallback(() => {
    const alerts = alertEngine.getActiveAlerts();
    setActiveAlerts(alerts);
    
    // Update unacknowledged count
    const unacknowledged = alerts.filter(
      alert => !alertEngine.isAlertAcknowledged(alert.id)
    ).length;
    setUnacknowledgedCount(unacknowledged);
  }, [alertEngine]);

  /**
   * Acknowledge an alert
   * 
   * Requirement 2.1: Alert acknowledgment workflow
   */
  const acknowledgeAlert = useCallback(async (alertId: string, adminId: string) => {
    await alertEngine.acknowledgeAlert(alertId, adminId);
    refreshAlerts();
  }, [alertEngine, refreshAlerts]);

  /**
   * Activate emergency mode
   * 
   * Requirement 5.4: Manual activation by authorized admins
   */
  const activateEmergency = useCallback((areaId: string, adminId?: string) => {
    emergencyManager.activateEmergency(
      areaId,
      adminId ? EmergencyTrigger.MANUAL : EmergencyTrigger.AUTOMATIC,
      adminId
    );
  }, [emergencyManager]);

  /**
   * Deactivate emergency mode
   * 
   * Requirement 5.5: Deactivation by authorized admins
   */
  const deactivateEmergency = useCallback((adminId: string) => {
    emergencyManager.deactivateEmergency(adminId);
  }, [emergencyManager]);

  /**
   * Subscribe to emergency mode state changes
   * 
   * Requirement 5.1, 5.2, 5.3: Emergency mode integration
   * Task 8.1: Integrate with VisualIndicatorController to handle emergency mode blinking states
   */
  useEffect(() => {
    // Initialize emergency notification integration
    emergencyIntegration.initialize();
    
    // Register admin if provided
    if (adminId) {
      emergencyIntegration.registerAdmin(adminId);
    }
    
    // Subscribe to emergency state changes
    const unsubscribeEmergency = emergencyManager.onEmergencyStateChange((state) => {
      setEmergencyMode(state);
      
      // Update visual indicators for emergency mode
      // Requirement 4.1, 4.3: Red blinking indicators for emergency
      if (state && state.active) {
        // Set emergency mode for trigger area and affected areas
        visualIndicatorController.setEmergencyMode(state.triggerAreaId, true);
        state.affectedAreas.forEach(areaId => {
          visualIndicatorController.setEmergencyMode(areaId, true);
        });
      } else if (state === null) {
        // Emergency deactivated - clear emergency mode
        // Note: Indicators will return to their normal state based on current density
        const currentEmergencyState = emergencyManager.getEmergencyState();
        if (!currentEmergencyState) {
          // Clear all emergency indicators
          // The actual state will be restored by the next density evaluation
        }
      }
    });
    
    // Initial load of emergency state
    const initialState = emergencyManager.getEmergencyState();
    setEmergencyMode(initialState);
    
    // Set initial emergency indicators if emergency is active
    if (initialState && initialState.active) {
      visualIndicatorController.setEmergencyMode(initialState.triggerAreaId, true);
      initialState.affectedAreas.forEach(areaId => {
        visualIndicatorController.setEmergencyMode(areaId, true);
      });
    }
    
    // Cleanup
    return () => {
      unsubscribeEmergency();
    };
  }, [emergencyManager, emergencyIntegration, adminId, visualIndicatorController]);

  /**
   * Connect to SSE alert stream
   * Task 12.1: Implement SSE connection for alerts with automatic reconnection
   */
  const connectToSSE = useCallback(() => {
    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setConnectionState('connecting');
    
    try {
      const eventSource = new EventSource('/api/crowd-risk/alert-stream');
      eventSourceRef.current = eventSource;
      
      // Handle connection open
      eventSource.onopen = () => {
        setConnectionState('connected');
        reconnectAttemptsRef.current = 0;
      };
      
      // Handle messages
      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'alert' && message.data) {
            const alert = message.data as AlertEvent;
            
            // Send admin notification if adminId is provided
            if (adminId) {
              adminNotifier.sendAlert(alert, [adminId]).catch((error) => {
                console.error('Failed to send admin notification:', error);
              });
            }
            
            // Add to active alerts
            setActiveAlerts((prev: AlertEvent[]) => {
              const existingIds = new Set(prev.map((a: AlertEvent) => a.id));
              if (existingIds.has(alert.id)) return prev;
              
              // Add new alert and sort by severity and timestamp
              const updated = [...prev, alert];
              return updated.sort((a: AlertEvent, b: AlertEvent) => {
                const severityOrder: Record<string, number> = {
                  emergency: 0,
                  critical: 1,
                  warning: 2,
                  normal: 3,
                };
                
                const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
                if (severityDiff !== 0) {
                  return severityDiff;
                }
                
                return b.timestamp - a.timestamp;
              });
            });
            
            // Update unacknowledged count
            setUnacknowledgedCount((prev: number) => prev + 1);
          } else if (message.type === 'emergency' && message.data !== undefined) {
            // Update emergency mode state
            setEmergencyMode(message.data);
          }
        } catch (error) {
          errorHandler.handleSystemError(
            error instanceof Error ? error : new Error('Failed to parse SSE message'),
            'alert-sse-parse',
            { event: event.data }
          );
        }
      };
      
      // Handle errors
      eventSource.onerror = () => {
        setConnectionState('error');
        eventSource.close();
        eventSourceRef.current = null;
        
        // Attempt reconnection with exponential backoff
        reconnectWithBackoff();
      };
    } catch (error) {
      errorHandler.handleSystemError(
        error instanceof Error ? error : new Error('Failed to create SSE connection'),
        'alert-sse-connection',
        {}
      );
      setConnectionState('error');
      reconnectWithBackoff();
    }
  }, [adminId, adminNotifier, errorHandler]);
  
  /**
   * Reconnect with exponential backoff
   * Task 12.1: Implement automatic reconnection with exponential backoff (1s, 2s, 4s, 8s, max 30s)
   */
  const reconnectWithBackoff = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error('Max SSE reconnect attempts reached for alerts');
      setConnectionState('disconnected');
      return;
    }
    
    setConnectionState('reconnecting');
    
    // Calculate backoff time: 1s, 2s, 4s, 8s, max 30s
    const backoffTime = Math.min(
      1000 * Math.pow(2, reconnectAttemptsRef.current),
      30000
    );
    
    reconnectAttemptsRef.current++;
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connectToSSE();
    }, backoffTime);
  }, [connectToSSE]);
  
  /**
   * Disconnect SSE connection
   */
  const disconnectSSE = useCallback(() => {
    // Close SSE connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setConnectionState('disconnected');
    reconnectAttemptsRef.current = 0;
  }, []);
  
  /**
   * Subscribe to new alerts via SSE
   * 
   * Requirement 2.2: Real-time alert updates via SSE
   * Task 12.1: Connect to SSE alert stream on mount
   */
  useEffect(() => {
    // Connect to SSE
    connectToSSE();
    
    // Initial load of active alerts
    refreshAlerts();
    
    // Cleanup subscription
    return () => {
      disconnectSSE();
    };
  }, [connectToSSE, disconnectSSE, refreshAlerts]);

  /**
   * Subscribe to visual indicator updates
   * 
   * Task 8.1: Sync indicator states from VisualIndicatorController
   * Requirement 4.4: Real-time indicator state updates
   */
  useEffect(() => {
    const unsubscribeIndicator = visualIndicatorController.subscribeToUpdates((state) => {
      setIndicatorStates((prev: Map<string, IndicatorState>) => {
        const next = new Map(prev);
        next.set(state.areaId, state);
        return next;
      });
    });
    
    // Load initial indicator states
    const initialStates = visualIndicatorController.getAllIndicatorStates();
    setIndicatorStates(initialStates);
    
    return () => {
      unsubscribeIndicator();
    };
  }, [visualIndicatorController]);

  /**
   * Periodically refresh alerts to remove old ones
   */
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAlerts();
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      clearInterval(interval);
    };
  }, [refreshAlerts]);

  // Memoize context value to prevent unnecessary re-renders
  // Optimization: Only recreate value when dependencies change
  // Task 12.1: Added connectionState to context value
  const value: AlertContextType = React.useMemo(() => ({
    activeAlerts,
    emergencyMode,
    indicatorStates,
    unacknowledgedCount,
    acknowledgeAlert,
    refreshAlerts,
    activateEmergency,
    deactivateEmergency,
    connectionState,
  }), [
    activeAlerts,
    emergencyMode,
    indicatorStates,
    unacknowledgedCount,
    acknowledgeAlert,
    refreshAlerts,
    activateEmergency,
    deactivateEmergency,
    connectionState,
  ]);

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
}

/**
 * Hook to access alert context
 * 
 * Requirement 2.1: useAlerts hook for accessing alert state
 * 
 * @returns Alert context
 */
export function useAlerts(): AlertContextType {
  const context = useContext(AlertContext);
  
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  
  return context;
}

/**
 * Hook to get active alerts
 * 
 * Requirement 2.1: useActiveAlerts hook for accessing active alerts
 * 
 * @returns Active alerts
 */
export function useActiveAlerts(): AlertEvent[] {
  const { activeAlerts } = useAlerts();
  return activeAlerts;
}

/**
 * Hook to get alerts for a specific area
 * 
 * @param areaId - Area ID to filter by
 * @returns Alerts for the specified area
 */
export function useAreaAlerts(areaId: string): AlertEvent[] {
  const { activeAlerts } = useAlerts();
  // Memoize filtered alerts to avoid unnecessary recalculations
  return React.useMemo(() => {
    return activeAlerts.filter(alert => alert.areaId === areaId);
  }, [activeAlerts, areaId]);
}

/**
 * Hook to get unacknowledged alert count
 * 
 * @returns Number of unacknowledged alerts
 */
export function useUnacknowledgedCount(): number {
  const { unacknowledgedCount } = useAlerts();
  return unacknowledgedCount;
}

/**
 * Hook to get emergency mode state
 * 
 * @returns Emergency mode state
 */
export function useEmergencyMode(): EmergencyMode | null {
  const { emergencyMode } = useAlerts();
  return emergencyMode;
}

/**
 * Hook to get indicator states
 * 
 * @returns Map of indicator states by area ID
 */
export function useIndicatorStates(): Map<string, IndicatorState> {
  const { indicatorStates } = useAlerts();
  return indicatorStates;
}

/**
 * Hook to get indicator state for a specific area
 * 
 * @param areaId - Area ID
 * @returns Indicator state for the area
 */
export function useAreaIndicator(areaId: string): IndicatorState | undefined {
  const { indicatorStates } = useAlerts();
  return indicatorStates.get(areaId);
}

/**
 * Hook to acknowledge an alert
 * 
 * @returns Function to acknowledge an alert
 */
export function useAcknowledgeAlert(): (alertId: string, adminId: string) => Promise<void> {
  const { acknowledgeAlert } = useAlerts();
  return acknowledgeAlert;
}

/**
 * Hook to get alert history for an area
 * 
 * @param areaId - Area ID
 * @param limit - Maximum number of alerts to return
 * @returns Alert history
 */
export function useAlertHistory(areaId: string, limit: number = 50) {
  const [history, setHistory] = useState<AlertEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const alertEngine = getAlertEngine();

  useEffect(() => {
    let mounted = true;
    
    const loadHistory = async () => {
      try {
        setLoading(true);
        const alerts = await alertEngine.getAlertHistory(areaId, limit);
        
        if (mounted) {
          setHistory(alerts);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load alert history'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    loadHistory();
    
    return () => {
      mounted = false;
    };
  }, [areaId, limit, alertEngine]);

  return { history, loading, error };
}

/**
 * Hook to get alerts by severity
 * 
 * @param severity - Severity level to filter by
 * @returns Alerts with the specified severity
 */
export function useAlertsBySeverity(severity: string): AlertEvent[] {
  const { activeAlerts } = useAlerts();
  // Memoize filtered alerts to avoid unnecessary recalculations
  return React.useMemo(() => {
    return activeAlerts.filter(alert => alert.severity === severity);
  }, [activeAlerts, severity]);
}

/**
 * Hook to check if there are any emergency alerts
 * 
 * @returns True if there are emergency alerts
 */
export function useHasEmergencyAlerts(): boolean {
  const { activeAlerts } = useAlerts();
  // Memoize computation to avoid unnecessary recalculations
  return React.useMemo(() => {
    return activeAlerts.some(alert => alert.severity === 'emergency');
  }, [activeAlerts]);
}

/**
 * Hook to check if there are any critical or emergency alerts
 * 
 * @returns True if there are critical or emergency alerts
 */
export function useHasCriticalAlerts(): boolean {
  const { activeAlerts } = useAlerts();
  // Memoize computation to avoid unnecessary recalculations
  return React.useMemo(() => {
    return activeAlerts.some(
      alert => alert.severity === 'critical' || alert.severity === 'emergency'
    );
  }, [activeAlerts]);
}

/**
 * Hook to get the most recent alert
 * 
 * @returns Most recent alert or undefined
 */
export function useMostRecentAlert(): AlertEvent | undefined {
  const { activeAlerts } = useAlerts();
  // Memoize to avoid unnecessary re-renders when array reference changes but first item is same
  return React.useMemo(() => activeAlerts[0], [activeAlerts]);
}

/**
 * Hook to get alerts sorted by timestamp
 * 
 * @param ascending - Sort in ascending order (oldest first)
 * @returns Sorted alerts
 */
export function useSortedAlerts(ascending: boolean = false): AlertEvent[] {
  const { activeAlerts } = useAlerts();
  
  // Memoize sorted array to avoid unnecessary sorting on every render
  return React.useMemo(() => {
    return [...activeAlerts].sort((a, b) => {
      return ascending ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
    });
  }, [activeAlerts, ascending]);
}

/**
 * Hook to get alert connection state
 * Task 12.1: Access SSE connection state
 * 
 * @returns Current connection state
 */
export function useAlertConnectionState(): ConnectionState {
  const { connectionState } = useAlerts();
  return connectionState;
}
