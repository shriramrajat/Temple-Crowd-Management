/**
 * Command Center Data Hook
 * 
 * Custom React hook for managing real-time command center data.
 * Handles initial data fetching, WebSocket connections, and state management.
 */

'use client';

import { useState, useEffect, useCallback, useRef, startTransition } from 'react';
import {
  Zone,
  Alert,
  HighDensityWarning,
  FootfallDataPoint,
  ConnectionStatus,
  TimeRange,
  ZoneUpdate,
} from '@/lib/types/command-center';
import {
  fetchInitialData,
  ApiError,
} from '@/lib/api/command-center-client';
import { WebSocketMessageSchema } from '@/lib/schemas/command-center';
import { throttle, batchUpdates } from '@/lib/utils/throttle';
import { createSSEClient } from '@/lib/utils/sse-client';

/**
 * Hook options
 */
export interface UseCommandCenterDataOptions {
  zoneId?: string;
  timeRange?: TimeRange;
  autoConnect?: boolean;
}

/**
 * Hook return type
 */
export interface UseCommandCenterDataReturn {
  zones: Zone[];
  alerts: Alert[];
  warnings: HighDensityWarning[];
  footfallData: FootfallDataPoint[];
  connectionStatus: ConnectionStatus;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for command center real-time data management
 */
export function useCommandCenterData(
  options: UseCommandCenterDataOptions = {}
): UseCommandCenterDataReturn {
  const {
    zoneId,
    timeRange = 'hourly',
    autoConnect = true,
  } = options;

  // State management
  const [zones, setZones] = useState<Zone[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [warnings, setWarnings] = useState<HighDensityWarning[]>([]);
  const [footfallData, setFootfallData] = useState<FootfallDataPoint[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Refs for SSE connection and reconnection logic
  const sseClientRef = useRef<ReturnType<typeof createSSEClient> | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  const baseReconnectDelay = 1000; // 1 second
  
  // Refs for batching updates
  const pendingZoneUpdatesRef = useRef<Map<string, ZoneUpdate>>(new Map());
  const pendingAlertsRef = useRef<Alert[]>([]);
  const pendingWarningsRef = useRef<HighDensityWarning[]>([]);
  const pendingFootfallRef = useRef<FootfallDataPoint[]>([]);

  /**
   * Fetch initial data from REST API
   */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchInitialData(timeRange);
      
      setZones(data.zones);
      setAlerts(data.alerts);
      setFootfallData(data.footfallData);
      
      // Extract active warnings from zones
      const activeWarnings: HighDensityWarning[] = data.zones
        .filter(zone => zone.densityLevel === 'critical')
        .map(zone => ({
          id: `warning-${zone.id}-${Date.now()}`,
          zoneId: zone.id,
          zoneName: zone.name,
          currentDensity: zone.currentOccupancy / zone.maxCapacity,
          threshold: zone.densityThreshold,
          timestamp: zone.lastUpdated,
          status: 'active' as const,
        }));
      
      setWarnings(activeWarnings);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to fetch initial data';
      
      setError(new Error(errorMessage));
      setIsLoading(false);
    }
  }, [timeRange]);

  /**
   * Refetch data manually
   */
  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  /**
   * Calculate exponential backoff delay for reconnection
   */
  const getReconnectDelay = useCallback(() => {
    const delay = Math.min(
      baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current),
      30000 // Max 30 seconds
    );
    return delay;
  }, []);

  /**
   * Apply batched zone updates
   */
  const applyZoneUpdates = useCallback(() => {
    if (pendingZoneUpdatesRef.current.size === 0) return;

    const updates = Array.from(pendingZoneUpdatesRef.current.values());
    pendingZoneUpdatesRef.current.clear();

    // Use startTransition for non-urgent updates
    startTransition(() => {
      setZones(prevZones => {
        return prevZones.map(zone => {
          const update = updates.find(u => u.zoneId === zone.id);
          if (update) {
            return {
              ...zone,
              currentOccupancy: update.occupancy,
              densityLevel: update.densityLevel,
              lastUpdated: new Date(update.timestamp),
            };
          }
          return zone;
        });
      });

      // Update warnings based on zone updates
      setWarnings(prevWarnings => {
        let newWarnings = [...prevWarnings];

        updates.forEach(update => {
          const zone = zones.find(z => z.id === update.zoneId);
          if (!zone) return;

          const existingWarning = newWarnings.find(w => w.zoneId === update.zoneId);

          if (update.densityLevel === 'critical') {
            // Add or update warning
            const newWarning: HighDensityWarning = {
              id: existingWarning?.id || `warning-${update.zoneId}-${Date.now()}`,
              zoneId: update.zoneId,
              zoneName: zone.name,
              currentDensity: update.occupancy / zone.maxCapacity,
              threshold: zone.densityThreshold,
              timestamp: new Date(update.timestamp),
              status: 'active',
            };

            if (existingWarning) {
              newWarnings = newWarnings.map(w => w.id === existingWarning.id ? newWarning : w);
            } else {
              newWarnings = [...newWarnings, newWarning];
            }
          } else if (existingWarning) {
            // Remove warning if density is no longer critical
            newWarnings = newWarnings.filter(w => w.zoneId !== update.zoneId);
          }
        });

        return newWarnings;
      });
    });
  }, [zones]);

  /**
   * Throttled zone update handler - max 1 update per second
   */
  const throttledApplyZoneUpdates = useRef(
    throttle(() => {
      batchUpdates(() => {
        applyZoneUpdates();
      });
    }, 1000) // 1 second throttle
  ).current;

  /**
   * Handle zone update messages - batch and throttle
   */
  const handleZoneUpdate = useCallback((update: ZoneUpdate) => {
    // Add to pending updates map (overwrites previous update for same zone)
    pendingZoneUpdatesRef.current.set(update.zoneId, update);
    
    // Trigger throttled batch update
    throttledApplyZoneUpdates();
  }, [throttledApplyZoneUpdates]);

  /**
   * Apply batched alert updates
   */
  const applyAlertUpdates = useCallback(() => {
    if (pendingAlertsRef.current.length === 0) return;

    const newAlerts = [...pendingAlertsRef.current];
    pendingAlertsRef.current = [];

    // Use startTransition for non-urgent updates
    startTransition(() => {
      setAlerts(prevAlerts => {
        // Prepend new alerts and maintain max 50 items
        const alertsWithDates = newAlerts.map(alert => ({
          ...alert,
          timestamp: new Date(alert.timestamp),
        }));
        return [...alertsWithDates, ...prevAlerts].slice(0, 50);
      });
    });
  }, []);

  /**
   * Throttled alert update handler - max 1 update per second
   */
  const throttledApplyAlertUpdates = useRef(
    throttle(() => {
      batchUpdates(() => {
        applyAlertUpdates();
      });
    }, 1000) // 1 second throttle
  ).current;

  /**
   * Handle alert messages - batch and throttle
   */
  const handleAlert = useCallback((alert: Alert) => {
    // Add to pending alerts
    pendingAlertsRef.current.push(alert);
    
    // Trigger throttled batch update
    throttledApplyAlertUpdates();
  }, [throttledApplyAlertUpdates]);

  /**
   * Apply batched warning updates
   */
  const applyWarningUpdates = useCallback(() => {
    if (pendingWarningsRef.current.length === 0) return;

    const newWarnings = [...pendingWarningsRef.current];
    pendingWarningsRef.current = [];

    // Use startTransition for non-urgent updates
    startTransition(() => {
      setWarnings(prevWarnings => {
        let updatedWarnings = [...prevWarnings];

        newWarnings.forEach(warning => {
          const warningWithDate = {
            ...warning,
            timestamp: new Date(warning.timestamp),
          };

          const existingIndex = updatedWarnings.findIndex(w => w.id === warning.id);

          if (warning.status === 'resolved') {
            // Remove resolved warning
            updatedWarnings = updatedWarnings.filter(w => w.id !== warning.id);
          } else if (existingIndex >= 0) {
            // Update existing warning
            updatedWarnings = updatedWarnings.map((w, i) => 
              i === existingIndex ? warningWithDate : w
            );
          } else {
            // Add new warning
            updatedWarnings = [...updatedWarnings, warningWithDate];
          }
        });

        return updatedWarnings;
      });
    });
  }, []);

  /**
   * Throttled warning update handler - max 1 update per second
   */
  const throttledApplyWarningUpdates = useRef(
    throttle(() => {
      batchUpdates(() => {
        applyWarningUpdates();
      });
    }, 1000) // 1 second throttle
  ).current;

  /**
   * Handle warning messages - batch and throttle
   */
  const handleWarning = useCallback((warning: HighDensityWarning) => {
    // Add to pending warnings
    pendingWarningsRef.current.push(warning);
    
    // Trigger throttled batch update
    throttledApplyWarningUpdates();
  }, [throttledApplyWarningUpdates]);

  /**
   * Apply batched footfall updates
   */
  const applyFootfallUpdates = useCallback(() => {
    if (pendingFootfallRef.current.length === 0) return;

    const newDataPoints = [...pendingFootfallRef.current];
    pendingFootfallRef.current = [];

    // Use startTransition for non-urgent updates
    startTransition(() => {
      setFootfallData(prevData => {
        const dataPointsWithDates = newDataPoints
          .filter(dp => !zoneId || dp.zoneId === zoneId)
          .map(dp => ({
            ...dp,
            timestamp: new Date(dp.timestamp),
          }));

        return [...prevData, ...dataPointsWithDates];
      });
    });
  }, [zoneId]);

  /**
   * Throttled footfall update handler - max 1 update per second
   */
  const throttledApplyFootfallUpdates = useRef(
    throttle(() => {
      batchUpdates(() => {
        applyFootfallUpdates();
      });
    }, 1000) // 1 second throttle
  ).current;

  /**
   * Handle footfall data updates - batch and throttle
   */
  const handleFootfallUpdate = useCallback((dataPoint: FootfallDataPoint) => {
    // Add to pending footfall data
    pendingFootfallRef.current.push(dataPoint);
    
    // Trigger throttled batch update
    throttledApplyFootfallUpdates();
  }, [throttledApplyFootfallUpdates]);

  /**
   * Process incoming SSE/WebSocket messages
   */
  const handleRealtimeMessage = useCallback((rawData: any) => {
    try {
      // Validate message format
      const message = WebSocketMessageSchema.parse(rawData);

      // Route message to appropriate handler
      switch (message.type) {
        case 'zone_update':
          handleZoneUpdate(message.payload);
          break;
        
        case 'alert':
          handleAlert(message.payload);
          break;
        
        case 'warning':
          handleWarning(message.payload);
          break;
        
        case 'footfall':
          handleFootfallUpdate(message.payload);
          break;
        
        case 'connection_status':
          setConnectionStatus(message.payload.status);
          break;
        
        default:
          console.warn('[Realtime] Unknown message type:', message);
      }
    } catch (err) {
      console.error('[Realtime] Failed to process message:', err);
      // Don't set error state for individual message failures
      // Just log and continue processing other messages
    }
  }, [handleZoneUpdate, handleAlert, handleWarning, handleFootfallUpdate]);

  /**
   * Connect to SSE/WebSocket server
   */
  const connectRealtime = useCallback(async () => {
    // Don't connect if already connected
    if (sseClientRef.current?.isConnected()) {
      return;
    }

    try {
      // Get SSE URL
      const sseUrl = `${window.location.origin}/api/admin/ws`;
      
      // Fetch authentication token from session API
      let token: string | null = null;
      try {
        const response = await fetch('/api/auth/token');
        if (response.ok) {
          const data = await response.json();
          token = data.token;
        }
      } catch (err) {
        console.error('[SSE] Failed to fetch auth token:', err);
      }

      if (!token) {
        console.error('[SSE] No authentication token available');
        setError(new Error('Authentication required'));
        return;
      }

      // Create SSE client
      const client = createSSEClient(sseUrl, token);
      sseClientRef.current = client;

      setConnectionStatus('reconnecting');

      // Set up event handlers
      client.onOpen(() => {
        console.log('[SSE] Connected to command center');
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
      });

      client.onError((event) => {
        console.error('[SSE] Connection error:', event);
        setConnectionStatus('disconnected');
        
        // Attempt reconnection if under max attempts
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = getReconnectDelay();
          console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            sseClientRef.current = null;
            connectRealtime();
          }, delay);
        } else {
          console.error('[SSE] Max reconnection attempts reached');
          setError(new Error('Unable to establish connection. Please refresh the page.'));
        }
      });

      client.onClose(() => {
        console.log('[SSE] Connection closed');
        setConnectionStatus('disconnected');
        sseClientRef.current = null;
      });

      client.onMessage((data) => {
        handleRealtimeMessage(data);
      });

      // Connect
      client.connect();

    } catch (err) {
      console.error('[SSE] Failed to create connection:', err);
      setConnectionStatus('disconnected');
      setError(new Error('Failed to establish connection'));
    }
  }, [getReconnectDelay, handleRealtimeMessage]);

  /**
   * Disconnect SSE/WebSocket
   */
  const disconnectRealtime = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (sseClientRef.current) {
      sseClientRef.current.close();
      sseClientRef.current = null;
    }

    setConnectionStatus('disconnected');
  }, []);

  /**
   * Initial data fetch on mount
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Real-time connection management
   */
  useEffect(() => {
    if (!autoConnect) {
      return;
    }

    // Connect after initial data is loaded
    if (!isLoading && !error) {
      connectRealtime();
    }

    // Cleanup on unmount
    return () => {
      disconnectRealtime();
    };
  }, [autoConnect, isLoading, error, connectRealtime, disconnectRealtime]);

  return {
    zones,
    alerts,
    warnings,
    footfallData,
    connectionStatus,
    isLoading,
    error,
    refetch,
  };
}
