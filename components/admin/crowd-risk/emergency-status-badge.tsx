'use client';

/**
 * Emergency Status Badge Component
 * 
 * A compact status indicator showing emergency mode state
 * Can be placed in headers, navigation bars, or dashboards
 * 
 * Requirements: 5.4, 5.5
 */

import { useState, useEffect } from 'react';
import { EmergencyMode, EmergencyTrigger } from '@/lib/crowd-risk/types';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmergencyStatusBadgeProps {
  className?: string;
  showWhenInactive?: boolean;
}

export function EmergencyStatusBadge({ 
  className,
  showWhenInactive = false 
}: EmergencyStatusBadgeProps) {
  const [emergencyState, setEmergencyState] = useState<EmergencyMode | null>(null);

  // Mock emergency state - will be replaced with actual EmergencyModeManager in task 9.1
  useEffect(() => {
    // TODO: Replace with actual EmergencyModeManager subscription
    // const manager = getEmergencyModeManager();
    // const unsubscribe = manager.onEmergencyStateChange((state) => {
    //   setEmergencyState(state);
    // });
    // return unsubscribe;
  }, []);

  const isActive = emergencyState?.active || false;

  // Don't render if inactive and showWhenInactive is false
  if (!isActive && !showWhenInactive) {
    return null;
  }

  return (
    <Badge
      variant={isActive ? 'destructive' : 'secondary'}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1',
        isActive && 'animate-pulse',
        className
      )}
    >
      {isActive ? (
        <>
          <AlertTriangle className="h-3.5 w-3.5" />
          <span className="font-semibold">EMERGENCY MODE</span>
        </>
      ) : (
        <>
          <CheckCircle className="h-3.5 w-3.5" />
          <span>Normal Operations</span>
        </>
      )}
    </Badge>
  );
}
