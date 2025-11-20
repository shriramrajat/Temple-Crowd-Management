# Error Handling and Loading States Documentation

This document describes the comprehensive error handling and loading state system implemented across the application.

## Overview

The application implements a multi-layered error handling strategy:

1. **Global Error Boundary** - Catches React errors at the root level
2. **Page-Level Error Pages** - Custom 404 and error pages
3. **Component-Level Error Handling** - Reusable error display components
4. **API Error Handling** - Standardized error responses
5. **Loading States** - Skeleton loaders and spinners for all async operations

## Components

### 1. Error Boundary (`/components/error-boundary.tsx`)

A React Error Boundary component that catches JavaScript errors anywhere in the component tree.

**Usage:**
```tsx
import { ErrorBoundary } from '@/components/error-boundary'

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**Features:**
- Catches unhandled React errors
- Displays user-friendly error message
- Provides "Try Again" and "Go Home" buttons
- Logs errors to console for debugging

### 2. Error Display Components (`/components/error-display.tsx`)

Reusable components for displaying errors in a consistent way.

#### ErrorDisplay

Full-page error display with retry functionality.

**Usage:**
```tsx
import { ErrorDisplay } from '@/components/error-display'

<ErrorDisplay
  title="Failed to Load Data"
  message="Unable to fetch booking information"
  error={error}
  onRetry={() => fetchData()}
  showHomeButton={true}
/>
```

**Props:**
- `title` - Error title (default: "Something went wrong")
- `message` - Error description
- `error` - Error object or string
- `onRetry` - Optional retry callback
- `showHomeButton` - Show home button (default: true)

#### InlineError

Compact inline error display for forms and sections.

**Usage:**
```tsx
import { InlineError } from '@/components/error-display'

<InlineError
  message="Failed to submit form"
  onRetry={() => submitForm()}
/>
```

### 3. Loading State Components (`/components/loading-states.tsx`)

Pre-built skeleton loaders for common UI patterns.

#### Available Loaders:

- **SlotGridSkeleton** - For slot selection grids
- **BookingCardSkeleton** - For booking confirmation cards
- **BookingListSkeleton** - For booking lists
- **TableSkeleton** - For data tables
- **DashboardSkeleton** - For dashboard layouts
- **FormSkeleton** - For forms
- **PageLoader** - Centered spinner with message
- **FullPageLoader** - Full-screen loading overlay

**Usage:**
```tsx
import { SlotGridSkeleton, PageLoader } from '@/components/loading-states'

{loading ? (
  <SlotGridSkeleton />
) : (
  <SlotGrid slots={slots} />
)}
```

### 4. API Utilities (`/lib/api-utils.ts`)

Helper functions for consistent API error handling.

**Functions:**

- `createErrorResponse(message, statusCode, error)` - Create standardized error response
- `handleAPIError(err, context)` - Handle errors with automatic status code detection
- `validateRequiredFields(data, fields)` - Validate required fields in request body
- `createSuccessResponse(data, statusCode)` - Create success response

**Usage in API Routes:**
```tsx
import { handleAPIError, validateRequiredFields } from '@/lib/api-utils'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const validation = validateRequiredFields(body, ['name', 'email'])
    if (!validation.valid) {
      return validation.error
    }
    
    // Your logic here
    
  } catch (error) {
    return handleAPIError(error, 'POST /api/bookings')
  }
}
```

### 5. Custom Hook for API Calls (`/hooks/use-api.ts`)

React hook for handling API calls with built-in loading and error states.

**Usage:**
```tsx
import { useApi, fetchApi } from '@/hooks/use-api'

function MyComponent() {
  const { data, error, isLoading, execute } = useApi(
    async (id: string) => fetchApi(`/api/bookings/${id}`),
    {
      successMessage: 'Booking loaded successfully',
      errorMessage: 'Failed to load booking',
      onSuccess: (data) => console.log('Success:', data),
      onError: (error) => console.error('Error:', error),
    }
  )
  
  useEffect(() => {
    execute('booking-id')
  }, [])
  
  if (isLoading) return <PageLoader />
  if (error) return <ErrorDisplay error={error} onRetry={() => execute('booking-id')} />
  
  return <div>{data?.name}</div>
}
```

## Error Pages

### 1. Global Error Page (`/app/error.tsx`)

Catches errors at the page level in Next.js.

**Features:**
- Displays error message and digest
- "Try Again" button to reset error boundary
- "Go Home" button for navigation
- Automatic error logging

### 2. Global Error Handler (`/app/global-error.tsx`)

Catches critical errors that occur outside the normal React tree.

**Features:**
- Minimal inline styles (no external CSS)
- Basic error display
- Reset and home navigation

### 3. 404 Not Found Page (`/app/not-found.tsx`)

Custom 404 page for missing routes.

**Features:**
- User-friendly "Page Not Found" message
- "Go Back" and "Go Home" buttons
- Consistent styling with the app

### 4. Booking Not Found Page (`/app/darshan/confirmation/[bookingId]/not-found.tsx`)

Specific 404 page for invalid booking IDs.

**Features:**
- Booking-specific error message
- "Find My Bookings" button
- "Book New Slot" button

## Toast Notifications

The application uses `sonner` for toast notifications throughout.

**Usage:**
```tsx
import { toast } from 'sonner'

// Success
toast.success('Booking confirmed!')

// Error
toast.error('Failed to create booking')

// Info
toast.info('Refreshing availability...')

// Warning
toast.warning('Slot is almost full')

// With description
toast.success('Booking confirmed!', {
  description: 'Check your email for the QR code',
  duration: 5000,
})
```

## Best Practices

### 1. Always Handle Loading States

```tsx
// ✅ Good
{loading ? <PageLoader /> : <Content data={data} />}

// ❌ Bad
{data && <Content data={data} />}
```

### 2. Provide Retry Functionality

```tsx
// ✅ Good
<ErrorDisplay
  error={error}
  onRetry={() => fetchData()}
/>

// ❌ Bad
<div>Error: {error.message}</div>
```

### 3. Use Appropriate Error Messages

```tsx
// ✅ Good
toast.error('Failed to create booking. Please try again.')

// ❌ Bad
toast.error('Error')
```

### 4. Handle Different Error Types

```tsx
// ✅ Good
if (response.status === 404) {
  notFound() // Trigger Next.js 404 page
} else if (response.status === 409) {
  toast.error('Slot is no longer available')
} else {
  toast.error('An unexpected error occurred')
}

// ❌ Bad
if (!response.ok) {
  toast.error('Error')
}
```

### 5. Disable Buttons During Loading

```tsx
// ✅ Good
<Button disabled={isLoading}>
  {isLoading ? <Loader2 className="animate-spin" /> : 'Submit'}
</Button>

// ❌ Bad
<Button onClick={submit}>Submit</Button>
```

### 6. Show Skeleton Loaders for Better UX

```tsx
// ✅ Good
{loading ? <SlotGridSkeleton /> : <SlotGrid slots={slots} />}

// ❌ Bad
{loading ? <div>Loading...</div> : <SlotGrid slots={slots} />}
```

## Error Handling Checklist

When implementing a new feature, ensure:

- [ ] Loading states are shown during async operations
- [ ] Errors are caught and displayed to users
- [ ] Retry functionality is provided where appropriate
- [ ] Toast notifications are used for user feedback
- [ ] Form buttons are disabled during submission
- [ ] API errors return standardized responses
- [ ] 404 errors trigger the appropriate not-found page
- [ ] Network errors are handled gracefully
- [ ] Error messages are user-friendly and actionable

## Testing Error Scenarios

### Simulate Network Errors

```tsx
// In your API route or service
if (process.env.NODE_ENV === 'development') {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Simulate error
  throw new Error('Simulated error for testing')
}
```

### Test Error Boundary

```tsx
// Create a component that throws an error
function BrokenComponent() {
  throw new Error('Test error')
  return <div>This will never render</div>
}

// Wrap it in ErrorBoundary
<ErrorBoundary>
  <BrokenComponent />
</ErrorBoundary>
```

## Monitoring and Logging

For production, consider integrating:

- **Sentry** - Error tracking and monitoring
- **LogRocket** - Session replay for debugging
- **DataDog** - Application performance monitoring

Example Sentry integration:

```tsx
// In error boundary or global error handler
import * as Sentry from '@sentry/nextjs'

Sentry.captureException(error, {
  tags: {
    component: 'BookingForm',
    action: 'submit',
  },
  extra: {
    bookingData: data,
  },
})
```

## Summary

This comprehensive error handling system ensures:

- ✅ Users always see helpful error messages
- ✅ Loading states provide visual feedback
- ✅ Errors are logged for debugging
- ✅ Users can retry failed operations
- ✅ The app never shows a blank screen
- ✅ API errors are consistent and standardized
- ✅ Critical errors are caught at the root level
