/**
 * End-to-End Integration Test: Route Optimization with Different Profiles
 * 
 * Tests route calculation with various accessibility profiles
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { saveProfile } from '@/lib/services/accessibility-service';
import { calculateRoute } from '@/lib/services/route-optimizer-service';
import { MOCK_LOCATIONS } from '@/lib/mock-data/path-segments-mock';
import type { AccessibilityProfile } from '@/lib/types/accessibility';
import type { RouteCalculationOptions } from '@/lib/services/route-optimizer-service';

describe('Route Optimization Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should calculate wheelchair-accessible route', () => {
    const profile: AccessibilityProfile = {
      pilgrimId: 'test-001',
      categories: ['wheelchair-user'],
      mobilitySpeed: 'slow',
      requiresAssistance: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const options: RouteCalculationOptions = {
      startPoint: MOCK_LOCATIONS.mainEntrance,
      endPoint: MOCK_LOCATIONS.templeMain,
      accessibilityProfile: profile,
      preferWomenOnly: false,
      includeAlternatives: true,
    };

    const route = calculateRoute(options);

    expect(route).toBeDefined();
    expect(route!.segments.length).toBeGreaterThan(0);

    // Verify all segments are wheelchair accessible
    route!.segments.forEach(segment => {
      expect(segment.accessibility.wheelchairAccessible).toBe(true);
      expect(segment.accessibility.hasStairs).toBe(false);
      expect(segment.accessibility.maxIncline).toBeLessThanOrEqual(5);
      expect(segment.accessibility.minWidth).toBeGreaterThanOrEqual(1.5);
    });

    // Verify route has accessible amenities
    const hasAccessibleRestrooms = route!.segments.some(segment =>
      segment.amenities.some(amenity => 
        amenity.type === 'restroom' && 
        amenity.accessible &&
        amenity.distanceFromPath <= 200
      )
    );
    expect(hasAccessibleRestrooms).toBe(true);
  });

  it('should calculate women-only route when preferred', () => {
    const profile: AccessibilityProfile = {
      pilgrimId: 'test-002',
      categories: ['women-only-route'],
      mobilitySpeed: 'normal',
      requiresAssistance: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const options: RouteCalculationOptions = {
      startPoint: MOCK_LOCATIONS.mainEntrance,
      endPoint: MOCK_LOCATIONS.templeMain,
      accessibilityProfile: profile,
      preferWomenOnly: true,
      includeAlternatives: true,
    };

    const route = calculateRoute(options);

    expect(route).toBeDefined();
    
    // Should prioritize women-only segments
    const womenOnlySegments = route!.segments.filter(s => s.isWomenOnly);
    expect(womenOnlySegments.length).toBeGreaterThan(0);
  });

  it('should adjust travel time for different mobility speeds', () => {
    const slowProfile: AccessibilityProfile = {
      pilgrimId: 'test-003',
      categories: ['elderly'],
      mobilitySpeed: 'slow',
      requiresAssistance: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const normalProfile: AccessibilityProfile = {
      ...slowProfile,
      pilgrimId: 'test-004',
      mobilitySpeed: 'normal',
    };

    const slowOptions: RouteCalculationOptions = {
      startPoint: MOCK_LOCATIONS.mainEntrance,
      endPoint: MOCK_LOCATIONS.templeMain,
      accessibilityProfile: slowProfile,
    };

    const normalOptions: RouteCalculationOptions = {
      ...slowOptions,
      accessibilityProfile: normalProfile,
    };

    const slowRoute = calculateRoute(slowOptions);
    const normalRoute = calculateRoute(normalOptions);

    expect(slowRoute).toBeDefined();
    expect(normalRoute).toBeDefined();

    // Slow mobility should have longer estimated duration
    expect(slowRoute!.estimatedDuration).toBeGreaterThan(normalRoute!.estimatedDuration);
  });

  it('should provide alternative routes', () => {
    const profile: AccessibilityProfile = {
      pilgrimId: 'test-005',
      categories: ['differently-abled'],
      mobilitySpeed: 'moderate',
      requiresAssistance: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const options: RouteCalculationOptions = {
      startPoint: MOCK_LOCATIONS.mainEntrance,
      endPoint: MOCK_LOCATIONS.templeMain,
      accessibilityProfile: profile,
      includeAlternatives: true,
    };

    const route = calculateRoute(options);

    expect(route).toBeDefined();
    expect(route!.alternativeRoutes).toBeDefined();
    expect(Array.isArray(route!.alternativeRoutes)).toBe(true);

    // Each alternative should have a reason
    route!.alternativeRoutes.forEach(alt => {
      expect(alt.reason).toBeDefined();
      expect(alt.route).toBeDefined();
      expect(alt.route.segments.length).toBeGreaterThan(0);
    });
  });

  it('should calculate route with multiple accessibility needs', () => {
    const profile: AccessibilityProfile = {
      pilgrimId: 'test-006',
      categories: ['elderly', 'wheelchair-user', 'differently-abled'],
      mobilitySpeed: 'slow',
      requiresAssistance: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const options: RouteCalculationOptions = {
      startPoint: MOCK_LOCATIONS.mainEntrance,
      endPoint: MOCK_LOCATIONS.templeMain,
      accessibilityProfile: profile,
      includeAlternatives: false,
    };

    const route = calculateRoute(options);

    expect(route).toBeDefined();
    expect(route!.accessibilityScore).toBeGreaterThan(0);
    expect(route!.accessibilityScore).toBeLessThanOrEqual(100);

    // Should meet all accessibility requirements
    route!.segments.forEach(segment => {
      expect(segment.accessibility.wheelchairAccessible).toBe(true);
      expect(segment.accessibility.hasStairs).toBe(false);
    });
  });

  it('should handle route recalculation', () => {
    const profile: AccessibilityProfile = {
      pilgrimId: 'test-007',
      categories: ['wheelchair-user'],
      mobilitySpeed: 'moderate',
      requiresAssistance: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const options: RouteCalculationOptions = {
      startPoint: MOCK_LOCATIONS.mainEntrance,
      endPoint: MOCK_LOCATIONS.templeMain,
      accessibilityProfile: profile,
    };

    // Calculate initial route
    const initialRoute = calculateRoute(options);
    expect(initialRoute).toBeDefined();

    // Recalculate (simulating condition change)
    const recalculatedRoute = calculateRoute(options);
    expect(recalculatedRoute).toBeDefined();

    // Both routes should be valid
    expect(initialRoute!.segments.length).toBeGreaterThan(0);
    expect(recalculatedRoute!.segments.length).toBeGreaterThan(0);
  });
});
