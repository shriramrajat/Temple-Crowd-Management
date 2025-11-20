/**
 * Input Sanitization Utilities
 * Sanitizes user inputs to prevent XSS, SQL injection, and other attacks
 * Requirements: Task 24 - Sanitize all user inputs before database insertion
 */

/**
 * Sanitize string input by removing potentially dangerous characters
 * Prevents XSS attacks by escaping HTML entities
 * 
 * @param input - Raw string input
 * @param maxLength - Maximum allowed length (default: 1000)
 * @returns Sanitized string
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Trim whitespace
  let sanitized = input.trim();

  // Enforce length limit to prevent DoS attacks
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Escape HTML entities to prevent XSS
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return sanitized;
}

/**
 * Sanitize name input
 * Allows only letters, spaces, and common name characters
 * 
 * @param name - Raw name input
 * @returns Sanitized name
 */
export function sanitizeName(name: string): string {
  if (typeof name !== 'string') {
    return '';
  }

  // Trim and limit length
  let sanitized = name.trim().substring(0, 100);

  // Remove any characters that aren't letters, spaces, hyphens, or apostrophes
  sanitized = sanitized.replace(/[^a-zA-Z\s\-']/g, '');

  // Remove multiple consecutive spaces
  sanitized = sanitized.replace(/\s+/g, ' ');

  return sanitized;
}

/**
 * Sanitize phone number
 * Removes all non-digit characters
 * 
 * @param phone - Raw phone input
 * @returns Sanitized phone number (digits only)
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') {
    return '';
  }

  // Remove all non-digit characters
  const sanitized = phone.replace(/\D/g, '');

  // Limit to 15 digits (international phone number max length)
  return sanitized.substring(0, 15);
}

/**
 * Sanitize email address
 * Removes dangerous characters while preserving valid email format
 * 
 * @param email - Raw email input
 * @returns Sanitized email
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return '';
  }

  // Trim and convert to lowercase
  let sanitized = email.trim().toLowerCase();

  // Limit length
  sanitized = sanitized.substring(0, 255);

  // Remove any characters that aren't valid in email addresses
  // Allow: letters, numbers, @, ., -, _, +
  sanitized = sanitized.replace(/[^a-z0-9@.\-_+]/g, '');

  return sanitized;
}

/**
 * Sanitize numeric input
 * Ensures the value is a valid number within bounds
 * 
 * @param value - Raw numeric input
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Sanitized number
 */
export function sanitizeNumber(
  value: unknown,
  min: number = Number.MIN_SAFE_INTEGER,
  max: number = Number.MAX_SAFE_INTEGER
): number {
  const num = Number(value);

  // Check if valid number
  if (isNaN(num) || !isFinite(num)) {
    return min;
  }

  // Clamp to bounds
  return Math.max(min, Math.min(max, num));
}

/**
 * Sanitize UUID
 * Validates and sanitizes UUID format
 * 
 * @param uuid - Raw UUID input
 * @returns Sanitized UUID or empty string if invalid
 */
export function sanitizeUUID(uuid: string): string {
  if (typeof uuid !== 'string') {
    return '';
  }

  // UUID regex pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const sanitized = uuid.trim().toLowerCase();

  return uuidPattern.test(sanitized) ? sanitized : '';
}

/**
 * Sanitize date string
 * Validates and sanitizes ISO date format
 * 
 * @param dateString - Raw date input
 * @returns Sanitized ISO date string or empty string if invalid
 */
export function sanitizeDate(dateString: string): string {
  if (typeof dateString !== 'string') {
    return '';
  }

  const sanitized = dateString.trim();

  // Try to parse as date
  const date = new Date(sanitized);

  // Check if valid date
  if (isNaN(date.getTime())) {
    return '';
  }

  // Return ISO format
  return date.toISOString();
}

/**
 * Sanitize booking form data
 * Applies appropriate sanitization to all booking fields
 * 
 * @param data - Raw booking form data
 * @returns Sanitized booking data
 */
export function sanitizeBookingData(data: {
  name: string;
  phone: string;
  email: string;
  numberOfPeople: number;
  slotId: string;
}): {
  name: string;
  phone: string;
  email: string;
  numberOfPeople: number;
  slotId: string;
} {
  return {
    name: sanitizeName(data.name),
    phone: sanitizePhone(data.phone),
    email: sanitizeEmail(data.email),
    numberOfPeople: sanitizeNumber(data.numberOfPeople, 1, 10),
    slotId: sanitizeUUID(data.slotId),
  };
}

/**
 * Remove SQL injection patterns
 * Additional layer of protection (Prisma already handles this)
 * 
 * @param input - Raw input string
 * @returns Sanitized string
 */
export function removeSQLInjectionPatterns(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove common SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
    /(--|;|\/\*|\*\/|xp_|sp_)/gi,
    /('|('')|(\\')|(\")|(\\"))/gi,
  ];

  let sanitized = input;
  for (const pattern of sqlPatterns) {
    sanitized = sanitized.replace(pattern, '');
  }

  return sanitized;
}

/**
 * Validate and sanitize search query
 * For admin search functionality
 * 
 * @param query - Raw search query
 * @returns Sanitized search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') {
    return '';
  }

  // Trim and limit length
  let sanitized = query.trim().substring(0, 100);

  // Remove special characters that could be used for injection
  sanitized = sanitized.replace(/[<>{}[\]\\]/g, '');

  // Remove SQL patterns
  sanitized = removeSQLInjectionPatterns(sanitized);

  return sanitized;
}

/**
 * Input length validation
 * Prevents DoS attacks via oversized inputs
 */
export const INPUT_LENGTH_LIMITS = {
  NAME: 100,
  EMAIL: 255,
  PHONE: 15,
  SEARCH_QUERY: 100,
  UUID: 36,
  GENERAL_STRING: 1000,
} as const;

/**
 * Validate input length
 * 
 * @param input - Input string
 * @param maxLength - Maximum allowed length
 * @returns Boolean indicating if length is valid
 */
export function validateInputLength(input: string, maxLength: number): boolean {
  return typeof input === 'string' && input.length <= maxLength;
}
