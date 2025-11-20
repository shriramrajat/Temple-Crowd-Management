# Alert Logger Service

## Overview

The Alert Logger Service provides persistent storage for alert events with comprehensive tracking of notification results, acknowledgments, and resolutions. It integrates seamlessly with the AlertEngine and AdminNotifier to automatically log all alerts and their lifecycle events.

**Requirements Addressed:**
- **1.4**: Alert history and tracking
- **2.1**: Alert acknowledgment workflow

## Features

### Core Functionality

1. **Alert Logging**
   - Automatic logging of all alert events
   - Storage of notification results (admin and pilgrim)
   - Persistent alert history

2. **Acknowledgment Tracking**
   - Record admin acknowledgments with timestamps
   - Prevent duplicate acknowledgments
   - Track multiple acknowledgments per alert

3. **Resolution Management**
   - Log alert resolutions with notes
   - Track resolution time and responsible admin
   - Prevent duplicate resolutions

4. **Querying and Filtering**
   - Query by area ID
   - Query by time range
   - Filter unacknowledged alerts
   - Filter unresolved alerts

5. **Statistics**
   - Total alerts logged
   - Acknowledgment rates
   - Resolution rates
   - Average acknowledgment time
   - Average resolution time

## Architecture

### Storage Interface

The AlertLogger uses a pluggable storage interface that supports:
- **In-Memory Storage** (default): Fast, suitable for development and testing
- **Persistent Storage** (future): Database-backed storage for production

```typescript
interface AlertLogStorage {
  save(entry: AlertLogEntry): Promise<void>;
  get(alertId: string): Promise<AlertLogEntry | null>;
  getAll(options?: FilterOptions): Promise<AlertLogEntry[]>;
  update(alertId: string, updates: Partial<AlertLogEntry>): Promise<void>;
}
```

### Data Model

```typescript
interface AlertLogEntry {
  id: string;                          // Alert ID
  alertEvent: AlertEvent;              // Full alert event
  notificationResults: {
    adminNotifications: NotificationResult[];
    pilgrimCount: number;
  };
  acknowledgments: AlertAcknowledgment[];
  resolution?: AlertResolution;
}
```

## Integration

### AlertEngine Integration

The AlertLogger is automatically integrated with the AlertEngine:

```typescript
// In AlertEngine.processEvaluation()
const alertLogger = getAlertLogger();
alertLogger.logAlert(alert, [], 0).catch(error => {
  // Error handling
});
```

**What's Logged:**
- Alert event when generated
- Acknowledgments when alerts are acknowledged

### AdminNotifier Integration

The AlertLogger is automatically integrated with the AdminNotifier:

```typescript
// In AdminNotifier.sendAlert()
const alertLogger = getAlertLogger();
alertLogger.updateNotificationResults(alert.id, results, 0).catch(error => {
  // Error handling
});
```

**What's Logged:**
- Notification results after delivery attempts
- Delivery success/failure status
- Delivery times per channel

## Usage

### Basic Usage

```typescript
import { getAlertLogger } from '@/lib/crowd-risk/alert-logger';

const logger = getAlertLogger();

// Log an alert (usually done automatically by AlertEngine)
await logger.logAlert(alert, notificationResults, pilgrimCount);

// Log an acknowledgment
await logger.logAcknowledgment(alertId, adminId);

// Log a resolution
await logger.logResolution(alertId, adminId, 'Resolution notes');

// Query alerts
const allAlerts = await logger.getAlertLogs();
const areaAlerts = await logger.getAlertLogsByArea('area-1');
const unacknowledged = await logger.getUnacknowledgedAlerts();
const unresolved = await logger.getUnresolvedAlerts();

// Get statistics
const stats = await logger.getStats();
console.log(`Total alerts: ${stats.totalAlerts}`);
console.log(`Acknowledgment rate: ${(stats.acknowledgedAlerts / stats.totalAlerts * 100).toFixed(1)}%`);
```

### Querying with Filters

```typescript
// Query by area and time range
const logs = await logger.getAlertLogs({
  areaId: 'area-1',
  startTime: Date.now() - 24 * 60 * 60 * 1000, // Last 24 hours
  endTime: Date.now(),
  limit: 50
});

// Query by time range only
const recentLogs = await logger.getAlertLogsByTimeRange(
  Date.now() - 60 * 60 * 1000, // Last hour
  Date.now(),
  100
);
```

### Updating Notification Results

```typescript
// Update notification results (usually done automatically by AdminNotifier)
await logger.updateNotificationResults(
  alertId,
  updatedNotificationResults,
  updatedPilgrimCount
);
```

## API Reference

### AlertLogger Class

#### Methods

##### `logAlert(alert, adminNotifications, pilgrimCount)`
Log a new alert event with notification results.

**Parameters:**
- `alert: AlertEvent` - Alert event to log
- `adminNotifications: NotificationResult[]` - Admin notification results (default: [])
- `pilgrimCount: number` - Number of pilgrims notified (default: 0)

**Returns:** `Promise<void>`

##### `logAcknowledgment(alertId, adminId)`
Log an acknowledgment for an alert.

**Parameters:**
- `alertId: string` - Alert ID
- `adminId: string` - Admin who acknowledged

**Returns:** `Promise<void>`

**Throws:** Error if alert not found or already acknowledged by this admin

##### `logResolution(alertId, resolvedBy, notes)`
Log a resolution for an alert.

**Parameters:**
- `alertId: string` - Alert ID
- `resolvedBy: string` - Admin who resolved
- `notes: string` - Resolution notes

**Returns:** `Promise<void>`

**Throws:** Error if alert not found or already resolved

##### `getAlertLog(alertId)`
Get a specific alert log entry.

**Parameters:**
- `alertId: string` - Alert ID

**Returns:** `Promise<AlertLogEntry | null>`

##### `getAlertLogs(options?)`
Get alert logs with optional filtering.

**Parameters:**
- `options?: { areaId?, startTime?, endTime?, limit? }` - Filter options

**Returns:** `Promise<AlertLogEntry[]>`

##### `getAlertLogsByArea(areaId, limit?)`
Get alert logs for a specific area.

**Parameters:**
- `areaId: string` - Area ID
- `limit?: number` - Maximum number of logs

**Returns:** `Promise<AlertLogEntry[]>`

##### `getAlertLogsByTimeRange(startTime, endTime, limit?)`
Get alert logs within a time range.

**Parameters:**
- `startTime: number` - Start timestamp (milliseconds)
- `endTime: number` - End timestamp (milliseconds)
- `limit?: number` - Maximum number of logs

**Returns:** `Promise<AlertLogEntry[]>`

##### `getUnacknowledgedAlerts(limit?)`
Get unacknowledged alert logs.

**Parameters:**
- `limit?: number` - Maximum number of logs

**Returns:** `Promise<AlertLogEntry[]>`

##### `getUnresolvedAlerts(limit?)`
Get unresolved alert logs.

**Parameters:**
- `limit?: number` - Maximum number of logs

**Returns:** `Promise<AlertLogEntry[]>`

##### `getStats()`
Get statistics about logged alerts.

**Returns:** `Promise<{ totalAlerts, acknowledgedAlerts, resolvedAlerts, averageAcknowledgmentTime, averageResolutionTime }>`

##### `updateNotificationResults(alertId, adminNotifications, pilgrimCount?)`
Update notification results for an alert.

**Parameters:**
- `alertId: string` - Alert ID
- `adminNotifications: NotificationResult[]` - Updated notification results
- `pilgrimCount?: number` - Updated pilgrim count

**Returns:** `Promise<void>`

### Singleton Functions

#### `getAlertLogger()`
Get the singleton AlertLogger instance.

**Returns:** `AlertLogger`

#### `resetAlertLogger()`
Reset the singleton instance (useful for testing).

**Returns:** `void`

## Testing

Run the verification script to test all AlertLogger functionality:

```bash
npx tsx lib/crowd-risk/verify-alert-logger.ts
```

The verification script tests:
- Alert logging
- Acknowledgment logging
- Resolution logging
- Filtering and querying
- Statistics calculation
- AlertEngine integration
- AdminNotifier integration

## Error Handling

The AlertLogger integrates with the ErrorHandler service for consistent error handling:

```typescript
try {
  await logger.logAlert(alert, results, count);
} catch (error) {
  // Error is automatically logged by ErrorHandler
  // Handle error appropriately
}
```

**Error Categories:**
- `alert-logging`: Failed to log alert
- `acknowledgment-logging`: Failed to log acknowledgment
- `resolution-logging`: Failed to log resolution
- `notification-results-update`: Failed to update notification results

## Performance Considerations

### In-Memory Storage

The default in-memory storage is fast but has limitations:
- Data is lost on application restart
- Memory usage grows with number of alerts
- Not suitable for production with high alert volumes

### Future: Persistent Storage

For production use, implement a persistent storage backend:

```typescript
class DatabaseStorage implements AlertLogStorage {
  async save(entry: AlertLogEntry): Promise<void> {
    // Save to database
  }
  
  async get(alertId: string): Promise<AlertLogEntry | null> {
    // Query database
  }
  
  // ... other methods
}

// Use custom storage
const logger = new AlertLogger(new DatabaseStorage());
```

**Recommended Database:**
- PostgreSQL with time-series optimization
- MongoDB for flexible schema
- TimescaleDB for time-series data

## Best Practices

1. **Let Integration Handle Logging**
   - Don't manually log alerts; let AlertEngine do it automatically
   - Don't manually update notification results; let AdminNotifier do it

2. **Use Appropriate Queries**
   - Use specific queries (by area, time range) instead of fetching all logs
   - Apply limits to prevent memory issues

3. **Monitor Statistics**
   - Regularly check acknowledgment and resolution rates
   - Monitor average times to identify bottlenecks

4. **Handle Errors Gracefully**
   - Logging failures shouldn't break alert processing
   - Log errors but continue operation

5. **Clean Up Old Data**
   - Implement data retention policies
   - Archive old logs to prevent unbounded growth

## Future Enhancements

1. **Persistent Storage**
   - Database-backed storage for production
   - Data retention and archiving

2. **Advanced Querying**
   - Query by severity level
   - Query by alert type
   - Full-text search in resolution notes

3. **Export Functionality**
   - Export logs to CSV/JSON
   - Generate reports

4. **Analytics**
   - Alert frequency trends
   - Response time analytics
   - Area-based statistics

5. **Notifications**
   - Alert on slow acknowledgment times
   - Alert on unresolved alerts

## Related Services

- **AlertEngine**: Generates alerts and triggers auto-logging
- **AdminNotifier**: Sends notifications and updates results
- **ErrorHandler**: Handles logging errors
- **AnalyticsDataService**: Uses logged data for analytics

## Support

For issues or questions about the AlertLogger service:
1. Check the verification script output
2. Review error logs in ErrorHandler
3. Consult the design document for architecture details
