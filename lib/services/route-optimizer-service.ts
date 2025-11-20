/**
 * Route Optimizer Service
 * 
 * This service calculates optimal accessible routes for pilgrims based on
 * their accessibility profiles, avoiding obstacles and prioritizing safety.
 */

import type { 
  PathSegment, 
  OptimizedRoute, 
  AlternativeRoute, 
  Coordinates 
} from '@/lib/types/route-optimization';
import type { AccessibilityProfile, MobilitySpeed } from '@/lib/types/accessibility';
import {
  getPathSegments,
  getPathSegmentsByAccessibility,
  getAccessibleAmenities,
  calculateDistance,
} from './path-data-service';

/**
 * Route calculation options
 */
export interface RouteCalculationOptions {
  startPoint: Coordinates;
  endPoint: Coordinates;
  accessibilityProfile?: AccessibilityProfile;
  preferWomenOnly?: boolean;
  includeAlternatives?: boolean;
}

/**
 * Last route calculation timestamp for rate limiting
 */
let lastCalculationTime: Date | null = null;

/**
 * Mobility speed multipliers for travel time estimation
 */
const MOBILITY_SPEED_MULTIPLIERS: Record<MobilitySpeed, number> = {
  slow: 2.0,      // 2x normal time
  moderate: 1.5,  // 1.5x normal time
  normal: 1.0,    // 1x normal time
};

/**
 * Calculate optimal route based on accessibility requirements
 */
export function calculateRoute(options: RouteCalculationOptions): OptimizedRoute | null {
  // Check 2-minute constraint for recalculation
  if (lastCalculationTime) {
    const timeSinceLastCalc = Date.now() - lastCalculationTime.getTime();
    if (timeSinceLastCalc < 120000) { // 2 minutes in milliseconds
      console.warn('Route recalculation requested too soon. Minimum 2 minutes between calculations.');
    }
  }
  lastCalculationTime = new Date();

  const { startPoint, endPoint, accessibilityProfile, preferWomenOnly, includeAlternatives } = options;

  // Get available path segments
  let availableSegments = getPathSegments();

  // Apply accessibility filtering
  if (accessibilityProfile) {
    availableSegments = filterSegmentsByAccessibility(
      availableSegments,
      accessibilityProfile
    );
  }

  // Find route using simplified pathfinding
  const route = findRoute(startPoint, endPoint, availableSegments, accessibilityProfile, preferWomenOnly);

  if (!route) {
    return null;
  }

  // Calculate route metrics
  const optimizedRoute = calculateRouteMetrics(route, accessibilityProfile);

  // Generate alternative routes if requested
  if (includeAlternatives) {
    optimizedRoute.alternativeRoutes = generateAlternativeRoutes(
      startPoint,
      endPoint,
      availableSegments,
      accessibilityProfile,
      preferWomenOnly,
      route
    );
  }

  return optimizedRoute;
}

/**
 * Filter path segments by accessibility requirements
 * Requirements: no stairs, inclines ≤5°, width ≥1.5m
 */
function filterSegmentsByAccessibility(
  segments: PathSegment[],
  profile: AccessibilityProfile
): PathSegment[] {
  const requiresWheelchairAccess = profile.categories.includes('wheelchair-user');
  const requiresDifferentlyAbled = profile.categories.includes('differently-abled');

  if (requiresWheelchairAccess || requiresDifferentlyAbled) {
    return segments.filter(segment => {
      const { hasStairs, maxIncline, minWidth, wheelchairAccessible } = segment.accessibility;
      
      // Apply obstacle avoidance logic
      return (
        !hasStairs &&
        maxIncline <= 5 &&
        minWidth >= 1.5 &&
        wheelchairAccessible
      );
    });
  }

  return segments;
}

/**
 * Find route between two points using available segments
 * Simplified pathfinding algorithm
 */
function findRoute(
  startPoint: Coordinates,
  endPoint: Coordinates,
  availableSegments: PathSegment[],
  profile?: AccessibilityProfile,
  preferWomenOnly?: boolean
): PathSegment[] | null {
  // Find segments that start near the start point
  const startSegments = availableSegments.filter(seg => 
    calculateDistance(seg.startPoint, startPoint) < 100 // within 100m
  );

  if (startSegments.length === 0) {
    return null;
  }

  // Simple greedy pathfinding: choose segments that get closer to destination
  const route: PathSegment[] = [];
  let currentPoint = startPoint;
  let attempts = 0;
  const maxAttempts = 10;

  while (calculateDistance(currentPoint, endPoint) > 50 && attempts < maxAttempts) {
    // Find next best segment
    const nextSegment = findNextSegment(
      currentPoint,
      endPoint,
      availableSegments,
      route,
      preferWomenOnly
    );

    if (!nextSegment) {
      break;
    }

    route.push(nextSegment);
    currentPoint = nextSegment.endPoint;
    attempts++;
  }

  return route.length > 0 ? route : null;
}

/**
 * Find next best segment in route
 */
function findNextSegment(
  currentPoint: Coordinates,
  endPoint: Coordinates,
  availableSegments: PathSegment[],
  usedSegments: PathSegment[],
  preferWomenOnly?: boolean
): PathSegment | null {
  const usedIds = new Set(usedSegments.map(s => s.id));
  
  // Find segments starting near current point
  const candidates = availableSegments.filter(seg => 
    !usedIds.has(seg.id) &&
    calculateDistance(seg.startPoint, currentPoint) < 100
  );

  if (candidates.length === 0) {
    return null;
  }

  // Score each candidate
  const scored = candidates.map(seg => {
    let score = 0;
    
    // Distance to destination (lower is better)
    const distToEnd = calculateDistance(seg.endPoint, endPoint);
    score -= distToEnd;
    
    // Prefer women-only routes if requested
    if (preferWomenOnly && seg.isWomenOnly) {
      score += 1000;
    }
    
    // Prefer segments with amenities
    score += seg.amenities.length * 100;
    
    // Prefer wheelchair accessible
    if (seg.accessibility.wheelchairAccessible) {
      score += 500;
    }
    
    return { segment: seg, score };
  });

  // Return highest scoring segment
  scored.sort((a, b) => b.score - a.score);
  return scored[0].segment;
}

/**
 * Calculate route metrics and scoring
 */
function calculateRouteMetrics(
  segments: PathSegment[],
  profile?: AccessibilityProfile
): OptimizedRoute {
  const totalDistance = segments.reduce((sum, seg) => sum + seg.distance, 0);
  
  // Calculate base estimated duration
  let estimatedDuration = segments.reduce((sum, seg) => sum + seg.estimatedTime, 0);
  
  // Apply mobility speed adjustment
  if (profile) {
    const multiplier = MOBILITY_SPEED_MULTIPLIERS[profile.mobilitySpeed];
    estimatedDuration *= multiplier;
  }
  
  // Calculate accessibility score (0-100)
  const accessibilityScore = calculateAccessibilityScore(segments);
  
  // Count amenities
  const amenitiesCount = segments.reduce(
    (count, seg) => count + seg.amenities.filter(a => a.accessible).length,
    0
  );
  
  // Check if entire route is women-only
  const isWomenOnlyRoute = segments.every(seg => seg.isWomenOnly);
  
  return {
    routeId: `route-${Date.now()}`,
    segments,
    totalDistance,
    estimatedDuration,
    accessibilityScore,
    amenitiesCount,
    isWomenOnlyRoute,
    alternativeRoutes: [],
  };
}

/**
 * Calculate accessibility score for a route (0-100)
 */
function calculateAccessibilityScore(segments: PathSegment[]): number {
  if (segments.length === 0) return 0;
  
  let score = 0;
  
  segments.forEach(seg => {
    const { hasStairs, maxIncline, minWidth, hasHandrails, wheelchairAccessible } = seg.accessibility;
    
    // Base score for wheelchair accessible
    if (wheelchairAccessible) score += 20;
    
    // No stairs bonus
    if (!hasStairs) score += 15;
    
    // Low incline bonus
    if (maxIncline <= 3) score += 15;
    else if (maxIncline <= 5) score += 10;
    
    // Wide path bonus
    if (minWidth >= 2.0) score += 15;
    else if (minWidth >= 1.5) score += 10;
    
    // Handrails bonus
    if (hasHandrails) score += 10;
    
    // Paved surface bonus
    if (seg.accessibility.surfaceType === 'paved') score += 10;
    
    // Amenities bonus
    score += Math.min(seg.amenities.length * 5, 15);
  });
  
  // Average score across segments
  const avgScore = score / segments.length;
  
  // Normalize to 0-100
  return Math.min(Math.round(avgScore), 100);
}

/**
 * Generate alternative routes with explanations
 */
function generateAlternativeRoutes(
  startPoint: Coordinates,
  endPoint: Coordinates,
  availableSegments: PathSegment[],
  profile?: AccessibilityProfile,
  preferWomenOnly?: boolean,
  primaryRoute?: PathSegment[]
): AlternativeRoute[] {
  const alternatives: AlternativeRoute[] = [];
  
  // Alternative 1: Fastest route (ignore women-only preference)
  if (preferWomenOnly) {
    const fastestRoute = findRoute(startPoint, endPoint, availableSegments, profile, false);
    if (fastestRoute && !areRoutesEqual(fastestRoute, primaryRoute)) {
      alternatives.push({
        reason: 'Fastest route (not women-only)',
        route: calculateRouteMetrics(fastestRoute, profile),
      });
    }
  }
  
  // Alternative 2: Most accessible route (highest accessibility score)
  const accessibleSegments = availableSegments.filter(seg => 
    seg.accessibility.wheelchairAccessible && seg.accessibility.maxIncline <= 3
  );
  const mostAccessibleRoute = findRoute(startPoint, endPoint, accessibleSegments, profile, preferWomenOnly);
  if (mostAccessibleRoute && !areRoutesEqual(mostAccessibleRoute, primaryRoute)) {
    alternatives.push({
      reason: 'Most accessible route (lowest inclines)',
      route: calculateRouteMetrics(mostAccessibleRoute, profile),
    });
  }
  
  // Alternative 3: Route with most amenities
  const amenityRichRoute = findRouteWithMostAmenities(
    startPoint,
    endPoint,
    availableSegments,
    profile,
    preferWomenOnly
  );
  if (amenityRichRoute && !areRoutesEqual(amenityRichRoute, primaryRoute)) {
    alternatives.push({
      reason: 'Route with most accessible facilities',
      route: calculateRouteMetrics(amenityRichRoute, profile),
    });
  }
  
  return alternatives;
}

/**
 * Find route prioritizing amenities
 */
function findRouteWithMostAmenities(
  startPoint: Coordinates,
  endPoint: Coordinates,
  availableSegments: PathSegment[],
  profile?: AccessibilityProfile,
  preferWomenOnly?: boolean
): PathSegment[] | null {
  // Sort segments by amenity count
  const sortedByAmenities = [...availableSegments].sort(
    (a, b) => b.amenities.length - a.amenities.length
  );
  
  return findRoute(startPoint, endPoint, sortedByAmenities, profile, preferWomenOnly);
}

/**
 * Check if two routes are equal
 */
function areRoutesEqual(route1?: PathSegment[], route2?: PathSegment[]): boolean {
  if (!route1 || !route2) return false;
  if (route1.length !== route2.length) return false;
  
  return route1.every((seg, idx) => seg.id === route2[idx].id);
}

/**
 * Identify accessible entry and exit points
 */
export function getAccessibleEntryPoints(): Coordinates[] {
  const segments = getPathSegmentsByAccessibility(true, false);
  
  // Get unique start points from accessible segments
  const entryPoints = new Map<string, Coordinates>();
  
  segments.forEach(seg => {
    const key = `${seg.startPoint.latitude},${seg.startPoint.longitude}`;
    if (!entryPoints.has(key)) {
      entryPoints.set(key, seg.startPoint);
    }
  });
  
  return Array.from(entryPoints.values());
}

/**
 * Identify accessible exit points
 */
export function getAccessibleExitPoints(): Coordinates[] {
  const segments = getPathSegmentsByAccessibility(true, false);
  
  // Get unique end points from accessible segments
  const exitPoints = new Map<string, Coordinates>();
  
  segments.forEach(seg => {
    const key = `${seg.endPoint.latitude},${seg.endPoint.longitude}`;
    if (!exitPoints.has(key)) {
      exitPoints.set(key, seg.endPoint);
    }
  });
  
  return Array.from(exitPoints.values());
}

/**
 * Recalculate route (enforces 2-minute constraint)
 */
export function recalculateRoute(options: RouteCalculationOptions): OptimizedRoute | null {
  return calculateRoute(options);
}

/**
 * Reset calculation timer (for testing)
 */
export function resetCalculationTimer(): void {
  lastCalculationTime = null;
}
