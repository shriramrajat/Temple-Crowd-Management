import { NextRequest, NextResponse } from 'next/server';
import { requestPasswordReset, AuthError } from '@/lib/services/auth-service';
import { passwordResetRequestSchema } from '@/lib/validations/auth';

/**
 * POST /api/auth/forgot-password
 * Request password reset email
 * Requirements: 5.1
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = passwordResetRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Please provide a valid email address',
          },
        },
        { status: 400 }
      );
    }

    // Request password reset (silently succeeds even if user doesn't exist)
    await requestPasswordReset(validationResult.data.email);

    // Return success response (don't reveal if user exists)
    return NextResponse.json(
      {
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset request error:', error);

    // Handle authentication errors
    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.statusCode }
      );
    }

    // Handle unexpected errors
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred while processing your request',
        },
      },
      { status: 500 }
    );
  }
}
