/**
 * API Route Tests for SOS Alerts System
 * 
 * Tests alert creation, validation, retrieval, filtering, and acknowledgment flow.
 * Requirements: 1.2, 7.2
 * 
 * @vitest-environment node
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST as createAlert, GET as getAlerts } from '@/app/api/sos/alerts/route';
import { POST as acknowledgeAlert } from '@/app/api/sos/alerts/[id]/acknowledge/route';
import { AlertType, UrgencyLevel, AlertStatus, LocationData } from '@/lib/types/sos';
import { clearAllAlerts } from '@/lib/storage/sos-storage';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Helper function to create a valid location object
function createValidLocation(): LocationData {
  return {
    latitude: 18.5204,
    longitude: 73.8567,
    accuracy: 10,
    address: 'Test Temple, Test City',
    zone: 'Zone A',
    timestamp: Date.now()
  };
}

// Helper function to create a mock NextRequest
function createMockRequest(body?: any, url?: string): any {
  return {
    json: async () => body,
    url: url || 'http://localhost:3000/api/sos/alerts'
  };
}

describe('SOS Alerts API Routes', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    clearAllAlerts();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Test: Alert creation with valid data
   * Requirement: 1.2 - Create and transmit alert within 5 seconds
   */
  describe('POST /api/sos/alerts - Create Alert', () => {
    it('should create alert with valid data', async () => {
      const validAlertData = {
        alertType: AlertType.MEDICAL,
        urgencyLevel: UrgencyLevel.HIGH,
        location: createValidLocation(),
        pilgrimInfo: {
          name: 'John Doe',
          phone: '+1234567890',
          emergencyContact: '+0987654321'
        },
        notes: 'Need immediate medical assistance'
      };

      const request = createMockRequest(validAlertData);
      const response = await createAlert(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.alertId).toBeDefined();
      expect(data.alert).toBeDefined();
      expect(data.alert.alertType).toBe(AlertType.MEDICAL);
      expect(data.alert.urgencyLevel).toBe(UrgencyLevel.HIGH);
      expect(data.alert.status).toBe(AlertStatus.PENDING);
      expect(data.alert.location.latitude).toBe(18.5204);
      expect(data.alert.pilgrimInfo?.name).toBe('John Doe');
    });

    it('should create alert without optional fields', async () => {
      const minimalAlertData = {
        alertType: AlertType.SECURITY,
        urgencyLevel: UrgencyLevel.CRITICAL,
        location: createValidLocation()
      };

      const request = createMockRequest(minimalAlertData);
      const response = await createAlert(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.alertId).toBeDefined();
      expect(data.alert.alertType).toBe(AlertType.SECURITY);
    });

    it('should reject alert with missing required fields', async () => {
      const invalidData = {
        alertType: AlertType.MEDICAL,
        // Missing urgencyLevel and location
      };

      const request = createMockRequest(invalidData);
      const response = await createAlert(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid request data');
      expect(data.details).toBeDefined();
    });

    it('should reject alert with invalid alert type', async () => {
      const invalidData = {
        alertType: 'INVALID_TYPE',
        urgencyLevel: UrgencyLevel.HIGH,
        location: createValidLocation()
      };

      const request = createMockRequest(invalidData);
      const response = await createAlert(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid request data');
    });

    it('should reject alert with invalid location coordinates', async () => {
      const invalidData = {
        alertType: AlertType.MEDICAL,
        urgencyLevel: UrgencyLevel.HIGH,
        location: {
          latitude: 200, // Invalid: > 90
          longitude: 73.8567,
          accuracy: 10,
          timestamp: Date.now()
        }
      };

      const request = createMockRequest(invalidData);
      const response = await createAlert(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject alert with invalid phone number format', async () => {
      const invalidData = {
        alertType: AlertType.MEDICAL,
        urgencyLevel: UrgencyLevel.HIGH,
        location: createValidLocation(),
        pilgrimInfo: {
          name: 'John Doe',
          phone: 'invalid-phone', // Invalid format
        }
      };

      const request = createMockRequest(invalidData);
      const response = await createAlert(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  /**
   * Test: Alert retrieval and filtering
   * Requirement: 5.1, 5.2, 5.3, 5.4, 5.5
   */
  describe('GET /api/sos/alerts - Retrieve Alerts', () => {
    beforeEach(async () => {
      // Create test alerts
      const alerts = [
        {
          alertType: AlertType.MEDICAL,
          urgencyLevel: UrgencyLevel.CRITICAL,
          location: createValidLocation(),
          pilgrimInfo: { name: 'Alice' }
        },
        {
          alertType: AlertType.SECURITY,
          urgencyLevel: UrgencyLevel.HIGH,
          location: createValidLocation(),
          pilgrimInfo: { name: 'Bob' }
        },
        {
          alertType: AlertType.LOST,
          urgencyLevel: UrgencyLevel.MEDIUM,
          location: createValidLocation(),
          pilgrimInfo: { name: 'Charlie' }
        }
      ];

      for (const alert of alerts) {
        await createAlert(createMockRequest(alert));
      }
    });

    it('should retrieve all alerts without filters', async () => {
      const request = createMockRequest(undefined, 'http://localhost:3000/api/sos/alerts');
      const response = await getAlerts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.alerts).toBeDefined();
      expect(data.alerts.length).toBe(3);
      expect(data.count).toBe(3);
    });

    it('should filter alerts by status', async () => {
      const request = createMockRequest(
        undefined,
        'http://localhost:3000/api/sos/alerts?status=pending'
      );
      const response = await getAlerts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.alerts.every((a: any) => a.status === AlertStatus.PENDING)).toBe(true);
    });

    it('should filter alerts by urgency level', async () => {
      const request = createMockRequest(
        undefined,
        'http://localhost:3000/api/sos/alerts?urgencyLevel=critical'
      );
      const response = await getAlerts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.alerts.length).toBe(1);
      expect(data.alerts[0].urgencyLevel).toBe(UrgencyLevel.CRITICAL);
    });

    it('should filter alerts by alert type', async () => {
      const request = createMockRequest(
        undefined,
        'http://localhost:3000/api/sos/alerts?alertType=security'
      );
      const response = await getAlerts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.alerts.length).toBe(1);
      expect(data.alerts[0].alertType).toBe(AlertType.SECURITY);
    });

    it('should filter alerts by multiple criteria', async () => {
      const request = createMockRequest(
        undefined,
        'http://localhost:3000/api/sos/alerts?urgencyLevel=high,critical&status=pending'
      );
      const response = await getAlerts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.alerts.length).toBe(2);
      expect(data.alerts.every((a: any) => 
        [UrgencyLevel.HIGH, UrgencyLevel.CRITICAL].includes(a.urgencyLevel)
      )).toBe(true);
    });

    it('should return empty array when no alerts match filters', async () => {
      const request = createMockRequest(
        undefined,
        'http://localhost:3000/api/sos/alerts?alertType=accident'
      );
      const response = await getAlerts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.alerts.length).toBe(0);
    });

    it('should sort alerts by timestamp (newest first)', async () => {
      const request = createMockRequest(undefined, 'http://localhost:3000/api/sos/alerts');
      const response = await getAlerts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.alerts.length).toBeGreaterThan(1);
      
      // Check that alerts are sorted by createdAt descending
      for (let i = 0; i < data.alerts.length - 1; i++) {
        expect(data.alerts[i].createdAt).toBeGreaterThanOrEqual(data.alerts[i + 1].createdAt);
      }
    });
  });

  /**
   * Test: Alert acknowledgment flow
   * Requirement: 7.2 - Acknowledge alert within 2 seconds
   */
  describe('POST /api/sos/alerts/[id]/acknowledge - Acknowledge Alert', () => {
    let testAlertId: string;

    beforeEach(async () => {
      // Create a test alert
      const alertData = {
        alertType: AlertType.MEDICAL,
        urgencyLevel: UrgencyLevel.CRITICAL,
        location: createValidLocation(),
        pilgrimInfo: { name: 'Test Pilgrim' }
      };

      const request = createMockRequest(alertData);
      const response = await createAlert(request);
      const data = await response.json();
      testAlertId = data.alertId;
    });

    it('should acknowledge alert with valid data', async () => {
      const acknowledgmentData = {
        authorityId: 'auth-123',
        authorityName: 'Temple Security Officer',
        notes: 'Medical team dispatched'
      };

      const request = createMockRequest(acknowledgmentData);
      const response = await acknowledgeAlert(request, { params: { id: testAlertId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.alert).toBeDefined();
      expect(data.alert.status).toBe(AlertStatus.ACKNOWLEDGED);
      expect(data.alert.acknowledgment).toBeDefined();
      expect(data.alert.acknowledgment.authorityId).toBe('auth-123');
      expect(data.alert.acknowledgment.authorityName).toBe('Temple Security Officer');
      expect(data.alert.acknowledgment.acknowledgedAt).toBeDefined();
    });

    it('should acknowledge alert without optional notes', async () => {
      const acknowledgmentData = {
        authorityId: 'auth-456',
        authorityName: 'Medical Staff'
      };

      const request = createMockRequest(acknowledgmentData);
      const response = await acknowledgeAlert(request, { params: { id: testAlertId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.alert.status).toBe(AlertStatus.ACKNOWLEDGED);
    });

    it('should reject acknowledgment with missing authority ID', async () => {
      const invalidData = {
        authorityName: 'Temple Security Officer'
        // Missing authorityId
      };

      const request = createMockRequest(invalidData);
      const response = await acknowledgeAlert(request, { params: { id: testAlertId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid request data');
    });

    it('should reject acknowledgment with invalid authority name', async () => {
      const invalidData = {
        authorityId: 'auth-123',
        authorityName: 'A' // Too short (< 2 characters)
      };

      const request = createMockRequest(invalidData);
      const response = await acknowledgeAlert(request, { params: { id: testAlertId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 404 for non-existent alert', async () => {
      const acknowledgmentData = {
        authorityId: 'auth-123',
        authorityName: 'Temple Security Officer'
      };

      const request = createMockRequest(acknowledgmentData);
      const response = await acknowledgeAlert(request, { params: { id: 'non-existent-id' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Alert not found');
    });

    it('should reject acknowledgment of already acknowledged alert', async () => {
      // First acknowledgment
      const acknowledgmentData = {
        authorityId: 'auth-123',
        authorityName: 'Temple Security Officer'
      };

      const request1 = createMockRequest(acknowledgmentData);
      await acknowledgeAlert(request1, { params: { id: testAlertId } });

      // Second acknowledgment attempt
      const request2 = createMockRequest(acknowledgmentData);
      const response = await acknowledgeAlert(request2, { params: { id: testAlertId } });
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Alert already processed');
    });

    it('should update alert timestamp on acknowledgment', async () => {
      const acknowledgmentData = {
        authorityId: 'auth-123',
        authorityName: 'Temple Security Officer'
      };

      const request = createMockRequest(acknowledgmentData);
      const response = await acknowledgeAlert(request, { params: { id: testAlertId } });
      const data = await response.json();

      expect(data.alert.updatedAt).toBeDefined();
      expect(data.alert.updatedAt).toBeGreaterThanOrEqual(data.alert.createdAt);
    });
  });
});
