# Security Module - Quick Start Guide

## Installation

No additional packages needed. The security module uses Node.js built-in `crypto` module.

## Setup

1. Add environment variables to `.env`:
```env
QR_SECRET_KEY=your-secure-random-key-here
```

Generate a secure key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. Import security utilities in your API routes:
```typescript
import {
  bookingRateLimiter,
  getClientIP,
  sanitizeBookingData,
  validateInputLength,
  INPUT_LENGTH_LIMITS,
} from '@/lib/security';
```

## Common Use Cases

### 1. Add Rate Limiting to API Route

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { bookingRateLimiter, getClientIP } from '@/lib/security';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const clientIP = getClientIP(request.headers);
  const rateLimitResult = bookingRateLimiter.check(clientIP);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetIn.toString(),
        },
      }
    );
  }

  // Continue with request handling...
}
```

### 2. Sanitize User Inputs

```typescript
import { sanitizeBookingData, validateInputLength, INPUT_LENGTH_LIMITS } from '@/lib/security';

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate input lengths
  if (body.name && !validateInputLength(body.name, INPUT_LENGTH_LIMITS.NAME)) {
    return NextResponse.json({ error: 'Name too long' }, { status: 400 });
  }

  // Sanitize all inputs
  const sanitizedData = sanitizeBookingData(body);

  // Use sanitized data for validation and processing
  const validatedData = schema.parse(sanitizedData);
}
```

### 3. Secure QR Code Generation

```typescript
import { createSecureQRData } from '@/lib/security';

// In your QR service
const qrDataBase = {
  bookingId: 'uuid',
  name: 'John Doe',
  date: '2024-01-01',
  slotTime: '09:00-10:00',
  numberOfPeople: 2,
  timestamp: Date.now(),
};

// Add hash for integrity
const secureQRData = createSecureQRData(qrDataBase);

// Generate QR code with secure data
const qrCode = await QRCode.toDataURL(JSON.stringify(secureQRData));
```

### 4. Validate QR Code

```typescript
import { validateSecureQRData } from '@/lib/security';

// Decode QR data
const qrData = JSON.parse(decodedString);

// Validate security features
const validation = validateSecureQRData(qrData);

if (!validation.valid) {
  return NextResponse.json(
    { error: 'Invalid QR code', details: validation.errors },
    { status: 400 }
  );
}

// QR is valid, continue processing...
```

### 5. Apply Comprehensive Security

```typescript
import { applySecurityMiddleware, bookingRateLimiter } from '@/lib/security';

export async function POST(request: NextRequest) {
  // Apply all security measures at once
  const securityResult = await applySecurityMiddleware(request, {
    rateLimiter: bookingRateLimiter,
    enableCSRF: false,
    maxBodySize: 1024 * 1024, // 1MB
    allowedContentTypes: ['application/json'],
  });

  if (!securityResult.valid) {
    return securityResult.response;
  }

  // Request is secure, continue processing...
}
```

## Pre-configured Rate Limiters

```typescript
import {
  bookingRateLimiter,      // 10 requests per 15 minutes
  verificationRateLimiter, // 30 requests per minute
  generalRateLimiter,      // 100 requests per 15 minutes
} from '@/lib/security';
```

## Input Sanitization Functions

```typescript
import {
  sanitizeName,        // For name fields
  sanitizePhone,       // For phone numbers
  sanitizeEmail,       // For email addresses
  sanitizeNumber,      // For numeric inputs
  sanitizeUUID,        // For UUID validation
  sanitizeBookingData, // For complete booking data
} from '@/lib/security';
```

## Input Length Limits

```typescript
import { INPUT_LENGTH_LIMITS } from '@/lib/security';

// Available limits:
INPUT_LENGTH_LIMITS.NAME           // 100
INPUT_LENGTH_LIMITS.EMAIL          // 255
INPUT_LENGTH_LIMITS.PHONE          // 15
INPUT_LENGTH_LIMITS.SEARCH_QUERY   // 100
INPUT_LENGTH_LIMITS.UUID           // 36
INPUT_LENGTH_LIMITS.GENERAL_STRING // 1000
```

## Custom Rate Limiter

```typescript
import { RateLimiter } from '@/lib/security';

const customLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
  keyGenerator: (ip) => `custom:${ip}`,
});

// Use it
const result = customLimiter.check(clientIP);
```

## CSRF Protection (Optional)

```typescript
import { csrfProtection } from '@/lib/security';

export async function POST(request: NextRequest) {
  const result = await csrfProtection(request);
  
  if (!result.valid) {
    return NextResponse.json(
      { error: result.error },
      { status: 403 }
    );
  }
  
  // Continue with request handling...
}
```

## Testing

### Test Rate Limiting

```bash
# Should fail after 10 requests
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/bookings \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","phone":"9876543210","email":"test@example.com","numberOfPeople":1,"slotId":"uuid"}'
done
```

### Test Input Sanitization

```typescript
import { sanitizeName } from '@/lib/security';

const malicious = '<script>alert("XSS")</script>';
const sanitized = sanitizeName(malicious);
console.log(sanitized); // Should not contain script tags
```

### Test QR Security

```typescript
import { validateQRTimestamp } from '@/lib/security';

const oldTimestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours old
const result = validateQRTimestamp(oldTimestamp);
console.log(result); // { valid: false, reason: 'QR code has expired' }
```

## Troubleshooting

### Rate Limit Not Working

- Check if `getClientIP()` is returning correct IP
- Verify rate limiter configuration
- Check if multiple instances are running (use Redis for distributed systems)

### QR Validation Failing

- Ensure `QR_SECRET_KEY` is set in environment variables
- Verify timestamp is within 24 hours
- Check if hash is being generated correctly

### Input Sanitization Too Aggressive

- Review sanitization rules in `input-sanitizer.ts`
- Adjust regex patterns if needed
- Consider using different sanitization functions for different fields

## Best Practices

1. ✅ Always apply rate limiting to public APIs
2. ✅ Sanitize inputs before validation
3. ✅ Validate input lengths before processing
4. ✅ Use secure QR data for all QR codes
5. ✅ Log security events for monitoring
6. ✅ Test security measures regularly
7. ✅ Keep secrets in environment variables
8. ✅ Use HTTPS in production

## More Information

- [Full Documentation](./README.md)
- [Security Implementation Guide](../../docs/SECURITY_IMPLEMENTATION.md)
- [Task 24 Summary](../../docs/TASK_24_SECURITY_SUMMARY.md)
