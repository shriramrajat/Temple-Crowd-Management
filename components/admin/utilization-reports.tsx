'use client';

import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Download, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AccessibilityMetrics } from '@/lib/types/accessibility-analytics';
import { getDailyMetrics } from '@/lib/services/monitoring-service';
import { getCategoryBreakdown } from '@/lib/utils/accessibility-metrics';

type ReportPeriod = 'daily' | 'weekly' | 'monthly';

interface UtilizationReportsProps {
  className?: string;
}

export default function UtilizationReports({ className = '' }: UtilizationReportsProps) {
  const [period, setPeriod] = useState<ReportPeriod>('daily');
  const [metrics, setMetrics] = useState<AccessibilityMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [period]);

  const loadMetrics = () => {
    setLoading(true);
    
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 1);
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
    }

    const data = getDailyMetrics(startDate, now);
    setMetrics(data);
    setLoading(false);
  };

  const calculateAverages = () => {
    if (metrics.length === 0) {
      return {
        avgUtilization: 0,
        avgWaitTimeDiff: 0,
        totalAssistance: 0,
        totalRoutes: 0,
      };
    }

    const totalUtilization = metrics.reduce(
      (sum, m) => sum + m.prioritySlotUtilization.utilizationRate,
      0
    );
    const totalWaitDiff = metrics.reduce(
      (sum, m) => sum + m.averageWaitTimes.difference,
      0
    );
    const totalAssistance = metrics.reduce((sum, m) => sum + m.assistanceRequests, 0);
    const totalRoutes = metrics.reduce(
      (sum, m) => sum + m.routeMetrics.accessibleRoutesGenerated,
      0
    );

    return {
      avgUtilization: Math.round(totalUtilization / metrics.length),
      avgWaitTimeDiff: Math.round(totalWaitDiff / metrics.length),
      totalAssistance,
      totalRoutes,
    };
  };

  const getCategoryTotals = () => {
    if (metrics.length === 0) {
      return { elderly: 0, differentlyAbled: 0, wheelchairUser: 0, total: 0 };
    }

    return metrics.reduce(
      (totals, m) => ({
        elderly: totals.elderly + m.prioritySlotUtilization.elderly,
        differentlyAbled: totals.differentlyAbled + m.prioritySlotUtilization.differentlyAbled,
        wheelchairUser: totals.wheelchairUser + m.prioritySlotUtilization.wheelchairUser,
        total: totals.total + m.prioritySlotUtilization.total,
      }),
      { elderly: 0, differentlyAbled: 0, wheelchairUser: 0, total: 0 }
    );
  };

  const getTrendData = () => {
    return metrics.map((m) => ({
      date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      utilization: m.prioritySlotUtilization.utilizationRate,
    }));
  };

  const exportReport = () => {
    const averages = calculateAverages();
    const categoryTotals = getCategoryTotals();
    
    const reportData = {
      period,
      generatedAt: new Date().toISOString(),
      dateRange: {
        start: metrics.length > 0 ? metrics[metrics.length - 1].date : null,
        end: metrics.length > 0 ? metrics[0].date : null,
      },
      summary: {
        averageUtilization: averages.avgUtilization,
        averageWaitTimeSaved: averages.avgWaitTimeDiff,
        totalAssistanceRequests: averages.totalAssistance,
        totalAccessibleRoutes: averages.totalRoutes,
      },
      categoryBreakdown: categoryTotals,
      dailyMetrics: metrics,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-report-${period}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const averages = calculateAverages();
  const categoryTotals = getCategoryTotals();
  const trendData = getTrendData();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Utilization Reports
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-background/50 rounded-lg p-1">
            <Button
              variant={period === 'daily' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPeriod('daily')}
            >
              Daily
            </Button>
            <Button
              variant={period === 'weekly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPeriod('weekly')}
            >
              Weekly
            </Button>
            <Button
              variant={period === 'monthly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPeriod('monthly')}
            >
              Monthly
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={exportReport} disabled={metrics.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {loading ? (
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-8">
          <p className="text-center text-muted-foreground">Loading report data...</p>
        </Card>
      ) : metrics.length === 0 ? (
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-8">
          <p className="text-center text-muted-foreground">No data available for this period</p>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Avg Utilization
              </p>
              <p className="text-2xl font-bold text-foreground">{averages.avgUtilization}%</p>
              <Badge variant="secondary" className="mt-2 text-xs">
                {metrics.length} days
              </Badge>
            </Card>
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Avg Time Saved
              </p>
              <p className="text-2xl font-bold text-green-400">{averages.avgWaitTimeDiff} min</p>
              <Badge variant="secondary" className="mt-2 text-xs">
                Per pilgrim
              </Badge>
            </Card>
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Total Assistance
              </p>
              <p className="text-2xl font-bold text-foreground">{averages.totalAssistance}</p>
              <Badge variant="secondary" className="mt-2 text-xs">
                Requests
              </Badge>
            </Card>
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Accessible Routes
              </p>
              <p className="text-2xl font-bold text-foreground">{averages.totalRoutes}</p>
              <Badge variant="secondary" className="mt-2 text-xs">
                Generated
              </Badge>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Category-wise Breakdown
            </h3>
            <div className="space-y-4">
              <CategoryBar
                label="Elderly"
                count={categoryTotals.elderly}
                total={categoryTotals.total}
                color="bg-blue-500"
              />
              <CategoryBar
                label="Differently-abled"
                count={categoryTotals.differentlyAbled}
                total={categoryTotals.total}
                color="bg-green-500"
              />
              <CategoryBar
                label="Wheelchair User"
                count={categoryTotals.wheelchairUser}
                total={categoryTotals.total}
                color="bg-purple-500"
              />
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">Total</span>
                  <span className="text-sm font-bold text-foreground">{categoryTotals.total}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Trend Analysis */}
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Utilization Trend
            </h3>
            <div className="space-y-2">
              {trendData.map((data, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-background/50 rounded-lg hover:bg-background/70 transition-colors"
                >
                  <span className="text-sm text-muted-foreground w-20">{data.date}</span>
                  <div className="flex-1">
                    <div className="w-full bg-background rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${data.utilization}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-foreground w-12 text-right">
                    {Math.round(data.utilization)}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

// Helper Component
function CategoryBar({
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
      <div className="w-full bg-background rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
