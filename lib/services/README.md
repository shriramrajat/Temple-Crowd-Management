# Services

This directory contains business logic services for the Smart Darshan Slot Booking system.

## Slot Service

The `SlotService` handles all slot management operations including availability calculation, crowd level determination, and CRUD operations.

### Features

- **Get Available Slots**: Fetch slots for a specific date with availability status
- **Calculate Crowd Level**: Determine crowd indicators (Low/Medium/High/Full)
- **Create Slot**: Create new time slots with validation
- **Update Slot**: Modify slot configuration with booking protection
- **Update Booked Count**: Atomic increment/decrement for bookings
- **Delete Slot**: Remove slots with booking validation

### Usage

```typescript
import { slotService } from "@/lib/services";

// Get available slots for a date
const slots = await slotService.getAvailableSlots(new Date("2024-01-15"));

// Create a new slot
const newSlot = await slotService.createSlot({
  date: new Date("2024-01-15"),
  startTime: "09:00",
  endTime: "10:00",
  capacity: 100,
  isActive: true,
});

// Update slot capacity (with booking protection)
const updated = await slotService.updateSlotCapacity(slotId, 150);

// Increment booked count (atomic operation)
await slotService.updateBookedCount(slotId, 1); // Add 1 booking
await slotService.updateBookedCount(slotId, -1); // Remove 1 booking

// Check availability
const isAvailable = await slotService.isSlotAvailable(slotId);
```

### Crowd Level Calculation

The service automatically calculates crowd levels based on booking percentage:

- **Low**: < 33% capacity filled
- **Medium**: 33-66% capacity filled
- **High**: > 66% capacity filled
- **Full**: 100% capacity filled

### Error Handling

The service throws descriptive errors for:

- Duplicate slot creation
- Capacity reduction below booked count
- Exceeding slot capacity
- Negative booked count
- Deleting slots with bookings

### Requirements Coverage

This service implements the following requirements:

- **1.1, 1.2**: Slot availability display
- **1.3, 1.4**: Slot booking validation
- **3.1-3.5**: Crowd prediction badges
- **7.2-7.4**: Admin slot management

## Database Client

The `db.ts` file provides a singleton Prisma client instance with:

- Connection pooling
- Development logging
- Graceful shutdown handling
- Hot reload support in development

### Usage

```typescript
import { db } from "@/lib/db";

// Use directly in API routes
const slots = await db.slot.findMany();
```

## Testing

To test the service:

```bash
npm run test lib/services
```

## Architecture

```
lib/services/
├── slot.service.ts      # Core service class
├── slot.instance.ts     # Pre-configured instance
├── index.ts             # Exports
└── README.md            # Documentation
```
