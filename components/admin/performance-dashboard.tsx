'use client'

/**
 * Performance Dashboard Component
 * 
 * Displays real-time performance metrics for the SOS system.
 * Shows location capture time, alert submission time, and UI responsiveness.
 * 
 * Requirements: 1.1, 1.2
 */

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getPerformanceSummary,
  getPerformanceReport,
  PerformanceMetric,
  PerformanceReport,
  clearPerformanceLogs,
  getPerformanceLogs,
} from '@/lib/utils/performance-monitor';
import { Activity, AlertTriangle, CheckCircle, TrendingUp, Trash2 } from 'lucide-react';

export function PerformanceDashboard() {
  const [summary, setSummary] = React.useState(() => getPerformanceSummary());
  const [logs, setLogs] = React.useState<unknown[]>([]);
  const [autoRefresh, setAutoRefresh] = React.useState(true);

  // Auto-refresh every 5 seconds
  React.useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setSummary(getPerformanceSummary());
      setLogs(getPerformanceLogs());
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = () => {
    setSummary(getPerformanceSummary());
    setLogs(getPerformanceLogs());
  };

  const handleClearLogs = () => {
    clearPerformanceLogs();
    setLogs([]);
  };

  const formatDuration = (ms: number): string => {
    return `${ms.toFixed(0)}ms`;
  };

  const getStatusBadge = (report: PerformanceReport) => {
    if (report.measurements.length === 0) {
      return <Badge variant="secondary">No Data</Badge>;
    }

    const violationRate = (report.thresholdViolations / report.measurements.length) * 100;

    if (violationRate === 0) {
      return <Badge variant="default" className="bg-green-600"><CheckCircle className="size-3 mr-1" />Excellent</Badge>;
    } else if (violationRate < 10) {
      return <Badge variant="default" className="bg-yellow-600"><TrendingUp className="size-3 mr-1" />Good</Badge>;
    } else {
      return <Badge variant="destructive"><AlertTriangle className="size-3 mr-1" />Needs Attention</Badge>;
    }
  };

  const getMetricLabel = (metric: PerformanceMetric): string => {
    switch (metric) {
      case PerformanceMetric.LOCATION_CAPTURE:
        return 'Location Capture';
      case PerformanceMetric.ALERT_SUBMISSION:
        return 'Alert Submission';
      case PerformanceMetric.UI_INTERACTION:
        return 'UI Responsiveness';
      case PerformanceMetric.API_REQUEST:
        return 'API Requests';
      case PerformanceMetric.COMPONENT_RENDER:
        return 'Component Render';
      default:
        return metric;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time performance metrics for the SOS system
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Pause' : 'Resume'} Auto-Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Measurements</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalMeasurements}</div>
            <p className="text-xs text-muted-foreground">
              Across all metrics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.criticalIssues}</div>
            <p className="text-xs text-muted-foreground">
              Threshold violations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(summary.averageResponseTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              All operations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Metric Reports */}
      <div className="grid gap-4 md:grid-cols-2">
        {summary.reports
          .filter(report => report.measurements.length > 0)
          .map((report) => (
            <Card key={report.metric}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{getMetricLabel(report.metric)}</CardTitle>
                  {getStatusBadge(report)}
                </div>
                <CardDescription>
                  {report.measurements.length} measurements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Average:</span>
                    <span className="font-medium">{formatDuration(report.average)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Min:</span>
                    <span className="font-medium">{formatDuration(report.min)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max:</span>
                    <span className="font-medium">{formatDuration(report.max)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">P95:</span>
                    <span className="font-medium">{formatDuration(report.p95)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Success Rate:</span>
                    <span className="font-medium">{report.successRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Violations:</span>
                    <span className={report.thresholdViolations > 0 ? 'font-medium text-red-600' : 'font-medium'}>
                      {report.thresholdViolations}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Performance Logs */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Performance Issues Log</CardTitle>
                <CardDescription>
                  Recent threshold violations ({logs.length} entries)
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearLogs}
              >
                <Trash2 className="size-4 mr-2" />
                Clear Logs
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.slice(-10).reverse().map((log: any, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-3 border rounded-lg text-sm"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{getMetricLabel(log.metric)}</div>
                    <div className="text-muted-foreground">
                      Duration: {formatDuration(log.duration)} (threshold: {formatDuration(log.threshold)})
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <Badge variant="destructive">Slow</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
