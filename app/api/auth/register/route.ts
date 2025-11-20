import { NextRequest, NextResponse } from 'next/server';
import { registerUser, createAutoLoginSession } from '@/lib/services/auth-service';
import { registerUserSchema } from '@/lib/validations/auth';
import { handleGenericError, handleValidationError, createSuccessResponse } from '@/lib/utils/api-error-handler';
import { logger } from '@/lib/utils/logger';
import { ZodError } from 'zod';

/**
 * POST /api/auth/register
 * Register a new pilgrim user and automatically create session
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 * Enhanced with standardized error handling: Task 10
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod schema
    const validationResult = registerUserSchema.safeParse(body);
    
    if (!validationResult.success) {
      logger.warn('Registration validation failed', {
        errors: validationResult.error.errors,
      });
      return handleValidationError(validationResult.error);
    }

    // Call authentication service to create user
    const user = await registerUser(validationResult.data);

    logger.auth('register', {
      userId: user.id,
      email: user.email,
    });

    // Create session for auto-login after registration
    // This bypasses the email verification check
    const sessionResult = await createAutoLoginSession(user.id);

    if (!sessionResult.success) {
      logger.error('Failed to create auto-login session', {
        userId: user.id,
        error: sessionResult.error,
      });
      
      // Return success for registration but indicate session creation failed
      return createSuccessResponse(
        {
          message: 'Registration successful. Please log in to continue.',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          redirectUrl: '/login',
        },
        201
      );
    }

    logger.info('User registered and auto-logged in', {
      userId: user.id,
    });

    // Return success response with session
    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful. You are now logged in.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        redirectUrl: '/booking', // Redirect to booking dashboard
      },
      { 
        status: 201,
        headers: {
          'Set-Cookie': sessionResult.sessionCookie!,
        },
      }
    );
  } catch (error) {
    logger.error('Registration error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    }, error instanceof Error ? error : undefined);

    return handleGenericError(error);
  }
}
