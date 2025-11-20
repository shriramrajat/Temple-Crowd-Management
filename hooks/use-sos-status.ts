/**
 * useSOSStatus Hook
 * 
 * Custom hook to poll for SOS alert status updates on the pilgrim side.
 * Checks for acknowledgment status every 5 seconds and stops polling after
 * acknowledgment or 5 minutes.
 * 
 * Requirements: 6.5, 7.3
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { SOSAlert, AlertStatus } from '@/lib/types/sos'

/**
 * Polling configuration constants
 */
const POLLING_INTERVAL = 5000 // 5 seconds
const POLLING_MAX_DURATION = 300000 // 5 minutes

/**
 * Hook return interface
 */
interface UseSOSStatusReturn {
  /** Current alert data */
  alert: SOSAlert | null
  /** Whether polling is active */
  isPolling: boolean
  /** Error if polling fails */
  error: Error | null
  /** Start polling for an alert */
  startPolling: (alertId: string, initialAlert: SOSAlert) => void
  /** Stop polling manually */
  stopPolling: () => void
  /** Whether alert has been acknowledged */
  isAcknowledged: boolean
}

/**
 * Custom hook to poll for SOS alert status updates
 * 
 * @returns {UseSOSStatusReturn} Hook state and controls
 * 
 * @example
 * ```tsx
 * const { alert, isPolling, isAcknowledged, startPolling } = useSOSStatus()
 * 
 * // Start polling after alert is created
 * startPolling(alertId, createdAlert)
 * 
 * // Check if acknowledged
 * if (isAcknowledged) {
 *   console.log('Help is on the way!')
 * }
 * ```
 */
export function useSOSStatus(): UseSOSStatusReturn {
  const [alert, setAlert] = useState<SOSAlert | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isAcknowledged, setIsAcknowledged] = useState(false)
  
  // Use refs to track polling state
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollingStartTimeRef = useRef<number | null>(null)
  const alertIdRef = useRef<string | null>(null)

  /**
   * Stop polling and clean up
   */
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    setIsPolling(false)
    pollingStartTimeRef.current = null
    alertIdRef.current = null
  }, [])

  /**
   * Fetch alert status from API
   */
  const fetchAlertStatus = useCallback(async (alertId: string): Promise<SOSAlert | null> => {
    try {
      const response = await fetch(`/api/sos?alertId=${alertId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch alert status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.alerts && data.alerts.length > 0) {
        return data.alerts[0] as SOSAlert
      }

      return null
    } catch (err) {
      console.error('Error fetching alert status:', err)
      throw err instanceof Error ? err : new Error('Unknown error fetching alert status')
    }
  }, [])

  /**
   * Poll for alert status updates
   */
  const pollAlertStatus = useCallback(async () => {
    if (!alertIdRef.current) return

    // Check if polling duration exceeded (5 minutes)
    if (pollingStartTimeRef.current) {
      const elapsed = Date.now() - pollingStartTimeRef.current
      if (elapsed > POLLING_MAX_DURATION) {
        console.log('Polling max duration reached (5 minutes), stopping')
        stopPolling()
        return
      }
    }

    try {
      const updatedAlert = await fetchAlertStatus(alertIdRef.current)

      if (updatedAlert) {
        setAlert(updatedAlert)
        setError(null)

        // Check if status changed to acknowledged
        if (updatedAlert.status === AlertStatus.ACKNOWLEDGED && !isAcknowledged) {
          setIsAcknowledged(true)
          stopPolling()
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to poll alert status')
      setError(error)
      console.error('Polling error:', error)
    }
  }, [fetchAlertStatus, stopPolling, isAcknowledged])

  /**
   * Start polling for an alert
   * 
   * @param alertId - The ID of the alert to poll
   * @param initialAlert - The initial alert data
   */
  const startPolling = useCallback((alertId: string, initialAlert: SOSAlert) => {
    // Stop any existing polling
    stopPolling()

    // Set initial state
    setAlert(initialAlert)
    setError(null)
    setIsAcknowledged(initialAlert.status === AlertStatus.ACKNOWLEDGED)
    
    // If already acknowledged, don't start polling
    if (initialAlert.status === AlertStatus.ACKNOWLEDGED) {
      return
    }

    // Start polling
    alertIdRef.current = alertId
    pollingStartTimeRef.current = Date.now()
    setIsPolling(true)

    // Set up polling interval
    pollingIntervalRef.current = setInterval(() => {
      pollAlertStatus()
    }, POLLING_INTERVAL)

    // Do an immediate poll
    pollAlertStatus()
  }, [stopPolling, pollAlertStatus])

  /**
   * Clean up on unmount
   */
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  return {
    alert,
    isPolling,
    error,
    startPolling,
    stopPolling,
    isAcknowledged
  }
}
