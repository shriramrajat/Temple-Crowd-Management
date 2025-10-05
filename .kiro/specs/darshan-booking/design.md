# Design Document

## Overview

The Darshan Booking Component is a React component that provides a complete booking flow for temple darshan slots. It integrates with the existing Firebase infrastructure to store bookings in Firestore and generates QR codes for booking confirmations. The component follows the established patterns in the codebase, utilizing the existing Firebase services and maintaining consistency with the current architecture.

## Architecture

### Component Structure
```
DarshanBooking/
├── DarshanBooking.tsx          # Main booking component
├── components/
│   ├── DatePicker.tsx          # Date selection component
│   ├── TimeSlotPicker.tsx      # Time slot selection component
│   ├── BookingConfirmation.tsx # Confirmation screen with QR code
│   └── LoadingSpinner.tsx      # Loading indicator
├── hooks/
│   ├── useBookingService.ts    # Custom hook for booking operations
│   └── useQRCode.ts           # Custom hook for QR code generation
├── services/
│   └── bookingService.ts       # Booking business logic
├── types/
│   └── booking.ts             # TypeScript interfaces
└── utils/
    └── dateUtils.ts           # Date formatting utilities
```

### Data Flow
1. User selects date → Component fetches available slots for that date
2. User selects time slot → Component validates selection and enables booking
3. User confirms booking → Component stores data in Firestore and generates QR code
4. System displays confirmation screen with booking details and QR code

## Components and Interfaces

### Main Component Interface
```typescript
interface DarshanBookingProps {
  userId: string;
  onBookingComplete?: (booking: Booking) => void;
  onError?: (error: BookingError) => void;
  className?: string;
}
```

### Core Data Models
```typescript
interface Booking {
  id: string;
  userId: string;
  slotTime: Date;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

interface TimeSlot {
  id: string;
  time: string;
  date: Date;
  capacity: number;
  booked: number;
  available: boolean;
}

interface BookingError {
  code: string;
  message: string;
  details?: any;
}
```

### Service Layer
The component will utilize a new `bookingService` that follows the same patterns as the existing `authService` and `firestoreService`:

```typescript
interface BookingService {
  getAvailableSlots(date: Date): Promise<TimeSlot[]>;
  createBooking(userId: string, slotTime: Date): Promise<Booking>;
  getBooking(bookingId: string): Promise<Booking>;
  cancelBooking(bookingId: string): Promise<void>;
}
```

## Data Models

### Firestore Collections

#### Bookings Collection (`/bookings`)
```typescript
{
  id: string;           // Auto-generated document ID
  userId: string;       // Reference to authenticated user
  slotTime: Timestamp;  // Firebase Timestamp for the booking slot
  status: string;       // 'confirmed' | 'cancelled' | 'completed'
  createdAt: Timestamp; // Firebase Timestamp
  updatedAt: Timestamp; // Firebase Timestamp
}
```

#### Time Slots Collection (`/timeSlots`)
```typescript
{
  id: string;           // Format: YYYY-MM-DD-HH-MM
  date: Timestamp;      // Date of the slot
  time: string;         // Time in HH:MM format
  capacity: number;     // Maximum bookings for this slot
  booked: number;       // Current number of bookings
  available: boolean;   // Computed field for availability
}
```

### QR Code Data Structure
The QR code will encode a JSON string containing:
```typescript
{
  bookingId: string;
  userId: string;
  slotTime: string;     // ISO string format
  status: string;
  verificationCode: string; // Hash for security
}
```

## Error Handling

### Error Categories
1. **Network Errors**: Firebase connection issues, timeout errors
2. **Authentication Errors**: User not signed in, invalid permissions
3. **Validation Errors**: Invalid date selection, slot unavailable
4. **Business Logic Errors**: Slot capacity exceeded, duplicate booking

### Error Handling Strategy
- Use React Error Boundaries for component-level error catching
- Implement retry mechanisms for network failures
- Provide user-friendly error messages with actionable guidance
- Log errors for debugging while maintaining user privacy

### Error Recovery
- Automatic retry for transient network errors
- Graceful degradation when services are unavailable
- Clear error messages with suggested actions
- Option to refresh data when errors occur

## Testing Strategy

### Unit Testing
- Test individual components with React Testing Library
- Mock Firebase services for isolated testing
- Test error scenarios and edge cases
- Validate date/time calculations and formatting

### Integration Testing
- Test complete booking flow with Firebase emulators
- Verify Firestore data persistence and retrieval
- Test QR code generation and data encoding
- Validate component interactions and state management

### Test Coverage Areas
1. **Component Rendering**: All UI states render correctly
2. **User Interactions**: Date/time selection, booking confirmation
3. **Service Integration**: Firebase operations, error handling
4. **Data Validation**: Input validation, business rules
5. **QR Code Generation**: Correct data encoding, image generation

### Testing Tools
- Jest for unit testing framework
- React Testing Library for component testing
- Firebase emulators for integration testing
- MSW (Mock Service Worker) for API mocking if needed

## Implementation Considerations

### Performance Optimizations
- Lazy load QR code generation library
- Implement date-based caching for available slots
- Use React.memo for expensive re-renders
- Debounce date picker changes to reduce API calls

### Accessibility
- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management for modal states

### Mobile Responsiveness
- Touch-friendly date/time pickers
- Responsive layout for different screen sizes
- Optimized QR code size for mobile viewing
- Swipe gestures for date navigation

### Security Considerations
- Validate all user inputs on both client and server
- Use Firebase Security Rules for data access control
- Generate secure verification codes for QR codes
- Sanitize data before QR code generation

### Integration with Existing Codebase
- Follow established TypeScript patterns
- Use existing error handling utilities
- Integrate with current authentication system
- Maintain consistency with existing UI components
- Utilize established Firebase service patterns