/**
 * Path Data Service
 * 
 * This service manages path segment data, real-time path conditions,
 * and amenity information for route optimization.
 */

import type { PathSegment, Amenity, Coordinates } from '@/lib/types/route-optimization';
import {
  getAllPathSegments,
  getAccessiblePathSegments,
  getWomenOnlyPathSegments,
  getPathSegmentById,
  getAmenitiesNearPoint,
  MOCK_AMENITIES,
} from '@/lib/mock-data/path-segments-mock';

/**
 * Path condition update interface
 */
export interface PathConditionUpdate {
  segmentId: string;
  hasStairs?: boolean;
  maxIncline?: number;
  minWidth?: number;
  wheelchairAccessible?: boolean;
  isWomenOnly?: boolean;
  timestamp: Date;
}

/**
 * In-memory storage for path condition updates
 */
const pathConditionUpdates: Map<string, PathConditionUpdate[]> = new Map();

/**
 * Get all path segments
 */
export function getPathSegments(): PathSegment[] {
  return getAllPathSegments();
}

/**
 * Get path segments filtered by accessibility requirements
 */
export function getPathSegmentsByAccessibility(
  requireWheelchairAccessible: boolean = false,
  requireWomenOnly: boolean = false
): PathSegment[] {
  let segments = getAllPathSegments();

  if (requireWheelchairAccessible) {
    segments = segments.filter(seg => seg.accessibility.wheelchairAccessible);
  }

  if (requireWomenOnly) {
    segments = segments.filter(seg => seg.isWomenOnly);
  }

  return segments;
}

/**
 * Get path segment by ID with applied condition updates
 */
export function getPathSegmentWithUpdates(segmentId: string): PathSegment | null {
  const segment = getPathSegmentById(segmentId);
  if (!segment) return null;

  // Apply any condition updates
  const updates = pathConditionUpdates.get(segmentId);
  if (!updates || updates.length === 0) {
    return segment;
  }

  // Apply the most recent update
  const latestUpdate = updates[updates.length - 1];
  return {
    ...segment,
    accessibility: {
      ...segment.accessibility,
      ...(latestUpdate.hasStairs !== undefined && { hasStairs: latestUpdate.hasStairs }),
      ...(latestUpdate.maxIncline !== undefined && { maxIncline: latestUpdate.maxIncline }),
      ...(latestUpdate.minWidth !== undefined && { minWidth: latestUpdate.minWidth }),
      ...(latestUpdate.wheelchairAccessible !== undefined && { 
        wheelchairAccessible: latestUpdate.wheelchairAccessible 
      }),
    },
    ...(latestUpdate.isWomenOnly !== undefined && { isWomenOnly: latestUpdate.isWomenOnly }),
  };
}

/**
 * Update path conditions for real-time changes
 * (e.g., maintenance, crowding, temporary obstacles)
 */
export function updatePathConditions(update: Omit<PathConditionUpdate, 'timestamp'>): boolean {
  const segment = getPathSegmentById(update.segmentId);
  if (!segment) {
    console.error(`Path segment ${update.segmentId} not found`);
    return false;
  }

  const fullUpdate: PathConditionUpdate = {
    ...update,
    timestamp: new Date(),
  };

  const existingUpdates = pathConditionUpdates.get(update.segmentId) || [];
  existingUpdates.push(fullUpdate);
  pathConditionUpdates.set(update.segmentId, existingUpdates);

  return true;
}

/**
 * Get accessible amenities within specified distance from a point
 * Default: restrooms within 200m as per requirements
 */
export function getAccessibleAmenities(
  point: Coordinates,
  maxDistance: number = 200,
  requireAccessible: boolean = true
): Amenity[] {
  const nearbyAmenities = getAmenitiesNearPoint(point, maxDistance);
  
  if (requireAccessible) {
    return nearbyAmenities.filter(amenity => amenity.accessible);
  }
  
  return nearbyAmenities;
}

/**
 * Get accessible restrooms within 200m (specific requirement)
 */
export function getAccessibleRestrooms(point: Coordinates): Amenity[] {
  return getAccessibleAmenities(point, 200, true).filter(
    amenity => amenity.type === 'restroom'
  );
}

/**
 * Get women-only zones and segments
 */
export function getWomenOnlyZones(): PathSegment[] {
  return getWomenOnlyPathSegments();
}

/**
 * Check if a path segment is currently in a women-only zone
 */
export function isInWomenOnlyZone(segmentId: string): boolean {
  const segment = getPathSegmentWithUpdates(segmentId);
  return segment?.isWomenOnly || false;
}

/**
 * Get path segments that connect two points
 */
export function getConnectingSegments(
  startPoint: Coordinates,
  endPoint: Coordinates,
  tolerance: number = 0.0001 // ~11 meters
): PathSegment[] {
  const segments = getAllPathSegments();
  
  return segments.filter(segment => {
    const startsNear = 
      Math.abs(segment.startPoint.latitude - startPoint.latitude) < tolerance &&
      Math.abs(segment.startPoint.longitude - startPoint.longitude) < tolerance;
    
    const endsNear = 
      Math.abs(segment.endPoint.latitude - endPoint.latitude) < tolerance &&
      Math.abs(segment.endPoint.longitude - endPoint.longitude) < tolerance;
    
    return startsNear || endsNear;
  });
}

/**
 * Get all amenities along a path segment
 */
export function getAmenitiesAlongSegment(segmentId: string): Amenity[] {
  const segment = getPathSegmentById(segmentId);
  return segment?.amenities || [];
}

/**
 * Clear path condition updates (for testing or reset)
 */
export function clearPathConditionUpdates(segmentId?: string): void {
  if (segmentId) {
    pathConditionUpdates.delete(segmentId);
  } else {
    pathConditionUpdates.clear();
  }
}

/**
 * Get path condition update history
 */
export function getPathConditionHistory(segmentId: string): PathConditionUpdate[] {
  return pathConditionUpdates.get(segmentId) || [];
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(point1: Coordinates, point2: Coordinates): number {
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
