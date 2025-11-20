# Admin Command Center API

This directory contains the REST API endpoints and real-time data streaming for the Admin Command Center Dashboard.

## REST API Endpoints

### GET /api/admin/zones

Returns all zones with current occupancy and density information.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "zone-1",
      "name": "Main Entrance",
      "coordinates": { "x": 50, "y": 50, "width": 100, "height": 80 },
      "currentOccupancy": 145,
      "maxCapacity": 200,
      "densityLevel": "medium",
      "densityThreshold": 0.8,
      "lastUpdated": "2024-01-01T12:00:00.000Z"
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### GET /api/admin/alerts

Returns recent alerts with optional limit parameter.

**Query Parameters:**
- `limit` (optional): Number of alerts to return (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "alert-1",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "severity": "warning",
      "zoneId": "zone-1",
      "zoneName": "Main Entrance",
      "type": "high-density",
      "message": "High crowd density detected",
      "acknowledged": false
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### GET /api/admin/footfall

Returns footfall data with time range and zone filters.

**Query Parameters:**
- `timeRange` (optional): 'hourly' | 'daily' | 'weekly' (default: 'daily')
- `zoneId` (optional): Filter by specific zone

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2024-01-01T12:00:00.000Z",
      "count": 150,
      "zoneId": "zone-1"
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Real-Time Data Streaming

### GET /api/admin/ws

Server-Sent Events (SSE) endpoint for real-time updates.

**Authentication:**
- Requires `Authorization: Bearer <token>` header

**Message Types:**

#### Zone Update
```json
{
  "type": "zone_update",
  "payload": {
    "zoneId": "zone-1",
    "occupancy": 150,
    "densityLevel": "medium",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

#### Alert
```json
{
  "type": "alert",
  "payload": {
    "id": "alert-123",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "severity": "critical",
    "zoneId": "zone-1",
    "zoneName": "Main Entrance",
    "type": "high-density",
    "message": "Critical crowd density detected",
    "acknowledged": false
  }
}
```

#### Warning
```json
{
  "type": "warning",
  "payload": {
    "id": "warning-123",
    "zoneId": "zone-1",
    "zoneName": "Main Entrance",
    "currentDensity": 0.95,
    "threshold": 0.8,
    "timestamp": "2024-01-01T12:00:00.000Z",
    "status": "active"
  }
}
```

#### Connection Status
```json
{
  "type": "connection_status",
  "payload": {
    "status": "connected"
  }
}
```

## Mock Data

All endpoints currently use mock data generators for development purposes. The mock data includes:

- 8 predefined zones with varying occupancy levels
- Realistic alert generation with different severities
- Time-series footfall data with day/night patterns
- High-density warnings for zones exceeding thresholds

## Usage Example

```typescript
// Fetch zones
const response = await fetch('/api/admin/zones');
const { data: zones } = await response.json();

// Fetch footfall data for a specific zone
const footfallResponse = await fetch('/api/admin/footfall?timeRange=hourly&zoneId=zone-1');
const { data: footfallData } = await footfallResponse.json();

// Connect to real-time updates
const eventSource = new EventSource('/api/admin/ws', {
  headers: {
    'Authorization': 'Bearer your-token-here'
  }
});

eventSource.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};
```

## Production Considerations

For production deployment:

1. Replace mock data generators with actual database queries
2. Implement proper authentication middleware
3. Consider using WebSocket instead of SSE for bidirectional communication
4. Add rate limiting and request validation
5. Implement proper error handling and logging
6. Add database connection pooling
7. Consider caching strategies for frequently accessed data
