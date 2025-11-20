/**
 * System Health Dashboard Page
 * 
 * Displays system health metrics and service status indicators.
 * Requirements: 2.4
 */

import { SystemHealthMonitor } from '@/components/admin/crowd-risk/system-health-monitor';

export default function HealthDashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
        <p className="text-muted-foreground">
          Monitor system health, service status, and performance metrics
        </p>
      </div>

      <SystemHealthMonitor />
    </div>
  );
}
