'use client';

import { useState, useEffect } from 'react';
import {
  Accessibility,
  TrendingUp,
  Clock,
  Users,
  MapPin,
  Bell,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/admin/admin-layout';
import UtilizationReports from '@/components/admin/utilization-reports';
import type { AccessibilityMetrics } from '@/lib/types/accessibility-analytics';
import {
  getDailyMetrics,
  getUtilizationAlerts,
  getRealTimeStats,
} from '@/lib/services/monitoring-service';

export default function AccessibilityDashboard() {
  const [metrics, setMetrics] = useState<AccessibilityMetrics | null>(null);
  const [alerts, setAlerts] = useState<number>(0);
  const [realTimeStats, setRealTimeStats] = useState({
    activePrioritySlots: 0,
    assistanceRequests: 0,
    routeRecalculations: 0,
  });

  useEffect(() => {
    // Load latest metrics
    const dailyMetrics = getDailyMetrics();
    if (dailyMetrics.length > 0) {
      setMetrics(dailyMetrics[0]);
    }

    // Load active alerts
    const activeAlerts = getUtilizationAlerts(false);
    setAlerts(activeAlerts.length);

    // Load real-time stats
    const stats = getRealTimeStats();
    setRealTimeStats(stats);
  }, []);

  const summaryMetrics = [
    {
      label: 'Priority Slot Utilization',
      value: metrics ? `${Math.round(metrics.prioritySlotUtilization.utilizationRate)}%` : '0%',
      change: metrics ? `${metrics.prioritySlotUtilization.total} slots used` : 'No data',
      icon: Users,
      color: 'text-blue-400',
    },
    {
      label: 'Active Priority Slots',
      value: realTimeStats.activePrioritySlots.toString(),
      change: 'Currently active',
      icon: Clock,
      color: 'text-green-400',
    },
    {
      label: 'Assistance Requests',
      value: metrics ? metrics.assistanceRequests.toString() : '0',
      change: 'Today',
      icon: Bell,
      color: 'text-yellow-400',
    },
    {
      label: 'Active Alerts',
      value: alerts.toString(),
      change: alerts > 0 ? 'Needs attention' : 'All clear',
      icon: AlertCircle,
      color: alerts > 0 ? 'text-red-400' : 'text-green-400',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Accessibility className="w-8 h-8 text-primary" />
              Accessibility Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor priority access and accessibility services
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="px-3 py-1">
              {metrics ? new Date(metrics.date).toLocaleDateString() : 'No data'}
            </Badge>
          </div>
        </div>

        {/* Summary Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card
                key={metric.label}
                className="bg-card/50 border-border/50 backdrop-blur-sm p-5 hover:border-primary/30 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  </div>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <p className={`text-xs font-medium ${metric.color}`}>{metric.change}</p>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Utilization by Category */}
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Utilization by Category
            </h2>
            {metrics ? (
              <div className="space-y-4">
                <UtilizationBar
                  label="Elderly"
                  count={metrics.prioritySlotUtilization.elderly}
                  total={metrics.prioritySlotUtilization.total}
                  color="bg-blue-500"
                />
                <UtilizationBar
                  label="Differently-abled"
                  count={metrics.prioritySlotUtilization.differentlyAbled}
                  total={metrics.prioritySlotUtilization.total}
                  color="bg-green-500"
                />
                <UtilizationBar
                  label="Wheelchair User"
                  count={metrics.prioritySlotUtilization.wheelchairUser}
                  total={metrics.prioritySlotUtilization.total}
                  color="bg-purple-500"
                />
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No utilization data available</p>
            )}
          </Card>

          {/* Wait Time Comparison */}
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Wait Time Comparison
            </h2>
            {metrics ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Priority Slots</p>
                    <p className="text-2xl font-bold text-green-400">
                      {metrics.averageWaitTimes.prioritySlots} min
                    </p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">General Slots</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {metrics.averageWaitTimes.generalSlots} min
                    </p>
                  </div>
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">Time Saved</p>
                  <p className="text-xl font-bold text-primary">
                    {metrics.averageWaitTimes.difference} minutes faster
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No wait time data available</p>
            )}
          </Card>

          {/* Route Metrics */}
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Route Optimization
            </h2>
            {metrics ? (
              <div className="space-y-4">
                <MetricRow
                  label="Accessible Routes Generated"
                  value={metrics.routeMetrics.accessibleRoutesGenerated}
                />
                <MetricRow
                  label="Route Recalculations"
                  value={metrics.routeMetrics.recalculations}
                />
                <MetricRow
                  label="Avg Recalculation Time"
                  value={`${metrics.routeMetrics.averageRecalculationTime.toFixed(2)}s`}
                  highlight={metrics.routeMetrics.averageRecalculationTime > 2}
                />
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No route data available</p>
            )}
          </Card>

          {/* Notification Metrics */}
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notification Performance
            </h2>
            {metrics ? (
              <div className="space-y-4">
                <MetricRow label="Sent" value={metrics.notificationMetrics.sent} />
                <MetricRow
                  label="Delivered"
                  value={metrics.notificationMetrics.delivered}
                  percentage={
                    metrics.notificationMetrics.sent > 0
                      ? (metrics.notificationMetrics.delivered / metrics.notificationMetrics.sent) * 100
                      : 0
                  }
                />
                <MetricRow
                  label="Read"
                  value={metrics.notificationMetrics.read}
                  percentage={
                    metrics.notificationMetrics.delivered > 0
                      ? (metrics.notificationMetrics.read / metrics.notificationMetrics.delivered) * 100
                      : 0
                  }
                />
                <MetricRow
                  label="Action Taken"
                  value={metrics.notificationMetrics.actionTaken}
                  percentage={
                    metrics.notificationMetrics.read > 0
                      ? (metrics.notificationMetrics.actionTaken / metrics.notificationMetrics.read) * 100
                      : 0
                  }
                />
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No notification data available</p>
            )}
          </Card>
        </div>

        {/* Utilization Reports */}
        <UtilizationReports />
      </div>
    </AdminLayout>
  );
}

// Helper Components

function UtilizationBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm text-muted-foreground">
          {count} ({Math.round(percentage)}%)
        </span>
      </div>
      <div className="w-full bg-background/50 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function MetricRow({
  label,
  value,
  percentage,
  highlight = false,
}: {
  label: string;
  value: number | string;
  percentage?: number;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-bold ${highlight ? 'text-yellow-400' : 'text-foreground'}`}>
          {value}
        </span>
        {percentage !== undefined && (
          <Badge variant="secondary" className="text-xs">
            {Math.round(percentage)}%
          </Badge>
        )}
      </div>
    </div>
  );
}
