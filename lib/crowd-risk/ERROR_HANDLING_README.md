# Error Handling and Monitoring System

## Overview

This document describes the error handling infrastructure and system health monitoring dashboard implemented for the Crowd Risk Engine.

## Components Implemented

### 1. Error Handler Service (`error-handler.ts`)

A centralized error handling service that provides:

#### Features
- **Categorized Error Handling**: Separate handlers for different error types
  - `handleDataStreamError()` - Density stream failures
  - `handleNotificationFailure()` - Notification delivery errors
  - `handleConfigurationError()` - Configuration validation errors
  - `handleSystemError()` - General system errors

- **Retry Logic with Exponential Backoff**
  - Default backoff: 1s, 2s, 4s, 8s
  - Configurable retry attempts (default: 4)
  - `retryWithBackoff()` method for async operations

- **Fallback Mechanisms**
  - Degraded mode activation on multiple errors
  - Stale data indicators for areas with stream failures
  - Last known good state storage

- **Error Logging**
  - Comprehensive error log with context and stack traces
  - Error categorization by type and severity
  - Timestamp tracking with millisecond precision
  - Error statistics and metrics

#### Usage Example

```typescript
import { getErrorHandler } from '@/lib/crowd-risk/error-handler';

const errorHandler = getErrorHandler();

// Handle data stream error
try {
  // Process density reading
} catch (error) {
  errorHandler.handleDataStreamError(error, areaId, { context });
}

// Retry with exponential backoff
await errorHandler.retryWithBackoff(async () => {
  // Operation to retry
});

// Check system status
if (errorHandler.isDegradedMode()) {
  // Handle degraded mode
}

// Check if data is stale
if (errorHandler.isDataStale(areaId)) {
  // Show stale data indicator
}
```

### 2. Service Integration

The error handler has been integrated with all core services:

#### DensityMonitor
- Validates density readings with error handling
- Stores last known good state
- Clears stale data indicators on successful processing
- Handles subscriber notification errors

#### AlertEngine
- Wraps evaluation processing with error handling
- Handles subscriber notification failures
- Logs system errors during alert generation

#### AdminNotifier
- Handles notification delivery failures
- Integrates with retry queue processing
- Logs errors during queue processing

#### PilgrimNotifier
- Handles area notification failures
- Tracks delivery time violations (>5s target)
- Logs individual pilgrim delivery errors

### 3. Health Check API (`/api/crowd-risk/health/route.ts`)

RESTful API endpoint that provides comprehensive system health metrics.

#### Response Structure

```typescript
{
  status: 'operational' | 'degraded' | 'down',
  timestamp: number,
  services: {
    densityMonitor: {
      status: ServiceStatus,
      monitoredAreas: number
    },
    alertEngine: {
      status: ServiceStatus,
      activeAlerts: number,
      totalAlerts: number
    },
    notifications: {
      status: ServiceStatus,
      deliverySuccessRate: number,  // Target: 99.5%
      averageDeliveryTime: number,
      failuresByChannel: Record<string, number>
    },
    errorHandler: {
      status: ServiceStatus,
      degradedMode: boolean,
      recentErrors: {
        last5Minutes: number,
        last15Minutes: number,
        lastHour: number
      }
    }
  },
  metrics: {
    notificationDeliveryRate: number,
    dataStreamLatency: number,
    alertProcessingLatency: number  // Target: <2s
  },
  alerts: string[]
}
```

#### Health Determination Logic

- **Operational**: All services functioning normally
- **Degraded**: Some services experiencing issues but still functional
  - Notification success rate < 99.5%
  - Recent errors detected
  - System in degraded mode
- **Down**: Critical failures detected
  - Notification success rate < 95%
  - High error rates (>10 errors per category)

#### Automatic Alerting

The API generates alerts when:
- Notification delivery rate falls below 99.5%
- System enters degraded mode
- High error rate detected (>10 errors in 5 minutes)
- System status is DOWN
- High failure rate on specific notification channels

### 4. System Health Monitor Component (`system-health-monitor.tsx`)

React component that displays real-time system health metrics.

#### Features

- **Real-time Updates**: Fetches health data every 30 seconds
- **Overall Status Badge**: Visual indicator of system health
- **Health Alerts**: Displays active system alerts
- **Service Status Grid**: Individual status cards for each service
  - Density Monitor
  - Alert Engine
  - Notifications
  - Error Handler
- **Performance Metrics**: Key performance indicators
  - Notifica