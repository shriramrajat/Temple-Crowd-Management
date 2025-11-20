import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { changePassword, AuthError } from '@/lib/services/auth-service';
import { passwordChangeSchema } from '@/lib/validations/auth';

/**
 * POST /api/profile/change-password
 * Change user password with current password validation
 * Requirements: 4.2
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    
    if (!session || !session.user || session.user.userType !== 'pilgrim') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input with Zod schema
    const validationResult = passwordChangeSchema.safeParse(body);
    
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

    const { currentPassword, newPassword } = validationResult.data;

    // Check that new password is different from current password
    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'New password must be different from current password',
          },
        },
        { status: 400 }
      );
    }

    // Change password
    await changePassword(session.user.id, currentPassword, newPassword);

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Password change error:', error);

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

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while changing your password',
        },
      },
      { status: 500 }
    );
  }
}
