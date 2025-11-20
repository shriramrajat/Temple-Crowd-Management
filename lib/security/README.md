# Security Module

This module provides comprehensive security utilities for the Smart Darshan Slot Booking system.

## Overview

The security module implements multiple layers of protection against common web vulnerabilities and attacks:

- **Rate Limiting** - Prevents API abuse
- **Input Sanitization** - Prevents XSS and injection attacks
- **QR Code Security** - Ensures QR code integrity with hash verification and timestamp validation
- **CSRF Protection** - Prevents cross-site request forgery
- **API Middleware** - Reusable security middleware for API routes

## Quick Start

### Basic Usage

```typescript
import {
  bookingRateLimiter,
  getClientIP,
  sanitizeBookingData,
  createSecureQRData,
  validateSecureQRData,
} from '@/lib/security';

// Rate limiting
const clientIP = getClientIP(request.headers);
const rateLimitResult = bookingRateLimiter.check(clientIP);

if (!rateLimitResult.allowed) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
}

// Input sanitization
const sanitizedData = sanitizeBookingData(rawData);

// QR code security
const secureQRData = createSecureQRData(qrData);
const validation = validateSecureQRData(secureQRData);
```

### Using Security Middleware

```typescript
import { applySecurityMiddleware, bookingRateLimiter } from '@/lib/security';

export async function POST(request: NextRequest) {
  // Apply comprehensive security checks
  const securityResult = await applySecurityMiddleware(request, {
    rateLimiter: bookingRateLimiter,
    enableCSRF: false,
    maxBodySize: 1024 * 1024, // 1MB
  });

  if (!securityResult.valid) {
    return securityResult.response;
  }

  // Continue with request handling...
}
```

## Modules

### Rate Limiter (`rate-limiter.ts`)

Prevents API abuse by limiting requests per IP address.

**Pre-configured limiters:**
- `bookingRateLimiter` - 10 requests per 15 minutes
- `verificationRateLimiter` - 30 requests per minute
- `generalRateLimiter` - 100 requests per 15 minutes

**Example:**
```typescript
import { bookingRateLimiter, getClientIP } from '@/lib/security';

const clientIP = getClientIP(request.headers);
const result = bookingRateLimiter.check(clientIP);

console.log(result);
// {
//   allowed: true,
//   remaining: 9,
//   resetIn: 900,
//   limit: 10
// }
```

### Input Sanitizer (`input-sanitizer.ts`)

Sanitizes user inputs to prevent XSS, SQL injection, and other attacks.

**Functions:**
- `sanitizeName(name)` - Sanitizes name fields
- `sanitizePhone(phone)` - Sanitizes phone numbers
- `sanitizeEmail(email)` - Sanitizes email addresses
- `sanitizeNumber(value, min, max)` - Sanitizes numeric inputs
- `sanitizeUUID(uuid)` - Validates and sanitizes UUIDs
- `sanitizeBookingData(data)` - Sanitizes all booking fields

**Example:**
```typescript
import { sanitizeName, sanitizeEmail } from '@/lib/security';

const name = sanitizeName('<script>alert("XSS")</script>John Doe');
// Result: 'John Doe'

const email = sanitizeEmail('USER@EXAMPLE.COM');
// Result: 'user@example.com'
```

### QR Security (`qr-security.ts`)

Ensures QR code integrity with hash verification and timestamp validation.

**Features:**
- HMAC-SHA256 hash generation
- Timestamp validation (24-hour expiry)
- Tampering detection
- Optional encryption

**Example:**
```typescript
import { createSecureQRData, validateSecureQRData } from '@/lib/security';

// Create secure QR data
const secureData = createSecureQRData({
  bookingId: 'uuid',
  name: 'John Doe',
  date: '2024-01-01',
  slotTime: '09:00-10:00',
  numberOfPeople: 2,
  timestamp: Date.now(),
});

// Validate QR data
const validation = validateSecureQRData(secureData);
if (!validation.valid) {
  console.error('QR validation failed:', validation.errors);
}
```

### CSRF Protection (`csrf.ts`)

Implements CSRF token generation and validation.

**Functions:**
- `generateCSRFToken()` - Generate a new token
- `setCSRFToken()` - Set token in cookie
- `getCSRFToken()` - Get token from cookie
- `validateCSRFToken(headers)` - Validate token from request
- `csrfProtection(request)` - Complete CSRF protection middleware

**Example:**
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

### API Middleware (`api-middleware.ts`)

Reusable middleware functions for API route protection.

**Functions:**
- `applyRateLimit(request, rateLimiter)` - Apply rate limiting
- `applyCSRFProtection(request)` - Apply CSRF protection
- `validateRequestBodySize(body, maxSize)` - Validate body size
- `validateContentType(request, allowedTypes)` - Validate content type
- `addSecurityHeaders(response)` - Add security headers
- `applySecurityMiddleware(request, options)` - Comprehensive security

**Example:**
```typescript
import { applySecurityMiddleware, bookingRateLimiter } from '@/lib/security';

export async function POST(request: NextRequest) {
  const securityResult = await applySecurityMiddleware(request, {
    rateLimiter: bookingRateLimiter,
    enableCSRF: false,
    maxBodySize: 1024 * 1024,
    allowedContentTypes: ['application/json'],
  });

  if (!securityResult.valid) {
    return securityResult.response;
  }

  // Request is secure, continue processing...
}
```

## Configuration

### Environment Variables

Add to `.env`:

```env
# QR Code Security
QR_SECRET_KEY=your-secure-random-key-here

# CSRF Protection (optional)
CSRF_SECRET=your-csrf-secret-here
```

Generate secure keys:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Rate Limit Configuration

Create custom rate limiters:

```typescript
import { RateLimiter } from '@/lib/security';

const customRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
  keyGenerator: (ip) => `custom:${ip}`,
});
```

## Best Practices

1. **Always sanitize user inputs** before processing
2. **Apply rate limiting** to all public APIs
3. **Validate input lengths** to prevent DoS
4. **Use HTTPS** in production
5. **Rotate secrets regularly**
6. **Monitor rate limit violations**
7. **Log security events**
8. **Test security measures**

## Testing

### Unit Tests

```typescript
import { sanitizeName, validateQRTimestamp } from '@/lib/security';

describe('Input Sanitization', () => {
  it('should remove HTML tags', () => {
    const result = sanitizeName('<script>alert("XSS")</script>');
    expect(result).not.toContain('<script>');
  });
});

describe('QR Security', () => {
  it('should reject expired QR codes', () => {
    const oldTimestamp = Date.now() - (25 * 60 * 60 * 1000);
    const result = validateQRTimestamp(oldTimestamp);
    expect(result.valid).toBe(false);
  });
});
```

### Integration Tests

Test rate limiting:
```bash
# Should fail after 10 requests
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/bookings \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","phone":"9876543210",...}'
done
```

## Troubleshooting

### Rate Limit Issues

**Problem:** Legitimate users hitting rate limits

**Solution:** Adjust rate limit configuration or implement user-based rate limiting

### QR Validation Failures

**Problem:** Valid QR codes being rejected

**Solution:** Check timestamp validation and ensure QR_SECRET_KEY is consistent

### CSRF Token Mismatches

**Problem:** CSRF validation failing

**Solution:** Ensure cookies are being set and tokens are included in request headers

## Support

For more information, see:
- [Security Implementation Documentation](../../docs/SECURITY_IMPLEMENTATION.md)
- [API Documentation](../../docs/)
- [Task 24 Requirements](.kiro/specs/darshan-slot-booking/tasks.md)
