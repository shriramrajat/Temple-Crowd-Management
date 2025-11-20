/**
 * Example usage of CommandCenterFootfall component
 * 
 * This file demonstrates how to integrate the Footfall Graph component
 * into the Command Center Dashboard.
 */

'use client';

import { useState } from 'react';
import CommandCenterFootfall from './command-center-footfall';
import { useCommandCenterData } from '@/hooks/use-command-center-data';
import { TimeRange } from '@/lib/types/command-center';

export default function FootfallGraphExample() {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('hourly');

  // Connect to real-time data hook
  const { zones, footfallData, isLoading } = useCommandCenterData({
    zoneId: selectedZoneId || undefined,
    timeRange,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-[600px]">
      <CommandCenterFootfall
        zones={zones}
        initialData={footfallData}
        zoneId={selectedZoneId}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onZoneChange={setSelectedZoneId}
      />
    </div>
  );
}
