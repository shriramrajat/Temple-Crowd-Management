# Command Center Dashboard Types

This directory contains TypeScript type definitions for the Admin Command Center Dashboard.

## Files

### `command-center.ts`
Core TypeScript interfaces and types for the dashboard, including:
- **Zone**: Venue area with monitoring parameters
- **Alert**: Critical event notifications
- **HighDensityWarning**: Crowd density threshold alerts
- **FootfallDataPoint**: Time-series visitor traffic data
- **WebSocketMessage**: Real-time update message types
- **DashboardState**: Dashboard UI state management

### `index.ts`
Central export file for easy importing throughout the application.

## Usage

```typescript
import { Zone, Alert, WebSocketMessage } from '@/lib/types';

// Use types for function parameters and return values
function processZoneUpdate(zone: Zone): void {
  // Implementation
}

// Use types for component props
interface MapProps {
  zones: Zone[];
  onZoneSelect: (zoneId: string) => void;
}
```

## Validation

For runtime validation, use the corresponding Zod schemas from `@/lib/schemas`:

```typescript
import { ZoneSchema } from '@/lib/schemas';

// Validate data at runtime
const result = ZoneSchema.safeParse(data);
if (result.success) {
  const zone = result.data;
  // Use validated zone
}
```

## Requirements Coverage

These types satisfy the following requirements:
- **1.1**: Live map zone data structures
- **2.1**: Real-time alert system types
- **3.1**: Footfall graph data points
- **4.1**: Zone status monitoring types
- **5.1**: High-density warning structures
