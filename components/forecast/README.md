# Forecast Components

This directory contains components for the Predictive Crowd Insights feature.

## Components

### ForecastDashboard

Main container component that combines ForecastChart and PeakHoursDisplay with data fetching, auto-refresh, and error handling.

**Features:**
- Combines ForecastChart and PeakHoursDisplay components
- Automatic data fetching from `/api/forecast` and `/api/crowd-data`
- Auto-refresh: 5 minutes for forecast, 30 seconds for actual data
- Data source indicators (historical, simulated, or hybrid)
- Low confidence warnings
- Error handling with retry mechanism
- Responsive grid layout
- Loading states

**Props:**
- `zoneId?: string` - Optional zone filter
- `showPeakHours?: boolean` - Show/hide peak hours display (default: true)
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
import { ForecastDashboard, ForecastErrorBoundary } from '@/components/forecast'

// Basic usage with error boundary
<ForecastErrorBoundary>
  <ForecastDashboard />
</ForecastErrorBoundary>

// With zone filter
<ForecastDashboard zoneId="zone-main-entrance" />

// Without peak hours display
<ForecastDashboard showPeakHours={false} />
```

**Requirements Implemented:**
- 3.1, 3.2, 3.3: Combines chart and peak hours with responsive layout
- 2.4: Fetches and merges forecast and actual data with auto-refresh
- 2.5: Error handling and low confidence scenarios
- 5.2: Data source indicators

### ForecastChart

A comprehensive chart component that displays predicted vs actual crowd levels with confidence bands.

**Features:**
- Dual-line chart showing Expected (blue) and Actual (green) crowd levels
- Confidence bands with semi-transparent fill
- Interactive tooltips with exact values and confidence scores
- Real-time data overlay (updates every 30 seconds)
- Responsive design for mobile devices
- Time axis: -2 hours to +2 hours from current time
- Y-axis: 0-100% capacity

**Props:**
- `data: ChartDataPoint[]` - Array of chart data points (required)
- `className?: string` - Additional CSS classes
- `zoneId?: string` - Optional zone filter for real-time data
- `enableRealTimeOverlay?: boolean` - Enable/disable real-time updates (default: true)

**Usage:**

```tsx
import { ForecastChart } from '@/components/forecast'

// Basic usage
<ForecastChart data={chartDataPoints} />

// With zone filter and real-time overlay
<ForecastChart 
  data={chartDataPoints}
  zoneId="zone-main-entrance"
  enableRealTimeOverlay={true}
/>

// Without real-time updates
<ForecastChart 
  data={chartDataPoints}
  enableRealTimeOverlay={false}
/>
```

**Requirements Implemented:**
- 3.1: Display Expected Graph as continuous line chart
- 3.2: Overlay Actual Graph on same chart
- 3.3: Update Actual Graph within 30 seconds
- 3.4: Distinct visual styling for Expected and Actual
- 3.5: Time axis spanning -2h to +2h
- 3.6: Crowd density as percentages (0-100%)
- 2.3: Display forecast confidence levels

### PeakHoursDisplay

Displays identified peak hours for the day with visual indicators for crowd level severity.

**Features:**
- List of peak periods with time ranges
- Expected footfall and capacity percentages
- Visual indicators for crowd level severity (high/very-high)
- Auto-refresh every 15 minutes
- Loading and error state handling

**Props:**
- `className?: string` - Additional CSS classes
- `date?: string` - Specific date (defaults to today)
- `autoRefresh?: boolean` - Enable/disable auto-refresh (default: true)
- `refreshInterval?: number` - Refresh interval in ms (default: 15 minutes)

**Requirements Implemented:**
- 1.1, 1.2, 1.3: Display peak periods with time ranges and crowd levels
- 1.4: Auto-refresh every 15 minutes

### ForecastErrorBoundary

Error boundary component for catching and handling React errors in the forecast component tree.

**Features:**
- Catches errors in child components
- Displays user-friendly error message
- Provides retry mechanism
- Prevents entire app from crashing

**Usage:**

```tsx
import { ForecastErrorBoundary } from '@/components/forecast'

<ForecastErrorBoundary>
  <ForecastDashboard />
</ForecastErrorBoundary>
```

**Requirements Implemented:**
- 2.5: Error boundary for component tree

## Data Types

The component uses the following types from `@/lib/types/forecast`:

```typescript
interface ChartDataPoint {
  timestamp: string;
  predicted: number;
  actual: number | null;
  confidence: number;
  confidenceBandLow: number;
  confidenceBandHigh: number;
}
```

## Testing

Tests are located in `__tests__/components/forecast-chart.test.tsx`

Run tests:
```bash
npm test -- __tests__/components/forecast-chart.test.tsx --run
```

## Implementation Details

### Real-Time Data Overlay

The component automatically fetches actual crowd data from `/api/crowd-data` every 30 seconds when `enableRealTimeOverlay` is true. It merges this data with the predicted values to show actual vs expected comparison.

### Confidence Bands

Confidence bands are rendered using Recharts `Area` components with semi-transparent fill. The bands show the range of uncertainty around predictions based on the confidence score.

### Responsive Design

The chart uses `ResponsiveContainer` from Recharts to automatically adjust to different screen sizes. The X-axis labels are angled at -45 degrees for better readability on mobile devices.

### Performance

- Chart animations are enabled but limited to 500ms duration
- Real-time updates use React's `useCallback` hook to prevent unnecessary re-renders
- Intervals are properly cleaned up on component unmount
