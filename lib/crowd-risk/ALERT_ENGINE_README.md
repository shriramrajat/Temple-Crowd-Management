# Alert Engine Implementation

## Overview

The Alert Engine is a core component of the Crowd Risk Engine that generates and routes alert events based on threshold evaluations. It implements an observer pattern for real-time alert distribution, severity-based prioritization, alert history tracking, and acknowledgment workflows.

## Components

### 1. AlertEngine Service (`alert-engine.ts`)

The main service that handles alert generation, routing, and management.

**Key Features:**
- **Alert Event Generation**: Automatically generates alerts when density thresholds are crossed
- **Unique Alert IDs**: Each alert gets a unique identifier for tracking
- **Metadata Enrichment**: Alerts include location, affected pilgrim count, suggested actions, and alternative routes
- **Alert Deduplication**: Prevents duplicate alerts within a 30-second window
- **Observer Pattern**: Subscribers receive real-time alert notifications
- **Severity-Based Prioritization**: Emergency alerts are prioritized over other severities
- **Alert History**: Maintains history of alerts per area (up to 100 entries)
- **Acknowledgment Workflow**: Admins can acknowledge alerts

**Usage Example:**
```typescript
import { getAlertEngine } from '@/lib/crowd-risk';

const alertEngine = getAlertEngine();

// Register monitored areas
alertEngine.registerArea(area);

// Subscribe to alerts
const unsubscribe = alertEngine.subscribeToAlerts((alert) => {
  console.log('New alert:', alert);
});

// Process threshold evaluation
alertEngine.processEvaluation(evaluation);

// Get alert history
const history = await alertEngine.getAlertHistory('area-1', 50);

// Acknowledge alert
await alertEngine.acknowledgeAlert('alert-id', 'admin-id');

// Get active alerts
const activeAlerts = alertEngine.getActiveAlerts();
```

### 2. Alert Context (`alert-context.tsx`)

React context and hooks for managing alert state in the UI.

**Key Features:**
- **Global Alert State**: Centralized state management for alerts
- **Real-time Updates**: Automatically updates when new alerts are generated
- **Multiple Hooks**: Convenient hooks for different use cases
- **Automatic Cleanup**: Removes old alerts automatically

**Available Hooks:**

```typescript
// Get all alert context
const { activeAlerts, emergencyMode, unacknowledgedCount } = useAlerts();

// Get active alerts only
const alerts = useActiveAlerts();

// Get alerts for specific area
const areaAlerts = useAreaAlerts('area-1');

// Get unacknowledged count
const count = useUnacknowledgedCount();

// Get emergency mode state
const emergency = useEmergencyMode();

// Get indicator states
const indicators = useIndicatorStates();

// Get specific area indicator
const indicator = useAreaIndicator('area-1');

// Acknowledge alert function
const acknowledge = useAcknowledgeAlert();
await acknowledge('alert-id', 'admin-id');

// Get alert history
const { history, loading, error } = useAlertHistory('area-1', 50);

// Get alerts by severity
const emergencyAlerts = useAlertsBySeverity('emergency');

// Check for emergency alerts
const hasEmergency = useHasEmergencyAlerts();

// Check for critical alerts
const hasCritical = useHasCriticalAlerts();

// Get most recent alert
const recent = useMostRecentAlert();

// Get sorted alerts
const sorted = useSortedAlerts(false); // false = newest first
```

**Usage in Components:**

```typescript
'use client';

import { AlertProvider, useActiveAlerts } from '@/lib/crowd-risk';

// Wrap your app with AlertProvider
export function App() {
  return (
    <AlertProvider adminId="admin-123">
      <YourComponents />
    </AlertProvider>
  );
}

// Use hooks in components
function AlertList() {
  const alerts = useActiveAlerts();
  
  return (
    <div>
      {alerts.map(alert => (
        <AlertCard key={alert.id} alert={alert} />
      ))}
    </div>
  );
}
```

## Integration with Other Services

### Density Evaluation Service Integration

The Alert Engine integrates seamlessly with the Density Evaluation Service:

```typescript
import { getDensityEvaluationService, getAlertEngine } from '@/lib/crowd-risk';

const evaluationService = getDensityEvaluationService();
const alertEngine = getAlertEngine();

// Connect evaluation service to alert engine
evaluationService.onEvaluation((evaluation) => {
  alertEngine.processEvaluation(evaluation);
});

// Start monitoring
evaluationService.start();
```

### Complete Integration Example

```typescript
import {
  getAlertEngine,
  getDensityEvaluationService,
  getThresholdConfigManager,
  getDensityMonitor,
} from '@/lib/crowd-risk';

// Initialize services
const alertEngine = getAlertEngine();
const evaluationService = getDensityEvaluationService();
const configManager = getThresholdConfigManager();
const densityMonitor = getDensityMonitor();

// Register areas
alertEngine.registerAreas(monitoredAreas);

// Configure thresholds
await configManager.saveConfig({
  areaId: 'area-1',
  warningThreshold: 50,
  criticalThreshold: 75,
  emergencyThreshold: 90,
});

// Connect services
evaluationService.onEvaluation((evaluation) => {
  alertEngine.processEvaluation(evaluation);
});

// Subscribe to alerts
alertEngine.subscribeToAlerts((alert) => {
  // Handle alert (send notifications, update UI, etc.)
  console.log('Alert:', alert);
});

// Start monitoring
evaluationService.start();
densityMonitor.startMonitoring(['area-1', 'area-2']);
```

## Alert Types

The Alert Engine generates the following alert types:

1. **THRESHOLD_VIOLATION**: Generated when density crosses a threshold (escalation)
2. **DENSITY_NORMALIZED**: Generated when density returns to normal after being elevated

## Alert Severity Levels

Alerts have the following severity levels (from highest to lowest):

1. **EMERGENCY**: Density >= emergency threshold
2. **CRITICAL**: Density >= critical threshold
3. **WARNING**: Density >= warning threshold
4. **NORMAL**: Density < warning threshold

## Alert Metadata

Each alert includes rich metadata:

- **location**: Geographic coordinates of the area
- **affectedPilgrimCount**: Estimated number of pilgrims affected
- **suggestedActions**: Array of recommended actions based on severity
- **alternativeRoutes**: Array of alternative area names (adjacent areas)

## Alert Deduplication

The Alert Engine prevents duplicate alerts using a 30-second deduplication window. Alerts with the same area ID, type, and severity within this window are deduplicated.

## Alert History

Alert history is maintained per area with a maximum of 100 entries per area. History can be retrieved using:

```typescript
const history = await alertEngine.getAlertHistory('area-1', 50);
```

## Alert Acknowledgment

Admins can acknowledge alerts to mark them as seen:

```typescript
await alertEngine.acknowledgeAlert('alert-id', 'admin-id');

// Check if acknowledged
const isAcknowledged = alertEngine.isAlertAcknowledged('alert-id');

// Get acknowledgments
const acks = alertEngine.getAlertAcknowledgments('alert-id');
```

## Statistics and Monitoring

Get statistics about the Alert Engine:

```typescript
const stats = alertEngine.getStats();
console.log(stats);
// {
//   subscriberCount: 3,
//   totalHistoryEntries: 45,
//   areasWithHistory: 5,
//   deduplicationCacheSize: 2,
//   registeredAreas: 10,
//   totalAcknowledgments: 12
// }
```

## Testing

Run the verification script to test the Alert Engine:

```typescript
import { verifyAlertEngine } from '@/lib/crowd-risk/verify-alert-engine';

await verifyAlertEngine();
```

This will:
1. Register test areas
2. Configure thresholds
3. Subscribe to alerts
4. Simulate density readings
5. Test alert generation
6. Test deduplication
7. Test acknowledgment
8. Display statistics

## Requirements Fulfilled

This implementation fulfills the following requirements:

- **Requirement 1.2**: Generate alert events when thresholds are crossed
- **Requirement 1.4**: Alert history and tracking with metadata
- **Requirement 2.1**: Alert context for global alert state
- **Requirement 2.2**: Real-time alert updates via hooks
- **Requirement 2.3**: Observer pattern for alert distribution with severity-based prioritization
- **Requirement 2.4**: Alert acknowledgment workflow

## Next Steps

The Alert Engine is now ready to be integrated with:

1. **Admin Notification Service** (Task 6): Send alerts to administrators
2. **Pilgrim Notification Service** (Task 7): Send alerts to pilgrims
3. **Visual Indicator Controller** (Task 8): Update visual indicators
4. **Emergency Mode Manager** (Task 9): Trigger emergency mode
5. **Admin Dashboard** (Task 10): Display alerts in UI
