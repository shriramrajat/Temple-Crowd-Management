import { db } from '@/lib/db';
import { 
  generatePasswordResetToken,
  validatePasswordResetToken,
  invalidatePasswordResetToken,
  invalidateAllPasswordResetTokens
} from './token-service';
import { 
  sendPasswordResetEmail
} from './email-service';
import { authRateLimiter } from '@/lib/utils/auth-rate-limiter';
import { registerUserSchema, loginUserSchema } from '@/lib/validations/auth';
import { 
  AuthErrorCode, 
  AuthError, 
  RegisterUserInput, 
  AuthResult 
} from '@/lib/types/auth';

/**
 * Authentication Service
 * Handles user registration, login, email verification, and password reset
 */

// Re-export types for backward compatibility
export { AuthErrorCode, AuthError };
export type { RegisterUserInput, AuthResult };

/**
 * Register a new user
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 * 
 * @param data - User registration data
 * @returns The created user
 */
export async function registerUser(data: RegisterUserInput) {
  // Validate input
  const validationResult = registerUserSchema.safeParse(data);
  if (!validationResult.success) {
    throw new AuthError(
      AuthErrorCode.VALIDATION_ERROR,
      validationResult.error.errors[0].message,
      400
    );
  }

  const { email, password, name, phone } = validationResult.data;

  // Check if user already exists
  const existingUser = await db.users.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AuthError(
      AuthErrorCode.EMAIL_ALREADY_EXISTS,
      'An account with this email already exists',
      409
    );
  }

  // Hash password with bcryptjs (10 salt rounds)
  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.default.hash(password, 10);

  // Generate unique ID for user
  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

  // Create user in database
  const user = await db.users.create({
    data: {
      id: userId,
      email,
      passwordHash,
      name: name || null,
      phone: phone || null,
      updatedAt: new Date(),
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    createdAt: user.createdAt,
  };
}


/**
 * Authenticate user login
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 * 
 * @param email - User email
 * @param password - User password
 * @returns Authentication result with user data
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthResult> {
  // Validate input
  const validationResult = loginUserSchema.safeParse({ email, password });
  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.errors[0].message,
      errorCode: AuthErrorCode.VALIDATION_ERROR,
    };
  }

  // Check rate limiting
  const rateLimitResult = authRateLimiter.checkLoginAttempt(email);
  
  if (!rateLimitResult.allowed) {
    const lockoutMinutes = rateLimitResult.lockoutExpiresIn 
      ? Math.ceil(rateLimitResult.lockoutExpiresIn / 60)
      : 15;
    
    return {
      success: false,
      error: `Account temporarily locked due to too many failed login attempts. Please try again in ${lockoutMinutes} minutes.`,
      errorCode: AuthErrorCode.ACCOUNT_LOCKED,
    };
  }

  // Find user by email
  const user = await db.users.findUnique({
    where: { email: validationResult.data.email },
  });

  // If user not found or password incorrect, record failed attempt
  if (!user) {
    authRateLimiter.recordFailedAttempt(email);
    return {
      success: false,
      error: 'Invalid email or password',
      errorCode: AuthErrorCode.INVALID_CREDENTIALS,
    };
  }

  // Compare password with bcryptjs
  const bcrypt = await import('bcryptjs');
  const isPasswordValid = await bcrypt.default.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    authRateLimiter.recordFailedAttempt(email);
    
    // Update failed login count in database
    await db.users.update({
      where: { id: user.id },
      data: {
        failedLoginCount: { increment: 1 },
      },
    });

    return {
      success: false,
      error: 'Invalid email or password',
      errorCode: AuthErrorCode.INVALID_CREDENTIALS,
    };
  }

  // Reset failed attempts on successful login
  authRateLimiter.resetFailedAttempts(email);

  // Update last login time and reset failed login count
  await db.users.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
      failedLoginCount: 0,
    },
  });

  // Return successful authentication result
  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
}


/**
 * Request password reset
 * Requirements: 5.1, 5.2
 * 
 * @param email - User email address
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await db.users.findUnique({
    where: { email },
  });

  // Don't reveal if user exists for security
  if (!user) {
    // Silently succeed to prevent email enumeration
    return;
  }

  // Generate password reset token and send email
  const { plainToken } = await generatePasswordResetToken(user.id);
  await sendPasswordResetEmail(email, plainToken);
}

/**
 * Reset password with token
 * Requirements: 5.2, 5.3, 5.4, 5.5
 * 
 * @param token - Password reset token
 * @param newPassword - New password
 * @returns True if password reset successful
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<boolean> {
  // Validate token and get user ID
  const userId = await validatePasswordResetToken(token);

  if (!userId) {
    throw new AuthError(
      AuthErrorCode.INVALID_TOKEN,
      'Invalid or expired password reset token',
      400
    );
  }

  // Get user
  const user = await db.users.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AuthError(
      AuthErrorCode.USER_NOT_FOUND,
      'User not found',
      404
    );
  }

  // Hash new password with bcryptjs (10 salt rounds)
  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.default.hash(newPassword, 10);

  // Update password in database
  await db.users.update({
    where: { id: userId },
    data: {
      passwordHash,
      failedLoginCount: 0,
    },
  });

  // Invalidate the reset token
  await invalidatePasswordResetToken(token);

  // Invalidate all other password reset tokens for this user
  await invalidateAllPasswordResetTokens(userId);

  // Note: Session invalidation will be handled by NextAuth
  // when we implement the session management

  return true;
}

/**
 * Change password for authenticated user
 * Requirements: 4.2
 * 
 * @param userId - User ID
 * @param currentPassword - Current password
 * @param newPassword - New password
 * @returns True if password change successful
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  const user = await db.users.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AuthError(
      AuthErrorCode.USER_NOT_FOUND,
      'User not found',
      404
    );
  }

  // Verify current password
  const bcrypt = await import('bcryptjs');
  const isPasswordValid = await bcrypt.default.compare(currentPassword, user.passwordHash);

  if (!isPasswordValid) {
    throw new AuthError(
      AuthErrorCode.INVALID_CREDENTIALS,
      'Current password is incorrect',
      401
    );
  }

  // Hash new password with bcryptjs (12 salt rounds)
  const passwordHash = await bcrypt.default.hash(newPassword, 12);

  // Update password in database
  await db.users.update({
    where: { id: userId },
    data: {
      passwordHash,
    },
  });

  // Invalidate all password reset tokens
  await invalidateAllPasswordResetTokens(userId);

  return true;
}


/**
 * Session Management Functions
 * Requirements: 3.5, 6.1, 6.2, 6.5
 * 
 * Note: Session tokens are managed by NextAuth JWT strategy.
 * These functions provide additional user validation and session helpers.
 */

/**
 * Get user by ID for session validation
 * 
 * @param userId - User ID
 * @returns User data or null if not found
 */
export async function getUserById(userId: string) {
  const user = await db.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

/**
 * Get user by email
 * 
 * @param email - User email
 * @returns User data or null if not found
 */
export async function getUserByEmail(email: string) {
  const user = await db.users.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

/**
 * Validate user session
 * Checks if user exists
 * 
 * @param userId - User ID from session
 * @returns User data if valid, null otherwise
 */
export async function validateUserSession(userId: string) {
  const user = await getUserById(userId);

  if (!user) {
    return null;
  }

  return user;
}

/**
 * Check if user account is locked
 * 
 * @param email - User email
 * @returns True if account is locked
 */
export async function isAccountLocked(email: string): Promise<boolean> {
  const rateLimitResult = authRateLimiter.checkLoginAttempt(email);
  return rateLimitResult.isLocked;
}

/**
 * Get account lockout status
 * 
 * @param email - User email
 * @returns Lockout information
 */
export async function getAccountLockoutStatus(email: string) {
  const rateLimitResult = authRateLimiter.checkLoginAttempt(email);
  
  return {
    isLocked: rateLimitResult.isLocked,
    failedAttempts: rateLimitResult.failedAttempts,
    remainingAttempts: rateLimitResult.remainingAttempts,
    lockoutExpiresIn: rateLimitResult.lockoutExpiresIn,
  };
}

/**
 * Manually unlock an account (admin function)
 * 
 * @param email - User email
 */
export async function unlockAccount(email: string): Promise<void> {
  authRateLimiter.unlockAccount(email);
  
  // Reset failed login count in database
  const user = await db.users.findUnique({
    where: { email },
  });

  if (user) {
    await db.users.update({
      where: { id: user.id },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
      },
    });
  }
}

/**
 * Update user's last login timestamp
 * 
 * @param userId - User ID
 */
export async function updateLastLogin(userId: string): Promise<void> {
  await db.users.update({
    where: { id: userId },
    data: {
      lastLoginAt: new Date(),
    },
  });
}

/**
 * Check if user exists by email
 * 
 * @param email - User email
 * @returns True if user exists
 */
export async function userExists(email: string): Promise<boolean> {
  const count = await db.users.count({
    where: { email },
  });
  return count > 0;
}

/**
 * Get user statistics
 * 
 * @param userId - User ID
 * @returns User statistics
 */
export async function getUserStats(userId: string) {
  const user = await db.users.findUnique({
    where: { id: userId },
    include: {
      user_bookings: {
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const totalBookings = user.user_bookings.length;
  const confirmedBookings = user.user_bookings.filter(b => b.status === 'confirmed').length;
  const completedBookings = user.user_bookings.filter(b => b.status === 'completed').length;

  return {
    totalBookings,
    confirmedBookings,
    completedBookings,
    accountAge: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
    lastLoginAt: user.lastLoginAt,
  };
}

/**
 * Create auto-login session after registration
 * Requirements: 1.2, 1.5
 * 
 * @param userId - User ID
 * @returns Session creation result with cookie
 */
export async function createAutoLoginSession(userId: string): Promise<{
  success: boolean;
  sessionCookie?: string;
  error?: string;
}> {
  try {
    const user = await db.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Update last login timestamp
    await db.users.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
      },
    });

    // Create JWT token using NextAuth's encode function
    const { encode } = await import('next-auth/jwt');
    
    const token = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: 'user',
        userType: 'pilgrim',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
      },
      secret: process.env.NEXTAUTH_SECRET!,
      salt: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
    });

    // Create session cookie string
    const cookieName = process.env.NODE_ENV === 'production'
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token';
    
    const cookieValue = `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`;

    return {
      success: true,
      sessionCookie: cookieValue,
    };
  } catch (error) {
    console.error('Failed to create auto-login session:', error);
    return {
      success: false,
      error: 'Failed to create session',
    };
  }
}
