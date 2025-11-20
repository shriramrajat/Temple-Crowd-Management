/**
 * Mock Path Segment Data
 * 
 * This file contains mock data for path segments, amenities, and routes
 * used for testing and development of the route optimization system.
 */

import type { PathSegment, Amenity, Coordinates } from '@/lib/types/route-optimization';

/**
 * Mock coordinates for key locations
 */
export const MOCK_LOCATIONS = {
  mainEntrance: { latitude: 18.5204, longitude: 73.8567 } as Coordinates,
  templeMain: { latitude: 18.5214, longitude: 73.8577 } as Coordinates,
  womenOnlyArea: { latitude: 18.5209, longitude: 73.8572 } as Coordinates,
  accessibleEntrance: { latitude: 18.5202, longitude: 73.8565 } as Coordinates,
  restArea1: { latitude: 18.5207, longitude: 73.8570 } as Coordinates,
  restArea2: { latitude: 18.5211, longitude: 73.8574 } as Coordinates,
  exitPoint: { latitude: 18.5216, longitude: 73.8580 } as Coordinates,
};

/**
 * Mock amenities
 */
export const MOCK_AMENITIES: Amenity[] = [
  {
    type: 'restroom',
    location: { latitude: 18.5206, longitude: 73.8569 },
    accessible: true,
    distanceFromPath: 50,
  },
  {
    type: 'seating',
    location: { latitude: 18.5208, longitude: 73.8571 },
    accessible: true,
    distanceFromPath: 30,
  },
  {
    type: 'water',
    location: { latitude: 18.5210, longitude: 73.8573 },
    accessible: true,
    distanceFromPath: 40,
  },
  {
    type: 'assistance-point',
    location: { latitude: 18.5212, longitude: 73.8575 },
    accessible: true,
    distanceFromPath: 20,
  },
  {
    type: 'medical',
    location: { latitude: 18.5205, longitude: 73.8568 },
    accessible: true,
    distanceFromPath: 60,
  },
  {
    type: 'restroom',
    location: { latitude: 18.5213, longitude: 73.8576 },
    accessible: false,
    distanceFromPath: 150,
  },
];

/**
 * Mock path segments
 */
export const MOCK_PATH_SEGMENTS: PathSegment[] = [
  // Segment 1: Main entrance to rest area 1 (wheelchair accessible)
  {
    id: 'seg-001',
    startPoint: MOCK_LOCATIONS.mainEntrance,
    endPoint: MOCK_LOCATIONS.restArea1,
    distance: 120,
    estimatedTime: 3,
    accessibility: {
      hasStairs: false,
      maxIncline: 2,
      minWidth: 2.0,
      surfaceType: 'paved',
      hasHandrails: true,
      wheelchairAccessible: true,
    },
    isWomenOnly: false,
    amenities: [MOCK_AMENITIES[0], MOCK_AMENITIES[4]],
  },
  // Segment 2: Rest area 1 to women-only area (accessible, women-only)
  {
    id: 'seg-002',
    startPoint: MOCK_LOCATIONS.restArea1,
    endPoint: MOCK_LOCATIONS.womenOnlyArea,
    distance: 80,
    estimatedTime: 2,
    accessibility: {
      hasStairs: false,
      maxIncline: 3,
      minWidth: 1.8,
      surfaceType: 'paved',
      hasHandrails: true,
      wheelchairAccessible: true,
    },
    isWomenOnly: true,
    amenities: [MOCK_AMENITIES[1]],
  },
  // Segment 3: Women-only area to temple main (accessible)
  {
    id: 'seg-003',
    startPoint: MOCK_LOCATIONS.womenOnlyArea,
    endPoint: MOCK_LOCATIONS.templeMain,
    distance: 100,
    estimatedTime: 2.5,
    accessibility: {
      hasStairs: false,
      maxIncline: 4,
      minWidth: 1.6,
      surfaceType: 'paved',
      hasHandrails: true,
      wheelchairAccessible: true,
    },
    isWomenOnly: false,
    amenities: [MOCK_AMENITIES[2]],
  },
  // Segment 4: Main entrance to rest area 2 (has stairs, not accessible)
  {
    id: 'seg-004',
    startPoint: MOCK_LOCATIONS.mainEntrance,
    endPoint: MOCK_LOCATIONS.restArea2,
    distance: 90,
    estimatedTime: 2,
    accessibility: {
      hasStairs: true,
      maxIncline: 15,
      minWidth: 1.2,
      surfaceType: 'paved',
      hasHandrails: true,
      wheelchairAccessible: false,
    },
    isWomenOnly: false,
    amenities: [],
  },
  // Segment 5: Rest area 2 to temple main (steep incline, not accessible)
  {
    id: 'seg-005',
    startPoint: MOCK_LOCATIONS.restArea2,
    endPoint: MOCK_LOCATIONS.templeMain,
    distance: 110,
    estimatedTime: 2.5,
    accessibility: {
      hasStairs: false,
      maxIncline: 8,
      minWidth: 1.5,
      surfaceType: 'mixed',
      hasHandrails: false,
      wheelchairAccessible: false,
    },
    isWomenOnly: false,
    amenities: [MOCK_AMENITIES[3]],
  },
  // Segment 6: Accessible entrance to rest area 1 (fully accessible)
  {
    id: 'seg-006',
    startPoint: MOCK_LOCATIONS.accessibleEntrance,
    endPoint: MOCK_LOCATIONS.restArea1,
    distance: 150,
    estimatedTime: 4,
    accessibility: {
      hasStairs: false,
      maxIncline: 1,
      minWidth: 2.5,
      surfaceType: 'paved',
      hasHandrails: true,
      wheelchairAccessible: true,
    },
    isWomenOnly: false,
    amenities: [MOCK_AMENITIES[0], MOCK_AMENITIES[1]],
  },
  // Segment 7: Temple main to exit (accessible)
  {
    id: 'seg-007',
    startPoint: MOCK_LOCATIONS.templeMain,
    endPoint: MOCK_LOCATIONS.exitPoint,
    distance: 70,
    estimatedTime: 2,
    accessibility: {
      hasStairs: false,
      maxIncline: 2,
      minWidth: 2.0,
      surfaceType: 'paved',
      hasHandrails: true,
      wheelchairAccessible: true,
    },
    isWomenOnly: false,
    amenities: [MOCK_AMENITIES[5]],
  },
  // Segment 8: Rest area 1 to temple main (direct, narrow path)
  {
    id: 'seg-008',
    startPoint: MOCK_LOCATIONS.restArea1,
    endPoint: MOCK_LOCATIONS.templeMain,
    distance: 95,
    estimatedTime: 2.5,
    accessibility: {
      hasStairs: false,
      maxIncline: 4,
      minWidth: 1.4,
      surfaceType: 'paved',
      hasHandrails: false,
      wheelchairAccessible: false,
    },
    isWomenOnly: false,
    amenities: [MOCK_AMENITIES[2]],
  },
];

/**
 * Get all path segments
 */
export function getAllPathSegments(): PathSegment[] {
  return MOCK_PATH_SEGMENTS;
}

/**
 * Get path segments by accessibility criteria
 */
export function getAccessiblePathSegments(): PathSegment[] {
  return MOCK_PATH_SEGMENTS.filter(segment => segment.accessibility.wheelchairAccessible);
}

/**
 * Get women-only path segments
 */
export function getWomenOnlyPathSegments(): PathSegment[] {
  return MOCK_PATH_SEGMENTS.filter(segment => segment.isWomenOnly);
}

/**
 * Get path segment by ID
 */
export function getPathSegmentById(id: string): PathSegment | undefined {
  return MOCK_PATH_SEGMENTS.find(segment => segment.id === id);
}

/**
 * Get amenities within distance from a point
 */
export function getAmenitiesNearPoint(
  point: Coordinates,
  maxDistance: number = 200
): Amenity[] {
  return MOCK_AMENITIES.filter(amenity => {
    const distance = calculateDistance(point, amenity.location);
    return distance <= maxDistance;
  });
}

/**
 * Calculate distance between two coordinates (simplified Haversine)
 */
function calculateDistance(point1: Coordinates, point2: Coordinates): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
