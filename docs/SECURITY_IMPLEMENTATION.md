# Security Implementation - Task 24

This document describes the security measures implemented for the Smart Darshan Slot Booking system.

## Overview

Task 24 implements comprehensive security measures to protect the application from common vulnerabilities and attacks. The implementation includes:

1. Rate limiting on booking API to prevent abuse
2. CSRF protection using Next.js built-in tokens
3. Input sanitization before database insertion
4. SQL injection protection via Prisma parameterized queries
5. Timestamp validation in QR codes to prevent tampering
6. Hash verification for QR code data integrity
7. Input length limits to prevent DoS attacks
8. File upload validation (if QR download feature is added)

## Security Features

### 1. Rate Limiting

**Location:** `lib/security/rate-limiter.ts`

**Purpose:** Prevents API abuse by limiting the number of requests per IP address.

**Implementation:**
- In-memory rate limiter with automatic cleanup
- Pre-configured limiters for different endpoints:
  - **Booking API:** 10 requests per 15 minutes
  - **Verification API:** 30 requests per minute (for staff scanning)
  - **General API:** 100 requests per 15 minutes

**Usage:**
```typescript
import { bookingRateLimiter, getClientIP } from '@/lib/security';

const clientIP = getClientIP(request.headers);
const rateLimitResult = bookingRateLimiter.check(clientIP);

if (!rateLimitResult.allowed) {
  // Return 429 Too Many Requests
}
```

**Applied to:**
- `POST /api/bookings` - Booking creation
- `POST /api/verify` - QR code verification

### 2. Input Sanitization

**Location:** `lib/security/input-sanitizer.ts`

**Purpose:** Sanitizes user inputs to prevent XSS, SQL injection, and other attacks.

**Features:**
- HTML entity escaping to prevent XSS
- SQL injection pattern removal (additional layer)
- Character whitelisting for specific fields
- Length enforcement to prevent DoS

**Sanitization Functions:**
- `sanitizeName()` - Allows only letters, spaces, hyphens, apostrophes
- `sanitizePhone()` - Removes all non-digit characters
- `sanitizeEmail()` - Removes dangerous characters, preserves email format
- `sanitizeNumber()` - Validates and clamps numeric values
- `sanitizeUUID()` - Validates UUID format
- `sanitizeBookingData()` - Applies appropriate sanitization to all booking fields

**Usage:**
```typescript
import { sanitizeBookingData } from '@/lib/security';

const sanitizedData = sanitizeBookingData(rawData);
const validatedData = createBookingSchema.parse(sanitizedData);
```

**Applied to:**
- All user inputs in booking creation
- Search queries in admin panel
- Any data before database insertion

### 3. SQL Injection Protection

**Implementation:** Prisma ORM automatically uses parameterized queries, preventing SQL injection attacks.

**Additional Protection:**
- Input sanitization removes common SQL injection patterns
- Zod schema validation ensures data types match expectations
- Length limits prevent oversized inputs

**Note:** Prisma's parameterized queries are the primary defense. The additional sanitization provides defense-in-depth.

### 4. QR Code Security

**Location:** `lib/security/qr-security.ts`

**Purpose:** Ensures QR code integrity and prevents tampering.

**Features:**

#### Timestamp Validation
- QR codes include generation timestamp
- Maximum age: 24 hours (configurable)
- Future timestamp detection with 5-minute tolerance for clock skew
- Prevents replay attacks with old QR codes

#### Hash Verification
- HMAC-SHA256 hash generated for each QR code
- Hash includes all QR data fields
- Timing-safe comparison prevents timing attacks
- Detects any tampering with QR data

**QR Data Structure:**
```typescript
interface SecureQRCodeData {
  bookingId: string;
  name: string;
  date: string;
  slotTime: string;
  numberOfPeople: number;
  timestamp: number;
  hash: string; // HMAC hash for integrity
}
```

**Usage:**
```typescript
import { createSecureQRData, validateSecureQRData } from '@/lib/security';

// Generation
const secureData = createSecureQRData(qrData);

// Validation
const validation = validateSecureQRData(secureData);
if (!validation.valid) {
  // Handle tampering or expired QR
}
```

**Applied to:**
- QR code generation in `QRService.generateQRCode()`
- QR code validation in `QRService.validateQRCode()`

### 5. CSRF Protection

**Location:** `lib/security/csrf.ts`

**Purpose:** Prevents Cross-Site Request Forgery attacks.

**Implementation:**
- Token-based CSRF protection
- Tokens stored in HTTP-only cookies
- Tokens validated from request headers
- Automatic token generation and refresh

**Configuration:**
- Cookie name: `csrf-token`
- Header name: `x-csrf-token`
- Token length: 32 bytes (64 hex characters)
- Cookie options: httpOnly, secure (production), sameSite: strict

**Usage:**
```typescript
import { csrfProtection } from '@/lib/security';

const result = await csrfProtection(request);
if (!result.valid) {
  // Return 403 Forbidden
}
```

**Note:** CSRF protection is optional for this implementation as Next.js API routes are typically accessed by the same-origin frontend. It's included for completeness and can be enabled if needed.

### 6. Input Length Limits

**Location:** `lib/security/input-sanitizer.ts`

**Purpose:** Prevents DoS attacks via oversized inputs.

**Limits:**
```typescript
const INPUT_LENGTH_LIMITS = {
  NAME: 100,
  EMAIL: 255,
  PHONE: 15,
  SEARCH_QUERY: 100,
  UUID: 36,
  GENERAL_STRING: 1000,
};
```

**Usage:**
```typescript
import { validateInputLength, INPUT_LENGTH_LIMITS } from '@/lib/security';

if (!validateInputLength(input, INPUT_LENGTH_LIMITS.NAME)) {
  // Return 400 Bad Request
}
```

**Applied to:**
- All user inputs before processing
- Request body validation
- Query parameter validation

### 7. API Security Middleware

**Location:** `lib/security/api-middleware.ts`

**Purpose:** Provides reusable middleware functions for API route protection.

**Features:**
- Rate limiting application
- CSRF protection application
- Request body size validation
- Content-Type validation
- Security headers addition
- Comprehensive security middleware

**Usage:**
```typescript
import { applySecurityMiddleware, bookingRateLimiter } from '@/lib/security';

const securityResult = await applySecurityMiddleware(request, {
  rateLimiter: bookingRateLimiter,
  enableCSRF: false,
  maxBodySize: 1024 * 1024, // 1MB
});

if (!securityResult.valid) {
  return securityResult.response;
}
```

## Security Headers

The following security headers are recommended for production:

```typescript
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; ...
```

These can be added using the `addSecurityHeaders()` function from the middleware.

## Environment Variables

Add the following to `.env` for production:

```env
# QR Code Security
QR_SECRET_KEY=your-secure-random-key-here-change-in-production

# CSRF Protection (optional)
CSRF_SECRET=your-csrf-secret-here
```

**Important:** Generate strong random keys for production:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Testing Security Features

### Rate Limiting
```bash
# Test booking rate limit (should fail after 10 requests)
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/bookings \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","phone":"9876543210","email":"test@example.com","numberOfPeople":1,"slotId":"uuid"}'
done
```

### Input Sanitization
```typescript
// Test XSS prevention
const maliciousInput = '<script>alert("XSS")</script>';
const sanitized = sanitizeName(maliciousInput);
// Result: 'scriptalertXSSscript' (tags removed)
```

### QR Code Security
```typescript
// Test timestamp validation
const oldQRData = {
  ...qrData,
  timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours old
};
const validation = validateQRTimestamp(oldQRData.timestamp);
// Result: { valid: false, reason: 'QR code has expired' }

// Test hash tampering
const tamperedData = { ...secureQRData, name: 'Hacker' };
const isValid = verifyQRHash(tamperedData);
// Result: false (hash doesn't match)
```

## Security Best Practices

1. **Always sanitize user inputs** before processing or storing
2. **Use rate limiting** on all public APIs
3. **Validate input lengths** to prevent DoS attacks
4. **Use HTTPS** in production (enforced by Vercel)
5. **Keep dependencies updated** to patch security vulnerabilities
6. **Monitor rate limit violations** for potential attacks
7. **Rotate secrets regularly** (QR_SECRET_KEY, CSRF_SECRET)
8. **Log security events** for audit trails
9. **Use environment variables** for sensitive configuration
10. **Test security measures** regularly

## Compliance

This implementation helps meet the following security requirements:

- **OWASP Top 10:**
  - A03:2021 – Injection (SQL injection prevention)
  - A05:2021 – Security Misconfiguration (security headers)
  - A07:2021 – Identification and Authentication Failures (rate limiting)

- **Data Protection:**
  - Input validation and sanitization
  - Secure data transmission (HTTPS)
  - Integrity verification (QR hash)

## Future Enhancements

1. **Redis-based rate limiting** for distributed systems
2. **Advanced CSRF protection** with double-submit cookies
3. **QR code encryption** for sensitive data
4. **Audit logging** for security events
5. **IP reputation checking** for known malicious IPs
6. **Captcha integration** for additional bot protection
7. **Anomaly detection** for unusual patterns
8. **Security monitoring dashboard** for administrators

## Support

For security concerns or questions, refer to:
- Security module: `lib/security/`
- API routes: `app/api/`
- Documentation: `docs/SECURITY_IMPLEMENTATION.md`
