/**
 * Example usage of CommandCenterAlerts component
 * 
 * This file demonstrates how to integrate the Alert System component
 * into the Command Center Dashboard.
 */

'use client';

import { useCommandCenterData } from '@/hooks/use-command-center-data';
import CommandCenterAlerts from './command-center-alerts';

export default function CommandCenterAlertsExample() {
  // Get real-time data from the hook
  const { alerts } = useCommandCenterData();

  // Handle alert click - highlight zone on map
  const handleAlertClick = (alert: any) => {
    console.log('Alert clicked:', alert);
    // In the actual dashboard, this would:
    // 1. Update selectedZone state
    // 2. Highlight the zone on the map
    // 3. Optionally scroll to the zone
  };

  // Handle alert acknowledgment
  const handleAlertAcknowledge = (alertId: string) => {
    console.log('Alert acknowledged:', alertId);
    // In the actual dashboard, this would:
    // 1. Send acknowledgment to backend API
    // 2. Update alert state to acknowledged
  };

  return (
    <div className="h-[600px]">
      <CommandCenterAlerts
        alerts={alerts}
        maxAlerts={50}
        onAlertClick={handleAlertClick}
        onAlertAcknowledge={handleAlertAcknowledge}
      />
    </div>
  );
}
