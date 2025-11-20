/**
 * Route Optimization Type Definitions
 * 
 * This file contains TypeScript interfaces and types for accessible route
 * calculation and path optimization for pilgrims with mobility needs.
 */

/**
 * Surface type classifications
 */
export type SurfaceType = 'paved' | 'unpaved' | 'mixed';

/**
 * Amenity type classifications
 */
export type AmenityType = 'restroom' | 'seating' | 'water' | 'assistance-point' | 'medical';

/**
 * Geographic coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Path accessibility criteria
 */
export interface PathAccessibility {
  hasStairs: boolean;
  maxIncline: number; // degrees
  minWidth: number; // meters
  surfaceType: SurfaceType;
  hasHandrails: boolean;
  wheelchairAccessible: boolean;
}

/**
 * Amenity along a path
 */
export interface Amenity {
  type: AmenityType;
  location: Coordinates;
  accessible: boolean;
  distanceFromPath: number; // meters
}

/**
 * Path segment with accessibility information
 */
export interface PathSegment {
  id: string;
  startPoint: Coordinates;
  endPoint: Coordinates;
  distance: number; // meters
  estimatedTime: number; // minutes
  accessibility: PathAccessibility;
  isWomenOnly: boolean;
  amenities: Amenity[];
}

/**
 * Alternative route suggestion
 */
export interface AlternativeRoute {
  reason: string;
  route: OptimizedRoute;
}

/**
 * Optimized route with accessibility scoring
 */
export interface OptimizedRoute {
  routeId: string;
  segments: PathSegment[];
  totalDistance: number;
  estimatedDuration: number;
  accessibilityScore: number; // 0-100
  amenitiesCount: number;
  isWomenOnlyRoute: boolean;
  alternativeRoutes: AlternativeRoute[];
}
