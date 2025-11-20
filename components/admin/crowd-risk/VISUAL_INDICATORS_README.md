# Visual Indicator UI Components

This document describes the visual indicator components implemented for the Crowd Risk Engine monitoring interface.

## Overview

The visual indicator components provide real-time visual feedback about crowd density status across monitored areas. These components are optimized for sub-2-second state updates and include emergency blinking animations for critical situations.

## Components

### 1. IndicatorBadge

A visual badge component that displays crowd density status with color-coded severity levels and blinking animation for emergency conditions.

**Requirements Addressed:**
- 4.1: Red blinking indicators for critical conditions
- 4.2: Color-coded severity levels (green/yellow/red)
- 4.3: 2 Hz blink rate for emergency conditions
- 4.4: Sub-2-second state update rendering

**Features:**
- Color-coded severity levels:
  - 🟢 Green: Normal (safe density)
  - 🟡 Yellow: Warning (approaching threshold)
  - 🔴 Red: Critical (threshold exceeded)
  - 🔴 Red Blinking: Emergency (dangerous density, 2 Hz blink)
- Multiple size variants: `sm`, `md`, `lg`
- Optional label display
- Accessibility support (ARIA attributes)
- React.memo optimization for efficient re-rendering

**Props:**
```typescript
interface IndicatorBadgeProps {
  level: ThresholdLevel          // Current threshold level
  size?: 'sm' | 'md' | 'lg'     // Badge size (default: 'md')
  showLabel?: boolean            // Show text label (default: true)
  className?: string             // Additional CSS classes
}
```

**Usage:**
```tsx
import { IndicatorBadge } from '@/components/admin/crowd-risk'
import { ThresholdLevel } from '@/lib/crowd-risk/types'

// Basic usage
<IndicatorBadge level={ThresholdLevel.EMERGENCY} />

// Custom size without label
<IndicatorBadge 
  level={ThresholdLevel.WARNING} 
  size="lg" 
  showLabel={false} 
/>
```

### 2. AreaMonitoringGrid

A grid component that displays multiple monitored areas with real-time density information and visual indicators.

**Requirements Addressed:**
- 4.1: Display visual indicators for each area
- 4.2: Color-coded severity levels
- 4.4: Sub-2-second state update rendering

**Features:**
- Responsive grid layout (1-4 columns based on screen size)
- Real-time density display with capacity percentage
- Visual capacity bars with color coding
- Area metadata (type, description)
- Click handlers for area selection
- Automatic severity-based sorting (emergency first)
- Empty state handling
- React.memo optimization for individual area cards

**Props:**
```typescript
interface AreaMonitoringGridProps {
  areas: MonitoredArea[]                      // List of monitored areas
  densities: Map<string, DensityReading>      // Current density readings
  thresholdLevels: Map<string, ThresholdLevel> // Current threshold levels
  onAreaClick?: (areaId: string) => void      // Click handler
  className?: string                          // Additional CSS classes
}
```

**Usage:**
```tsx
import { AreaMonitoringGrid } from '@/components/admin/crowd-risk'

<AreaMonitoringGrid
  areas={monitoredAreas}
  densities={densityMap}
  thresholdLevels={levelMap}
  onAreaClick={(areaId) => console.log('Selected:', areaId)}
/>
```

### 3. IndicatorLegend

A legend component that explains the meaning of each indicator status level with descriptions and recommended actions.

**Requirements Addressed:**
- 4.1: Explain red blinking indicators
- 4.2: Explain color-coded severity levels
- 4.3: Explain 2 Hz blink rate for emergency

**Features:**
- Two display variants:
  - **Card**: Detailed legend with descriptions and actions
  - **Inline**: Compact legend for quick reference
- Status level explanations
- Recommended actions for each level
- Emergency blinking explanation
- Performance notes
- React.memo optimization

**Props:**
```typescript
interface IndicatorLegendProps {
  variant?: 'card' | 'inline'  // Display variant (default: 'card')
  className?: string           // Additional CSS classes
}
```

**Usage:**
```tsx
import { IndicatorLegend } from '@/components/admin/crowd-risk'

// Detailed card variant
<IndicatorLegend variant="card" />

// Compact inline variant
<IndicatorLegend variant="inline" />
```

## Emergency Blinking Animation

The emergency blinking animation is implemented using CSS keyframes for optimal performance (GPU-accelerated).

**Animation Specifications:**
- **Blink Rate**: 2 Hz (2 cycles per second)
- **Duration**: 0.5 seconds per cycle
- **Opacity Range**: 1.0 (visible) to 0.2 (dimmed)
- **Easing**: ease-in-out for smooth transitions

**CSS Implementation:**
```css
@keyframes blink-emergency {
  0%, 49% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0.2;
  }
}

.animate-blink-emergency {
  animation: blink-emergency 0.5s ease-in-out infinite;
}
```

**Location**: `TeamDigitalDaredevils/styles/globals.css`

## Performance Optimizations

All components are optimized for sub-2-second state updates:

1. **React.memo**: All components use React.memo to prevent unnecessary re-renders
2. **Memoized Sorting**: Area sorting is memoized to avoid recalculation on every render
3. **CSS Animations**: Blinking uses CSS animations (GPU-accelerated) instead of JavaScript
4. **Efficient State Updates**: Components only re-render when their specific props change

## Status Level Mapping

| Level | Color | Indicator | Blinking | Description |
|-------|-------|-----------|----------|-------------|
| Normal | Green | 🟢 | No | Crowd density within safe limits |
| Warning | Yellow | 🟡 | No | Density approaching threshold |
| Critical | Red | 🔴 | No | Threshold exceeded, attention required |
| Emergency | Red | 🔴 | Yes (2 Hz) | Dangerous density, immediate action needed |

## Integration Example

Here's a complete example of integrating all visual indicator components:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  IndicatorBadge, 
  AreaMonitoringGrid, 
  IndicatorLegend 
} from '@/components/admin/crowd-risk'
import { useDensityMonitor } from '@/lib/crowd-risk/density-context'
import { useAlerts } from '@/lib/crowd-risk/alert-context'

export default function MonitoringDashboard() {
  const { areas, densities, thresholdLevels } = useDensityMonitor()
  const { activeAlerts } = useAlerts()

  return (
    <div className="space-y-6">
      {/* Header with overall status */}
      <div className="flex items-center justify-between">
        <h1>Crowd Monitoring Dashboard</h1>
        <IndicatorBadge 
          level={getOverallStatus(thresholdLevels)} 
          size="lg" 
        />
      </div>

      {/* Legend */}
      <IndicatorLegend variant="inline" />

      {/* Area Grid */}
      <AreaMonitoringGrid
        areas={areas}
        densities={densities}
        thresholdLevels={thresholdLevels}
        onAreaClick={handleAreaClick}
      />

      {/* Detailed Legend */}
      <IndicatorLegend variant="card" />
    </div>
  )
}
```

## Testing

A demo page is available at `/admin/crowd-risk/indicators-demo` that showcases all components with:
- All threshold levels and sizes
- Live density simulation
- Interactive state updates
- Performance verification

## Accessibility

All components include proper accessibility attributes:
- `role="status"` for indicator badges
- `aria-label` for status descriptions
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly

## Browser Compatibility

The components are compatible with all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

CSS animations are supported in all target browsers without fallbacks needed.

## Files

- `indicator-badge.tsx` - Badge component
- `area-monitoring-grid.tsx` - Grid component
- `indicator-legend.tsx` - Legend component
- `index.ts` - Component exports
- `VISUAL_INDICATORS_README.md` - This documentation

## Related Components

- `ThresholdConfigForm` - Configure thresholds
- `NotificationConfig` - Configure notifications
- `NotificationMetrics` - View notification statistics

## Next Steps

These components are ready for integration into:
- Task 10.1: Admin Dashboard Integration
- Task 11.1: Heatmap Interface Integration

The components can be used immediately with the existing DensityContext and AlertContext providers.
