# Booking Service

The Booking Service handles all business logic related to booking management for the Smart Darshan Slot Booking system.

## Features

### 1. Check Availability
- Verifies slot exists and is active
- Checks if slot has available capacity
- Requirements: 1.3, 1.4

### 2. Create Booking
- Validates slot availability
- Prevents duplicate bookings (same phone/email for same slot)
- Creates booking with atomic database transaction
- Increments slot booked count
- Requirements: 1.3, 1.4, 1.6, 2.6, 8.4

### 3. Cancel Booking
- Validates 2-hour cancellation window
- Prevents cancellation of checked-in bookings
- Updates booking status to cancelled
- Decrements slot booked count atomically
- Requirements: 5.5, 5.6

### 4. Get User Bookings
- Retrieves bookings by phone or email
- Returns all bookings with slot details
- Sorted by date and time
- Requirements: 5.5

### 5. Check In Booking
- Marks booking as checked-in
- Records check-in timestamp
- Validates booking status
- Requirements: 6.3, 6.4, 6.5, 6.6

## Usage

```typescript
import { bookingService } from "@/lib/services";

// Check availability
const isAvailable = await bookingService.checkAvailability(slotId);

// Create booking
const booking = await bookingService.createBooking({
  name: "John Doe",
  phone: "9876543210",
  email: "john@example.com",
  numberOfPeople: 2,
  slotId: "slot-uuid",
});

// Cancel booking
const cancelledBooking = await bookingService.cancelBooking(bookingId);

// Get user bookings
const bookings = await bookingService.getUserBookings("9876543210");

// Check in booking
const checkedInBooking = await bookingService.checkInBooking(bookingId);
```

## Transaction Safety

The service uses database transactions for critical operations:

1. **Create Booking**: Ensures atomic booking creation and slot count increment
2. **Cancel Booking**: Ensures atomic status update and slot count decrement

This prevents race conditions and ensures data consistency.

## Error Handling

The service throws descriptive errors for:
- Slot not found
- Slot fully booked
- Duplicate bookings
- Invalid cancellation window
- Booking not found
- Already cancelled/checked-in bookings

## Validation

### Duplicate Booking Prevention
- Checks if phone or email already has a booking for the same slot
- Only considers non-cancelled bookings

### Cancellation Window
- Validates booking can only be cancelled at least 2 hours before slot time
- Calculates time remaining and provides helpful error messages

### Check-in Validation
- Prevents checking in cancelled bookings
- Prevents duplicate check-ins
- Records timestamp for audit trail

## Database Schema

The service works with the following Prisma models:

```prisma
model Booking {
  id              String   @id @default(uuid())
  slotId          String
  name            String
  phone           String
  email           String
  numberOfPeople  Int
  qrCode          String
  status          String   @default("confirmed")
  checkedInAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  slot            Slot     @relation(fields: [slotId], references: [id])
}
```

## Integration

The Booking Service integrates with:
- **Slot Service**: For availability checking
- **QR Service**: For QR code generation after booking creation
- **Notification Service**: For sending confirmation/cancellation emails
