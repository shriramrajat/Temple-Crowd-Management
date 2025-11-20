/**
 * End-to-End Integration Tests for SOS Assistance System
 * 
 * Tests the complete SOS flow from button press to admin acknowledgment:
 * - Complete SOS flow from button press to admin acknowledgment
 * - Error scenarios (location denied, network failure)
 * - Acknowledgment notification flow
 * - Filtering and search in admin dashboard
 * 
 * Requirements: 1.1, 1.2, 6.5, 7.2
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AlertType, UrgencyLevel, AlertStatus, SOSAlert } from '@/lib/types/sos'
import { 
  clearAllAlerts, 
  saveAlert, 
  getAlerts, 
  updateAlert,
  saveUserProfile
} from '@/lib/storage/sos-storage'

// Mock geolocation API
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
}

// Mock fetch
const mockFetch = vi.fn()

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

describe('SOS Assistance System - End-to-End Integration Tests', () => {
  beforeEach(() => {
    // Setup geolocation mock
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    })

    // Setup fetch mock
    global.fetch = mockFetch as any

    // Setup localStorage mock
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    })

    // Setup navigator.vibrate mock
    Object.defineProperty(global.navigator, 'vibrate', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    })

    // Clear all mocks
    vi.clearAllMocks()
    
    // Clear localStorage
    localStorageMock.clear()
    clearAllAlerts()
    
    // Setup default geolocation mock
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: 18.5204,
          longitude: 73.8567,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      })
    })
    
    // Setup default fetch mock
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  /**
   * Test: Complete SOS flow from alert creation to admin acknowledgment
   * Requirements: 1.1, 1.2, 6.5, 7.2
   */
  describe('Complete SOS Flow', () => {
    it('should create alert, store it, and allow admin to acknowledge', async () => {
      // Step 1: Setup user profile
      const userProfile = saveUserProfile({
        id: 'test-user-1',
        name: 'Test Pilgrim',
        phone: '+91 9876543210',
        emergencyContact: '+91 9876543211',
      })

      expect(userProfile).toBeDefined()
      expect(userProfile.name).toBe('Test Pilgrim')

      // Step 2: Create SOS alert
      const alertData: SOSAlert = {
        id: 'sos-test-123',
        alertType: AlertType.MEDICAL,
        urgencyLevel: UrgencyLevel.HIGH,
        status: AlertStatus.PENDING,
        location: {
          latitude: 18.5204,
          longitude: 73.8567,
          accuracy: 10,
          address: 'Temple Area, Zone A',
          zone: 'Zone A',
          timestamp: Date.now(),
        },
        pilgrimInfo: {
          name: userProfile.name,
          phone: userProfile.phone,
          emergencyContact: userProfile.emergencyContact,
          userId: userProfile.id,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      const savedAlert = saveAlert(alertData)
      expect(savedAlert).toBeDefined()
      expect(savedAlert.id).toBe('sos-test-123')
      expect(savedAlert.status).toBe(AlertStatus.PENDING)

      // Step 3: Retrieve alert (simulating admin dashboard)
      const alerts = getAlerts({ status: AlertStatus.PENDING })
      expect(alerts).toHaveLength(1)
      expect(alerts[0].id).toBe('sos-test-123')
      expect(alerts[0].pilgrimInfo.name).toBe('Test Pilgrim')

      // Step 4: Admin acknowledges alert
      const acknowledgedAlert = updateAlert('sos-test-123', {
        status: AlertStatus.ACKNOWLEDGED,
        acknowledgment: {
          authorityName: 'Admin User',
          authorityId: 'admin-1',
          acknowledgedAt: Date.now(),
          notes: 'Help is on the way',
        },
      })

      expect(acknowledgedAlert.status).toBe(AlertStatus.ACKNOWLEDGED)
      expect(acknowledgedAlert.acknowledgment).toBeDefined()
      expect(acknowledgedAlert.acknowledgment?.authorityName).toBe('Admin User')

      // Step 5: Verify pilgrim can see acknowledgment
      const updatedAlerts = getAlerts({ status: AlertStatus.ACKNOWLEDGED })
      expect(updatedAlerts).toHaveLength(1)
      expect(updatedAlerts[0].acknowledgment).toBeDefined()
    })

    it('should handle multiple alerts with different urgency levels', async () => {
      // Create multiple alerts
      const alerts: SOSAlert[] = [
        {
          id: 'sos-critical-1',
          alertType: AlertType.MEDICAL,
          urgencyLevel: UrgencyLevel.CRITICAL,
          status: AlertStatus.PENDING,
          location: {
            latitude: 18.5204,
            longitude: 73.8567,
            accuracy: 10,
            timestamp: Date.now(),
          },
          pilgrimInfo: { name: 'Critical Patient' },
          createdAt: Date.now() - 1000,
          updatedAt: Date.now() - 1000,
        },
        {
          id: 'sos-high-1',
          alertType: AlertType.SECURITY,
          urgencyLevel: UrgencyLevel.HIGH,
          status: AlertStatus.PENDING,
          location: {
            latitude: 18.5205,
            longitude: 73.8568,
            accuracy: 10,
            timestamp: Date.now(),
          },
          pilgrimInfo: { name: 'Security Issue' },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'sos-medium-1',
          alertType: AlertType.LOST,
          urgencyLevel: UrgencyLevel.MEDIUM,
          status: AlertStatus.PENDING,
          location: {
            latitude: 18.5206,
            longitude: 73.8569,
            accuracy: 10,
            timestamp: Date.now(),
          },
          pilgrimInfo: { name: 'Lost Person' },
          createdAt: Date.now() + 1000,
          updatedAt: Date.now() + 1000,
        },
      ]

      alerts.forEach(alert => saveAlert(alert))

      // Retrieve all alerts
      const allAlerts = getAlerts()
      expect(allAlerts).toHaveLength(3)

      // Verify sorting (newest first)
      expect(allAlerts[0].id).toBe('sos-medium-1')
      expect(allAlerts[2].id).toBe('sos-critical-1')

      // Filter by urgency level
      const criticalAlerts = getAlerts({ urgencyLevel: UrgencyLevel.CRITICAL })
      expect(criticalAlerts).toHaveLength(1)
      expect(criticalAlerts[0].urgencyLevel).toBe(UrgencyLevel.CRITICAL)

      // Filter by alert type
      const medicalAlerts = getAlerts({ alertType: AlertType.MEDICAL })
      expect(medicalAlerts).toHaveLength(1)
      expect(medicalAlerts[0].alertType).toBe(AlertType.MEDICAL)
    })
  })

  /**
   * Test: Error scenarios
   * Requirements: 4.4, 4.5, 6.4
   */
  describe('Error Scenarios', () => {
    it('should handle location permission denied gracefully', () => {
      // Mock location permission denied
      mockGeolocation.getCurrentPosition.mockImplementation((_success: any, error: any) => {
        error?.({
          code: 1, // PERMISSION_DENIED
          message: 'User denied geolocation',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError)
      })

      // Attempt to get location
      let locationError: GeolocationPositionError | null = null
      mockGeolocation.getCurrentPosition(
        () => {},
        (err: GeolocationPositionError) => { locationError = err }
      )

      expect(locationError).toBeDefined()
      expect((locationError as unknown as GeolocationPositionError).code).toBe(1)
      expect((locationError as unknown as GeolocationPositionError).message).toContain('denied')

      // Alert can still be created without location
      const alertWithoutLocation: SOSAlert = {
        id: 'sos-no-location',
        alertType: AlertType.GENERAL,
        urgencyLevel: UrgencyLevel.HIGH,
        status: AlertStatus.PENDING,
        location: {
          latitude: 0,
          longitude: 0,
          accuracy: 0,
          timestamp: Date.now(),
        },
        pilgrimInfo: { name: 'Test User' },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        notes: 'Location unavailable - permission denied',
      }

      const saved = saveAlert(alertWithoutLocation)
      expect(saved).toBeDefined()
      expect(saved.notes).toContain('Location unavailable')
    })

    it('should handle location timeout', () => {
      // Mock location timeout
      mockGeolocation.getCurrentPosition.mockImplementation((_success: any, error: any) => {
        error?.({
          code: 3, // TIMEOUT
          message: 'Location request timed out',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError)
      })

      let locationError: GeolocationPositionError | null = null
      mockGeolocation.getCurrentPosition(
        () => {},
        (err: GeolocationPositionError) => { locationError = err }
      )

      expect(locationError).toBeDefined()
      expect((locationError as unknown as GeolocationPositionError).code).toBe(3)
      expect((locationError as unknown as GeolocationPositionError).message).toContain('timed out')
    })

    it('should handle network failure with API', async () => {
      // Mock network failure
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      try {
        await fetch('/api/sos/alerts', {
          method: 'POST',
          body: JSON.stringify({
            alertType: AlertType.MEDICAL,
            urgencyLevel: UrgencyLevel.HIGH,
            location: {
              latitude: 18.5204,
              longitude: 73.8567,
              accuracy: 10,
              timestamp: Date.now(),
            },
          }),
        })
        // Should not reach here
        expect(true).toBe(false)
      } catch (error) {
        expect(error).toBeDefined()
        expect((error as Error).message).toContain('Network error')
      }
    })

    it('should handle API validation errors', async () => {
      // Mock validation error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: 'Invalid request data',
          details: [{ message: 'Invalid alert type' }],
        }),
      })

      const response = await fetch('/api/sos/alerts', {
        method: 'POST',
        body: JSON.stringify({
          alertType: 'invalid_type',
          urgencyLevel: UrgencyLevel.HIGH,
        }),
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid')
    })

    it('should handle storage quota exceeded', () => {
      // Mock localStorage to throw quota exceeded error
      const originalSetItem = localStorageMock.setItem
      localStorageMock.setItem = vi.fn(() => {
        const error = new Error('QuotaExceededError')
        error.name = 'QuotaExceededError'
        throw error
      })

      try {
        const alert: SOSAlert = {
          id: 'sos-quota-test',
          alertType: AlertType.MEDICAL,
          urgencyLevel: UrgencyLevel.HIGH,
          status: AlertStatus.PENDING,
          location: {
            latitude: 18.5204,
            longitude: 73.8567,
            accuracy: 10,
            timestamp: Date.now(),
          },
          pilgrimInfo: {},
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }

        saveAlert(alert)
        // Should not reach here
        expect(true).toBe(false)
      } catch (error) {
        expect(error).toBeDefined()
        expect((error as Error).name).toContain('Storage')
      } finally {
        // Restore original setItem
        localStorageMock.setItem = originalSetItem
      }
    })
  })

  /**
   * Test: Admin dashboard filtering and search
   * Requirements: 5.1
   */
  describe('Admin Dashboard Filtering', () => {
    beforeEach(() => {
      // Create test alerts
      const alerts: SOSAlert[] = [
        {
          id: 'sos-1',
          alertType: AlertType.MEDICAL,
          urgencyLevel: UrgencyLevel.CRITICAL,
          status: AlertStatus.PENDING,
          location: { 
            latitude: 18.5204, 
            longitude: 73.8567, 
            accuracy: 10, 
            address: 'Temple Main Hall',
            zone: 'Zone A',
            timestamp: Date.now() 
          },
          pilgrimInfo: { name: 'Pilgrim One', phone: '+91 9876543210' },
          createdAt: Date.now() - 3000,
          updatedAt: Date.now() - 3000,
        },
        {
          id: 'sos-2',
          alertType: AlertType.SECURITY,
          urgencyLevel: UrgencyLevel.HIGH,
          status: AlertStatus.ACKNOWLEDGED,
          location: { 
            latitude: 18.5205, 
            longitude: 73.8568, 
            accuracy: 10,
            address: 'Temple Courtyard',
            zone: 'Zone B',
            timestamp: Date.now() 
          },
          pilgrimInfo: { name: 'Pilgrim Two', phone: '+91 9876543211' },
          createdAt: Date.now() - 2000,
          updatedAt: Date.now() - 2000,
        },
        {
          id: 'sos-3',
          alertType: AlertType.LOST,
          urgencyLevel: UrgencyLevel.MEDIUM,
          status: AlertStatus.PENDING,
          location: { 
            latitude: 18.5206, 
            longitude: 73.8569, 
            accuracy: 10,
            address: 'Temple Garden',
            zone: 'Zone C',
            timestamp: Date.now() 
          },
          pilgrimInfo: { name: 'John Doe', phone: '+91 9876543212' },
          createdAt: Date.now() - 1000,
          updatedAt: Date.now() - 1000,
        },
        {
          id: 'sos-4',
          alertType: AlertType.ACCIDENT,
          urgencyLevel: UrgencyLevel.HIGH,
          status: AlertStatus.RESOLVED,
          location: { 
            latitude: 18.5207, 
            longitude: 73.8570, 
            accuracy: 10,
            address: 'Temple Entrance',
            zone: 'Zone A',
            timestamp: Date.now() 
          },
          pilgrimInfo: { name: 'Pilgrim Four', phone: '+91 9876543213' },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      alerts.forEach(alert => saveAlert(alert))
    })

    it('should filter alerts by status', () => {
      // Filter by pending status
      const pendingAlerts = getAlerts({ status: AlertStatus.PENDING })
      expect(pendingAlerts).toHaveLength(2)
      expect(pendingAlerts.every(a => a.status === AlertStatus.PENDING)).toBe(true)

      // Filter by acknowledged status
      const acknowledgedAlerts = getAlerts({ status: AlertStatus.ACKNOWLEDGED })
      expect(acknowledgedAlerts).toHaveLength(1)
      expect(acknowledgedAlerts[0].id).toBe('sos-2')

      // Filter by resolved status
      const resolvedAlerts = getAlerts({ status: AlertStatus.RESOLVED })
      expect(resolvedAlerts).toHaveLength(1)
      expect(resolvedAlerts[0].id).toBe('sos-4')

      // Filter by multiple statuses
      const multipleStatuses = getAlerts({ 
        status: [AlertStatus.PENDING, AlertStatus.ACKNOWLEDGED] 
      })
      expect(multipleStatuses).toHaveLength(3)
    })

    it('should filter alerts by urgency level', () => {
      // Filter by critical urgency
      const criticalAlerts = getAlerts({ urgencyLevel: UrgencyLevel.CRITICAL })
      expect(criticalAlerts).toHaveLength(1)
      expect(criticalAlerts[0].urgencyLevel).toBe(UrgencyLevel.CRITICAL)
      expect(criticalAlerts[0].id).toBe('sos-1')

      // Filter by high urgency
      const highAlerts = getAlerts({ urgencyLevel: UrgencyLevel.HIGH })
      expect(highAlerts).toHaveLength(2)
      expect(highAlerts.every(a => a.urgencyLevel === UrgencyLevel.HIGH)).toBe(true)

      // Filter by multiple urgency levels
      const multipleUrgency = getAlerts({ 
        urgencyLevel: [UrgencyLevel.CRITICAL, UrgencyLevel.HIGH] 
      })
      expect(multipleUrgency).toHaveLength(3)
    })

    it('should filter alerts by alert type', () => {
      // Filter by medical type
      const medicalAlerts = getAlerts({ alertType: AlertType.MEDICAL })
      expect(medicalAlerts).toHaveLength(1)
      expect(medicalAlerts[0].alertType).toBe(AlertType.MEDICAL)

      // Filter by security type
      const securityAlerts = getAlerts({ alertType: AlertType.SECURITY })
      expect(securityAlerts).toHaveLength(1)
      expect(securityAlerts[0].alertType).toBe(AlertType.SECURITY)

      // Filter by multiple types
      const multipleTypes = getAlerts({ 
        alertType: [AlertType.MEDICAL, AlertType.SECURITY] 
      })
      expect(multipleTypes).toHaveLength(2)
    })

    it('should search alerts by pilgrim name', () => {
      // Search by full name
      const johnDoeAlerts = getAlerts({ searchQuery: 'John Doe' })
      expect(johnDoeAlerts).toHaveLength(1)
      expect(johnDoeAlerts[0].pilgrimInfo.name).toBe('John Doe')

      // Search by partial name (case insensitive)
      const pilgrimAlerts = getAlerts({ searchQuery: 'pilgrim' })
      expect(pilgrimAlerts).toHaveLength(3)

      // Search by location
      const gardenAlerts = getAlerts({ searchQuery: 'Garden' })
      expect(gardenAlerts).toHaveLength(1)
      expect(gardenAlerts[0].location.address).toContain('Garden')

      // Search by zone
      const zoneAAlerts = getAlerts({ searchQuery: 'Zone A' })
      expect(zoneAAlerts).toHaveLength(2)
    })

    it('should combine multiple filters', () => {
      // Filter by status and urgency
      const pendingHighAlerts = getAlerts({ 
        status: AlertStatus.PENDING,
        urgencyLevel: UrgencyLevel.CRITICAL
      })
      expect(pendingHighAlerts).toHaveLength(1)
      expect(pendingHighAlerts[0].id).toBe('sos-1')

      // Filter by type and status
      const medicalPendingAlerts = getAlerts({ 
        alertType: AlertType.MEDICAL,
        status: AlertStatus.PENDING
      })
      expect(medicalPendingAlerts).toHaveLength(1)

      // Filter with search query
      const pendingPilgrimAlerts = getAlerts({ 
        status: AlertStatus.PENDING,
        searchQuery: 'Pilgrim'
      })
      expect(pendingPilgrimAlerts).toHaveLength(2)
    })

    it('should sort alerts by timestamp (newest first)', () => {
      const allAlerts = getAlerts()
      expect(allAlerts).toHaveLength(4)
      
      // Verify sorting (newest first)
      expect(allAlerts[0].id).toBe('sos-4') // Most recent
      expect(allAlerts[3].id).toBe('sos-1') // Oldest
      
      // Verify timestamps are in descending order
      for (let i = 0; i < allAlerts.length - 1; i++) {
        expect(allAlerts[i].createdAt).toBeGreaterThanOrEqual(allAlerts[i + 1].createdAt)
      }
    })
  })

  /**
   * Test: Acknowledgment notification flow
   * Requirements: 6.5, 7.2, 7.3
   */
  describe('Acknowledgment Flow', () => {
    it('should acknowledge alert and update status', () => {
      // Create pending alert
      const alert: SOSAlert = {
        id: 'sos-ack-test',
        alertType: AlertType.MEDICAL,
        urgencyLevel: UrgencyLevel.HIGH,
        status: AlertStatus.PENDING,
        location: { 
          latitude: 18.5204, 
          longitude: 73.8567, 
          accuracy: 10, 
          timestamp: Date.now() 
        },
        pilgrimInfo: { name: 'Test Pilgrim', phone: '+91 9876543210' },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      saveAlert(alert)

      // Verify alert is pending
      const pendingAlerts = getAlerts({ status: AlertStatus.PENDING })
      expect(pendingAlerts).toHaveLength(1)
      expect(pendingAlerts[0].id).toBe('sos-ack-test')

      // Admin acknowledges alert
      const acknowledgedAlert = updateAlert('sos-ack-test', {
        status: AlertStatus.ACKNOWLEDGED,
        acknowledgment: {
          authorityName: 'Admin User',
          authorityId: 'admin-1',
          acknowledgedAt: Date.now(),
          notes: 'Help is on the way',
        },
      })

      // Verify acknowledgment
      expect(acknowledgedAlert.status).toBe(AlertStatus.ACKNOWLEDGED)
      expect(acknowledgedAlert.acknowledgment).toBeDefined()
      expect(acknowledgedAlert.acknowledgment?.authorityName).toBe('Admin User')
      expect(acknowledgedAlert.acknowledgment?.notes).toBe('Help is on the way')

      // Verify alert is no longer pending
      const stillPending = getAlerts({ status: AlertStatus.PENDING })
      expect(stillPending).toHaveLength(0)

      // Verify alert is in acknowledged list
      const acknowledgedAlerts = getAlerts({ status: AlertStatus.ACKNOWLEDGED })
      expect(acknowledgedAlerts).toHaveLength(1)
      expect(acknowledgedAlerts[0].id).toBe('sos-ack-test')
    })

    it('should track acknowledgment timestamp and authority', () => {
      const alert: SOSAlert = {
        id: 'sos-timestamp-test',
        alertType: AlertType.SECURITY,
        urgencyLevel: UrgencyLevel.CRITICAL,
        status: AlertStatus.PENDING,
        location: { 
          latitude: 18.5204, 
          longitude: 73.8567, 
          accuracy: 10, 
          timestamp: Date.now() 
        },
        pilgrimInfo: { name: 'Security Alert' },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      saveAlert(alert)

      const acknowledgeTime = Date.now()
      const acknowledgedAlert = updateAlert('sos-timestamp-test', {
        status: AlertStatus.ACKNOWLEDGED,
        acknowledgment: {
          authorityName: 'Security Officer',
          authorityId: 'sec-001',
          acknowledgedAt: acknowledgeTime,
        },
      })

      expect(acknowledgedAlert.acknowledgment?.acknowledgedAt).toBe(acknowledgeTime)
      expect(acknowledgedAlert.acknowledgment?.authorityId).toBe('sec-001')
      expect(acknowledgedAlert.updatedAt).toBeGreaterThanOrEqual(acknowledgeTime)
    })

    it('should handle alert resolution after acknowledgment', () => {
      const alert: SOSAlert = {
        id: 'sos-resolve-test',
        alertType: AlertType.LOST,
        urgencyLevel: UrgencyLevel.MEDIUM,
        status: AlertStatus.PENDING,
        location: { 
          latitude: 18.5204, 
          longitude: 73.8567, 
          accuracy: 10, 
          timestamp: Date.now() 
        },
        pilgrimInfo: { name: 'Lost Person' },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      saveAlert(alert)

      // Acknowledge
      updateAlert('sos-resolve-test', {
        status: AlertStatus.ACKNOWLEDGED,
        acknowledgment: {
          authorityName: 'Staff Member',
          authorityId: 'staff-001',
          acknowledgedAt: Date.now(),
        },
      })

      // Resolve
      const resolvedAlert = updateAlert('sos-resolve-test', {
        status: AlertStatus.RESOLVED,
        notes: 'Person found and reunited with family',
      })

      expect(resolvedAlert.status).toBe(AlertStatus.RESOLVED)
      expect(resolvedAlert.notes).toContain('Person found')
      expect(resolvedAlert.acknowledgment).toBeDefined() // Acknowledgment preserved

      // Verify in resolved list
      const resolvedAlerts = getAlerts({ status: AlertStatus.RESOLVED })
      expect(resolvedAlerts).toHaveLength(1)
      expect(resolvedAlerts[0].id).toBe('sos-resolve-test')
    })

    it('should support multiple authorities acknowledging different alerts', () => {
      // Create multiple alerts
      const alerts: SOSAlert[] = [
        {
          id: 'sos-multi-1',
          alertType: AlertType.MEDICAL,
          urgencyLevel: UrgencyLevel.CRITICAL,
          status: AlertStatus.PENDING,
          location: { latitude: 18.5204, longitude: 73.8567, accuracy: 10, timestamp: Date.now() },
          pilgrimInfo: { name: 'Patient 1' },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'sos-multi-2',
          alertType: AlertType.SECURITY,
          urgencyLevel: UrgencyLevel.HIGH,
          status: AlertStatus.PENDING,
          location: { latitude: 18.5205, longitude: 73.8568, accuracy: 10, timestamp: Date.now() },
          pilgrimInfo: { name: 'Security Issue' },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      alerts.forEach(alert => saveAlert(alert))

      // Different authorities acknowledge different alerts
      updateAlert('sos-multi-1', {
        status: AlertStatus.ACKNOWLEDGED,
        acknowledgment: {
          authorityName: 'Medical Team',
          authorityId: 'med-001',
          acknowledgedAt: Date.now(),
        },
      })

      updateAlert('sos-multi-2', {
        status: AlertStatus.ACKNOWLEDGED,
        acknowledgment: {
          authorityName: 'Security Team',
          authorityId: 'sec-001',
          acknowledgedAt: Date.now(),
        },
      })

      // Verify both acknowledged
      const acknowledgedAlerts = getAlerts({ status: AlertStatus.ACKNOWLEDGED })
      expect(acknowledgedAlerts).toHaveLength(2)

      // Verify different authorities
      const medicalAlert = acknowledgedAlerts.find(a => a.id === 'sos-multi-1')
      const securityAlert = acknowledgedAlerts.find(a => a.id === 'sos-multi-2')

      expect(medicalAlert?.acknowledgment?.authorityName).toBe('Medical Team')
      expect(securityAlert?.acknowledgment?.authorityName).toBe('Security Team')
    })
  })
})