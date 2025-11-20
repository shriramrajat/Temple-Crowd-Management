/**
 * SOS Performance Tests
 * 
 * Tests performance metrics for the SOS system:
 * - Location capture time (target: < 3 seconds)
 * - Alert submission time (target: < 5 seconds)
 * - UI responsiveness (target: < 100ms)
 * 
 * Requirements: 1.1, 1.2
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  startMeasurement,
  measureAsync,
  measureSync,
  getPerformanceReport,
  PerformanceMetric,
  PERFORMANCE_THRESHOLDS,
} from '@/lib/utils/performance-monitor';

describe('SOS Performance Monitoring', () => {
  beforeEach(() => {
    // Clear any existing measurements
    vi.clearAllMocks();
  });

  describe('Performance Measurement', () => {
    it('should measure synchronous operations', () => {
      const result = measureSync(
        PerformanceMetric.UI_INTERACTION,
        () => {
          // Simulate UI operation
          let sum = 0;
          for (let i = 0; i < 1000; i++) {
            sum += i;
          }
          return sum;
        },
        { component: 'test' }
      );

      expect(result).toBe(499500);
      
      const report = getPerformanceReport(PerformanceMetric.UI_INTERACTION);
      expect(report.measurements.length).toBeGreaterThan(0);
      expect(report.measurements[0].success).toBe(true);
    });

    it('should measure asynchronous operations', async () => {
      const result = await measureAsync(
        PerformanceMetric.API_REQUEST,
        async () => {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 50));
          return { success: true };
        },
        { endpoint: 'test' }
      );

      expect(result).toEqual({ success: true });
      
      const report = getPerformanceReport(PerformanceMetric.API_REQUEST);
      expect(report.measurements.length).toBeGreaterThan(0);
      expect(report.measurements[0].duration).toBeGreaterThanOrEqual(50);
    });

    it('should track failed operations', async () => {
      try {
        await measureAsync(
          PerformanceMetric.API_REQUEST,
          async () => {
            throw new Error('Test error');
          }
        );
      } catch (error) {
        // Expected error
      }

      const report = getPerformanceReport(PerformanceMetric.API_REQUEST);
      const failedMeasurement = report.measurements.find(m => !m.success);
      expect(failedMeasurement).toBeDefined();
      expect(failedMeasurement?.success).toBe(false);
    });
  });

  describe('Performance Thresholds', () => {
    it('should have correct threshold for location capture', () => {
      expect(PERFORMANCE_THRESHOLDS[PerformanceMetric.LOCATION_CAPTURE]).toBe(3000);
    });

    it('should have correct threshold for alert submission', () => {
      expect(PERFORMANCE_THRESHOLDS[PerformanceMetric.ALERT_SUBMISSION]).toBe(5000);
    });

    it('should have correct threshold for UI interaction', () => {
      expect(PERFORMANCE_THRESHOLDS[PerformanceMetric.UI_INTERACTION]).toBe(100);
    });

    it('should detect threshold violations', () => {
      const endMeasurement = startMeasurement(PerformanceMetric.UI_INTERACTION);
      
      // Simulate slow operation
      const start = Date.now();
      while (Date.now() - start < 150) {
        // Busy wait
      }
      
      endMeasurement(true);

      const report = getPerformanceReport(PerformanceMetric.UI_INTERACTION);
      const lastMeasurement = report.measurements[report.measurements.length - 1];
      
      expect(lastMeasurement.exceededThreshold).toBe(true);
      expect(lastMeasurement.duration).toBeGreaterThan(100);
    });
  });

  describe('Performance Reports', () => {
    it('should calculate statistics correctly', async () => {
      // Create multiple measurements
      for (let i = 0; i < 5; i++) {
        await measureAsync(
          PerformanceMetric.API_REQUEST,
          async () => {
            await new Promise(resolve => setTimeout(resolve, 10 * (i + 1)));
            return true;
          }
        );
      }

      const report = getPerformanceReport(PerformanceMetric.API_REQUEST);
      
      expect(report.measurements.length).toBeGreaterThanOrEqual(5);
      expect(report.average).toBeGreaterThan(0);
      expect(report.min).toBeLessThanOrEqual(report.average);
      expect(report.max).toBeGreaterThanOrEqual(report.average);
      expect(report.p95).toBeGreaterThan(0);
      expect(report.successRate).toBeGreaterThan(0);
    });

    it('should track success rate', async () => {
      // Successful operation
      await measureAsync(
        PerformanceMetric.API_REQUEST,
        async () => true
      );

      // Failed operation
      try {
        await measureAsync(
          PerformanceMetric.API_REQUEST,
          async () => {
            throw new Error('Test');
          }
        );
      } catch (error) {
        // Expected
      }

      const report = getPerformanceReport(PerformanceMetric.API_REQUEST);
      expect(report.successRate).toBeLessThan(100);
      expect(report.successRate).toBeGreaterThan(0);
    });
  });

  describe('Location Capture Performance', () => {
    it('should complete within 3 seconds threshold', async () => {
      const mockGeolocation = {
        getCurrentPosition: vi.fn((success) => {
          setTimeout(() => {
            success({
              coords: {
                latitude: 40.7128,
                longitude: -74.0060,
                accuracy: 10,
              },
              timestamp: Date.now(),
            });
          }, 100); // Simulate 100ms location capture
        }),
      };

      vi.stubGlobal('navigator', {
        geolocation: mockGeolocation,
      });

      const duration = await measureAsync(
        PerformanceMetric.LOCATION_CAPTURE,
        async () => {
          return new Promise((resolve) => {
            mockGeolocation.getCurrentPosition((position: any) => {
              resolve(position);
            });
          });
        }
      );

      const report = getPerformanceReport(PerformanceMetric.LOCATION_CAPTURE);
      const lastMeasurement = report.measurements[report.measurements.length - 1];
      
      expect(lastMeasurement.duration).toBeLessThan(3000);
      expect(lastMeasurement.exceededThreshold).toBe(false);
    });
  });

  describe('Alert Submission Performance', () => {
    it('should complete within 5 seconds threshold', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, alertId: 'test-123' }),
      });

      vi.stubGlobal('fetch', mockFetch);

      await measureAsync(
        PerformanceMetric.ALERT_SUBMISSION,
        async () => {
          const response = await fetch('/api/sos/alerts', {
            method: 'POST',
            body: JSON.stringify({
              alertType: 'medical',
              urgencyLevel: 'high',
              location: {
                latitude: 40.7128,
                longitude: -74.0060,
                accuracy: 10,
                timestamp: Date.now(),
              },
            }),
          });
          return response.json();
        }
      );

      const report = getPerformanceReport(PerformanceMetric.ALERT_SUBMISSION);
      const lastMeasurement = report.measurements[report.measurements.length - 1];
      
      expect(lastMeasurement.duration).toBeLessThan(5000);
      expect(lastMeasurement.success).toBe(true);
    });
  });

  describe('UI Responsiveness', () => {
    it('should respond within 100ms threshold', () => {
      measureSync(
        PerformanceMetric.UI_INTERACTION,
        () => {
          // Simulate button click handler
          const element = { classList: { add: vi.fn() } };
          element.classList.add('active');
          return element;
        },
        { component: 'SOSButton', action: 'click' }
      );

      const report = getPerformanceReport(PerformanceMetric.UI_INTERACTION);
      const lastMeasurement = report.measurements[report.measurements.length - 1];
      
      expect(lastMeasurement.duration).toBeLessThan(100);
      expect(lastMeasurement.exceededThreshold).toBe(false);
    });

    it('should detect slow UI operations', () => {
      measureSync(
        PerformanceMetric.UI_INTERACTION,
        () => {
          // Simulate slow operation
          const start = Date.now();
          while (Date.now() - start < 150) {
            // Busy wait to exceed threshold
          }
        },
        { component: 'SlowComponent' }
      );

      const report = getPerformanceReport(PerformanceMetric.UI_INTERACTION);
      const lastMeasurement = report.measurements[report.measurements.length - 1];
      
      expect(lastMeasurement.duration).toBeGreaterThan(100);
      expect(lastMeasurement.exceededThreshold).toBe(true);
    });
  });
});
