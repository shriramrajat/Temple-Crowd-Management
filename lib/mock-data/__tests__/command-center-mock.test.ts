/**
 * Tests for Command Center Mock Data Generator
 */

import {
  generateMockZones,
  generateMockAlerts,
  generateMockFootfallData,
  generateMockWarnings,
  generateRandomZoneUpdate,
  generateRandomAlert,
} from '../command-center-mock';

describe('Command Center Mock Data', () => {
  describe('generateMockZones', () => {
    it('should generate 8 zones', () => {
      const zones = generateMockZones();
      expect(zones).toHaveLength(8);
    });

    it('should have valid zone structure', () => {
      const zones = generateMockZones();
      const zone = zones[0];
      
      expect(zone).toHaveProperty('id');
      expect(zone).toHaveProperty('name');
      expect(zone).toHaveProperty('coordinates');
      expect(zone).toHaveProperty('currentOccupancy');
      expect(zone).toHaveProperty('maxCapacity');
      expect(zone).toHaveProperty('densityLevel');
      expect(zone).toHaveProperty('densityThreshold');
      expect(zone).toHaveProperty('lastUpdated');
    });

    it('should have valid density levels', () => {
      const zones = generateMockZones();
      const validLevels = ['low', 'medium', 'high', 'critical'];
      
      zones.forEach(zone => {
        expect(validLevels).toContain(zone.densityLevel);
      });
    });
  });

  describe('generateMockAlerts', () => {
    it('should generate specified number of alerts', () => {
      const alerts = generateMockAlerts(10);
      expect(alerts).toHaveLength(10);
    });

    it('should have valid alert structure', () => {
      const alerts = generateMockAlerts(5);
      const alert = alerts[0];
      
      expect(alert).toHaveProperty('id');
      expect(alert).toHaveProperty('timestamp');
      expect(alert).toHaveProperty('severity');
      expect(alert).toHaveProperty('zoneId');
      expect(alert).toHaveProperty('zoneName');
      expect(alert).toHaveProperty('type');
      expect(alert).toHaveProperty('message');
      expect(alert).toHaveProperty('acknowledged');
    });

    it('should sort alerts by timestamp descending', () => {
      const alerts = generateMockAlerts(10);
      
      for (let i = 0; i < alerts.length - 1; i++) {
        expect(alerts[i].timestamp.getTime()).toBeGreaterThanOrEqual(
          alerts[i + 1].timestamp.getTime()
        );
      }
    });
  });

  describe('generateMockFootfallData', () => {
    it('should generate hourly data with 60 points', () => {
      const data = generateMockFootfallData('hourly');
      expect(data).toHaveLength(60);
    });

    it('should generate daily data with 24 points', () => {
      const data = generateMockFootfallData('daily');
      expect(data).toHaveLength(24);
    });

    it('should generate weekly data with 168 points', () => {
      const data = generateMockFootfallData('weekly');
      expect(data).toHaveLength(168); // 7 days * 24 hours
    });

    it('should include zoneId when provided', () => {
      const data = generateMockFootfallData('hourly', 'zone-1');
      
      data.forEach(point => {
        expect(point.zoneId).toBe('zone-1');
      });
    });

    it('should have valid footfall structure', () => {
      const data = generateMockFootfallData('hourly');
      const point = data[0];
      
      expect(point).toHaveProperty('timestamp');
      expect(point).toHaveProperty('count');
      expect(point.count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generateMockWarnings', () => {
    it('should generate warnings for high/critical zones', () => {
      const warnings = generateMockWarnings();
      
      warnings.forEach(warning => {
        expect(warning.currentDensity).toBeGreaterThan(warning.threshold);
      });
    });

    it('should have valid warning structure', () => {
      const warnings = generateMockWarnings();
      
      if (warnings.length > 0) {
        const warning = warnings[0];
        
        expect(warning).toHaveProperty('id');
        expect(warning).toHaveProperty('zoneId');
        expect(warning).toHaveProperty('zoneName');
        expect(warning).toHaveProperty('currentDensity');
        expect(warning).toHaveProperty('threshold');
        expect(warning).toHaveProperty('timestamp');
        expect(warning).toHaveProperty('status');
        expect(warning.status).toBe('active');
      }
    });
  });

  describe('generateRandomZoneUpdate', () => {
    it('should generate valid zone update', () => {
      const update = generateRandomZoneUpdate();
      
      expect(update).toHaveProperty('zoneId');
      expect(update).toHaveProperty('occupancy');
      expect(update).toHaveProperty('densityLevel');
      expect(update).toHaveProperty('timestamp');
    });

    it('should have valid density level', () => {
      const update = generateRandomZoneUpdate();
      const validLevels = ['low', 'medium', 'high', 'critical'];
      
      expect(validLevels).toContain(update.densityLevel);
    });
  });

  describe('generateRandomAlert', () => {
    it('should generate valid alert', () => {
      const alert = generateRandomAlert();
      
      expect(alert).toHaveProperty('id');
      expect(alert).toHaveProperty('timestamp');
      expect(alert).toHaveProperty('severity');
      expect(alert).toHaveProperty('zoneId');
      expect(alert).toHaveProperty('zoneName');
      expect(alert).toHaveProperty('type');
      expect(alert).toHaveProperty('message');
      expect(alert.acknowledged).toBe(false);
    });

    it('should have valid severity', () => {
      const alert = generateRandomAlert();
      const validSeverities = ['info', 'warning', 'critical'];
      
      expect(validSeverities).toContain(alert.severity);
    });
  });
});
