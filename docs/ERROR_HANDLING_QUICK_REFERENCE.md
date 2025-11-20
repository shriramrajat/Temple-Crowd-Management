# Error Handling Quick Reference

Quick reference for using the error handling system in the Smart Darshan Slot Booking System.

## Server-Side (API Routes)

### Basic Error Handling

```typescript
import { handleGenericError, createSuccessResponse } from '@/lib/utils/api-error-handler';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const result = await someOperation(data);
    
    logger.info('Operation completed', { userId: data.userId });
    return createSuccessResponse({ result }, 201);
  } catch (error) {
    logger.error('Operation failed', { context }, error);
    return handleGenericError(error);
  }
}
```

### Validation Errors

```typescript
import { handleValidationError } from '@/lib/utils/api-error-handler';
import { z } from 'zod';

const schema = z.object({ email: z.string().email() });
const result = schema.safeParse(data);

if (!result.success) {
  return handleValidationError(result.error);
}
```

### Custom Errors

```typescript
import { createErrorResponse, APIErrorCode } from '@/lib/utils/api-error-handler';

if (!user) {
  return createErrorResponse(
    404,
    'User not found',
    APIErrorCode.NOT_FOUND
  );
}
```

### Logging Events

```typescript
import { logger } from '@/lib/utils/logger';

// Authentication
logger.auth('login', { userId, email });
logger.auth('failed_login', { email, reason });

// Business operations
logger.booking('created', bookingId, { userId });
logger.sosAlert(alertId, { userId, emergencyType });
logger.email('sent', recipient, 'booking_confirmation');
logger.qrCode('generated', bookingId);

// Security
logger.security('unauthorized_access', { userId, resource });
logger.rateLimit(identifier, endpoint);
```

## Client-Side (React Components)

### Fetch with Retry

```typescript
import { fetchWithRetry } from '@/lib/utils/client-error-handler';

const data = await fetchWithRetry('/api/bookings', {
  method: 'POST',
  body: JSON.stringify(bookingData),
});
```

### Error Handling

```typescript
import { handleError, handleErrorWithRetry, showSuccess } from '@/lib/utils/client-error-handler';

try {
  await operation();
  showSuccess('Operation completed');
} catch (error) {
  // Simple error display
  handleError(error, 'Operation failed');
  
  // Or with retry button
  handleErrorWithRetry(error, () => operation(), 'Operation failed');
}
```

### Form Error Hook

```typescript
import { useFormError } from '@/hooks/use-form-error';
import { FieldError, GeneralError } from '@/components/ui/form-error';

function MyForm() {
  const {
    fieldErrors,
    generalError,
    handleAPIError,
    getFieldError,
    clearFieldError,
    clearAllErrors,
  } = useFormError();

  const handleSubmit = async (data) => {
    clearAllErrors();
    try {
      await submitForm(data);
    } catch (error) {
      handleAPIError(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <GeneralError error={generalError} />
      
      <input
        name="email"
        onChange={() => clearFieldError('email')}
      />
      <FieldError error={getFieldError('email')} />
    </form>
  );
}
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Validation failed |
| `INVALID_INPUT` | 400 | Invalid input data |
| `MISSING_REQUIRED_FIELD` | 400 | Required field missing |
| `UNAUTHORIZED` | 401 | Authentication required |
| `INVALID_CREDENTIALS` | 401 | Invalid email/password |
| `FORBIDDEN` | 403 | Access denied |
| `INSUFFICIENT_PERMISSIONS` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `DUPLICATE_RESOURCE` | 409 | Duplicate resource |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `DATABASE_ERROR` | 500 | Database error |

## Common Patterns

### API Route with Validation

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return handleValidationError(result.error);
    }
    
    const data = await createResource(result.data);
    logger.info('Resource created', { id: data.id });
    
    return createSuccessResponse({ data }, 201);
  } catch (error) {
    logger.error('Failed to create resource', {}, error);
    return handleGenericError(error);
  }
}
```

### Client Component with Retry

```typescript
async function fetchData() {
  try {
    const data = await fetchWithRetry('/api/data', {
      method: 'GET',
    }, {
      maxRetries: 3,
      baseDelay: 1000,
    });
    return data;
  } catch (error) {
    handleErrorWithRetry(
      error,
      () => fetchData(),
      'Failed to fetch data'
    );
  }
}
```

### Form with Field Errors

```typescript
function BookingForm() {
  const { handleAPIError, getFieldError, clearFieldError } = useFormError();
  
  const onSubmit = async (values) => {
    try {
      await createBooking(values);
      showSuccess('Booking created');
    } catch (error) {
      handleAPIError(error);
    }
  };
  
  return (
    <form>
      <input
        name="email"
        onChange={() => clearFieldError('email')}
      />
      <FieldError error={getFieldError('email')} />
    </form>
  );
}
```

## Tips

1. **Always log errors** - Use `logger.error()` for debugging
2. **Use specific error codes** - Help clients handle errors appropriately
3. **Clear errors on change** - Clear field errors when user types
4. **Show retry for transient errors** - Network issues, 5xx errors
5. **Validate early** - Validate on client before API call
6. **Provide context** - Include relevant context in logs
7. **Use toast notifications** - Keep users informed
8. **Test error paths** - Test both success and error scenarios

## See Also

- [Full Error Handling Guide](./ERROR_HANDLING_GUIDE.md)
- [Task 10 Implementation Summary](./TASK_10_IMPLEMENTATION_SUMMARY.md)
