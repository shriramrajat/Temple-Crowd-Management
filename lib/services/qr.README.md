# QR Code Service

The QR Code Service handles all QR code operations for the darshan booking system, including generation, validation, and verification.

## Features

- **QR Code Generation**: Creates Base64-encoded QR codes with booking information
- **QR Code Validation**: Decodes and validates QR code data structure
- **Usage Tracking**: Checks if a QR code has already been used
- **Comprehensive Verification**: Validates booking details, dates, and time slots
- **Check-in Management**: Marks bookings as checked-in after successful verification

## Usage

### Import the Service

```typescript
import { getQRService } from "@/lib/services";

const qrService = getQRService();
```

### Generate QR Code

```typescript
// Generate QR code for a new booking
const qrCodeDataUrl = await qrService.generateQRCode(
  "booking-uuid",
  "John Doe",
  "2025-11-16T00:00:00.000Z",
  "09:00-10:00",
  4
);

// Returns: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
```

### Generate QR Code from Existing Booking

```typescript
// Generate QR code from booking ID
const qrCodeDataUrl = await qrService.generateQRCodeFromBooking("booking-uuid");
```

### Validate QR Code Data

```typescript
// Decode and validate QR data
const qrData = await qrService.validateQRCode(base64EncodedString);

// Returns:
// {
//   bookingId: "booking-uuid",
//   name: "John Doe",
//   date: "2025-11-16T00:00:00.000Z",
//   slotTime: "09:00-10:00",
//   numberOfPeople: 4,
//   timestamp: 1700136000000
// }
```

### Check if QR Code is Used

```typescript
// Check if booking has been checked in
const isUsed = await qrService.isQRCodeUsed("booking-uuid");

// Returns: true or false
```

### Verify QR Code (Comprehensive)

```typescript
// Verify QR code with all validations
const result = await qrService.verifyQRCode(base64EncodedString);

// Success response:
// {
//   valid: true,
//   message: "QR code verified successfully",
//   booking: { /* booking details */ }
// }

// Error response:
// {
//   valid: false,
//   message: "QR code already used. Checked in at: ...",
//   error: "QR_ALREADY_USED",
//   booking: { /* booking details */ }
// }
```

### Check-in Booking

```typescript
// Mark booking as checked-in
const updatedBooking = await qrService.checkInBooking("booking-uuid");
```

## QR Code Data Structure

The QR code encodes the following information:

```typescript
interface QRCodeData {
  bookingId: string;        // UUID of the booking
  name: string;             // Name of the devotee
  date: string;             // ISO date string
  slotTime: string;         // "HH:MM-HH:MM" format
  numberOfPeople: number;   // Number of people (1-10)
  timestamp: number;        // Unix timestamp for verification
}
```

## Error Codes

The `verifyQRCode` method returns specific error codes:

- `BOOKING_NOT_FOUND`: Booking doesn't exist in database
- `BOOKING_CANCELLED`: Booking has been cancelled
- `QR_ALREADY_USED`: QR code has already been scanned
- `DATE_MISMATCH`: Booking date doesn't match QR data
- `TIME_SLOT_MISMATCH`: Time slot doesn't match QR data
- `WRONG_DATE`: Booking is not for today
- `VERIFICATION_ERROR`: General verification error

## API Integration Examples

### Booking Creation API

```typescript
// POST /api/bookings
import { getQRService } from "@/lib/services";

const qrService = getQRService();

// After creating booking in database
const qrCodeDataUrl = await qrService.generateQRCode(
  booking.id,
  booking.name,
  booking.slot.date.toISOString(),
  `${booking.slot.startTime}-${booking.slot.endTime}`,
  booking.numberOfPeople
);

return {
  booking,
  qrCodeData: qrCodeDataUrl
};
```

### QR Verification API

```typescript
// POST /api/verify
import { getQRService } from "@/lib/services";

const qrService = getQRService();

// Verify QR code
const result = await qrService.verifyQRCode(qrData);

if (result.valid) {
  // Check in the booking
  await qrService.checkInBooking(result.booking.id);
  
  return {
    valid: true,
    message: result.message,
    booking: result.booking
  };
}

return {
  valid: false,
  message: result.message,
  error: result.error
};
```

## Requirements Covered

- **4.1**: Auto QR code generation after booking confirmation
- **4.2**: QR code encoding with booking data
- **4.3**: QR code display and retrieval
- **6.1**: QR code decoding and validation
- **6.2**: Booking information display from QR
- **6.3**: First-time scan marking
- **6.4**: Already-used QR detection
- **6.5**: Date and time slot validation
- **6.6**: Check-in logging

## Testing

```typescript
// Example test
import { getQRService } from "@/lib/services";

describe("QRService", () => {
  it("should generate and validate QR code", async () => {
    const qrService = getQRService();
    
    const qrCode = await qrService.generateQRCode(
      "test-id",
      "Test User",
      new Date().toISOString(),
      "09:00-10:00",
      2
    );
    
    expect(qrCode).toContain("data:image/png;base64");
  });
});
```

## Notes

- QR codes use high error correction level (H) for better scanning reliability
- QR code images are 300x300 pixels by default
- Base64 encoding is used for data transmission
- Timestamp is included for tamper detection
- All validations are performed server-side for security
