'use client';

/**
 * Notification Delivery Metrics Dashboard
 * 
 * Displays notification delivery statistics and tracks the 99.5% success rate target.
 * Requirements: 2.4
 */

import { useState, useEffect } from 'react';
import { NotificationStats, NotificationChannel } from '@/lib/crowd-risk/types';
import { getAdminNotifier } from '@/lib/crowd-risk';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  Bell,
  Mail,
  MessageSquare,
} from 'lucide-react';

interface NotificationMetricsProps {
  refreshInterval?: number; // milliseconds
}

export function NotificationMetrics({ refreshInterval = 5000 }: NotificationMetricsProps) {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const notifier = getAdminNotifier();
        const deliveryStats = await notifier.getDeliveryStats();
        setStats(deliveryStats);
      } catch (error) {
        console.error('Failed to load notification stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();

    // Set up auto-refresh
    const interval = setInterval(loadStats, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Delivery Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading metrics...</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.totalSent === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Delivery Metrics</CardTitle>
          <CardDescription>Track notification delivery performance</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No notifications sent yet</p>
        </CardContent>
      </Card>
    );
  }

  const successCount = Math.round((stats.successRate / 100) * stats.totalSent);
  const failureCount = stats.totalSent - successCount;
  const isHealthy = stats.successRate >= 99.5;
  const isWarning = stats.successRate >= 95 && stats.successRate < 99.5;

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case NotificationChannel.PUSH:
        return <Bell className="h-4 w-4" />;
      case NotificationChannel.SMS:
        return <MessageSquare className="h-4 w-4" />;
      case NotificationChannel.EMAIL:
        return <Mail className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Notification Delivery Metrics</span>
            <Badge variant={isHealthy ? 'default' : isWarning ? 'secondary' : 'destructive'}>
              {isHealthy ? 'Healthy' : isWarning ? 'Warning' : 'Critical'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Real-time notification delivery performance tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Success Rate Alert */}
          {!isHealthy && (
            <Alert variant={isWarning ? 'default' : 'destructive'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {isWarning
                  ? `Success rate (${stats.successRate.toFixed(2)}%) is below the 99.5% target. Monitor for issues.`
                  : `Success rate (${stats.successRate.toFixed(2)}%) is critically low. Immediate attention required.`}
              </AlertDescription>
            </Alert>
          )}

          {/* Overall Success Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">Success Rate</span>
              </div>
              <span className="text-2xl font-bold">
                {stats.successRate.toFixed(2)}%
              </span>
            </div>
            <Progress 
              value={stats.successRate} 
              className="h-3"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Target: 99.5%</span>
              <span>{successCount} / {stats.totalSent} delivered</span>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Sent */}
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">{stats.totalSent}</p>
              </div>
            </div>

            {/* Successful */}
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold">{successCount}</p>
              </div>
            </div>

            {/* Failed */}
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold">{failureCount}</p>
              </div>
            </div>
          </div>

          {/* Average Delivery Time */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Delivery Time</p>
                <p className="text-xl font-semibold">
                  {stats.averageDeliveryTime.toFixed(0)}ms
                </p>
              </div>
            </div>
            <Badge variant={stats.averageDeliveryTime < 3000 ? 'default' : 'secondary'}>
              {stats.averageDeliveryTime < 3000 ? 'Within Target' : 'Above Target'}
            </Badge>
          </div>

          {/* Failures by Channel */}
          {Object.keys(stats.failuresByChannel).length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center space-x-2">
                <XCircle className="h-4 w-4" />
                <span>Failures by Channel</span>
              </h4>
              <div className="space-y-2">
                {Object.entries(stats.failuresByChannel).map(([channel, count]) => (
                  <div
                    key={channel}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      {getChannelIcon(channel)}
                      <span className="font-medium capitalize">{channel}</span>
                    </div>
                    <Badge variant="destructive">{count} failures</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
