# Crowd Risk Engine Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Endpoints](#api-endpoints)
4. [Service Interfaces](#service-interfaces)
5. [Admin Configuration Guide](#admin-configuration-guide)
6. [User Guide](#user-guide)
7. [Emergency Procedures](#emergency-procedures)
8. [Troubleshooting](#troubleshooting)
9. [Deployment](#deployment)

## Overview

The Crowd Risk Engine is a real-time safety monitoring system that continuously monitors crowd density, evaluates it against configurable thresholds, and triggers multi-channel alerts when safety conditions are compromised.

### Key Features

- **Real-time Monitoring**: Sub-2-second density evaluation and alert generation
- **Multi-level Thresholds**: Warning, Critical, and Emergency levels
- **Multi-channel Notifications**: Push, SMS, and Email delivery
- **Visual Indicators**: Color-coded status with emergency blinking
- **Emergency Mode**: Automatic and manual activation with expanded reach
- **Configurable Thresholds**: Per-area and time-based profiles
- **Comprehensive Logging**: Full audit trail and alert history

### Performance Targets

- Alert generation: <2 seconds from density reading
- Admin notification delivery: <3 seconds
- Pilgrim notification delivery: <5 seconds
- Visual indicator update: <2 seconds
- Configuration update propagation: <10 seconds
- Notification delivery success rate: 99.5%


## Architecture

### System Overview

```mermaid
graph TB
    subgraph "Data Sources"
        DS[Density Data Stream]
    end
    
    subgraph "Core Engine"
        DM[Density Monitor]
        TE[Threshold Evaluator]
        AE[Alert Engine]
        EM[Emergency Mode Manager]
    end
    
    subgraph "Notification Layer"
        AN[Admin Notifier]
        PN[Pilgrim Notifier]
        VI[Visual Indicator Controller]
    end
    
    subgraph "Presentation Layer"
        AD[Admin Dashboard]
        MI[Monitoring Interface]
        PA[Pilgrim App]
    end
    
    subgraph "Configuration & Storage"
        TC[Threshold Config Store]
        AL[Alert Log]
    end
    
    DS --> DM
    DM --> TE
    TE --> TC
    TE --> AE
    AE --> EM
    AE --> AN
    AE --> PN
    AE --> VI
    AN --> AD
    VI --> MI
    PN --> PA
    AE --> AL
```

### Data Flow

```mermaid
sequenceDiagram
    participant DS as Density Stream
    participant DM as Density Monitor
    participant TE as Threshold Evaluator
    participant AE as Alert Engine
    participant AN as Admin Notifier
    participant PN as Pilgrim Notifier
    participant VI as Visual Indicator
    
    DS->>DM: Density Reading
    DM->>TE: Evaluate Reading
    TE->>TE: Compare to Thresholds
    TE->>AE: Threshold Evaluation
    
    alt Threshold Violated
        AE->>AE: Generate Alert Event
        par Parallel Notifications
            AE->>AN: Send to Admins
            AE->>PN: Send to Pilgrims
            AE->>VI: Update Indicators
        end
    end
```


### Component Interactions

```mermaid
graph TB
    subgraph "Presentation Layer"
        UI[UI Components]
        AMG[AreaMonitoringGrid]
        IB[IndicatorBadge]
        AD[AlertDialog]
        TC[ThresholdConfig]
        EMC[EmergencyModeControls]
    end
    
    subgraph "Context Layer - State Management"
        DC[DensityContext]
        AC[AlertContext]
        PC[PilgrimNotificationContext]
    end
    
    subgraph "Service Layer - Core Logic"
        DM[DensityMonitor]
        TE[ThresholdEvaluator]
        AE[AlertEngine]
        AL[AlertLogger]
        EM[EmergencyModeManager]
    end
    
    subgraph "Notification Layer"
        AN[AdminNotifier]
        PN[PilgrimNotifier]
        VI[VisualIndicatorController]
    end
    
    subgraph "Configuration & Storage"
        TCM[ThresholdConfigManager]
        NC[NotificationCache]
        CP[ConnectionPool]
    end
    
    subgraph "Infrastructure"
        EH[ErrorHandler]
        PM[PerformanceMonitor]
        PO[PerformanceOptimizer]
    end
    
    UI --> DC
    UI --> AC
    UI --> PC
    
    DC --> DM
    DC --> TE
    AC --> AE
    AC --> EM
    PC --> PN
    
    DM --> EH
    TE --> TCM
    AE --> AL
    AE --> AN
    AE --> PN
    AE --> VI
    
    AN --> NC
    AN --> CP
    PN --> NC
    
    EM --> AN
    EM --> PN
    
    PM --> PO
    EH --> PM
```

### Emergency Mode Flow

```mermaid
sequenceDiagram
    participant UI as Admin UI
    participant EM as EmergencyModeManager
    participant AE as AlertEngine
    participant AN as AdminNotifier
    participant PN as PilgrimNotifier
    participant VI as VisualIndicator
    
    alt Automatic Activation
        AE->>EM: Emergency threshold breach
        EM->>EM: Activate emergency mode
    else Manual Activation
        UI->>EM: Admin activates emergency
        EM->>EM: Activate emergency mode
    end
    
    EM->>EM: Identify affected areas
    EM->>EM: Expand to adjacent areas
    
    par Parallel Notifications
        EM->>AN: Override preferences
        AN->>AN: Send to ALL admins
        EM->>PN: Expand notification reach
        PN->>PN: Notify adjacent areas
        EM->>VI: Activate blinking indicators
        VI->>VI: Set 2 Hz blink rate
    end
    
    EM->>AE: Log emergency activation
    
    Note over EM: Emergency mode active
    
    UI->>EM: Admin deactivates
    EM->>EM: Deactivate emergency mode
    
    par Deactivation Notifications
        EM->>AN: Send confirmation
        EM->>PN: Send all-clear
        EM->>VI: Reset indicators
    end
    
    EM->>AE: Log deactivation
```

### Notification Delivery Flow

```mermaid
sequenceDiagram
    participant AE as AlertEngine
    participant AN as AdminNotifier
    participant NC as NotificationCache
    participant CP as ConnectionPool
    participant EH as ErrorHandler
    participant Push as Push Service
    participant SMS as SMS Gateway
    participant Email as Email Service
    
    AE->>AN: Send alert
    AN->>AN: Check admin preferences
    AN->>NC: Check cache for recent
    
    alt Not in cache
        AN->>AN: Batch by channel
        
        par Parallel Delivery
            AN->>CP: Get push connection
            CP->>Push: Deliver push notification
            Push-->>AN: Delivery result
            
            AN->>CP: Get SMS connection
            CP->>SMS: Send SMS
            SMS-->>AN: Delivery result
            
            AN->>CP: Get email connection
            CP->>Email: Send email
            Email-->>AN: Delivery result
        end
        
        AN->>NC: Cache notification
        AN->>AN: Aggregate results
        
        alt Delivery failed
            AN->>EH: Handle failure
            EH->>EH: Retry with backoff
            EH->>AN: Retry notification
        end
        
        AN->>AE: Return results
    else In cache (rate limited)
        AN->>AE: Skip duplicate
    end
```

### Technology Stack

- **Frontend**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript 5
- **UI Components**: Radix UI with Tailwind CSS
- **State Management**: React Context API + Custom Hooks
- **Validation**: Zod schemas
- **Notifications**: Sonner (toast notifications)
- **Charts**: Recharts


## API Endpoints

### GET /api/crowd-risk/alerts

Retrieve paginated alert history with filtering options.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `areaId` | string | No | Filter by specific area ID |
| `severity` | string | No | Filter by severity level (normal, warning, critical, emergency) |
| `acknowledged` | boolean | No | Filter by acknowledgment status |
| `resolved` | boolean | No | Filter by resolution status |
| `limit` | number | No | Results per page (default: 20, max: 100) |
| `offset` | number | No | Number of results to skip (default: 0) |

**Example Request:**

```bash
GET /api/crowd-risk/alerts?areaId=area-1&severity=critical&limit=50&offset=0
```

**Example Response:**

```json
{
  "data": [
    {
      "id": "alert-123",
      "type": "threshold_violation",
      "severity": "critical",
      "areaId": "area-1",
      "areaName": "Main Entrance",
      "densityValue": 85,
      "threshold": 75,
      "timestamp": 1700000000000,
      "metadata": {
        "location": "Main Entrance Gate A",
        "affectedPilgrimCount": 1500,
        "suggestedActions": [
          "Redirect traffic to alternative entrance",
          "Deploy additional staff"
        ]
      }
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 150,
    "hasMore": true,
    "nextOffset": 50,
    "prevOffset": null
  }
}
```

**Error Responses:**

- `400 Bad Request`: Invalid severity level or parameters
- `500 Internal Server Error`: Server error fetching alerts


### POST /api/crowd-risk/alerts

Get alert statistics for a specific area or all areas.

**Request Body:**

```json
{
  "areaId": "area-1"  // Optional: omit for all areas
}
```

**Example Response:**

```json
{
  "totalAlerts": 245,
  "byLevel": {
    "warning": 150,
    "critical": 80,
    "emergency": 15
  },
  "acknowledgedCount": 230,
  "resolvedCount": 220,
  "averageResponseTime": 45000,
  "last24Hours": 12,
  "last7Days": 89
}
```

### GET /api/crowd-risk/health

Get system health status and metrics.

**Example Request:**

```bash
GET /api/crowd-risk/health
```

**Example Response:**

```json
{
  "status": "operational",
  "timestamp": 1700000000000,
  "services": {
    "densityMonitor": {
      "status": "operational",
      "monitoredAreas": 12,
      "lastUpdate": 1699999999000
    },
    "alertEngine": {
      "status": "operational",
      "activeAlerts": 3,
      "totalAlerts": 245
    },
    "notifications": {
      "status": "operational",
      "deliverySuccessRate": 99.7,
      "averageDeliveryTime": 1850,
      "failuresByChannel": {
        "push": 1,
        "sms": 0,
        "email": 2
      }
    },
    "errorHandler": {
      "status": "operational",
      "degradedMode": false,
      "recentErrors": {
        "last5Minutes": 0,
        "last15Minutes": 1,
        "lastHour": 3
      },
      "errorsByCategory": {
        "data_stream": 1,
        "notification": 2,
        "system": 0
      }
    }
  },
  "metrics": {
    "notificationDeliveryRate": 99.7,
    "dataStreamLatency": 500,
    "alertProcessingLatency": 800
  },
  "alerts": []
}
```

**Status Values:**

- `operational`: All systems functioning normally
- `degraded`: Some functionality impaired but core features working
- `down`: Critical failure requiring immediate attention


## Service Interfaces

### DensityMonitor

Monitors real-time crowd density data for configured areas.

**Key Methods:**

```typescript
// Start monitoring specific areas
startMonitoring(areaIds: string[]): void

// Stop monitoring an area
stopMonitoring(areaId: string): void

// Get current density for an area
getCurrentDensity(areaId: string): Promise<DensityReading | null>

// Subscribe to density updates
onDensityUpdate(callback: (reading: DensityReading) => void): () => void
```

**Usage Example:**

```typescript
import { getDensityMonitor } from '@/lib/crowd-risk/density-monitor';

const monitor = getDensityMonitor();

// Start monitoring areas
monitor.startMonitoring(['area-1', 'area-2', 'area-3']);

// Subscribe to updates
const unsubscribe = monitor.onDensityUpdate((reading) => {
  console.log(`Area ${reading.areaId}: ${reading.densityValue}%`);
});

// Get current density
const current = await monitor.getCurrentDensity('area-1');
```

### ThresholdEvaluator

Evaluates density readings against configured thresholds.

**Key Methods:**

```typescript
// Evaluate a density reading
evaluate(reading: DensityReading): ThresholdEvaluation

// Update threshold configuration
updateThresholds(config: ThresholdConfig): void

// Get active thresholds for an area
getActiveThresholds(areaId: string): Promise<ThresholdConfig | null>

// Validate threshold configuration
validateThresholds(config: ThresholdConfig): ValidationResult
```

**Usage Example:**

```typescript
import { getThresholdEvaluator } from '@/lib/crowd-risk/threshold-evaluator';

const evaluator = getThresholdEvaluator();

// Update thresholds
evaluator.updateThresholds({
  areaId: 'area-1',
  warningThreshold: 60,
  criticalThreshold: 75,
  emergencyThreshold: 90
});

// Evaluate a reading
const evaluation = evaluator.evaluate({
  areaId: 'area-1',
  timestamp: Date.now(),
  densityValue: 80,
  unit: 'percentage'
});

console.log(`Level: ${evaluation.currentLevel}`); // "critical"
console.log(`Escalation: ${evaluation.isEscalation}`); // true/false
```


### AlertEngine

Generates and routes alert events to notification channels.

**Key Methods:**

```typescript
// Process a threshold evaluation
processEvaluation(evaluation: ThresholdEvaluation): void

// Subscribe to alert events
subscribeToAlerts(callback: (alert: AlertEvent) => void): () => void

// Get alert history
getAlertHistory(areaId: string, limit: number): Promise<AlertEvent[]>

// Acknowledge an alert
acknowledgeAlert(alertId: string, adminId: string): Promise<void>
```

**Usage Example:**

```typescript
import { getAlertEngine } from '@/lib/crowd-risk/alert-engine';

const engine = getAlertEngine();

// Subscribe to alerts
const unsubscribe = engine.subscribeToAlerts((alert) => {
  console.log(`Alert: ${alert.severity} in ${alert.areaName}`);
  
  if (alert.severity === 'emergency') {
    // Handle emergency alert
  }
});

// Acknowledge an alert
await engine.acknowledgeAlert('alert-123', 'admin-456');

// Get history
const history = await engine.getAlertHistory('area-1', 50);
```

### AdminNotifier

Delivers notifications to administrators through multiple channels.

**Key Methods:**

```typescript
// Send alert to admins
sendAlert(alert: AlertEvent, admins: string[]): Promise<NotificationResult[]>

// Configure notification preferences
configureNotifications(config: AdminNotificationConfig): void

// Get delivery statistics
getDeliveryStats(): Promise<NotificationStats>
```

**Usage Example:**

```typescript
import { getAdminNotifier } from '@/lib/crowd-risk/admin-notifier';

const notifier = getAdminNotifier();

// Configure preferences
notifier.configureNotifications({
  adminId: 'admin-1',
  channels: ['push', 'sms', 'email'],
  severityFilter: ['critical', 'emergency'],
  areaFilter: ['area-1', 'area-2']
});

// Send alert
const results = await notifier.sendAlert(alertEvent, ['admin-1', 'admin-2']);

// Check delivery stats
const stats = await notifier.getDeliveryStats();
console.log(`Success rate: ${stats.successRate}%`);
```


### EmergencyModeManager

Manages system-wide emergency mode activation and coordination.

**Key Methods:**

```typescript
// Activate emergency mode
activateEmergency(areaId: string, trigger: 'automatic' | 'manual', adminId?: string): void

// Deactivate emergency mode
deactivateEmergency(adminId: string): void

// Check if emergency is active
isEmergencyActive(): boolean

// Get current emergency state
getEmergencyState(): EmergencyMode | null

// Subscribe to state changes
onEmergencyStateChange(callback: (state: EmergencyMode | null) => void): () => void
```

**Usage Example:**

```typescript
import { getEmergencyModeManager } from '@/lib/crowd-risk/emergency-mode-manager';

const manager = getEmergencyModeManager();

// Subscribe to changes
const unsubscribe = manager.onEmergencyStateChange((state) => {
  if (state?.active) {
    console.log(`Emergency active in ${state.triggerAreaId}`);
    console.log(`Affected areas: ${state.affectedAreas.join(', ')}`);
  }
});

// Manual activation
manager.activateEmergency('area-1', 'manual', 'admin-123');

// Check status
if (manager.isEmergencyActive()) {
  const state = manager.getEmergencyState();
  console.log(`Emergency since: ${new Date(state.activatedAt)}`);
}

// Deactivate
manager.deactivateEmergency('admin-123');
```

### AlertLogger

Logs and stores alert history with notification results.

**Key Methods:**

```typescript
// Log an alert event
logAlert(alert: AlertEvent, notificationResults: NotificationResult[], pilgrimCount: number): Promise<void>

// Log acknowledgment
logAcknowledgment(alertId: string, adminId: string): Promise<void>

// Log resolution
logResolution(alertId: string, adminId: string, notes: string): Promise<void>

// Query alert logs
queryLogs(filters: AlertLogFilters): Promise<AlertLogEntry[]>
```

**Usage Example:**

```typescript
import { getAlertLogger } from '@/lib/crowd-risk/alert-logger';

const logger = getAlertLogger();

// Log an alert
await logger.logAlert(alertEvent, notificationResults, 1500);

// Log acknowledgment
await logger.logAcknowledgment('alert-123', 'admin-456');

// Log resolution
await logger.logResolution('alert-123', 'admin-456', 'Crowd dispersed successfully');

// Query logs
const logs = await logger.queryLogs({
  areaId: 'area-1',
  severity: 'critical',
  startTime: Date.now() - 86400000, // Last 24 hours
  endTime: Date.now()
});
```


## Admin Configuration Guide

### Threshold Configuration

#### Accessing Threshold Configuration

1. Navigate to `/admin/crowd-risk/monitor`
2. Click on an area card to view details
3. Click "Configure Thresholds" button

#### Setting Basic Thresholds

Configure three threshold levels for each area:

- **Warning Threshold**: Early warning level (e.g., 60%)
- **Critical Threshold**: Requires immediate attention (e.g., 75%)
- **Emergency Threshold**: Dangerous conditions (e.g., 90%)

**Important Rules:**

- Warning < Critical < Emergency (enforced by validation)
- Values must be positive numbers
- Changes apply within 10 seconds

**Example Configuration:**

```typescript
{
  areaId: "main-entrance",
  warningThreshold: 60,
  criticalThreshold: 75,
  emergencyThreshold: 90
}
```

#### Time-Based Profiles

Configure different thresholds for different times of day:

1. Click "Add Time Profile"
2. Set start and end times (HH:mm format)
3. Configure thresholds for that time period
4. Ensure time ranges don't overlap

**Example:**

```typescript
{
  areaId: "main-entrance",
  warningThreshold: 60,  // Default thresholds
  criticalThreshold: 75,
  emergencyThreshold: 90,
  timeProfile: [
    {
      startTime: "08:00",
      endTime: "12:00",
      thresholds: {
        warningThreshold: 50,  // Lower during peak hours
        criticalThreshold: 65,
        emergencyThreshold: 80
      }
    },
    {
      startTime: "18:00",
      endTime: "22:00",
      thresholds: {
        warningThreshold: 70,  // Higher during off-peak
        criticalThreshold: 85,
        emergencyThreshold: 95
      }
    }
  ]
}
```


### Notification Preferences

#### Configuring Notification Channels

1. Navigate to `/admin/crowd-risk/monitor`
2. Click "Notification Settings"
3. Select preferred channels:
   - **Push**: In-app toast notifications (instant)
   - **SMS**: Text message alerts (for mobile)
   - **Email**: Email notifications (for records)

#### Severity Filtering

Choose which severity levels trigger notifications:

- **Warning**: Early alerts (may be frequent)
- **Critical**: Urgent situations
- **Emergency**: Highest priority (recommended: always enabled)

**Note**: Emergency mode overrides all preferences and notifies all admins.

#### Area Filtering

Optionally filter notifications by specific areas:

1. Leave empty to receive alerts from all areas
2. Select specific areas to monitor only those locations

**Example Configuration:**

```typescript
{
  adminId: "admin-123",
  channels: ["push", "sms"],
  severityFilter: ["critical", "emergency"],
  areaFilter: ["main-entrance", "exit-gate-a"]
}
```

### Audit Log Review

All configuration changes are logged for accountability:

1. Navigate to `/admin/crowd-risk/monitor`
2. Click "View Audit Log"
3. Review changes with:
   - Timestamp
   - Admin who made the change
   - Previous and new configurations
   - Optional reason/notes

**Best Practices:**

- Review audit logs regularly
- Add notes when making significant changes
- Coordinate threshold changes with safety team


## User Guide

### Monitoring Dashboard

#### Accessing the Dashboard

Navigate to `/admin/crowd-risk/monitor` to view the real-time monitoring interface.

#### Dashboard Components

**1. Area Monitoring Grid**

- Displays all monitored areas in a grid layout
- Each card shows:
  - Area name and location
  - Current density percentage
  - Threshold level indicator (color-coded)
  - Last update timestamp
  - Trend indicator (increasing/decreasing)

**Color Coding:**

- 🟢 **Green**: Normal (below warning threshold)
- 🟡 **Yellow**: Warning (above warning, below critical)
- 🔴 **Red**: Critical (above critical, below emergency)
- 🔴 **Red Blinking**: Emergency (above emergency threshold)

**2. Active Alerts Panel**

- Shows unacknowledged alerts
- Sorted by severity and timestamp
- Click to view details and acknowledge

**3. Alert History**

- Recent alerts from last 24 hours
- Filter by area, severity, or status
- Export to CSV for reporting

**4. System Health Indicator**

- Shows overall system status
- Click for detailed health metrics
- Alerts if any service is degraded

#### Interacting with Areas

**View Details:**

1. Click on any area card
2. View detailed information:
   - Current density value
   - Active threshold configuration
   - Density trend chart (last hour)
   - Recent alerts for this area

**Configure Thresholds:**

1. Click "Configure" on area card
2. Adjust threshold values
3. Add time-based profiles if needed
4. Save changes (applied within 10 seconds)

**Acknowledge Alerts:**

1. Click on alert notification or alert in list
2. Review alert details
3. Click "Acknowledge"
4. Alert moves to acknowledged list


### Analytics Dashboard

#### Accessing Analytics

Navigate to `/admin/crowd-risk/analytics` for historical data and trends.

#### Available Analytics

**1. Density Trends**

- Line charts showing density over time
- Selectable time ranges: 1h, 6h, 24h, 7d
- Compare multiple areas side-by-side
- Threshold lines overlaid on charts

**2. Alert Frequency**

- Bar charts showing alert counts by:
  - Severity level
  - Area
  - Time of day
  - Day of week

**3. Response Metrics**

- Average acknowledgment time
- Average resolution time
- Response time trends

**4. Notification Performance**

- Delivery success rates by channel
- Average delivery times
- Failure analysis

#### Exporting Data

1. Select time range and filters
2. Click "Export Data"
3. Choose format (CSV or JSON)
4. Download for external analysis

### Health Monitoring

#### Accessing Health Dashboard

Navigate to `/admin/crowd-risk/health` to view system health.

#### Health Metrics

**Service Status:**

- Density Monitor: Connection and data flow status
- Alert Engine: Processing status and queue depth
- Notifications: Delivery rates and channel health
- Error Handler: Error rates and degraded mode status

**Performance Metrics:**

- Notification delivery rate (target: 99.5%)
- Data stream latency (target: <500ms)
- Alert processing latency (target: <2s)

**Alerts:**

- Automatic alerts when metrics fall below targets
- Critical alerts for service failures
- Recommendations for remediation


## Emergency Procedures

### Emergency Mode Overview

Emergency mode is a critical state that:

- Increases notification frequency
- Expands notifications to adjacent areas
- Overrides all admin notification preferences
- Activates visual and audio alerts
- Logs all actions for post-incident review

### Automatic Emergency Activation

Emergency mode activates automatically when:

1. Density exceeds emergency threshold in any area
2. System detects rapid density increase
3. Multiple critical alerts in adjacent areas

**What Happens:**

1. Emergency mode activates immediately
2. All administrators receive high-priority notifications
3. Visual indicators change to red blinking (2 Hz)
4. Pilgrims in affected and adjacent areas receive notifications
5. Event is logged with trigger details

### Manual Emergency Activation

#### When to Manually Activate

- Visual observation of dangerous conditions
- Reports from field staff
- Anticipation of crowd surge
- Coordination with other emergency systems

#### How to Activate

1. Navigate to `/admin/crowd-risk/monitor`
2. Click "Emergency Mode" button (red, top-right)
3. Select trigger area
4. Confirm activation
5. System activates within 1 second

**Confirmation Dialog:**

```
⚠️ ACTIVATE EMERGENCY MODE

This will:
- Send alerts to ALL administrators
- Notify pilgrims in affected and adjacent areas
- Override notification preferences
- Log this action with your admin ID

Trigger Area: [Selected Area]
Affected Areas: [List of adjacent areas]

[Cancel] [ACTIVATE EMERGENCY]
```


### Emergency Deactivation

#### When to Deactivate

- Crowd density returns to safe levels
- Situation is under control
- Alternative measures are in place

#### How to Deactivate

1. Click "Deactivate Emergency" button
2. Enter deactivation notes (required)
3. Confirm deactivation
4. System sends confirmation to all admins

**Deactivation Dialog:**

```
DEACTIVATE EMERGENCY MODE

Emergency has been active for: [Duration]
Trigger Area: [Area Name]

Deactivation Notes (required):
[Text area for notes]

[Cancel] [DEACTIVATE]
```

**Post-Deactivation:**

- All admins receive confirmation notification
- Event is logged with deactivation details
- Visual indicators return to normal state
- System continues normal monitoring

### Emergency Response Checklist

**Immediate Actions (0-2 minutes):**

- [ ] Verify emergency alert received
- [ ] Check affected areas on dashboard
- [ ] Confirm current density readings
- [ ] Alert field staff in affected areas
- [ ] Activate crowd control measures

**Short-term Actions (2-10 minutes):**

- [ ] Monitor density trends
- [ ] Coordinate with security team
- [ ] Implement traffic redirection
- [ ] Update pilgrim notifications if needed
- [ ] Document actions taken

**Resolution (10+ minutes):**

- [ ] Verify density returning to safe levels
- [ ] Confirm crowd dispersal
- [ ] Deactivate emergency mode with notes
- [ ] Conduct brief team debrief
- [ ] Review alert logs and response times


## Troubleshooting

### Common Issues and Solutions

#### Issue: Not Receiving Notifications

**Symptoms:**

- Alerts appear on dashboard but no notifications received
- Some channels work, others don't

**Possible Causes & Solutions:**

1. **Notification preferences not configured**
   - Go to Notification Settings
   - Ensure at least one channel is selected
   - Verify severity filter includes alert levels

2. **Channel-specific issues**
   - **Push**: Check browser notification permissions
   - **SMS**: Verify phone number in admin profile
   - **Email**: Check spam folder, verify email address

3. **Area filtering too restrictive**
   - Review area filter settings
   - Remove filters or add more areas

4. **Check system health**
   - Navigate to `/admin/crowd-risk/health`
   - Look for notification service issues
   - Check delivery success rates

**Quick Fix:**

```typescript
// Reset notification preferences to defaults
{
  channels: ["push", "sms", "email"],
  severityFilter: ["warning", "critical", "emergency"],
  areaFilter: [] // All areas
}
```

#### Issue: Indicators Not Updating

**Symptoms:**

- Area cards show stale data
- "Last updated" timestamp is old
- Indicators don't change color

**Possible Causes & Solutions:**

1. **Data stream connection lost**
   - Check health dashboard for data stream status
   - Look for "degraded" or "down" status
   - System will attempt automatic reconnection

2. **Browser tab inactive**
   - Some browsers throttle inactive tabs
   - Bring tab to foreground
   - Refresh page if needed

3. **Network connectivity issues**
   - Check internet connection
   - Look for network errors in browser console
   - Try refreshing the page

**Quick Fix:**

- Refresh the page (F5)
- Check connection status indicator
- Wait for automatic reconnection (30 seconds)


#### Issue: Threshold Configuration Not Applying

**Symptoms:**

- Saved threshold changes don't take effect
- Alerts still use old thresholds
- Validation errors when saving

**Possible Causes & Solutions:**

1. **Validation errors**
   - Ensure warning < critical < emergency
   - All values must be positive numbers
   - Check for error messages in UI

2. **Time profile conflicts**
   - Verify time ranges don't overlap
   - Check start time < end time
   - Ensure threshold ordering in profiles

3. **Propagation delay**
   - Changes take up to 10 seconds to apply
   - Wait and monitor for updates
   - Check audit log to confirm save

**Validation Example:**

```typescript
// ❌ Invalid - wrong ordering
{
  warningThreshold: 80,
  criticalThreshold: 70,  // Must be > warning
  emergencyThreshold: 90
}

// ✅ Valid
{
  warningThreshold: 60,
  criticalThreshold: 75,
  emergencyThreshold: 90
}
```

#### Issue: High Alert Frequency

**Symptoms:**

- Too many alerts being generated
- Alert fatigue among administrators
- Frequent threshold violations

**Possible Causes & Solutions:**

1. **Thresholds set too low**
   - Review threshold values
   - Adjust based on historical data
   - Use analytics to find optimal values

2. **Normal density fluctuations**
   - Consider time-based profiles
   - Set higher thresholds during expected peaks
   - Use 30-second normalization window

3. **Area capacity misconfigured**
   - Verify area capacity values
   - Adjust if actual capacity differs
   - Recalibrate density calculations

**Optimization Steps:**

1. Review analytics for alert patterns
2. Identify areas with frequent alerts
3. Adjust thresholds incrementally (+5-10%)
4. Monitor for 24-48 hours
5. Fine-tune based on results


#### Issue: Emergency Mode Won't Deactivate

**Symptoms:**

- Deactivate button not working
- Emergency mode persists after resolution
- Cannot exit emergency state

**Possible Causes & Solutions:**

1. **Density still above emergency threshold**
   - Check current density readings
   - Wait for density to drop below threshold
   - System may prevent premature deactivation

2. **Required notes not provided**
   - Deactivation requires notes
   - Enter detailed resolution notes
   - Explain actions taken

3. **Permission issues**
   - Verify admin has deactivation permissions
   - Check role-based access control
   - Contact super admin if needed

**Manual Override (Super Admin Only):**

If emergency mode is stuck:

1. Navigate to `/admin/crowd-risk/testing`
2. Use "Reset Emergency Mode" control
3. Document reason for override
4. Review system logs for root cause

#### Issue: Poor Notification Delivery Rate

**Symptoms:**

- Health dashboard shows <99.5% success rate
- Notifications failing to deliver
- High failure counts by channel

**Possible Causes & Solutions:**

1. **SMS gateway issues**
   - Check SMS service status
   - Verify API credentials
   - Review rate limits

2. **Email service problems**
   - Check email service status
   - Verify SMTP configuration
   - Check for blacklisting

3. **Network connectivity**
   - Test external service connectivity
   - Check firewall rules
   - Verify DNS resolution

**Monitoring:**

- Check `/admin/crowd-risk/health` regularly
- Set up alerts for <99% delivery rate
- Review failure logs for patterns
- Contact service providers if persistent


### Error Messages and Meanings

| Error Message | Meaning | Solution |
|---------------|---------|----------|
| "Data stream connection lost" | Lost connection to density data source | Wait for auto-reconnect or refresh page |
| "Notification delivery failed" | Failed to send notification via channel | Check channel configuration and service status |
| "Invalid threshold configuration" | Threshold values don't meet validation rules | Ensure warning < critical < emergency |
| "Time profile overlap detected" | Time ranges in profiles overlap | Adjust time ranges to remove overlap |
| "Emergency activation failed" | Cannot activate emergency mode | Check permissions and system status |
| "Configuration update timeout" | Threshold update took too long | Retry configuration save |
| "Alert acknowledgment failed" | Cannot acknowledge alert | Verify alert ID and admin permissions |
| "System in degraded mode" | Multiple errors detected | Check health dashboard for details |

### Getting Help

**For Technical Issues:**

1. Check this troubleshooting guide
2. Review system health dashboard
3. Check browser console for errors
4. Contact technical support with:
   - Error message
   - Steps to reproduce
   - Screenshot if applicable
   - Browser and version

**For Configuration Help:**

1. Review admin configuration guide
2. Check audit logs for recent changes
3. Consult with safety team
4. Contact system administrator

**Emergency Support:**

- For critical system failures during active emergency
- Contact: [Emergency Support Contact]
- Include: Current situation, affected areas, actions taken


## Deployment

### Requirements

#### System Requirements

- **Node.js**: 18.x or higher
- **npm/pnpm**: Latest stable version
- **Database**: PostgreSQL 14+ or compatible storage
- **Memory**: Minimum 2GB RAM (4GB recommended)
- **CPU**: 2+ cores recommended

#### External Services

- **SMS Gateway**: Twilio or compatible service
- **Email Service**: SendGrid, AWS SES, or SMTP server
- **Push Notifications**: Firebase Cloud Messaging or similar
- **Density Data Stream**: Real-time data feed endpoint

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# SMS Gateway (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Email Service (SendGrid)
SENDGRID_API_KEY=your_api_key
SENDGRID_FROM_EMAIL=alerts@your-domain.com

# Push Notifications (Firebase)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Density Data Stream
DENSITY_STREAM_URL=wss://density-provider.com/stream
DENSITY_STREAM_API_KEY=your_api_key

# Monitoring (Optional)
SENTRY_DSN=your_sentry_dsn
APM_SERVER_URL=your_apm_server

# Feature Flags
ENABLE_EMERGENCY_MODE=true
ENABLE_SMS_NOTIFICATIONS=true
ENABLE_EMAIL_NOTIFICATIONS=true
```


### Installation Steps

#### 1. Clone and Install Dependencies

```bash
# Clone repository
git clone <repository-url>
cd TeamDigitalDaredevils

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

#### 2. Database Setup

```bash
# Run database migrations
pnpm db:migrate

# Seed initial data (optional)
pnpm db:seed
```

#### 3. Build Application

```bash
# Build for production
pnpm build

# Verify build
pnpm start
```

#### 4. Configure External Services

**SMS Gateway (Twilio):**

1. Create Twilio account
2. Get Account SID and Auth Token
3. Purchase phone number
4. Add credentials to `.env`

**Email Service (SendGrid):**

1. Create SendGrid account
2. Generate API key
3. Verify sender email
4. Add credentials to `.env`

**Push Notifications (Firebase):**

1. Create Firebase project
2. Enable Cloud Messaging
3. Download service account key
4. Add credentials to `.env`


### Deployment Options

#### Option 1: Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t crowd-risk-engine .
docker run -p 3000:3000 --env-file .env crowd-risk-engine
```

#### Option 2: Kubernetes Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: crowd-risk-engine
spec:
  replicas: 3
  selector:
    matchLabels:
      app: crowd-risk-engine
  template:
    metadata:
      labels:
        app: crowd-risk-engine
    spec:
      containers:
      - name: app
        image: crowd-risk-engine:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        envFrom:
        - secretRef:
            name: crowd-risk-secrets
```

#### Option 3: Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
```

### Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test database connectivity
- [ ] Verify external service connections (SMS, Email, Push)
- [ ] Test density data stream connection
- [ ] Configure monitoring and alerting
- [ ] Set up log aggregation
- [ ] Configure backup strategy
- [ ] Test emergency procedures
- [ ] Train administrators on system
- [ ] Document custom configurations


### Monitoring and Maintenance

#### Application Monitoring

**Recommended Tools:**

- **APM**: New Relic, Datadog, or Elastic APM
- **Error Tracking**: Sentry
- **Logging**: ELK Stack, CloudWatch, or Papertrail
- **Uptime Monitoring**: Pingdom, UptimeRobot

**Key Metrics to Monitor:**

- Response times (target: <2s for alerts)
- Notification delivery rate (target: >99.5%)
- Error rates by service
- Database query performance
- Memory and CPU usage
- WebSocket connection count

#### Health Checks

Configure health check endpoints:

```bash
# Application health
GET /api/health

# Crowd risk system health
GET /api/crowd-risk/health

# Database health
GET /api/health/db
```

#### Backup Strategy

**Database Backups:**

- Daily full backups
- Hourly incremental backups
- Retain for 30 days minimum
- Test restore procedures monthly

**Configuration Backups:**

- Version control for threshold configs
- Export audit logs weekly
- Backup alert history monthly

#### Maintenance Windows

**Recommended Schedule:**

- Weekly: Review system health metrics
- Monthly: Update dependencies and security patches
- Quarterly: Performance optimization review
- Annually: Disaster recovery drill

**During Maintenance:**

1. Notify administrators in advance
2. Schedule during low-traffic periods
3. Keep emergency mode available
4. Monitor closely after updates


### Scaling Considerations

#### Horizontal Scaling

The system supports horizontal scaling for:

- **Web servers**: Load balance across multiple instances
- **Notification workers**: Distribute notification processing
- **Database**: Read replicas for query distribution

**Load Balancer Configuration:**

```nginx
upstream crowd_risk {
    least_conn;
    server app1:3000;
    server app2:3000;
    server app3:3000;
}

server {
    listen 80;
    location / {
        proxy_pass http://crowd_risk;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

#### Performance Optimization

**Database Optimization:**

- Index on frequently queried fields (areaId, timestamp, severity)
- Partition alert history by date
- Archive old data (>90 days) to cold storage

**Caching Strategy:**

- Cache threshold configurations (10-minute TTL)
- Cache area definitions (1-hour TTL)
- Cache admin preferences (5-minute TTL)

**Connection Pooling:**

- Configure database connection pool (min: 10, max: 50)
- Reuse HTTP connections for external services
- Implement WebSocket connection pooling

### Security Considerations

**Authentication:**

- Implement JWT-based authentication
- Rotate secrets regularly
- Use HTTPS for all connections

**Authorization:**

- Role-based access control (RBAC)
- Audit all administrative actions
- Restrict emergency mode activation

**Data Protection:**

- Encrypt sensitive data at rest
- Use TLS for data in transit
- Anonymize pilgrim data in logs
- Comply with data retention policies

**Rate Limiting:**

- API endpoints: 100 requests/minute per IP
- Configuration updates: 10 requests/minute per admin
- Emergency activation: 5 requests/minute per admin

---

## Additional Resources

### Core Documentation

- **[Architecture Documentation](./ARCHITECTURE.md)**: Detailed system architecture, design patterns, and component interactions
- **[Design Document](./.kiro/specs/crowd-risk-alerts/design.md)**: Original design specifications and technical decisions
- **[Requirements Document](./.kiro/specs/crowd-risk-alerts/requirements.md)**: System requirements and acceptance criteria
- **[API Reference](./API_REFERENCE.md)**: Complete API documentation for all services and endpoints

### User Guides

- **[User Guide](./USER_GUIDE.md)**: Comprehensive guide for monitoring operators and administrators
- **[Admin Configuration Guide](./ADMIN_CONFIGURATION_GUIDE.md)**: Step-by-step configuration instructions
- **[Emergency Procedures](./EMERGENCY_PROCEDURES.md)**: Emergency mode activation and response procedures
- **[Troubleshooting Guide](./TROUBLESHOOTING.md)**: Common issues and solutions

### Deployment and Operations

- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)**: Installation, configuration, and deployment instructions
- **[Performance Optimizations](./PERFORMANCE_OPTIMIZATIONS.md)**: Performance tuning and optimization strategies
- **[Error Handling](./ERROR_HANDLING_README.md)**: Error handling architecture and recovery procedures

### Component Documentation

- **[Alert Engine](./ALERT_ENGINE_README.md)**: Alert generation and routing system
- **[Alert Logger](./ALERT_LOGGER_README.md)**: Alert history and logging system
- **[Admin Notifier](./ADMIN_NOTIFIER_README.md)**: Administrator notification delivery
- **[Pilgrim Notifier](./PILGRIM_NOTIFIER_README.md)**: Pilgrim notification system
- **[Notification Optimizations](./NOTIFICATION_OPTIMIZATIONS.md)**: Notification performance improvements

### Quick Links

- **[Documentation Index](./DOCUMENTATION_INDEX.md)**: Complete index of all documentation
- **[Documentation Summary](./DOCUMENTATION_SUMMARY.md)**: Quick overview of available documentation

## Support

For questions or issues:

- Technical Support: support@your-domain.com
- Emergency Hotline: [Emergency Contact]
- Documentation: https://docs.your-domain.com

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Maintained by**: TeamDigitalDaredevils
