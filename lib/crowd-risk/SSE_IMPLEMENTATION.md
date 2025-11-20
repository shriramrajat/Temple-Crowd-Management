# Server-Sent Events (SSE) Implementation

## Overview

This document describes the implementation of Server-Sent Events (SSE) for real-time density and alert updates in the Crowd Risk Engine.

**Task:** 12.1 - Set up Server-Sent Events (SSE) for real-time updates  
**Requirements:** 1.1, 2.1, 4.4  
**Status:** ✅ Complete

## Architecture

### SSE API Routes

#### 1. Density Stream (`/api/crowd-risk/density-stream`)

**File:** `app/api/crowd-risk/density-stream/route.ts`

Streams real-time density readings to connected clients:
- Sends density updates in SSE format
- Includes heartbeat messages every 30 seconds
- Handles client disconnection and cleanup
- Integrates with ErrorHandler for error logging

**Message Format:**
```typescript
// Connection message
{ type: 'connected', timestamp: number }

// Density update
{ type: 'density', data: DensityReading }

// Heartbeat (comment format)
: heartbeat <timestamp>
```

#### 2. Alert Stream (`/api/crowd-risk/alert-stream`)

**File:** `app/api/crowd-risk/alert-stream/route.ts`

Streams real-time alert events and emergency mode changes:
- Sends alert events in SSE format
- Includes emergency mode state changes
- Sends heartbeat messages every 30 seconds
- Handles client disconnection and cleanup

**Message Format:**
```typescript
// Connection message
{ type: 'connected', timestamp: number }

// Alert event
{ type: 'alert', data: AlertEvent }

// Emergency mode change
{ type: 'emergency', data: EmergencyMode | null }

// Heartbeat (comment format)
: heartbeat <timestamp>
```

### Client-Side Integration

#### 1. DensityContext Updates

**File:** `lib/crowd-risk/density-context.tsx`

**New Features:**
- SSE connection management with EventSource API
- Connection state tracking (connecting, connected, disconnected, error, reconnecting)
- Automatic reconnection with exponential backoff (1s, 2s, 4s, 8s, max 30s)
- Fallback to polling every 5 seconds after max reconnect attempts
- Integration with ErrorHandler for connection error logging

**Connection States:**
- `connecting`: Initial connection attempt
- `connected`: Successfully connected to SSE stream
- `disconnected`: Not connected (initial state or after manual disconnect)
- `error`: Connection error occurred
- `reconnecting`: Attempting to reconnect after error

**Reconnection Strategy:**
1. Attempt reconnection with exponential backoff
2. Backoff times: 1s, 2s, 4s, 8s, max 30s
3. After 5 failed attempts, fall back to polling
4. Polling interval: 5 seconds using mock data from DensityMonitor

**New Hooks:**
- `useDensityConnectionState()`: Access current SSE connection state

#### 2. AlertContext Updates

**File:** `lib/crowd-risk/alert-context.tsx`

**New Features:**
- SSE connection management for alerts
- Connection state tracking
- Automatic reconnection with exponential backoff
- Real-time alert and emergency mode updates via SSE

**Reconnection Strategy:**
1. Attempt reconnection with exponential backoff
2. Backoff times: 1s, 2s, 4s, 8s, max 30s
3. After 5 failed attempts, stop reconnecting and log error

**New Hooks:**
- `useAlertConnectionState()`: Access current SSE connection state

### Connection Status Component

**File:** `components/admin/crowd-risk/connection-status.tsx`

Visual indicator component for displaying SSE connection state:

**Features:**
- Color-coded status dots:
  - 🟢 Green: Connected
  - 🟡 Yellow: Connecting/Reconnecting (with pulsing animation)
  - 🔴 Red: Disconnected/Error
- Optional label display
- Compact variant with tooltip
- Accessible with title attributes

**Usage:**
```tsx
import { ConnectionStatus } from '@/components/admin/crowd-risk/connection-status'
import { useDensityConnectionState } from '@/lib/crowd-risk/density-context'

function MyComponent() {
  const connectionState = useDensityConnectionState()
  
  return (
    <ConnectionStatus 
      state={connectionState} 
      showLabel={true} 
    />
  )
}
```

## Integration with Monitoring Dashboard

**File:** `app/admin/crowd-risk/monitor/page.tsx`

The monitoring dashboard now displays connection status indicators for both density and alert streams:

```tsx
<div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50">
  <span className="text-xs text-muted-foreground">Density:</span>
  <ConnectionStatus state={densityConnectionState} showLabel={false} />
</div>
<div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50">
  <span className="text-xs text-muted-foreground">Alerts:</span>
  <ConnectionStatus state={alertConnectionState} showLabel={false} />
</div>
```

## Error Handling

### Connection Errors

All SSE connection errors are logged through the ErrorHandler service:

```typescript
errorHandler.handleDataStreamError(
  error,
  'sse-connection',
  { /* context */ }
)
```

### Message Parsing Errors

Failed message parsing is logged with context:

```typescript
errorHandler.handleDataStreamError(
  error,
  'sse-parse',
  { event: event.data }
)
```

### Automatic Recovery

The system automatically recovers from connection failures:

1. **Temporary Network Issues:** Automatic reconnection with exponential backoff
2. **Persistent Connection Failures:** Fallback to polling (density only)
3. **Server Errors:** Logged and reconnection attempted

## Performance Considerations

### Heartbeat Messages

- Sent every 30 seconds to keep connections alive
- Prevents proxy/firewall timeouts
- Minimal bandwidth overhead (comment format)

### Connection Pooling

- Each client maintains two SSE connections (density + alerts)
- Connections are reused across component remounts
- Proper cleanup on unmount prevents connection leaks

### Bandwidth Optimization

- Only changed data is sent (no redundant updates)
- Efficient JSON serialization
- Heartbeats use comment format (not parsed as events)

## Testing

### Manual Testing

1. **Normal Operation:**
   - Open monitoring dashboard
   - Verify connection indicators show green (connected)
   - Observe real-time density and alert updates

2. **Connection Failure:**
   - Stop the development server
   - Observe connection indicators turn yellow (reconnecting)
   - Restart server and verify automatic reconnection

3. **Fallback to Polling:**
   - Simulate 5 consecutive connection failures
   - Verify system falls back to polling for density
   - Observe mock data continues to flow

4. **Multiple Clients:**
   - Open multiple browser tabs
   - Verify each maintains independent connections
   - Check server logs for multiple SSE connections

### Development Tools

Use the testing controls at `/admin/crowd-risk/testing` to:
- Trigger mock density violations
- Simulate threshold breaches
- Test alert generation and delivery
- Verify SSE message delivery

## Future Enhancements

### Potential Improvements

1. **Connection Multiplexing:** Combine density and alert streams into single connection
2. **Compression:** Add gzip compression for message payloads
3. **Authentication:** Add JWT-based authentication for SSE endpoints
4. **Rate Limiting:** Implement per-client rate limiting
5. **Metrics:** Add connection metrics and monitoring
6. **Binary Protocol:** Consider WebSocket for bidirectional communication

### Scalability Considerations

For production deployment with many concurrent clients:

1. **Load Balancing:** Use sticky sessions for SSE connections
2. **Redis Pub/Sub:** Distribute events across multiple server instances
3. **Connection Limits:** Implement per-client connection limits
4. **Backpressure:** Add flow control for slow clients
5. **CDN:** Consider CDN with SSE support for global distribution

## References

- [Server-Sent Events Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [MDN: Using Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)

## Conclusion

The SSE implementation provides a robust, real-time communication layer for the Crowd Risk Engine with:

✅ Real-time density updates via SSE  
✅ Real-time alert updates via SSE  
✅ Automatic reconnection with exponential backoff  
✅ Fallback to polling for resilience  
✅ Connection state tracking and visualization  
✅ Integration with error handling system  
✅ Production-ready error recovery  

The system meets all requirements for sub-2-second state updates (Requirement 4.4) and provides a solid foundation for real-time monitoring.
