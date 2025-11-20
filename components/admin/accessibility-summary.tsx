'use client';

import { useEffect, useState } from 'react';
import { Accessibility, Users, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { AccessibilityMetrics } from '@/lib/types/accessibility-analytics';
import {
  getDailyMetrics,
  getUtilizationAlerts,
} from '@/lib/services/monitoring-service';

export default function AccessibilitySummary() {
  const [metrics, setMetrics] = useState<AccessibilityMetrics | null>(null);
  const [alerts, setAlerts] = useState<number>(0);

  useEffect(() => {
    // Load latest metrics
    const dailyMetrics = getDailyMetrics();
    if (dailyMetrics.length > 0) {
      setMetrics(dailyMetrics[0]);
    }

    // Load active alerts
    const activeAlerts = getUtilizationAlerts(false);
    setAlerts(activeAlerts.length);
  }, []);

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Accessibility className="w-5 h-5 text-primary" />
          Accessibility Services
        </h2>
        <Link href="/admin/accessibility">
          <Button variant="ghost" size="sm">
            View Details
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      {metrics ? (
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-background/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-muted-foreground">Priority Slots</span>
              </div>
              <p className="text-xl font-bold text-foreground">
                {Math.round(metrics.prioritySlotUtilization.utilizationRate)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.prioritySlotUtilization.total} used today
              </p>
            </div>

            <div className="p-4 bg-background/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-xs text-muted-foreground">Time Saved</span>
              </div>
              <p className="text-xl font-bold text-green-400">
                {metrics.averageWaitTimes.difference} min
              </p>
              <p className="text-xs text-muted-foreground mt-1">vs general slots</p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Category Breakdown
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                Elderly: {metrics.prioritySlotUtilization.elderly}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Differently-abled: {metrics.prioritySlotUtilization.differentlyAbled}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Wheelchair: {metrics.prioritySlotUtilization.wheelchairUser}
              </Badge>
            </div>
          </div>

          {/* Alerts */}
          {alerts > 0 && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400">
                {alerts} utilization alert{alerts > 1 ? 's' : ''} need attention
              </span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No accessibility data available</p>
      )}
    </Card>
  );
}
