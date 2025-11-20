# Validation Schemas and Utilities

This directory contains all Zod validation schemas and utility functions for the Smart Darshan Slot Booking system.

## Overview

The validation layer ensures data integrity across the application by validating:
- User input from forms
- API request/response data
- Database operations
- QR code data

## Structure

```
validations/
├── index.ts           # Central export point
├── booking.ts         # Booking form and API validations
├── slot.ts            # Slot configuration validations
├── qr.ts              # QR code data validations
├── admin.ts           # Admin query parameter validations
└── __tests__/         # Test files
```

## Usage Examples

### Booking Form Validation

```typescript
import { bookingFormSchema, validatePhoneNumber, validateEmail } from "@/lib/validations";

// Validate form data
const result = bookingFormSchema.safeParse({
  name: "John Doe",
  phone: "9876543210",
  email: "john@example.com",
  numberOfPeople: 3,
  slotId: "uuid-here",
});

if (!result.success) {
  console.error(result.error.errors);
}

// Use utility functions
const isValidPhone = validatePhoneNumber("9876543210"); // true
const isValidEmail = validateEmail("test@example.com"); // true
```

### Slot Configuration Validation

```typescript
import { slotConfigSchema } from "@/lib/validations";

const result = slotConfigSchema.safeParse({
  date: new Date("2025-01-01"),
  startTime: "09:00",
  endTime: "10:00",
  capacity: 50,
  isActive: true,
});
```

### React Hook Form Integration

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingFormSchema, type BookingFormData } from "@/lib/validations";

const form = useForm<BookingFormData>({
  resolver: zodResolver(bookingFormSchema),
  defaultValues: {
    name: "",
    phone: "",
    email: "",
    numberOfPeople: 1,
    slotId: "",
  },
});
```

### API Route Validation

```typescript
import { createBookingSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const body = await request.json();
  
  const result = createBookingSchema.safeParse(body);
  
  if (!result.success) {
    return Response.json(
      { error: "Validation failed", details: result.error.errors },
      { status: 400 }
    );
  }
  
  // Proceed with validated data
  const validatedData = result.data;
}
```

## Validation Rules

### Phone Number
- Must be exactly 10 digits
- Must start with 6, 7, 8, or 9 (Indian format)
- Pattern: `/^[6-9]\d{9}$/`

### Email
- Standard email format validation
- Maximum 255 characters

### Name
- Minimum 2 characters
- Maximum 100 characters
- Only letters and spaces allowed

### Number of People
- Integer between 1 and 10
- Whole numbers only

### Time Format
- HH:MM format (24-hour)
- Pattern: `/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/`
- Examples: "09:00", "14:30", "23:59"

### Date Format
- ISO date string for API: "YYYY-MM-DD"
- JavaScript Date object for forms

### Slot Capacity
- Integer between 1 and 1000
- Must be greater than or equal to existing bookings when updating

## Type Safety

All schemas export TypeScript types for type-safe usage:

```typescript
import type {
  BookingFormData,
  SlotConfigData,
  QRCodeData,
  AdminBookingsQuery,
} from "@/lib/validations";
```

## Testing

Run validation tests:

```bash
npm test -- validations
```

## Error Handling

Zod provides detailed error messages:

```typescript
const result = bookingFormSchema.safeParse(invalidData);

if (!result.success) {
  result.error.errors.forEach((err) => {
    console.log(`${err.path.join(".")}: ${err.message}`);
  });
}
```

## Best Practices

1. **Always validate on both client and server**: Client-side for UX, server-side for security
2. **Use `safeParse()` instead of `parse()`**: Prevents throwing errors
3. **Provide clear error messages**: Help users understand what went wrong
4. **Validate early**: Catch errors before they reach the database
5. **Type inference**: Use `z.infer<typeof schema>` for automatic type generation

## Related Files

- `/lib/types/api.ts` - TypeScript interfaces for API types
- `/app/api/*` - API routes using these validations
- `/components/*` - Form components using these schemas
