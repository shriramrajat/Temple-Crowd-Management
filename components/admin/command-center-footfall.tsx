/**
 * Command Center Footfall Graph Component
 * 
 * Time-series visualization of visitor traffic patterns for the Admin Command Center Dashboard.
 * Features interactive charts, time range selection, zone filtering, and real-time updates.
 */

'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { FootfallDataPoint, TimeRange, Zone } from '@/lib/types/command-center';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TrendingUp, 
  Clock,
  Users,
  Loader2
} from 'lucide-react';
import { fetchFootfallData } from '@/lib/api/command-center-client';

export interface FootfallGraphProps {
  zones: Zone[];
  initialData?: FootfallDataPoint[];
  zoneId?: string | null;
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
  onZoneChange?: (zoneId: string | null) => void;
}

/**
 * Format timestamp based on time range
 */
function formatTimestamp(date: Date, timeRange: TimeRange): string {
  switch (timeRange) {
    case 'hourly':
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    case 'daily':
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        hour12: true
      });
    case 'weekly':
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    default:
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      });
  }
}

/**
 * Custom tooltip component for detailed data display
 */
const CustomTooltip = memo(function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0];
  const value = data.value as number;

  return (
    <div className="bg-card border border-primary/20 rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-primary" />
        <span className="text-lg font-bold text-primary">
          {value.toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground">visitors</span>
      </div>
    </div>
  );
});

/**
 * Get time range label
 */
function getTimeRangeLabel(range: TimeRange): string {
  switch (range) {
    case 'hourly':
      return 'Last 24 Hours';
    case 'daily':
      return 'Last 7 Days';
    case 'weekly':
      return 'Last 4 Weeks';
    default:
      return 'Unknown';
  }
}

function CommandCenterFootfall({
  zones,
  initialData = [],
  zoneId = null,
  timeRange: initialTimeRange = 'hourly',
  onTimeRangeChange,
  onZoneChange,
}: FootfallGraphProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(zoneId);
  const [footfallData, setFootfallData] = useState<FootfallDataPoint[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  /**
   * Fetch footfall data based on current filters
   */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchFootfallData({
        zoneId: selectedZoneId || undefined,
        timeRange,
      });
      setFootfallData(data);
      setLastUpdateTime(new Date());
    } catch (err) {
      console.error('Failed to fetch footfall data:', err);
      setError('Failed to load footfall data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedZoneId, timeRange]);

  /**
   * Fetch data when filters change
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Set up 60-second interval for real-time updates
   */
  useEffect(() => {
    // Set up interval for updates every 60 seconds
    const intervalId = setInterval(() => {
      fetchData();
    }, 60000); // 60 seconds

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchData]);

  /**
   * Handle time range change
   */
  const handleTimeRangeChange = useCallback((range: TimeRange) => {
    setTimeRange(range);
    if (onTimeRangeChange) {
      onTimeRangeChange(range);
    }
  }, [onTimeRangeChange]);

  /**
   * Handle zone selection change
   */
  const handleZoneChange = useCallback((value: string) => {
    const newZoneId = value === 'all' ? null : value;
    setSelectedZoneId(newZoneId);
    if (onZoneChange) {
      onZoneChange(newZoneId);
    }
  }, [onZoneChange]);

  /**
   * Prepare chart data with formatted timestamps
   */
  const chartData = useMemo(() => {
    return footfallData.map(point => ({
      timestamp: formatTimestamp(point.timestamp, timeRange),
      count: point.count,
      fullDate: point.timestamp.toLocaleString(),
    }));
  }, [footfallData, timeRange]);

  /**
   * Calculate statistics
   */
  const stats = useMemo(() => {
    if (footfallData.length === 0) {
      return { total: 0, average: 0, peak: 0 };
    }

    const total = footfallData.reduce((sum, point) => sum + point.count, 0);
    const average = Math.round(total / footfallData.length);
    const peak = Math.max(...footfallData.map(point => point.count));

    return { total, average, peak };
  }, [footfallData]);

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-primary/20" role="region" aria-label="Footfall analytics">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-primary/20">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Footfall Analytics</h2>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3" role="toolbar" aria-label="Footfall analytics controls">
          {/* Time range selector */}
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1" role="group" aria-label="Time range selector">
            <Button
              variant={timeRange === 'hourly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleTimeRangeChange('hourly')}
              className="h-8"
              aria-label="Show hourly data"
              aria-pressed={timeRange === 'hourly'}
            >
              <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
              Hourly
            </Button>
            <Button
              variant={timeRange === 'daily' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleTimeRangeChange('daily')}
              className="h-8"
              aria-label="Show daily data"
              aria-pressed={timeRange === 'daily'}
            >
              <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
              Daily
            </Button>
            <Button
              variant={timeRange === 'weekly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleTimeRangeChange('weekly')}
              className="h-8"
              aria-label="Show weekly data"
              aria-pressed={timeRange === 'weekly'}
            >
              <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
              Weekly
            </Button>
          </div>

          {/* Zone filter */}
          <Select
            value={selectedZoneId || 'all'}
            onValueChange={handleZoneChange}
          >
            <SelectTrigger className="w-[180px] h-9" aria-label="Filter by zone">
              <SelectValue placeholder="Select zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zones</SelectItem>
              {zones.map(zone => (
                <SelectItem key={zone.id} value={zone.id}>
                  {zone.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 p-4 border-b border-primary/20" role="status" aria-label="Footfall statistics">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1" id="total-visitors-label">Total Visitors</p>
          <p className="text-2xl font-bold text-primary" aria-labelledby="total-visitors-label">
            {stats.total.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1" id="average-visitors-label">Average</p>
          <p className="text-2xl font-bold" aria-labelledby="average-visitors-label">
            {stats.average.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1" id="peak-visitors-label">Peak</p>
          <p className="text-2xl font-bold text-orange-600" aria-labelledby="peak-visitors-label">
            {stats.peak.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 p-4 min-h-[300px]" role="img" aria-label={`Footfall chart showing ${getTimeRangeLabel(timeRange)} visitor data${selectedZoneId ? ` for ${zones.find(z => z.id === selectedZoneId)?.name}` : ' for all zones'}`}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full" role="status" aria-live="polite">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">Loading footfall data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full" role="alert">
            <div className="text-center">
              <p className="text-sm text-destructive mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchData} aria-label="Retry loading footfall data">
                Retry
              </Button>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full" role="status">
            <div className="text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">No footfall data available</p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedZoneId ? 'Try selecting a different zone' : 'Data will appear here when available'}
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              aria-label="Footfall line chart"
            >
              <defs>
                <linearGradient id="colorFootfall" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.3}
              />
              <XAxis 
                dataKey="timestamp" 
                stroke="hsl(var(--muted-foreground))" 
                style={{ fontSize: '12px' }}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                style={{ fontSize: '12px' }}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                fillOpacity={1}
                fill="url(#colorFootfall)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {getTimeRangeLabel(timeRange)}
          </Badge>
          {selectedZoneId && (
            <Badge variant="secondary" className="text-xs">
              {zones.find(z => z.id === selectedZoneId)?.name || 'Unknown Zone'}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{chartData.length} data points</span>
          <span>•</span>
          <span>Updated {lastUpdateTime.toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(CommandCenterFootfall);
