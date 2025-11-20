'use client';

/**
 * System Health Monitor Component
 * 
 * Displays real-time system health metrics and service status indicators.
 * Requirements: 2.4
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Bell,
  Radio,
  Zap,
  AlertCircle,
} from 'lucide-react';

/**
 * Service status enum
 */
enum ServiceStatus {
  OPERATIONAL = 'operational',
  DEGRADED = 'degraded',
  DOWN = 'down',
}

/**
 * Health check response type
 */
interface HealthCheckResponse {
  status: ServiceStatus;
  timestamp: number;
  services: {
    densityMonitor: {
      status: ServiceStatus;
      monitoredAreas: number;
      lastUpdate?: number;
    };
    alertEngine: {
      status: ServiceStatus;
      activeAlerts: number;
      totalAlerts: number;
    };
    notifications: {
      status: ServiceStatus;
      deliverySuccessRate: number;
      averageDeliveryTime: number;
      failuresByChannel: Record<string, number>;
    };
    errorHandler: {
      status: ServiceStatus;
      degradedMode: boolean;
      recentErrors: {
        last5Minutes: number;
        last15Minutes: number;
        lastHour: number;
      };
      errorsByCategory: Record<string, number>;
    };
  };
  metrics: {
    notificationDeliveryRate: number;
    dataStreamLatency: number;
    alertProcessingLatency: number;
  };
  alerts: string[];
}

/**
 * System Health Monitor Component
 */
export function SystemHealthMonitor() {
  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Fetch health data
  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/crowd-risk/health');
      
      if (!response.ok) {
        throw new Error('Failed to fetch health data');
      }
      
      const data = await response.json();
      setHealthData(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch health data on mount and every 30 seconds
  useEffect(() => {
    fetchHealthData();
    
    const interval = setInterval(fetchHealthData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Loading health metrics...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error || !healthData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Error loading health data</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || 'Failed to load health data'}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Health</CardTitle>
              <CardDescription>
                Last updated: {lastUpdate?.toLocaleTimeString()}
              </CardDescription>
            </div>
            <StatusBadge status={healthData.status} size="large" />
          </div>
        </CardHeader>
      </Card>

      {/* Health Alerts */}
      {healthData.alerts.length > 0 && (
        <div className="space-y-2">
          {healthData.alerts.map((alert, index) => (
            <Alert 
              key={index} 
              variant={healthData.status === ServiceStatus.DOWN ? 'destructive' : 'default'}
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Health Alert</AlertTitle>
              <AlertDescription>{alert}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Service Status Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Density Monitor */}
        <ServiceCard
          title="Density Monitor"
          icon={<Radio className="h-4 w-4" />}
          status={healthData.services.densityMonitor.status}
          metrics={[
            { label: 'Monitored Areas', value: healthData.services.densityMonitor.monitoredAreas },
          ]}
        />

        {/* Alert Engine */}
        <ServiceCard
          title="Alert Engine"
          icon={<Bell className="h-4 w-4" />}
          status={healthData.services.alertEngine.status}
          metrics={[
            { label: 'Active Alerts', value: healthData.services.alertEngine.activeAlerts },
            { label: 'Total Alerts', value: healthData.services.alertEngine.totalAlerts },
          ]}
        />

        {/* Notifications */}
        <ServiceCard
          title="Notifications"
          icon={<Zap className="h-4 w-4" />}
          status={healthData.services.notifications.status}
          metrics={[
            { 
              label: 'Success Rate', 
              value: `${healthData.services.notifications.deliverySuccessRate.toFixed(1)}%`,
              highlight: healthData.services.notifications.deliverySuccessRate < 99.5,
            },
            { 
              label: 'Avg Delivery', 
              value: `${healthData.services.notifications.averageDeliveryTime.toFixed(0)}ms` 
            },
          ]}
        />

        {/* Error Handler */}
        <ServiceCard
          title="Error Handler"
          icon={<Activity className="h-4 w-4" />}
          status={healthData.services.errorHandler.status}
          metrics={[
            { 
              label: 'Degraded Mode', 
              value: healthData.services.errorHandler.degradedMode ? 'Yes' : 'No',
              highlight: healthData.services.errorHandler.degradedMode,
            },
            { 
              label: 'Recent Errors', 
              value: healthData.services.errorHandler.recentErrors.last5Minutes 
            },
          ]}
        />
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Key system performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Notification Delivery Rate"
              value={`${healthData.metrics.notificationDeliveryRate.toFixed(1)}%`}
              target="99.5%"
              status={healthData.metrics.notificationDeliveryRate >= 99.5 ? 'good' : 'warning'}
            />
            <MetricCard
              label="Data Stream Latency"
              value={`${healthData.metrics.dataStreamLatency}ms`}
              target="<1000ms"
              status={healthData.metrics.dataStreamLatency < 1000 ? 'good' : 'warning'}
            />
            <MetricCard
              label="Alert Processing Latency"
              value={`${healthData.metrics.alertProcessingLatency}ms`}
              target="<2000ms"
              status={healthData.metrics.alertProcessingLatency < 2000 ? 'good' : 'warning'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Error Details */}
      {healthData.services.errorHandler.recentErrors.last5Minutes > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Error Summary</CardTitle>
            <CardDescription>Recent error activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-sm text-muted-foreground">Last 5 Minutes</div>
                  <div className="text-2xl font-bold">
                    {healthData.services.errorHandler.recentErrors.last5Minutes}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Last 15 Minutes</div>
                  <div className="text-2xl font-bold">
                    {healthData.services.errorHandler.recentErrors.last15Minutes}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Last Hour</div>
                  <div className="text-2xl font-bold">
                    {healthData.services.errorHandler.recentErrors.lastHour}
                  </div>
                </div>
              </div>

              {Object.keys(healthData.services.errorHandler.errorsByCategory).length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Errors by Category</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(healthData.services.errorHandler.errorsByCategory).map(
                      ([category, count]) => (
                        <Badge key={category} variant="outline">
                          {category}: {count}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Failures by Channel */}
      {Object.keys(healthData.services.notifications.failuresByChannel).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Failures</CardTitle>
            <CardDescription>Failures by delivery channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(healthData.services.notifications.failuresByChannel).map(
                ([channel, count]) => (
                  <Badge key={channel} variant="destructive">
                    {channel}: {count} failures
                  </Badge>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Status Badge Component
 */
function StatusBadge({ 
  status, 
  size = 'default' 
}: { 
  status: ServiceStatus; 
  size?: 'default' | 'large';
}) {
  const getStatusConfig = () => {
    switch (status) {
      case ServiceStatus.OPERATIONAL:
        return {
          icon: <CheckCircle2 className={size === 'large' ? 'h-5 w-5' : 'h-4 w-4'} />,
          label: 'Operational',
          variant: 'default' as const,
          className: 'bg-green-500 hover:bg-green-600',
        };
      case ServiceStatus.DEGRADED:
        return {
          icon: <AlertTriangle className={size === 'large' ? 'h-5 w-5' : 'h-4 w-4'} />,
          label: 'Degraded',
          variant: 'secondary' as const,
          className: 'bg-yellow-500 hover:bg-yellow-600',
        };
      case ServiceStatus.DOWN:
        return {
          icon: <XCircle className={size === 'large' ? 'h-5 w-5' : 'h-4 w-4'} />,
          label: 'Down',
          variant: 'destructive' as const,
          className: '',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className} ${size === 'large' ? 'text-base px-4 py-2' : ''}`}
    >
      {config.icon}
      <span className="ml-2">{config.label}</span>
    </Badge>
  );
}

/**
 * Service Card Component
 */
function ServiceCard({
  title,
  icon,
  status,
  metrics,
}: {
  title: string;
  icon: React.ReactNode;
  status: ServiceStatus;
  metrics: Array<{ label: string; value: string | number; highlight?: boolean }>;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          <StatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {metrics.map((metric, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{metric.label}</span>
              <span className={metric.highlight ? 'font-semibold text-yellow-600' : 'font-medium'}>
                {metric.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Metric Card Component
 */
function MetricCard({
  label,
  value,
  target,
  status,
}: {
  label: string;
  value: string;
  target: string;
  status: 'good' | 'warning' | 'error';
}) {
  const getStatusColor = () => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="space-y-1">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`text-2xl font-bold ${getStatusColor()}`}>{value}</div>
      <div className="text-xs text-muted-foreground">Target: {target}</div>
    </div>
  );
}
