# Admin API Routes Documentation

This document describes the admin API routes implemented for the Darshan Slot Booking system.

## Authentication

All admin API routes require authentication. The routes are protected by:
1. **Middleware**: Checks authentication at the edge before the request reaches the route handler
2. **Route-level checks**: Each route handler validates authentication using `checkAdminAuth()`

Users must have either `admin` or `staff` role to access these routes.

## Routes

### 1. GET /api/admin/dashboard

Fetches dashboard statistics for today's bookings.

**Authentication**: Required

**Query Parameters**: None

**Response** (200 OK):
```json
{
  "stats": {
    "todayBookingsCount": 45,
    "totalCapacity": 100,
    "capacityUtilization": 45,
    "activeSlots": 5,
    "slotBreakdown": [
      {
        "slotTime": "09:00-10:00",
        "bookedCount": 10,
        "capacity": 20,
        "utilizationPercentage": 50
      }
    ]
  }
}
```

**Error Responses**:
- 401: Unauthorized (not authenticated)
- 500: Internal server error

---

### 2. GET /api/admin/slots

Fetches all slot configurations with optional filters.

**Authentication**: Required

**Query Parameters**:
- `startDate` (optional): YYYY-MM-DD format
- `endDate` (optional): YYYY-MM-DD format
- `isActive` (optional): boolean (true/false)

**Response** (200 OK):
```json
{
  "slots": [
    {
      "id": "uuid",
      "date": "2025-11-16",
      "startTime": "09:00",
      "endTime": "10:00",
      "capacity": 20,
      "bookedCount": 10,
      "isActive": true,
      "createdAt": "2025-11-16T00:00:00.000Z",
      "updatedAt": "2025-11-16T00:00:00.000Z"
    }
  ]
}
```

**Error Responses**:
- 401: Unauthorized
- 500: Internal server error

---

### 3. POST /api/admin/slots

Creates a new slot configuration.

**Authentication**: Required

**Request Body**:
```json
{
  "date": "2025-11-16",
  "startTime": "09:00",
  "endTime": "10:00",
  "capacity": 20,
  "isActive": true
}
```

**Validation Rules**:
- `date`: Required, valid date
- `startTime`: Required, HH:MM format
- `endTime`: Required, HH:MM format, must be after startTime
- `capacity`: Required, integer between 1 and 1000
- `isActive`: Optional, boolean (defaults to true)

**Response** (201 Created):
```json
{
  "slot": {
    "id": "uuid",
    "date": "2025-11-16",
    "startTime": "09:00",
    "endTime": "10:00",
    "capacity": 20,
    "bookedCount": 0,
    "isActive": true,
    "createdAt": "2025-11-16T00:00:00.000Z",
    "updatedAt": "2025-11-16T00:00:00.000Z"
  }
}
```

**Error Responses**:
- 400: Validation errors
- 401: Unauthorized
- 409: Duplicate slot (same date and time)
- 500: Internal server error

---

### 4. PUT /api/admin/slots/[slotId]

Updates an existing slot configuration.

**Authentication**: Required

**URL Parameters**:
- `slotId`: UUID of the slot to update

**Request Body** (all fields optional):
```json
{
  "startTime": "09:30",
  "endTime": "10:30",
  "capacity": 25,
  "isActive": false
}
```

**Validation Rules**:
- `startTime`: Optional, HH:MM format
- `endTime`: Optional, HH:MM format, must be after startTime if both provided
- `capacity`: Optional, integer, must be >= current booked count
- `isActive`: Optional, boolean

**Response** (200 OK):
```json
{
  "slot": {
    "id": "uuid",
    "date": "2025-11-16",
    "startTime": "09:30",
    "endTime": "10:30",
    "capacity": 25,
    "bookedCount": 10,
    "isActive": false,
    "createdAt": "2025-11-16T00:00:00.000Z",
    "updatedAt": "2025-11-16T01:00:00.000Z"
  }
}
```

**Error Responses**:
- 400: Validation errors or capacity constraint violation
- 401: Unauthorized
- 404: Slot not found
- 500: Internal server error

---

### 5. DELETE /api/admin/slots/[slotId]

Deletes a slot configuration. Prevents deletion if bookings exist.

**Authentication**: Required

**URL Parameters**:
- `slotId`: UUID of the slot to delete

**Response** (200 OK):
```json
{
  "message": "Slot deleted successfully"
}
```

**Error Responses**:
- 400: Cannot delete slot with existing bookings
- 401: Unauthorized
- 404: Slot not found
- 500: Internal server error

---

### 6. GET /api/admin/bookings

Fetches all bookings with filtering and pagination.

**Authentication**: Required

**Query Parameters**:
- `date` (optional): YYYY-MM-DD format - Filter by booking date
- `status` (optional): confirmed|cancelled|checked-in - Filter by status
- `search` (optional): string - Search by name, phone, or email
- `page` (optional): number - Page number (default: 1)
- `limit` (optional): number - Results per page (default: 50, max: 100)

**Response** (200 OK):
```json
{
  "bookings": [
    {
      "id": "uuid",
      "slotId": "uuid",
      "name": "John Doe",
      "phone": "9876543210",
      "email": "john@example.com",
      "numberOfPeople": 2,
      "qrCode": "uuid",
      "status": "confirmed",
      "checkedInAt": null,
      "createdAt": "2025-11-16T00:00:00.000Z",
      "updatedAt": "2025-11-16T00:00:00.000Z",
      "slot": {
        "id": "uuid",
        "date": "2025-11-16",
        "startTime": "09:00",
        "endTime": "10:00",
        "capacity": 20,
        "bookedCount": 10,
        "crowdLevel": "medium",
        "isAvailable": true,
        "isActive": true
      }
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 50,
  "totalPages": 2
}
```

**Error Responses**:
- 400: Invalid query parameters
- 401: Unauthorized
- 500: Internal server error

---

## Testing the Routes

### Using cURL

1. **Login first** to get authentication cookie:
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  -c cookies.txt
```

2. **Get dashboard stats**:
```bash
curl -X GET http://localhost:3000/api/admin/dashboard \
  -b cookies.txt
```

3. **Get all slots**:
```bash
curl -X GET "http://localhost:3000/api/admin/slots?isActive=true" \
  -b cookies.txt
```

4. **Create a slot**:
```bash
curl -X POST http://localhost:3000/api/admin/slots \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "date": "2025-11-20",
    "startTime": "09:00",
    "endTime": "10:00",
    "capacity": 20,
    "isActive": true
  }'
```

5. **Update a slot**:
```bash
curl -X PUT http://localhost:3000/api/admin/slots/[slotId] \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "capacity": 25,
    "isActive": false
  }'
```

6. **Delete a slot**:
```bash
curl -X DELETE http://localhost:3000/api/admin/slots/[slotId] \
  -b cookies.txt
```

7. **Get bookings with filters**:
```bash
curl -X GET "http://localhost:3000/api/admin/bookings?date=2025-11-16&status=confirmed&page=1&limit=20" \
  -b cookies.txt
```

### Using Postman or Thunder Client

1. Create a POST request to `/api/auth/signin` with credentials
2. The authentication cookie will be stored automatically
3. Make requests to admin routes - authentication will be handled automatically

---

## Requirements Coverage

This implementation satisfies the following requirements:

- **7.1**: Admin authentication check on all routes
- **7.2**: Slot configuration management (create, read, update)
- **7.3**: Update slot capacity with existing booking protection
- **7.4**: Delete slot with booking existence check
- **7.5**: Dashboard statistics with today's bookings and capacity
- **7.6**: Booking management with filtering and pagination

---

## Security Features

1. **Authentication**: All routes require valid admin/staff session
2. **Authorization**: Role-based access control (admin or staff)
3. **Input Validation**: Zod schemas validate all request data
4. **Business Logic Protection**: 
   - Cannot reduce capacity below current bookings
   - Cannot delete slots with existing bookings
5. **Error Handling**: Consistent error responses with appropriate status codes
