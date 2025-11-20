/**
 * QR Code Security Utilities
 * Implements timestamp validation and hash verification for QR code integrity
 * Requirements: Task 24 - Add timestamp validation and hash verification for QR codes
 */

import crypto from 'crypto';

/**
 * QR code security configuration
 */
const QR_SECURITY_CONFIG = {
  /**
   * Maximum age of QR code in milliseconds (24 hours)
   * QR codes older than this are considered expired
   */
  MAX_QR_AGE_MS: 24 * 60 * 60 * 1000,

  /**
   * Secret key for HMAC generation
   * In production, this should be stored in environment variables
   */
  SECRET_KEY: process.env.QR_SECRET_KEY || 'default-secret-key-change-in-production',

  /**
   * Hash algorithm
   */
  HASH_ALGORITHM: 'sha256',
} as const;

/**
 * Enhanced QR code data structure with security features
 * Requirements: 6.3 - QR code data structure with bookingId, userId, slotId, timestamp, signature
 */
export interface SecureQRCodeData {
  bookingId: string;
  userId?: string;
  slotId: string;
  name: string;
  date: string;
  slotTime: string;
  numberOfPeople: number;
  timestamp: number;
  hash: string; // HMAC hash for integrity verification (signature)
}

/**
 * Generate HMAC hash for QR code data
 * Ensures data integrity and prevents tampering
 * Requirements: 6.3 - HMAC-SHA256 signature
 * 
 * @param data - QR code data (without hash)
 * @returns HMAC hash string
 */
export function generateQRHash(data: {
  bookingId: string;
  userId?: string;
  slotId: string;
  name: string;
  date: string;
  slotTime: string;
  numberOfPeople: number;
  timestamp: number;
}): string {
  // Create a deterministic string from the data
  const dataString = `${data.bookingId}|${data.userId || ''}|${data.slotId}|${data.name}|${data.date}|${data.slotTime}|${data.numberOfPeople}|${data.timestamp}`;

  // Generate HMAC hash
  const hmac = crypto.createHmac(QR_SECURITY_CONFIG.HASH_ALGORITHM, QR_SECURITY_CONFIG.SECRET_KEY);
  hmac.update(dataString);
  
  return hmac.digest('hex');
}

/**
 * Verify QR code hash
 * Checks if the hash matches the data to detect tampering
 * Requirements: 6.3 - Verify HMAC signature
 * 
 * @param data - QR code data with hash
 * @returns Boolean indicating if hash is valid
 */
export function verifyQRHash(data: SecureQRCodeData): boolean {
  // Extract data without hash
  const dataWithoutHash = {
    bookingId: data.bookingId,
    userId: data.userId,
    slotId: data.slotId,
    name: data.name,
    date: data.date,
    slotTime: data.slotTime,
    numberOfPeople: data.numberOfPeople,
    timestamp: data.timestamp,
  };

  // Generate expected hash
  const expectedHash = generateQRHash(dataWithoutHash);

  // Compare hashes using timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(expectedHash),
    Buffer.from(data.hash)
  );
}

/**
 * Validate QR code timestamp
 * Ensures QR code is not too old or from the future
 * 
 * @param timestamp - QR code timestamp
 * @param currentTime - Current time (defaults to now)
 * @returns Validation result with details
 */
export function validateQRTimestamp(
  timestamp: number,
  currentTime: number = Date.now()
): {
  valid: boolean;
  reason?: string;
  ageInHours?: number;
} {
  // Check if timestamp is a valid number
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return {
      valid: false,
      reason: 'Invalid timestamp format',
    };
  }

  // Check if timestamp is from the future (with 5-minute tolerance for clock skew)
  const futureToleranceMs = 5 * 60 * 1000;
  if (timestamp > currentTime + futureToleranceMs) {
    return {
      valid: false,
      reason: 'QR code timestamp is from the future',
    };
  }

  // Calculate age
  const ageMs = currentTime - timestamp;
  const ageInHours = ageMs / (60 * 60 * 1000);

  // Check if QR code is too old
  if (ageMs > QR_SECURITY_CONFIG.MAX_QR_AGE_MS) {
    return {
      valid: false,
      reason: `QR code has expired (age: ${ageInHours.toFixed(1)} hours)`,
      ageInHours,
    };
  }

  return {
    valid: true,
    ageInHours,
  };
}

/**
 * Create secure QR code data with hash
 * Requirements: 6.3 - Generate signed QR code data with HMAC-SHA256
 * 
 * @param data - QR code data without hash
 * @returns Secure QR code data with hash
 */
export function createSecureQRData(data: {
  bookingId: string;
  userId?: string;
  slotId: string;
  name: string;
  date: string;
  slotTime: string;
  numberOfPeople: number;
  timestamp: number;
}): SecureQRCodeData {
  const hash = generateQRHash(data);

  return {
    ...data,
    hash,
  };
}

/**
 * Validate secure QR code data
 * Performs comprehensive validation including hash and timestamp
 * 
 * @param data - Secure QR code data
 * @returns Validation result
 */
export function validateSecureQRData(data: SecureQRCodeData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate hash
  try {
    if (!verifyQRHash(data)) {
      errors.push('QR code data has been tampered with (invalid hash)');
    }
  } catch (error) {
    errors.push('Failed to verify QR code hash');
  }

  // Validate timestamp
  const timestampValidation = validateQRTimestamp(data.timestamp);
  if (!timestampValidation.valid) {
    errors.push(timestampValidation.reason || 'Invalid timestamp');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a secure random token
 * Can be used for additional security features
 * 
 * @param length - Token length in bytes (default: 32)
 * @returns Hex-encoded random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Encrypt sensitive data in QR code (optional enhancement)
 * Uses AES-256-GCM encryption
 * 
 * @param data - Data to encrypt
 * @param key - Encryption key (32 bytes)
 * @returns Encrypted data with IV and auth tag
 */
export function encryptQRData(data: string, key?: Buffer): {
  encrypted: string;
  iv: string;
  authTag: string;
} {
  const encryptionKey = key || Buffer.from(QR_SECURITY_CONFIG.SECRET_KEY.padEnd(32, '0').slice(0, 32));
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

/**
 * Decrypt QR code data (optional enhancement)
 * 
 * @param encryptedData - Encrypted data object
 * @param key - Decryption key (32 bytes)
 * @returns Decrypted data
 */
export function decryptQRData(
  encryptedData: {
    encrypted: string;
    iv: string;
    authTag: string;
  },
  key?: Buffer
): string {
  const decryptionKey = key || Buffer.from(QR_SECURITY_CONFIG.SECRET_KEY.padEnd(32, '0').slice(0, 32));
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const authTag = Buffer.from(encryptedData.authTag, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', decryptionKey, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Rate limit QR code generation per booking
 * Prevents abuse by limiting how many times a QR code can be regenerated
 */
const qrGenerationAttempts = new Map<string, { count: number; resetTime: number }>();

export function checkQRGenerationRateLimit(bookingId: string, maxAttempts: number = 5): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
} {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  
  let entry = qrGenerationAttempts.get(bookingId);
  
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + windowMs,
    };
    qrGenerationAttempts.set(bookingId, entry);
    
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetIn: Math.ceil(windowMs / 1000),
    };
  }
  
  entry.count++;
  qrGenerationAttempts.set(bookingId, entry);
  
  return {
    allowed: entry.count <= maxAttempts,
    remaining: Math.max(0, maxAttempts - entry.count),
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  };
}
