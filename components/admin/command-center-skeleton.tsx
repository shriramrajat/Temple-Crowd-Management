/**
 * Command Center Loading Skeletons
 * 
 * Loading skeleton components for the Command Center Dashboard.
 * Provides visual feedback during initial data fetch.
 */

'use client';

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Map skeleton component
 */
export function MapSkeleton() {
  return (
    <div className="w-full h-full bg-card rounded-lg border border-primary/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
      <Skeleton className="w-full h-[calc(100%-60px)] rounded-lg" />
    </div>
  );
}

/**
 * Alerts skeleton component
 */
export function AlertsSkeleton() {
  return (
    <div className="w-full h-full bg-card rounded-lg border border-primary/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 rounded-lg border border-primary/20">
            <div className="flex items-start gap-3 mb-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Footfall graph skeleton component
 */
export function FootfallSkeleton() {
  return (
    <div className="w-full h-full bg-card rounded-lg border border-primary/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center space-y-2">
          <Skeleton className="h-4 w-20 mx-auto" />
          <Skeleton className="h-8 w-16 mx-auto" />
        </div>
        <div className="text-center space-y-2">
          <Skeleton className="h-4 w-20 mx-auto" />
          <Skeleton className="h-8 w-16 mx-auto" />
        </div>
        <div className="text-center space-y-2">
          <Skeleton className="h-4 w-20 mx-auto" />
          <Skeleton className="h-8 w-16 mx-auto" />
        </div>
      </div>
      <Skeleton className="w-full h-[calc(100%-140px)] rounded-lg" />
    </div>
  );
}

/**
 * Zone status skeleton component
 */
export function ZonesSkeleton() {
  return (
    <div className="w-full bg-card rounded-lg border border-primary/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-6 w-28" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-primary/20">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
            <div className="flex-1 flex items-center gap-3">
              <Skeleton className="h-2 flex-1 rounded-full" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Full dashboard skeleton
 */
export function DashboardSkeleton() {
  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>

      {/* Desktop layout skeleton */}
      <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-[500px] lg:h-[600px]">
            <MapSkeleton />
          </div>
          <div className="h-[400px]">
            <FootfallSkeleton />
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="h-[500px] lg:h-[1016px]">
            <AlertsSkeleton />
          </div>
        </div>
      </div>

      {/* Mobile layout skeleton */}
      <div className="md:hidden space-y-4">
        <Skeleton className="h-[400px] rounded-lg" />
        <Skeleton className="h-[400px] rounded-lg" />
        <Skeleton className="h-[400px] rounded-lg" />
      </div>

      {/* Zone status skeleton */}
      <div className="hidden md:block">
        <ZonesSkeleton />
      </div>
    </div>
  );
}
