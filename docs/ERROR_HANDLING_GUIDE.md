# Error Handling Guide

This guide explains the comprehensive error handling system implemented in the Smart Darshan Slot Booking System.

## Overview

The error handling system provides:
- **Standardized API error responses** across all routes
- **Descriptive error messages** for all failure scenarios
- **Field-specific validation errors** in forms
- **Network error handling** with retry options
- **Server-side error logging** for debugging

## Requirements Addressed

- **10.1**: Standardize API error response format across all routes
- **10.2**: Add descriptive error messages for all failure scenarios
- **10.3**: Implement field-specific validation error display in forms
- **10.4**: Add network error handling with retry options
- **10.5**: Implement server-side error logging for debugging

## Architecture

### Server-Side Components

#### 1. API Error Handler (`lib/utils/api-error-handler.ts`)

Provides standardized error handling for API routes.

**Key Functions:**

```typescript
// Create standardized error response
createErrorResponse(statusCode, message, code?, details?)

// Handle Zod validation errors
handleValidationError(error: ZodError)

// Handle authentication errors
handleAuthError(error: AuthError)

// Handle database errors
handleDatabaseError(error: unknown)

// Handle generic errors
handleGenericError(error: unknown)

// Wrap API route with error handling
withErrorHandling(handler)

// Create success response
createSuccessResponse(data, statusCode?, message?)
```

**Error Response Format:**

```typescript
{
  error: string;        // Error title (e.g., "Bad Request")
  message: string;      // User-friendly error message
  statusCode: number;   // HTTP status code
  code?: string;        // Error code for client handling
  details?: object;     // Additional error details
  timestamp?: string;   // ISO timestamp
}
```

**Usage in API Routes:**

```typescript
import { handleGenericError, createSuccessResponse } from '@/lib/utils/api-error-handler';

export async function POST(request: NextRequest) {
  try {
    // Your logic here
    const result = await someOperation();
    
    return createSuccessResponse({ result }, 201);
  } catch (error) {
    return handleGenericError(error);
  }
}
```

#### 2. Logger (`lib/utils/logger.ts`)

Provides structured logging for debugging and monitoring.

**Log Levels:**
- `DEBUG`: Detailed information for debugging
- `INFO`: General informational messages
- `WARN`: Warning messages for potential issues
- `ERROR`: Error messages for failures

**Usage:**

```typescript
import { logger } from '@/lib/utils/logger';

// Basic logging
logger.info('Operation completed', { userId: '123' });
logger.error('Operation failed', { userId: '123' }, error);

// Specialized logging
logger.auth('login', { userId: '123', email: 'user@example.com' });
logger.booking('created', bookingId, { userId: '123' });
logger.sosAlert(alertId, { userId: '123', emergencyType: 'medical' });
logger.email('sent', recipient, 'booking_confirmation');
logger.qrCode('generated', bookingId);
logger.rateLimit(identifier, endpoint);
logger.security('unauthorized_access', { userId: '123' });
```

### Client-Side Components

#### 1. Client Error Handler (`lib/utils/client-error-handler.ts`)

Handles errors in client components with retry logic.

**Key Functions:**

```typescript
// Fetch with automatic retry
fetchWithRetry<T>(url, options?, retryConfig?)

// Handle error with user feedback
handleError(error, context?, showToast?)

// Handle error with retry option
handleErrorWithRetry(error, onRetry, context?)

// Show success/info/warning messages
showSuccess(message, description?, duration?)
showInfo(message, description?, duration?)
showWarning(message, description?, duration?)

// Async operation with error handling
withErrorHandling<T>(operation, errorContext?, showToast?)

// Async operation with retry
withRetry<T>(operation, errorContext?, retryConfig?)

// Form submission error handler
handleFormError(error, setFieldError?)
```

**Usage:**

```typescript
import { fetchWithRetry, handleErrorWithRetry } from '@/lib/utils/client-error-handler';

// Fetch with automatic retry
const data = await fetchWithRetry('/api/bookings', {
  method: 'POST',
  body: JSON.stringify(bookingData),
});

// Handle error with retry button
try {
  await createBooking(data);
} catch (error) {
  handleErrorWithRetry(error, () => createBooking(data), 'Failed to create booking');
}
```

#### 2. Form Error Hook (`hooks/use-form-error.ts`)

React hook for managing form errors with field-specific validation.

**Usage:**

```typescript
import { useFormError } from '@/hooks/use-form-error';

function MyForm() {
  const {
    fieldErrors,
    generalError,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    handleAPIError,
    getFieldError,
  } = useFormError();

  const handleSubmit = async (data) => {
    clearAllErrors();
    
    try {
      await submitForm(data);
    } catch (error) {
      handleAPIError(error); // Automatically extracts field errors
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        onChange={() => clearFieldError('email')}
      />
      <FieldError error={getFieldError('email')} />
      
      <GeneralError error={generalError} />
    </form>
  );
}
```

#### 3. Form Error Components (`components/ui/form-error.tsx`)

Reusable components for displaying form errors.

**Components:**

```typescript
// Display error for a specific field
<FieldError error={error} id="email-error" />

// Display general error message
<GeneralError error={generalError} />

// Display summary of all form errors
<FormErrorsSummary
  fieldErrors={fieldErrors}
  generalError={generalError}
/>
```

## Error Codes

### API Error Codes

```typescript
enum APIErrorCode {
  // Validation errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Authentication errors (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Authorization errors (403)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Resource errors (404)
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  
  // Conflict errors (409)
  CONFLICT = 'CONFLICT',
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
  RESOURCE_UNAVAILABLE = 'RESOURCE_UNAVAILABLE',
  
  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  
  // Server errors (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}
```

## Best Practices

### API Routes

1. **Always use standardized error handling:**
   ```typescript
   import { handleGenericError } from '@/lib/utils/api-error-handler';
   
   try {
     // Your logic
   } catch (error) {
     return handleGenericError(error);
   }
   ```

2. **Log important events:**
   ```typescript
   import { logger } from '@/lib/utils/logger';
   
   logger.info('Booking created', { bookingId, userId });
   ```

3. **Use specific error responses when appropriate:**
   ```typescript
   if (!user) {
     return createErrorResponse(
       404,
       'User not found',
       APIErrorCode.NOT_FOUND
     );
   }
   ```

### Client Components

1. **Use fetchWithRetry for API calls:**
   ```typescript
   const data = await fetchWithRetry('/api/endpoint', options);
   ```

2. **Handle errors with user feedback:**
   ```typescript
   try {
     await operation();
     showSuccess('Operation completed successfully');
   } catch (error) {
     handleError(error, 'Failed to complete operation');
   }
   ```

3. **Use form error hook for forms:**
   ```typescript
   const { handleAPIError, getFieldError } = useFormError();
   
   try {
     await submitForm(data);
   } catch (error) {
     handleAPIError(error);
   }
   ```

### Forms

1. **Display field-specific errors:**
   ```typescript
   <input name="email" />
   <FieldError error={getFieldError('email')} />
   ```

2. **Clear errors on field change:**
   ```typescript
   <input
     name="email"
     onChange={() => clearFieldError('email')}
   />
   ```

3. **Show error summary at top of form:**
   ```typescript
   <FormErrorsSummary
     fieldErrors={fieldErrors}
     generalError={generalError}
   />
   ```

## Retry Configuration

The retry system uses exponential backoff for transient errors.

**Default Configuration:**
```typescript
{
  maxRetries: 3,
  baseDelay: 1000,      // 1 second
  maxDelay: 10000,      // 10 seconds
  retryableStatusCodes: [408, 429, 500, 502, 503, 504]
}
```

**Custom Configuration:**
```typescript
const data = await fetchWithRetry('/api/endpoint', options, {
  maxRetries: 5,
  baseDelay: 2000,
});
```

## Logging Best Practices

1. **Log all authentication events:**
   ```typescript
   logger.auth('login', { userId, email });
   logger.auth('failed_login', { email, reason });
   ```

2. **Log business-critical operations:**
   ```typescript
   logger.booking('created', bookingId, { userId });
   logger.sosAlert(alertId, { userId, emergencyType });
   ```

3. **Log errors with context:**
   ```typescript
   logger.error('Operation failed', {
     userId,
     operation: 'createBooking',
   }, error);
   ```

4. **Use appropriate log levels:**
   - `DEBUG`: Development debugging
   - `INFO`: Normal operations
   - `WARN`: Potential issues (rate limits, failed attempts)
   - `ERROR`: Actual failures

## Testing Error Handling

### Unit Tests

Test error handling in services:
```typescript
it('should handle database errors', async () => {
  // Mock database error
  mockDb.booking.create.mockRejectedValue(new Error('DB error'));
  
  await expect(service.createBooking(data)).rejects.toThrow();
});
```

### Integration Tests

Test API error responses:
```typescript
it('should return 400 for validation errors', async () => {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    body: JSON.stringify({ invalid: 'data' }),
  });
  
  expect(response.status).toBe(400);
  const error = await response.json();
  expect(error.code).toBe('VALIDATION_ERROR');
});
```

### E2E Tests

Test user-facing error messages:
```typescript
it('should display field error for invalid email', async () => {
  await page.fill('[name="email"]', 'invalid');
  await page.click('button[type="submit"]');
  
  await expect(page.locator('[role="alert"]')).toContainText('Invalid email');
});
```

## Migration Guide

### Updating Existing API Routes

1. Import error handling utilities:
   ```typescript
   import { handleGenericError, createSuccessResponse } from '@/lib/utils/api-error-handler';
   import { logger } from '@/lib/utils/logger';
   ```

2. Replace error handling:
   ```typescript
   // Before
   catch (error) {
     console.error('Error:', error);
     return NextResponse.json({ error: 'Failed' }, { status: 500 });
   }
   
   // After
   catch (error) {
     logger.error('Operation failed', { context }, error);
     return handleGenericError(error);
   }
   ```

3. Replace success responses:
   ```typescript
   // Before
   return NextResponse.json({ data }, { status: 200 });
   
   // After
   return createSuccessResponse({ data });
   ```

### Updating Client Components

1. Replace fetch calls:
   ```typescript
   // Before
   const response = await fetch('/api/endpoint');
   const data = await response.json();
   
   // After
   import { fetchWithRetry } from '@/lib/utils/client-error-handler';
   const data = await fetchWithRetry('/api/endpoint');
   ```

2. Replace error handling:
   ```typescript
   // Before
   catch (error) {
     toast.error('Failed');
   }
   
   // After
   import { handleError } from '@/lib/utils/client-error-handler';
   catch (error) {
     handleError(error, 'Operation failed');
   }
   ```

## Troubleshooting

### Common Issues

1. **Validation errors not showing in forms:**
   - Ensure you're using `handleAPIError` from the form error hook
   - Check that field names match between client and server

2. **Retry not working:**
   - Verify error status code is in `retryableStatusCodes`
   - Check network connectivity

3. **Logs not appearing:**
   - Check `NODE_ENV` - DEBUG logs only show in development
   - Verify logger is imported correctly

### Debug Mode

Enable detailed logging in development:
```typescript
// Set in .env.local
NODE_ENV=development
```

This will show DEBUG level logs and full stack traces.
