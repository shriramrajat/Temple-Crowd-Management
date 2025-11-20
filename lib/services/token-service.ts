import { randomBytes } from 'crypto';
import { db } from '@/lib/db';

/**
 * Token Service
 * Handles generation, validation, and management of verification and password reset tokens
 */

// Token expiration times (in milliseconds)
const VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const RESET_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

/**
 * Generate a cryptographically secure random token
 * @returns A 32-byte hex string (64 characters)
 */
function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Hash a token using bcryptjs
 * @param token - The plain text token to hash
 * @returns The hashed token
 */
async function hashToken(token: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  const saltRounds = 10;
  return bcrypt.default.hash(token, saltRounds);
}

/**
 * Compare a plain text token with a hashed token
 * @param plainToken - The plain text token
 * @param hashedToken - The hashed token to compare against
 * @returns True if tokens match, false otherwise
 */
async function compareToken(plainToken: string, hashedToken: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.default.compare(plainToken, hashedToken);
}

/**
 * Calculate expiration date for a token
 * @param expiryMs - Expiration time in milliseconds
 * @returns Date object representing the expiration time
 */
function calculateExpiration(expiryMs: number): Date {
  return new Date(Date.now() + expiryMs);
}

/**
 * Check if a token has expired
 * @param expiresAt - The expiration date
 * @returns True if expired, false otherwise
 */
function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Generate a verification token for email verification
 * @param userId - The user ID to generate the token for
 * @returns Object containing the plain token and database record
 */
export async function generateVerificationToken(userId: string) {
  const plainToken = generateSecureToken();
  const hashedToken = await hashToken(plainToken);
  const expiresAt = calculateExpiration(VERIFICATION_TOKEN_EXPIRY);

  const tokenRecord = await db.verificationToken.create({
    data: {
      userId,
      token: hashedToken,
      expiresAt,
    },
  });

  return {
    plainToken,
    tokenRecord,
  };
}

/**
 * Generate a password reset token
 * @param userId - The user ID to generate the token for
 * @returns Object containing the plain token and database record
 */
export async function generatePasswordResetToken(userId: string) {
  const plainToken = generateSecureToken();
  const hashedToken = await hashToken(plainToken);
  const expiresAt = calculateExpiration(RESET_TOKEN_EXPIRY);

  const tokenRecord = await db.passwordResetToken.create({
    data: {
      userId,
      token: hashedToken,
      expiresAt,
    },
  });

  return {
    plainToken,
    tokenRecord,
  };
}

/**
 * Validate a verification token and return the user ID if valid
 * @param plainToken - The plain text token to validate
 * @returns The user ID if token is valid, null otherwise
 */
export async function validateVerificationToken(plainToken: string): Promise<string | null> {
  // Get all verification tokens (we need to compare hashes)
  const tokens = await db.verificationToken.findMany({
    where: {
      usedAt: null, // Only unused tokens
    },
    include: {
      user: true,
    },
  });

  // Find matching token by comparing hashes
  for (const tokenRecord of tokens) {
    const isMatch = await compareToken(plainToken, tokenRecord.token);
    
    if (isMatch) {
      // Check if token is expired
      if (isTokenExpired(tokenRecord.expiresAt)) {
        return null;
      }

      // Check if token has already been used
      if (tokenRecord.usedAt) {
        return null;
      }

      return tokenRecord.userId;
    }
  }

  return null;
}

/**
 * Validate a password reset token and return the user ID if valid
 * @param plainToken - The plain text token to validate
 * @returns The user ID if token is valid, null otherwise
 */
export async function validatePasswordResetToken(plainToken: string): Promise<string | null> {
  // Get all password reset tokens (we need to compare hashes)
  const tokens = await db.passwordResetToken.findMany({
    where: {
      usedAt: null, // Only unused tokens
    },
    include: {
      user: true,
    },
  });

  // Find matching token by comparing hashes
  for (const tokenRecord of tokens) {
    const isMatch = await compareToken(plainToken, tokenRecord.token);
    
    if (isMatch) {
      // Check if token is expired
      if (isTokenExpired(tokenRecord.expiresAt)) {
        return null;
      }

      // Check if token has already been used
      if (tokenRecord.usedAt) {
        return null;
      }

      return tokenRecord.userId;
    }
  }

  return null;
}

/**
 * Invalidate a verification token by marking it as used
 * @param plainToken - The plain text token to invalidate
 * @returns True if token was invalidated, false otherwise
 */
export async function invalidateVerificationToken(plainToken: string): Promise<boolean> {
  const tokens = await db.verificationToken.findMany({
    where: {
      usedAt: null,
    },
  });

  for (const tokenRecord of tokens) {
    const isMatch = await compareToken(plainToken, tokenRecord.token);
    
    if (isMatch) {
      await db.verificationToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() },
      });
      return true;
    }
  }

  return false;
}

/**
 * Invalidate a password reset token by marking it as used
 * @param plainToken - The plain text token to invalidate
 * @returns True if token was invalidated, false otherwise
 */
export async function invalidatePasswordResetToken(plainToken: string): Promise<boolean> {
  const tokens = await db.passwordResetToken.findMany({
    where: {
      usedAt: null,
    },
  });

  for (const tokenRecord of tokens) {
    const isMatch = await compareToken(plainToken, tokenRecord.token);
    
    if (isMatch) {
      await db.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() },
      });
      return true;
    }
  }

  return false;
}

/**
 * Delete all expired verification tokens for a user
 * @param userId - The user ID
 */
export async function cleanupExpiredVerificationTokens(userId: string): Promise<void> {
  await db.verificationToken.deleteMany({
    where: {
      userId,
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}

/**
 * Delete all expired password reset tokens for a user
 * @param userId - The user ID
 */
export async function cleanupExpiredPasswordResetTokens(userId: string): Promise<void> {
  await db.passwordResetToken.deleteMany({
    where: {
      userId,
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}

/**
 * Invalidate all verification tokens for a user
 * @param userId - The user ID
 */
export async function invalidateAllVerificationTokens(userId: string): Promise<void> {
  await db.verificationToken.updateMany({
    where: {
      userId,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });
}

/**
 * Invalidate all password reset tokens for a user
 * @param userId - The user ID
 */
export async function invalidateAllPasswordResetTokens(userId: string): Promise<void> {
  await db.passwordResetToken.updateMany({
    where: {
      userId,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });
}

/**
 * Get all active (unused and not expired) verification tokens for a user
 * @param userId - The user ID
 * @returns Array of active verification tokens
 */
export async function getActiveVerificationTokens(userId: string) {
  return db.verificationToken.findMany({
    where: {
      userId,
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Get all active (unused and not expired) password reset tokens for a user
 * @param userId - The user ID
 * @returns Array of active password reset tokens
 */
export async function getActivePasswordResetTokens(userId: string) {
  return db.passwordResetToken.findMany({
    where: {
      userId,
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Check if a user has any active verification tokens
 * @param userId - The user ID
 * @returns True if user has active tokens, false otherwise
 */
export async function hasActiveVerificationToken(userId: string): Promise<boolean> {
  const count = await db.verificationToken.count({
    where: {
      userId,
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
  });
  return count > 0;
}

/**
 * Check if a user has any active password reset tokens
 * @param userId - The user ID
 * @returns True if user has active tokens, false otherwise
 */
export async function hasActivePasswordResetToken(userId: string): Promise<boolean> {
  const count = await db.passwordResetToken.count({
    where: {
      userId,
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
  });
  return count > 0;
}

/**
 * Store a verification token in the database
 * This is a lower-level function that stores a pre-generated token
 * @param userId - The user ID
 * @param hashedToken - The hashed token
 * @param expiresAt - The expiration date
 * @returns The created token record
 */
export async function storeVerificationToken(
  userId: string,
  hashedToken: string,
  expiresAt: Date
) {
  return db.verificationToken.create({
    data: {
      userId,
      token: hashedToken,
      expiresAt,
    },
  });
}

/**
 * Store a password reset token in the database
 * This is a lower-level function that stores a pre-generated token
 * @param userId - The user ID
 * @param hashedToken - The hashed token
 * @param expiresAt - The expiration date
 * @returns The created token record
 */
export async function storePasswordResetToken(
  userId: string,
  hashedToken: string,
  expiresAt: Date
) {
  return db.passwordResetToken.create({
    data: {
      userId,
      token: hashedToken,
      expiresAt,
    },
  });
}

/**
 * Delete a specific verification token by ID
 * @param tokenId - The token ID
 */
export async function deleteVerificationToken(tokenId: string): Promise<void> {
  await db.verificationToken.delete({
    where: { id: tokenId },
  });
}

/**
 * Delete a specific password reset token by ID
 * @param tokenId - The token ID
 */
export async function deletePasswordResetToken(tokenId: string): Promise<void> {
  await db.passwordResetToken.delete({
    where: { id: tokenId },
  });
}

/**
 * Get verification token by ID
 * @param tokenId - The token ID
 * @returns The token record or null if not found
 */
export async function getVerificationTokenById(tokenId: string) {
  return db.verificationToken.findUnique({
    where: { id: tokenId },
    include: { user: true },
  });
}

/**
 * Get password reset token by ID
 * @param tokenId - The token ID
 * @returns The token record or null if not found
 */
export async function getPasswordResetTokenById(tokenId: string) {
  return db.passwordResetToken.findUnique({
    where: { id: tokenId },
    include: { user: true },
  });
}
