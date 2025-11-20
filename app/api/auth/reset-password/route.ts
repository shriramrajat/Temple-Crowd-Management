import { NextRequest, NextResponse } from 'next/server';
import { resetPassword, AuthError } from '@/lib/services/auth-service';
import { passwordResetSchema } from '@/lib/validations/auth';

/**
 * POST /api/auth/reset-password
 * Reset password with token
 * Requirements: 5.2, 5.3, 5.4, 5.5
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod schema
    const validationResult = passwordResetSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: validationResult.error.errors[0].message,
            details: validationResult.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { token, password } = validationResult.data;

    // Reset password with token
    await resetPassword(token, password);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Password reset successfully. You can now log in with your new password.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);

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
          message: 'An unexpected error occurred while resetting your password',
        },
      },
      { status: 500 }
    );
  }
}
