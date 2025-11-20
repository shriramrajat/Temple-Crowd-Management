# Crowd Risk Engine - API Reference

## Overview

This document provides detailed API reference for all service interfaces in the Crowd Risk Engine.

## Table of Contents

1. [DensityMonitor](#densitymonitor)
2. [ThresholdEvaluator](#thresholdevaluator)
3. [AlertEngine](#alertengine)
4. [AdminNotifier](#adminnotifier)
5. [PilgrimNotifier](#pilgrimnotifier)
6. [EmergencyModeManager](#emergencymodemanager)
7. [AlertLogger](#alertlogger)
8. [ThresholdConfigManager](#thresholdconfigmanager)
9. [ErrorHandler](#errorhandler)

---

## DensityMonitor

**Location**: `lib/crowd-risk/density-monitor.ts`

**Purpose**: Monitors real-time crowd density data for configured areas.

### Methods

#### `startMonitoring(areaIds: string[]): void`

Starts monitoring density for specified areas.

**Parameters:**
- `areaIds` (string[]): Array of area IDs to monitor

**Example:**
```typescript
import { getDensityMonitor } from '@/lib/crowd-risk/density-monitor';

const monitor = getDensityMonitor();
monitor.startMonitoring(['area-1', 'area-2', 'area-3']);
```

**Notes:**
- Can be called multiple times to add more areas
- Duplicate area IDs are ignored
- Starts data stream connection if not already connected


#### `stopMonitoring(areaId: string): void`

Stops monitoring density for a specific area.

**Parameters:**
- `areaId` (string): Area ID to stop monitoring

**Example:**
```typescript
monitor.stopMonitoring('area-1');
```

**Notes:**
- Removes area from monitoring list
- Does not close data stream if other areas are still monitored
- Safe to call even if area is not being monitored

#### `getCurrentDensity(areaId: string): Promise<DensityReading | null>`

Gets the current density reading for an area.

**Parameters:**
- `areaId` (string): Area ID to query

**Returns:**
- `Promise<DensityReading | null>`: Current density reading or null if not available

**Example:**
```typescript
const density = await monitor.getCurrentDensity('area-1');
if (density) {
  console.log(`Current density: ${density.densityValue}%`);
  console.log(`Last updated: ${new Date(density.timestamp)}`);
}
```

**DensityReading Type:**
```typescript
interface DensityReading {
  areaId: string;
  timestamp: number;        // Unix timestamp in milliseconds
  densityValue: number;     // Density value (0-100 for percentage)
  unit: 'people_per_sqm' | 'percentage';
  metadata?: Record<string, unknown>;
}
```

#### `onDensityUpdate(callback: (reading: DensityReading) => void): () => void`

Subscribes to real-time density updates.

**Parameters:**
- `callback` (function): Function called when density updates are received

**Returns:**
- `() => void`: Unsubscribe function

**Example:**
```typescript
const unsubscribe = monitor.onDensityUpdate((reading) => {
  console.log(`Area ${reading.areaId}: ${reading.densityValue}%`);
  
  // Update UI or trigger other actions
  updateDensityDisplay(reading);
});

// Later, to unsubscribe:
unsubscribe();
```

**Notes:**
- Callback is called for all monitored areas
- Filter by areaId in callback if needed
- Multiple subscribers are supported
- Always unsubscribe when component unmounts

