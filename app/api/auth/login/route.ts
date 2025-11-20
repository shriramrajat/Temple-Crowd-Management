import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse, APIErrorCode } from '@/lib/utils/api-error-handler';
import { logger } from '@/lib/utils/logger';
import { db } from '@/lib/db';
import { authenticateUser } from '@/lib/services/auth-service';

/**
 * Login API Route
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 * Enhanced with standardized error handling: Task 10
 * 
 * Handles user authentication with:
 * - Failed login attempt tracking and account lockout (5 attempts, 15 min lockout)
 * - Role-based redirect logic (admin → admin dashboard, user → booking dashboard)
 * - Proper error messages for invalid credentials
 * - Last login timestamp update on successful authentication
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, userType } = body;

    // Validate required fields
    if (!email || !password || !userType) {
      logger.warn('Login attempt with missing fields', {
        hasEmail: !!email,
        hasPassword: !!password,
        hasUserType: !!userType,
      });
      
      return createErrorResponse(
        400,
        'Email, password, and user type are required',
        APIErrorCode.MISSING_REQUIRED_FIELD
      );
    }

    // Validate userType
    if (userType !== 'admin' && userType !== 'pilgrim') {
      logger.warn('Login attempt with invalid user type', {
        userType,
        email,
      });
      
      return createErrorResponse(
        400,
        'Invalid user type. Must be "admin" or "pilgrim"',
        APIErrorCode.INVALID_INPUT
      );
    }

    // Determine redirect URL based on user type
    // Requirements: 2.3, 2.4 - Role-based redirect logic
    const redirectUrl = userType === 'admin' 
      ? '/admin/command-center'  // Admin → admin dashboard
      : '/profile';               // User → booking dashboard

    // Authenticate based on user type
    if (userType === 'admin') {
      // Admin authentication
      const adminUser = await db.adminUser.findUnique({
        where: { email },
      });

      if (!adminUser) {
        logger.auth('failed_login', { email, userType, reason: 'User not found' });
        return createErrorResponse(
          401,
          'Invalid email or password',
          APIErrorCode.INVALID_CREDENTIALS
        );
      }

      // Verify password
      const bcrypt = await import('bcryptjs');
      const isPasswordValid = await bcrypt.default.compare(password, adminUser.passwordHash);

      if (!isPasswordValid) {
        logger.auth('failed_login', { email, userType, reason: 'Invalid password' });
        return createErrorResponse(
          401,
          'Invalid email or password',
          APIErrorCode.INVALID_CREDENTIALS
        );
      }

      // Success - admin authenticated
      logger.auth('login', { email, userType });

      // Create session using NextAuth
      const { encode } = await import('next-auth/jwt');
      const salt = process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token';
      
      const token = await encode({
        token: {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
          userType: 'admin',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
        },
        secret: process.env.NEXTAUTH_SECRET!,
        salt,
      });

      // Set session cookie
      const cookieName = process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token';

      const response = createSuccessResponse(
        {
          redirectUrl,
          message: 'Login successful',
        },
        200
      );

      // Add Set-Cookie header
      response.headers.set(
        'Set-Cookie',
        `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${
          process.env.NODE_ENV === 'production' ? '; Secure' : ''
        }`
      );

      return response;

    } else {
      // Pilgrim user authentication
      const result = await authenticateUser(email, password);

      if (!result.success || !result.user) {
        logger.auth('failed_login', {
          email,
          userType,
          reason: result.error || 'Authentication failed',
        });

        let statusCode = 401;
        let errorCode = APIErrorCode.INVALID_CREDENTIALS;

        if (result.errorCode === 'ACCOUNT_LOCKED') {
          statusCode = 429;
          errorCode = APIErrorCode.RATE_LIMIT_EXCEEDED;
        }

        return createErrorResponse(
          statusCode,
          result.error || 'Invalid email or password',
          errorCode
        );
      }

      // Success - user authenticated
      logger.auth('login', { email, userType });

      // Create session using NextAuth
      const { encode } = await import('next-auth/jwt');
      const salt = process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token';
      
      const token = await encode({
        token: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: 'user',
          userType: 'pilgrim',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
        },
        secret: process.env.NEXTAUTH_SECRET!,
        salt,
      });

      // Set session cookie
      const cookieName = process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token';

      const response = createSuccessResponse(
        {
          redirectUrl,
          message: 'Login successful',
        },
        200
      );

      // Add Set-Cookie header
      response.headers.set(
        'Set-Cookie',
        `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${
          process.env.NODE_ENV === 'production' ? '; Secure' : ''
        }`
      );

      return response;
    }
  } catch (error) {
    logger.error('Login error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    }, error instanceof Error ? error : undefined);
    
    // Handle specific error types
    if (error instanceof Error) {
      // Check if it's an authentication error with a specific message
      if (error.message && error.message !== 'An unexpected error occurred') {
        return createErrorResponse(
          401,
          error.message,
          APIErrorCode.UNAUTHORIZED
        );
      }
    }

    return createErrorResponse(
      500,
      'An unexpected error occurred. Please try again.',
      APIErrorCode.INTERNAL_ERROR
    );
  }
}
