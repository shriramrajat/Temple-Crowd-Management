/**
 * Density Monitoring Context and Hooks
 * 
 * React Context for density state management with custom hooks.
 * Requirements: 1.1, 1.2
 * Task 12.1: Updated to use SSE for real-time density updates
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { DensityReading, ThresholdEvaluation, ThresholdConfig } from './types';
import { getDensityMonitor } from './density-monitor';
import { getDensityEvaluationService } from './density-evaluation-service';
import { getVisualIndicatorController } from './visual-indicator-controller';
import { getErrorHandler } from './error-handler';

/**
 * Connection state for SSE
 * Task 12.1: Track SSE connection state
 */
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting';

/**
 * Density context state
 * Requirement 1.1: Real-time density state management
 * Requirement 1.2: Threshold evaluation integration
 * Task 12.1: Added connection state tracking
 */
interface DensityContextState {
  densities: Map<string, DensityReading>;
  evaluations: Map<string, ThresholdEvaluation>;
  monitoredAreas: string[];
  isMonitoring: boolean;
  connectionState: ConnectionState;
  startMonitoring: (areaIds: string[]) => void;
  stopMonitoring: (areaId: string) => void;
  getCurrentDensity: (areaId: string) => DensityReading | null;
  getCurrentEvaluation: (areaId: string) => ThresholdEvaluation | null;
  updateThresholdConfig: (config: ThresholdConfig) => Promise<void>;
  triggerMockViolation: (areaId: string, densityValue: number) => void;
}

/**
 * Density context
 */
const DensityContext = createContext<DensityContextState | undefined>(undefined);

/**
 * Density Provider Props
 */
interface DensityProviderProps {
  children: ReactNode;
  autoStart?: boolean;
  initialAreas?: string[];
}

/**
 * Density Provider Component
 * 
 * Provides density monitoring state and controls to the component tree.
 * Requirement 1.1: React Context for density state management
 * Task 12.1: Updated to use SSE for real-time updates with automatic reconnection
 */
export function DensityProvider({ 
  children, 
  autoStart = false,
  initialAreas = []
}: DensityProviderProps) {
  const [densities, setDensities] = useState<Map<string, DensityReading>>(new Map());
  const [evaluations, setEvaluations] = useState<Map<string, ThresholdEvaluation>>(new Map());
  const [monitoredAreas, setMonitoredAreas] = useState<string[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  
  const densityMonitorRef = useRef(getDensityMonitor());
  const evaluationServiceRef = useRef(getDensityEvaluationService());
  const visualIndicatorControllerRef = useRef(getVisualIndicatorController());
  const errorHandlerRef = useRef(getErrorHandler());
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const evaluationUnsubscribeRef = useRef<(() => void) | null>(null);
  
  // SSE connection management
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxReconnectAttempts = 5;
  const useMockDataRef = useRef(false);
  
  // Debounce timers for high-frequency updates
  const debounceTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const pendingUpdatesRef = useRef<Map<string, DensityReading>>(new Map());
  
  // Track last update time per area to implement adaptive debouncing
  const lastUpdateTimeRef = useRef<Map<string, number>>(new Map());
  
  /**
   * Handle density updates from the monitor
   * Requirement 1.1: Real-time density updates
   * Task 17.1: Optimized with adaptive debouncing for high-frequency updates
   * 
   * Uses adaptive debouncing:
   * - Emergency/Critical: 50ms debounce (faster updates for critical situations)
   * - Warning: 100ms debounce
   * - Normal: 150ms debounce (can afford slower updates)
   */
  const handleDensityUpdate = useCallback((reading: DensityReading) => {
    // Store the latest reading
    pendingUpdatesRef.current.set(reading.areaId, reading);
    
    // Clear existing debounce timer for this area
    const existingTimer = debounceTimersRef.current.get(reading.areaId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Determine debounce delay based on current evaluation
    // This allows faster updates for critical situations
    const currentEval = evaluations.get(reading.areaId);
    let debounceDelay = 100; // Default
    
    if (currentEval) {
      switch (currentEval.currentLevel) {
        case 'emergency':
        case 'critical':
          debounceDelay = 50; // Faster updates for critical situations
          break;
        case 'warning':
          debounceDelay = 100;
          break;
        case 'normal':
          debounceDelay = 150; // Can afford slower updates
          break;
      }
    }
    
    // Set new debounce timer with adaptive delay
    const timer = setTimeout(() => {
      const latestReading = pendingUpdatesRef.current.get(reading.areaId);
      if (latestReading) {
        setDensities((prev: Map<string, DensityReading>) => {
          const next = new Map(prev);
          next.set(latestReading.areaId, latestReading);
          return next;
        });
        pendingUpdatesRef.current.delete(reading.areaId);
        lastUpdateTimeRef.current.set(reading.areaId, Date.now());
      }
      debounceTimersRef.current.delete(reading.areaId);
    }, debounceDelay);
    
    debounceTimersRef.current.set(reading.areaId, timer);
  }, [evaluations]);
  
  /**
   * Handle evaluation updates from the evaluation service
   * Requirement 1.2: Threshold evaluation integration
   * Task 8.1: Integrate with VisualIndicatorController to update indicators on density changes
   */
  const handleEvaluationUpdate = useCallback((evaluation: ThresholdEvaluation) => {
    setEvaluations((prev: Map<string, ThresholdEvaluation>) => {
      const next = new Map(prev);
      next.set(evaluation.areaId, evaluation);
      return next;
    });
    
    // Update visual indicator based on threshold level
    // Requirement 4.4: Sub-2-second state propagation
    const visualIndicatorController = visualIndicatorControllerRef.current;
    visualIndicatorController.updateIndicator(evaluation.areaId, evaluation.currentLevel);
  }, []);
  
  /**
   * Connect to SSE density stream
   * Task 12.1: Implement SSE connection with automatic reconnection
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
      const eventSource = new EventSource('/api/crowd-risk/density-stream');
      eventSourceRef.current = eventSource;
      
      // Handle connection open
      eventSource.onopen = () => {
        setConnectionState('connected');
        reconnectAttemptsRef.current = 0;
        useMockDataRef.current = false;
        
        // Stop polling if it was active
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
      
      // Handle messages
      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'density' && message.data) {
            const reading = message.data as DensityReading;
            handleDensityUpdate(reading);
          }
        } catch (error) {
          const errorHandler = errorHandlerRef.current;
          errorHandler.handleDataStreamError(
            error instanceof Error ? error : new Error('Failed to parse SSE message'),
            'sse-parse',
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
      const errorHandler = errorHandlerRef.current;
      errorHandler.handleDataStreamError(
        error instanceof Error ? error : new Error('Failed to create SSE connection'),
        'sse-connection',
        {}
      );
      setConnectionState('error');
      reconnectWithBackoff();
    }
  }, [handleDensityUpdate]);
  
  /**
   * Reconnect with exponential backoff
   * Task 12.1: Implement automatic reconnection with exponential backoff (1s, 2s, 4s, 8s, max 30s)
   */
  const reconnectWithBackoff = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      // Fall back to polling after max reconnect attempts
      console.warn('Max SSE reconnect attempts reached, falling back to polling');
      startPolling();
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
   * Start polling as fallback when SSE fails repeatedly
   * Task 12.1: Fall back to polling every 5 seconds if SSE connection fails repeatedly
   */
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      return; // Already polling
    }
    
    useMockDataRef.current = true;
    setConnectionState('disconnected');
    
    // Use mock data from DensityMonitor
    const monitor = densityMonitorRef.current;
    
    // Poll every 5 seconds
    pollingIntervalRef.current = setInterval(() => {
      const areas = monitor.getMonitoredAreas();
      areas.forEach(async (areaId: string) => {
        const reading = await monitor.getCurrentDensity(areaId);
        if (reading) {
          handleDensityUpdate(reading);
        }
      });
    }, 5000);
  }, [handleDensityUpdate]);
  
  /**
   * Stop SSE connection and polling
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
    
    // Clear polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    setConnectionState('disconnected');
    reconnectAttemptsRef.current = 0;
  }, []);
  
  /**
   * Start monitoring specified areas
   * Requirement 1.1: Start monitoring areas
   * Requirement 1.2: Start evaluation service
   * Task 12.1: Connect to SSE when monitoring starts
   */
  const startMonitoring = useCallback((areaIds: string[]) => {
    const monitor = densityMonitorRef.current;
    const evaluationService = evaluationServiceRef.current;
    
    // Start monitoring (for fallback/mock data)
    monitor.startMonitoring(areaIds);
    
    // Start evaluation service if not already running
    if (!evaluationService.isServiceRunning()) {
      evaluationService.start();
    }
    
    // Preload threshold configurations for these areas
    evaluationService.preloadConfigurations(areaIds).catch((error: unknown) => {
      console.error('Failed to preload threshold configurations:', error);
    });
    
    // Update state
    setMonitoredAreas((prev: string[]) => {
      const combined = new Set([...prev, ...areaIds]);
      return Array.from(combined);
    });
    
    setIsMonitoring(true);
    
    // Subscribe to evaluation updates if not already subscribed
    if (!evaluationUnsubscribeRef.current) {
      evaluationUnsubscribeRef.current = evaluationService.onEvaluation(handleEvaluationUpdate);
    }
    
    // Connect to SSE for real-time updates
    // If SSE fails, will automatically fall back to polling
    if (!eventSourceRef.current && !pollingIntervalRef.current) {
      connectToSSE();
    }
  }, [handleEvaluationUpdate, connectToSSE]);
  
  /**
   * Stop monitoring a specific area
   * Task 12.1: Disconnect SSE when no areas are monitored
   */
  const stopMonitoring = useCallback((areaId: string) => {
    const monitor = densityMonitorRef.current;
    const evaluationService = evaluationServiceRef.current;
    
    // Stop monitoring
    monitor.stopMonitoring(areaId);
    
    // Update state
    setMonitoredAreas((prev: string[]) => prev.filter((id: string) => id !== areaId));
    setDensities((prev: Map<string, DensityReading>) => {
      const next = new Map(prev);
      next.delete(areaId);
      return next;
    });
    setEvaluations((prev: Map<string, ThresholdEvaluation>) => {
      const next = new Map(prev);
      next.delete(areaId);
      return next;
    });
    
    // If no more areas are monitored, disconnect and stop services
    const remainingAreas = monitor.getMonitoredAreas();
    if (remainingAreas.length === 0) {
      disconnectSSE();
      
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (evaluationUnsubscribeRef.current) {
        evaluationUnsubscribeRef.current();
        evaluationUnsubscribeRef.current = null;
      }
      evaluationService.stop();
      setIsMonitoring(false);
    }
  }, [disconnectSSE]);
  
  /**
   * Get current density for an area
   * Requirement 1.1: Current density retrieval
   * Optimized: Memoized with useMemo to avoid recreating function on every render
   */
  const getCurrentDensity = useCallback((areaId: string): DensityReading | null => {
    return densities.get(areaId) || null;
  }, [densities]);
  
  /**
   * Get current evaluation for an area
   * Requirement 1.2: Current evaluation retrieval
   * Optimized: Memoized with useMemo to avoid recreating function on every render
   */
  const getCurrentEvaluation = useCallback((areaId: string): ThresholdEvaluation | null => {
    return evaluations.get(areaId) || null;
  }, [evaluations]);
  
  /**
   * Update threshold configuration
   * Requirement 6.3: Configuration update propagation
   */
  const updateThresholdConfig = useCallback(async (config: ThresholdConfig): Promise<void> => {
    const evaluationService = evaluationServiceRef.current;
    await evaluationService.updateThresholdConfig(config);
  }, []);
  
  /**
   * Trigger a mock violation for testing
   */
  const triggerMockViolation = useCallback((areaId: string, densityValue: number) => {
    const monitor = densityMonitorRef.current;
    monitor.triggerMockViolation(areaId, densityValue);
  }, []);
  
  /**
   * Auto-start monitoring on mount if enabled
   * Task 12.1: Connect to SSE when monitoring starts
   */
  useEffect(() => {
    if (autoStart && initialAreas.length > 0) {
      startMonitoring(initialAreas);
    }
    
    // Cleanup on unmount
    return () => {
      // Clear all debounce timers
      debounceTimersRef.current.forEach((timer: ReturnType<typeof setTimeout>) => clearTimeout(timer));
      debounceTimersRef.current.clear();
      pendingUpdatesRef.current.clear();
      lastUpdateTimeRef.current.clear();
      
      // Disconnect SSE
      disconnectSSE();
      
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (evaluationUnsubscribeRef.current) {
        evaluationUnsubscribeRef.current();
        evaluationUnsubscribeRef.current = null;
      }
      const evaluationService = evaluationServiceRef.current;
      if (evaluationService.isServiceRunning()) {
        evaluationService.stop();
      }
    };
  }, [autoStart, initialAreas, startMonitoring, disconnectSSE]);
  
  // Memoize context value to prevent unnecessary re-renders
  // Optimization: Only recreate value when dependencies change
  // Task 12.1: Added connectionState to context value
  const value: DensityContextState = React.useMemo(() => ({
    densities,
    evaluations,
    monitoredAreas,
    isMonitoring,
    connectionState,
    startMonitoring,
    stopMonitoring,
    getCurrentDensity,
    getCurrentEvaluation,
    updateThresholdConfig,
    triggerMockViolation,
  }), [
    densities,
    evaluations,
    monitoredAreas,
    isMonitoring,
    connectionState,
    startMonitoring,
    stopMonitoring,
    getCurrentDensity,
    getCurrentEvaluation,
    updateThresholdConfig,
    triggerMockViolation,
  ]);
  
  return (
    <DensityContext.Provider value={value}>
      {children}
    </DensityContext.Provider>
  );
}

/**
 * Hook to access density context
 * 
 * @throws Error if used outside DensityProvider
 */
export function useDensityContext(): DensityContextState {
  const context = useContext(DensityContext);
  
  if (!context) {
    throw new Error('useDensityContext must be used within a DensityProvider');
  }
  
  return context;
}

/**
 * Hook to monitor density for specific areas
 * 
 * Requirement 1.1: Custom hook for density monitoring
 * Requirement 1.2: Subscription mechanism for density updates
 * 
 * @param areaIds - Array of area IDs to monitor
 * @returns Density readings map and monitoring controls
 */
export function useDensityMonitor(areaIds: string[]) {
  const { 
    densities, 
    startMonitoring, 
    stopMonitoring, 
    isMonitoring 
  } = useDensityContext();
  
  const [areaDensities, setAreaDensities] = useState<Map<string, DensityReading>>(new Map());
  
  // Memoize area IDs string to prevent unnecessary effect triggers
  const areaIdsKey = React.useMemo(() => areaIds.join(','), [areaIds.join(',')]);
  
  /**
   * Start monitoring on mount
   */
  useEffect(() => {
    if (areaIds.length > 0) {
      startMonitoring(areaIds);
    }
    
    // Cleanup: stop monitoring these areas on unmount
    return () => {
      for (const areaId of areaIds) {
        stopMonitoring(areaId);
      }
    };
  }, [areaIdsKey, startMonitoring, stopMonitoring]); // eslint-disable-line react-hooks/exhaustive-deps
  
  /**
   * Update area densities when global densities change
   * Optimized: Use useMemo to avoid recreating Map on every render
   */
  useEffect(() => {
    const filtered = new Map<string, DensityReading>();
    
    for (const areaId of areaIds) {
      const density = densities.get(areaId);
      if (density) {
        filtered.set(areaId, density);
      }
    }
    
    setAreaDensities(filtered);
  }, [densities, areaIdsKey]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Memoize return value to prevent unnecessary re-renders
  return React.useMemo(() => ({
    densities: areaDensities,
    isMonitoring,
  }), [areaDensities, isMonitoring]);
}

/**
 * Hook to get current density for a single area
 * 
 * Requirement 1.1: Custom hook for current density
 * 
 * @param areaId - Area ID to monitor
 * @returns Current density reading or null
 */
export function useCurrentDensity(areaId: string): DensityReading | null {
  const { densities, startMonitoring, stopMonitoring } = useDensityContext();
  const [currentDensity, setCurrentDensity] = useState<DensityReading | null>(null);
  
  /**
   * Start monitoring this area on mount
   */
  useEffect(() => {
    if (areaId) {
      startMonitoring([areaId]);
    }
    
    // Cleanup: stop monitoring on unmount
    return () => {
      if (areaId) {
        stopMonitoring(areaId);
      }
    };
  }, [areaId, startMonitoring, stopMonitoring]);
  
  /**
   * Update current density when densities change
   */
  useEffect(() => {
    const density = densities.get(areaId);
    setCurrentDensity(density || null);
  }, [densities, areaId]);
  
  return currentDensity;
}

/**
 * Hook to subscribe to density updates for specific areas
 * 
 * Requirement 1.2: Subscription mechanism for density updates
 * 
 * @param areaIds - Array of area IDs to subscribe to
 * @param callback - Callback function called on density updates
 */
export function useDensitySubscription(
  areaIds: string[],
  callback: (reading: DensityReading) => void
) {
  const { densities } = useDensityContext();
  const callbackRef = useRef(callback);
  const previousDensitiesRef = useRef<Map<string, DensityReading>>(new Map());
  
  // Update callback ref
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  /**
   * Detect changes and call callback
   */
  useEffect(() => {
    const previous = previousDensitiesRef.current;
    
    for (const areaId of areaIds) {
      const currentReading = densities.get(areaId);
      const previousReading = previous.get(areaId);
      
      // Check if reading changed
      if (currentReading && currentReading !== previousReading) {
        callbackRef.current(currentReading);
      }
    }
    
    // Update previous densities
    previousDensitiesRef.current = new Map(densities);
  }, [densities, areaIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Hook to get all monitored areas with their current densities
 * 
 * @returns Array of area IDs with their density readings
 */
export function useAllDensities() {
  const { densities, monitoredAreas, isMonitoring } = useDensityContext();
  
  // Memoize the computed areas array to avoid unnecessary recalculations
  const areaDensities = React.useMemo(() => {
    return monitoredAreas.map(areaId => ({
      areaId,
      density: densities.get(areaId) || null,
    }));
  }, [densities, monitoredAreas]);
  
  // Memoize return value
  return React.useMemo(() => ({
    areas: areaDensities,
    isMonitoring,
  }), [areaDensities, isMonitoring]);
}

/**
 * Hook to get threshold evaluation for a single area
 * 
 * Requirement 1.2: Access threshold evaluation results
 * 
 * @param areaId - Area ID to get evaluation for
 * @returns Current threshold evaluation or null
 */
export function useThresholdEvaluation(areaId: string): ThresholdEvaluation | null {
  const { evaluations } = useDensityContext();
  const [currentEvaluation, setCurrentEvaluation] = useState<ThresholdEvaluation | null>(null);
  
  useEffect(() => {
    const evaluation = evaluations.get(areaId);
    setCurrentEvaluation(evaluation || null);
  }, [evaluations, areaId]);
  
  return currentEvaluation;
}

/**
 * Hook to subscribe to threshold evaluation updates
 * 
 * Requirement 1.2: Subscribe to evaluation changes
 * 
 * @param areaIds - Array of area IDs to subscribe to
 * @param callback - Callback function called on evaluation updates
 */
export function useEvaluationSubscription(
  areaIds: string[],
  callback: (evaluation: ThresholdEvaluation) => void
) {
  const { evaluations } = useDensityContext();
  const callbackRef = useRef(callback);
  const previousEvaluationsRef = useRef<Map<string, ThresholdEvaluation>>(new Map());
  
  // Update callback ref
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  /**
   * Detect changes and call callback
   */
  useEffect(() => {
    const previous = previousEvaluationsRef.current;
    
    for (const areaId of areaIds) {
      const currentEvaluation = evaluations.get(areaId);
      const previousEvaluation = previous.get(areaId);
      
      // Check if evaluation changed
      if (currentEvaluation && currentEvaluation !== previousEvaluation) {
        callbackRef.current(currentEvaluation);
      }
    }
    
    // Update previous evaluations
    previousEvaluationsRef.current = new Map(evaluations);
  }, [evaluations, areaIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Hook to get density connection state
 * Task 12.1: Access SSE connection state
 * 
 * @returns Current connection state
 */
export function useDensityConnectionState(): ConnectionState {
  const { connectionState } = useDensityContext();
  return connectionState;
}

/**
 * Hook to get all monitored areas with their evaluations
 * 
 * @returns Array of area IDs with their evaluations
 */
export function useAllEvaluations() {
  const { evaluations, monitoredAreas, isMonitoring } = useDensityContext();
  
  // Memoize the computed evaluations array to avoid unnecessary recalculations
  const areaEvaluations = React.useMemo(() => {
    return monitoredAreas.map(areaId => ({
      areaId,
      evaluation: evaluations.get(areaId) || null,
    }));
  }, [evaluations, monitoredAreas]);
  
  // Memoize return value
  return React.useMemo(() => ({
    areas: areaEvaluations,
    isMonitoring,
  }), [areaEvaluations, isMonitoring]);
}
