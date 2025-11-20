/**
 * Route Optimization Validation Schemas
 * 
 * This file contains Zod validation schemas for runtime type checking
 * and data validation for accessible route calculation and optimization.
 */

import { z } from 'zod';

/**
 * Surface type enum schema
 */
export const SurfaceTypeSchema = z.enum(['paved', 'unpaved', 'mixed']);

/**
 * Amenity type enum schema
 */
export const AmenityTypeSchema = z.enum(['restroom', 'seating', 'water', 'assistance-point', 'medical']);

/**
 * Coordinates schema with validation
 */
export const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
});

/**
 * Path accessibility schema with validation rules
 */
export const PathAccessibilitySchema = z.object({
  hasStairs: z.boolean(),
  maxIncline: z.number().nonnegative('Incline cannot be negative'),
  minWidth: z.number().positive('Width must be positive'),
  surfaceType: SurfaceTypeSchema,
  hasHandrails: z.boolean(),
  wheelchairAccessible: z.boolean(),
}).refine(
  (data: { wheelchairAccessible: boolean; hasStairs: boolean; maxIncline: number; minWidth: number }) => {
    // If wheelchair accessible, must meet criteria
    if (data.wheelchairAccessible) {
      return !data.hasStairs && data.maxIncline <= 5 && data.minWidth >= 1.5;
    }
    return true;
  },
  {
    message: 'Wheelchair accessible paths must have no stairs, incline ≤5°, and width ≥1.5m',
    path: ['wheelchairAccessible'],
  }
);

/**
 * Amenity schema with validation
 */
export const AmenitySchema = z.object({
  type: AmenityTypeSchema,
  location: CoordinatesSchema,
  accessible: z.boolean(),
  distanceFromPath: z.number().nonnegative('Distance cannot be negative'),
});

/**
 * Path segment schema with validation rules
 */
export const PathSegmentSchema = z.object({
  id: z.string().min(1, 'Segment ID is required'),
  startPoint: CoordinatesSchema,
  endPoint: CoordinatesSchema,
  distance: z.number().positive('Distance must be positive'),
  estimatedTime: z.number().positive('Estimated time must be positive'),
  accessibility: PathAccessibilitySchema,
  isWomenOnly: z.boolean(),
  amenities: z.array(AmenitySchema),
});

/**
 * Optimized route schema (forward declaration for recursive type)
 */
export const OptimizedRouteSchema: z.ZodType<any> = z.lazy(() => z.object({
  routeId: z.string().min(1, 'Route ID is required'),
  segments: z.array(PathSegmentSchema).min(1, 'Route must have at least one segment'),
  totalDistance: z.number().nonnegative('Total distance cannot be negative'),
  estimatedDuration: z.number().positive('Estimated duration must be positive'),
  accessibilityScore: z.number().min(0).max(100, 'Accessibility score must be between 0 and 100'),
  amenitiesCount: z.number().int().nonnegative('Amenities count cannot be negative'),
  isWomenOnlyRoute: z.boolean(),
  alternativeRoutes: z.array(AlternativeRouteSchema),
}));

/**
 * Alternative route schema
 */
export const AlternativeRouteSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
  route: OptimizedRouteSchema,
});

/**
 * Route request schema (for API input validation)
 */
export const RouteRequestSchema = z.object({
  startPoint: CoordinatesSchema,
  endPoint: CoordinatesSchema,
  pilgrimId: z.string().min(1, 'Pilgrim ID is required'),
  accessibilityCategories: z.array(z.string()).optional(),
  preferWomenOnly: z.boolean().optional(),
});

/**
 * Array schemas for bulk data validation
 */
export const PathSegmentsArraySchema = z.array(PathSegmentSchema);
export const AmenitiesArraySchema = z.array(AmenitySchema);
