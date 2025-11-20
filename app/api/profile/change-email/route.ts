import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { initiateEmailChange } from '@/lib/services/profile-service';
import { AuthError } from '@/lib/services/auth-service';

/**
 * POST /api/profile/change-email
 * Initiate email change workflow with verification
 * Requirements: 4.3
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
    const { newEmail } = body;

    if (!newEmail) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'New email address is required',
          },
        },
        { status: 400 }
      );
    }

    // Initiate email change
    const result = await initiateEmailChange(session.user.id, newEmail);

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Email change error:', error);

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
          message: 'An error occurred while processing your email change request',
        },
      },
      { status: 500 }
    );
  }
}
