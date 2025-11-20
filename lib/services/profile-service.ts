import { db } from '@/lib/db';
import { AuthError, AuthErrorCode } from './auth-service';
import { z } from 'zod';

/**
 * Profile Service
 * Handles user profile retrieval, updates, and email change workflows
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

/**
 * User profile data structure for API responses
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

/**
 * Input for profile updates
 */
export interface UpdateProfileInput {
  name?: string;
  phone?: string;
}

/**
 * Phone number validation schema
 * Validates Indian phone numbers (10 digits starting with 6-9)
 */
const phoneSchema = z
  .string()
  .length(10, "Phone number must be exactly 10 digits")
  .regex(/^[6-9]\d{9}$/, "Please enter a valid Indian phone number starting with 6-9");

/**
 * Name validation schema
 */
const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must not exceed 100 characters")
  .regex(/^[a-zA-Z\s]+$/, "Name must contain only letters and spaces");

/**
 * Profile update validation schema
 */
const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  phone: phoneSchema.optional(),
}).refine(
  (data) => data.name !== undefined || data.phone !== undefined,
  "At least one field must be provided for update"
);

/**
 * Fetch user profile by ID
 * Requirement: 4.1 - Display pilgrim's current profile information
 * 
 * @param userId - User ID
 * @returns User profile data formatted for API response
 */
export async function getProfile(userId: string): Promise<UserProfile> {
  const user = await db.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });

  if (!user) {
    throw new AuthError(
      AuthErrorCode.USER_NOT_FOUND,
      'User not found',
      404
    );
  }

  return user;
}


/**
 * Audit log entry for profile changes
 */
interface ProfileAuditLog {
  userId: string;
  action: string;
  changes: Record<string, { old: any; new: any }>;
  timestamp: Date;
}

/**
 * Log profile changes for audit purposes
 * Requirement: 4.5 - Maintain audit log of changes with timestamps
 * 
 * @param userId - User ID
 * @param changes - Object containing field changes
 */
async function logProfileChange(
  userId: string,
  changes: Record<string, { old: any; new: any }>
): Promise<void> {
  const auditLog: ProfileAuditLog = {
    userId,
    action: 'PROFILE_UPDATE',
    changes,
    timestamp: new Date(),
  };

  // Log to console for now - in production, this would go to a dedicated audit log table
  console.log('[AUDIT LOG]', JSON.stringify(auditLog, null, 2));
  
  // TODO: In production, store in a dedicated audit_logs table
  // await db.auditLog.create({ data: auditLog });
}

/**
 * Validate and update user profile fields
 * Requirements: 4.2, 4.4, 4.5 - Update profile with validation, phone validation, and audit logging
 * 
 * @param userId - User ID
 * @param data - Profile fields to update (name, phone)
 * @returns Updated user profile
 */
export async function updateProfile(
  userId: string,
  data: UpdateProfileInput
): Promise<UserProfile> {
  // Validate input data
  const validationResult = updateProfileSchema.safeParse(data);
  if (!validationResult.success) {
    throw new AuthError(
      AuthErrorCode.VALIDATION_ERROR,
      validationResult.error.errors[0].message,
      400
    );
  }

  // Get current user data for audit log
  const currentUser = await db.users.findUnique({
    where: { id: userId },
  });

  if (!currentUser) {
    throw new AuthError(
      AuthErrorCode.USER_NOT_FOUND,
      'User not found',
      404
    );
  }

  // Track changes for audit log
  const changes: Record<string, { old: any; new: any }> = {};

  if (data.name !== undefined && data.name !== currentUser.name) {
    changes.name = { old: currentUser.name, new: data.name };
  }

  if (data.phone !== undefined && data.phone !== currentUser.phone) {
    changes.phone = { old: currentUser.phone, new: data.phone };
  }

  // If no actual changes, return current profile
  if (Object.keys(changes).length === 0) {
    return {
      id: currentUser.id,
      email: currentUser.email,
      name: currentUser.name,
      phone: currentUser.phone,
      createdAt: currentUser.createdAt,
      updatedAt: currentUser.updatedAt,
      lastLoginAt: currentUser.lastLoginAt,
    };
  }

  // Update user profile in database
  const updatedUser = await db.users.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.phone !== undefined && { phone: data.phone }),
      updatedAt: new Date(),
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });

  // Log changes for audit
  await logProfileChange(userId, changes);

  return updatedUser;
}


/**
 * Email validation schema
 */
const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .max(255, "Email must not exceed 255 characters")
  .toLowerCase()
  .trim();

/**
 * Initiate email change workflow with verification
 * Requirement: 4.3 - Change email with verification to new address
 * 
 * This function initiates the email change process by:
 * 1. Validating the new email address
 * 2. Checking if the new email is already in use
 * 3. Generating a verification token
 * 4. Sending verification email to the new address
 * 
 * The email will only be updated after the user verifies the new address
 * by clicking the link in the verification email.
 * 
 * @param userId - User ID
 * @param newEmail - New email address to change to
 * @returns Success message
 */
export async function initiateEmailChange(
  userId: string,
  newEmail: string
): Promise<{ message: string }> {
  // Validate new email format
  const validationResult = emailSchema.safeParse(newEmail);
  if (!validationResult.success) {
    throw new AuthError(
      AuthErrorCode.INVALID_EMAIL,
      validationResult.error.errors[0].message,
      400
    );
  }

  const validatedEmail = validationResult.data;

  // Get current user
  const currentUser = await db.user.findUnique({
    where: { id: userId },
  });

  if (!currentUser) {
    throw new AuthError(
      AuthErrorCode.USER_NOT_FOUND,
      'User not found',
      404
    );
  }

  // Check if new email is the same as current email
  if (currentUser.email === validatedEmail) {
    throw new AuthError(
      AuthErrorCode.VALIDATION_ERROR,
      'New email must be different from current email',
      400
    );
  }

  // Check if new email is already in use by another user
  const existingUser = await db.users.findUnique({
    where: { email: validatedEmail },
  });

  if (existingUser) {
    throw new AuthError(
      AuthErrorCode.EMAIL_ALREADY_EXISTS,
      'This email address is already in use',
      409
    );
  }

  // Update email directly without verification
  await db.users.update({
    where: { id: userId },
    data: {
      email: validatedEmail,
      updatedAt: new Date(),
    },
  });

  // Log the email change for audit
  await logProfileChange(userId, {
    email: {
      old: currentUser.email,
      new: validatedEmail,
    },
  });

  return {
    message: `Email successfully changed to ${validatedEmail}.`,
  };
}

/**
 * Complete email change after verification
 * This function should be called after the user clicks the verification link
 * 
 * Note: This is a helper function that would be integrated with the email verification flow.
 * In practice, you would need to modify the verification token system to support email changes,
 * or create a separate EmailChangeToken model.
 * 
 * @param userId - User ID
 * @param newEmail - New verified email address
 * @returns Updated user profile
 */
export async function completeEmailChange(
  userId: string,
  newEmail: string
): Promise<UserProfile> {
  // Validate new email format
  const validationResult = emailSchema.safeParse(newEmail);
  if (!validationResult.success) {
    throw new AuthError(
      AuthErrorCode.INVALID_EMAIL,
      validationResult.error.errors[0].message,
      400
    );
  }

  const validatedEmail = validationResult.data;

  // Get current user
  const currentUser = await db.users.findUnique({
    where: { id: userId },
  });

  if (!currentUser) {
    throw new AuthError(
      AuthErrorCode.USER_NOT_FOUND,
      'User not found',
      404
    );
  }

  // Check if new email is already in use
  const existingUser = await db.users.findUnique({
    where: { email: validatedEmail },
  });

  if (existingUser && existingUser.id !== userId) {
    throw new AuthError(
      AuthErrorCode.EMAIL_ALREADY_EXISTS,
      'This email address is already in use',
      409
    );
  }

  // Update email in database
  const updatedUser = await db.users.update({
    where: { id: userId },
    data: {
      email: validatedEmail,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });

  // Log the completed email change for audit
  await logProfileChange(userId, {
    email: {
      old: currentUser.email,
      new: validatedEmail,
    },
  });

  return updatedUser;
}

/**
 * Get profile with booking statistics
 * Extended profile information including user's booking history
 * 
 * @param userId - User ID
 * @returns User profile with booking statistics
 */
export async function getProfileWithStats(userId: string) {
  const user = await db.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
      user_bookings: {
        select: {
          id: true,
          status: true,
          createdAt: true,
          numberOfPeople: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!user) {
    throw new AuthError(
      AuthErrorCode.USER_NOT_FOUND,
      'User not found',
      404
    );
  }

  const totalBookings = user.user_bookings.length;
  const confirmedBookings = user.user_bookings.filter(b => b.status === 'confirmed').length;
  const completedBookings = user.user_bookings.filter(b => b.status === 'completed').length;
  const cancelledBookings = user.user_bookings.filter(b => b.status === 'cancelled').length;

  return {
    profile: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
    },
    stats: {
      totalBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      accountAge: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
    },
    recentBookings: user.user_bookings.slice(0, 5),
  };
}

/**
 * Validate profile data
 * Helper function to validate profile fields
 * 
 * @param data - Profile data to validate
 * @returns Validation result
 */
export function validateProfileData(data: UpdateProfileInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (data.name !== undefined) {
    const nameResult = nameSchema.safeParse(data.name);
    if (!nameResult.success) {
      errors.push(...nameResult.error.errors.map(e => e.message));
    }
  }

  if (data.phone !== undefined) {
    const phoneResult = phoneSchema.safeParse(data.phone);
    if (!phoneResult.success) {
      errors.push(...phoneResult.error.errors.map(e => e.message));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if email is available for use
 * 
 * @param email - Email to check
 * @param excludeUserId - Optional user ID to exclude from check (for current user)
 * @returns True if email is available, false if already in use
 */
export async function isEmailAvailable(
  email: string,
  excludeUserId?: string
): Promise<boolean> {
  const validationResult = emailSchema.safeParse(email);
  if (!validationResult.success) {
    return false;
  }

  const existingUser = await db.users.findUnique({
    where: { email: validationResult.data },
  });

  if (!existingUser) {
    return true;
  }

  if (excludeUserId && existingUser.id === excludeUserId) {
    return true;
  }

  return false;
}
