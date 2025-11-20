/**
 * Security Module
 * Exports all security utilities for easy import
 */

// Rate limiting
export {
  RateLimiter,
  bookingRateLimiter,
  verificationRateLimiter,
  generalRateLimiter,
  getClientIP,
  type RateLimitConfig,
  type RateLimitResult,
} from './rate-limiter';

// Input sanitization
export {
  sanitizeString,
  sanitizeName,
  sanitizePhone,
  sanitizeEmail,
  sanitizeNumber,
  sanitizeUUID,
  sanitizeDate,
  sanitizeBookingData,
  sanitizeSearchQuery,
  removeSQLInjectionPatterns,
  validateInputLength,
  INPUT_LENGTH_LIMITS,
} from './input-sanitizer';

// QR code security
export {
  generateQRHash,
  verifyQRHash,
  validateQRTimestamp,
  createSecureQRData,
  validateSecureQRData,
  generateSecureToken,
  encryptQRData,
  decryptQRData,
  checkQRGenerationRateLimit,
  type SecureQRCodeData,
} from './qr-security';

// CSRF protection
export {
  generateCSRFToken,
  setCSRFToken,
  getCSRFToken,
  validateCSRFToken,
  csrfProtection,
  getOrCreateCSRFToken,
  clearCSRFToken,
  refreshCSRFToken,
} from './csrf';

// API middleware
export {
  applyRateLimit,
  applyCSRFProtection,
  validateRequestBodySize,
  validateContentType,
  addSecurityHeaders,
  applySecurityMiddleware,
} from './api-middleware';
