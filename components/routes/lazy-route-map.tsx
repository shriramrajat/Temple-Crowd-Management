'use client';

/**
 * Lazy Loaded Route Map Component
 * 
 * Implements lazy loading for the accessible route map to improve initial page load
 */

import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-state';
import type { OptimizedRoute } from '@/lib/types/route-optimization';

// Lazy load the map component
const AccessibleRouteMap = lazy(() => 
  import('./accessible-route-map').then(module => ({
    default: module.AccessibleRouteMap
  }))
);

interface LazyRouteMapProps {
  route: OptimizedRoute;
  onAlternativeSelect?: (index: number) => void;
  showAlternatives?: boolean;
}

export function LazyRouteMap(props: LazyRouteMapProps) {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading map..." />}>
      <AccessibleRouteMap {...props} />
    </Suspense>
  );
}
