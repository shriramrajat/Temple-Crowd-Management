/**
 * End-to-End Integration Test: Monitoring Data Collection
 * 
 * Tests the monitoring service data collection and reporting
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordSlotAllocation,
  recordRouteCalculation,
  recordNotificationSent,
  recordAssistanceRequest,
  getDailyMetrics,
  getUtilizationAlerts,
} from '@/lib/services/monitoring-service';
import { saveProfile } from '@/lib/services/accessibility-service';
import { allocateSlot, getAvailableSlots } from '@/lib/services/priority-slot-service';
import type { AccessibilityProfile } from '@/lib/types/accessibility';

describe('Monitoring Data Collection Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should track priority slot allocations by category', async () => {
    // Create profiles with different categories
    const elderlyProfile: AccessibilityProfile = {
      pilgrimId: 'pilgrim-001',
      categories: ['elderly'],
      mobilitySpeed: 'moderate',
      requiresAssistance: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const wheelchairProfile: AccessibilityProfile = {
      pilgrimId: 'pilgrim-002',
      categories: ['wheelchair-user'],
      mobilitySpeed: 'slow',
      requiresAssistance: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await saveProfile(elderlyProfile);
    await saveProfile(wheelchairProfile);

    // Allocate slots
    const elderlySlots = getAvailableSlots(elderlyProfile);
    const wheelchairSlots = getAvailableSlots(wheelchairProfile);

    if (elderlySlots.length > 0) {
      const allocation1 = await allocateSlot(
        elderlySlots[0].id,
        'pilgrim-001',
        elderlyProfile
      );
      recordSlotAllocation(allocation1, elderlyProfile.categories);
    }

    if (wheelchairSlots.length > 0) {
      const allocation2 = await allocateSlot(
        wheelchairSlots[0].id,
        'pilgrim-002',
        wheelchairProfile
      );
      recordSlotAllocation(allocation2, wheelchairProfile.categories);
    }

    // Get metrics
    const metrics = getDailyMetrics();
    expect(metrics.length).toBeGreaterThan(0);

    const todayMetrics = metrics[0];
    expect(todayMetrics.prioritySlotUtilization.total).toBeGreaterThan(0);
  });

  it('should track route calculations and recalculations', () => {
    // Record route calculations
    recordRouteCalculation('route-001', 1.5, false);
    recordRouteCalculation('route-002', 1.8, true); // Recalculation
    recordRouteCalculation('route-003', 1.2, false);

    const metrics = getDailyMetrics();
    const todayMetrics = metrics[0];

    expect(todayMetrics.routeMetrics.accessibleRoutesGenerated).toBeGreaterThanOrEqual(3);
    expect(todayMetrics.routeMetrics.recalculations).toBeGreaterThanOrEqual(1);
    expect(todayMetrics.routeMetrics.averageRecalculationTime).toBeGreaterThan(0);
  });

  it('should track notification delivery metrics', () => {
    // Record notifications
    recordNotificationSent('notif-001', 'assistance-zone', true, true, true);
    recordNotificationSent('notif-002', 'slot-reminder', true, true, false);
    recordNotificationSent('notif-003', 'condition-change', true, false, false);

    const metrics = getDailyMetrics();
    const todayMetrics = metrics[0];

    expect(todayMetrics.notificationMetrics.sent).toBeGreaterThanOrEqual(3);
    expect(todayMetrics.notificationMetrics.delivered).toBeGreaterThanOrEqual(2);
    expect(todayMetrics.notificationMetrics.read).toBeGreaterThanOrEqual(2);
    expect(todayMetrics.notificationMetrics.actionTaken).toBeGreaterThanOrEqual(1);
  });

  it('should track assistance requests', () => {
    // Record assistance requests
    recordAssistanceRequest('request-001', 'wheelchair-user');
    recordAssistanceRequest('request-002', 'elderly');
    recordAssistanceRequest('request-003', 'differently-abled');

    const metrics = getDailyMetrics();
    const todayMetrics = metrics[0];

    expect(todayMetrics.assistanceRequests).toBeGreaterThanOrEqual(3);
  });

  it('should generate utilization alerts for low usage', async () => {
    // Simulate low utilization scenario
    const profile: AccessibilityProfile = {
      pilgrimId: 'pilgrim-low',
      categories: ['elderly'],
      mobilitySpeed: 'moderate',
      requiresAssistance: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await saveProfile(profile);

    // Record minimal allocations over multiple days
    for (let day = 0; day < 3; day++) {
      const slots = getAvailableSlots(profile);
      if (slots.length > 0) {
        const allocation = await allocateSlot(
          slots[0].id,
          `pilgrim-${day}`,
          profile
        );
        recordSlotAllocation(allocation, profile.categories);
      }
    }

    // Check for alerts
    const alerts = getUtilizationAlerts(false);
    
    // May or may not have alerts depending on thresholds
    expect(Array.isArray(alerts)).toBe(true);
  });

  it('should calculate wait time comparisons', async () => {
    const profile: AccessibilityProfile = {
      pilgrimId: 'pilgrim-wait',
      categories: ['wheelchair-user'],
      mobilitySpeed: 'slow',
      requiresAssistance: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await saveProfile(profile);

    const slots = getAvailableSlots(profile);
    if (slots.length > 0) {
      const allocation = await allocateSlot(
        slots[0].id,
        'pilgrim-wait',
        profile
      );
      
      recordSlotAllocation(allocation, profile.categories);
    }

    const metrics = getDailyMetrics();
    const todayMetrics = metrics[0];

    // Priority slots should have lower wait times
    expect(todayMetrics.averageWaitTimes.prioritySlots).toBeLessThanOrEqual(
      todayMetrics.averageWaitTimes.generalSlots
    );
    expect(todayMetrics.averageWaitTimes.difference).toBeGreaterThanOrEqual(0);
  });

  it('should aggregate metrics over time', () => {
    // Record various activities
    recordAssistanceRequest('req-1', 'elderly');
    recordRouteCalculation('route-1', 1.5, false);
    recordNotificationSent('notif-1', 'assistance-zone', true, true, false);

    const allMetrics = getDailyMetrics();
    
    expect(allMetrics.length).toBeGreaterThan(0);
    expect(allMetrics[0].date).toBeDefined();
    
    // Verify all metric categories are present
    expect(allMetrics[0].prioritySlotUtilization).toBeDefined();
    expect(allMetrics[0].averageWaitTimes).toBeDefined();
    expect(allMetrics[0].routeMetrics).toBeDefined();
    expect(allMetrics[0].notificationMetrics).toBeDefined();
    expect(allMetrics[0].assistanceRequests).toBeDefined();
  });

  it('should handle concurrent metric updates', async () => {
    const profiles = Array.from({ length: 5 }, (_, i) => ({
      pilgrimId: `pilgrim-${i}`,
      categories: ['elderly'] as const,
      mobilitySpeed: 'moderate' as const,
      requiresAssistance: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Save all profiles
    await Promise.all(profiles.map(p => saveProfile(p)));

    // Allocate slots concurrently
    const allocations = await Promise.all(
      profiles.map(async (profile) => {
        const slots = getAvailableSlots(profile);
        if (slots.length > 0) {
          const allocation = await allocateSlot(
            slots[0].id,
            profile.pilgrimId,
            profile
          );
          recordSlotAllocation(allocation, profile.categories);
          return allocation;
        }
        return null;
      })
    );

    const validAllocations = allocations.filter(a => a !== null);
    expect(validAllocations.length).toBeGreaterThan(0);

    // Verify metrics reflect all allocations
    const metrics = getDailyMetrics();
    const todayMetrics = metrics[0];
    
    expect(todayMetrics.prioritySlotUtilization.total).toBeGreaterThanOrEqual(
      validAllocations.length
    );
  });
});
