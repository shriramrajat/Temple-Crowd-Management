import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getProfile, initiateEmailChange } from '@/lib/services/profile-service';
import { AuthError } from '@/lib/services/auth-service';

/**
 * GET /api/profile
 * Get user profile information
 * Requirements: 4.1
 */
export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Fetch user profile
    const profile = await getProfile(session.user.id);

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);

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
          message: 'Failed to fetch profile. Please try again.',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profile
 * Update user profile (name, phone)
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

/**
 * PATCH /api/profile
 * Update user profile fields
 * Requirements: 4.2
 */
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      name,
      phone,
      dateOfBirth,
      gender,
      idProofType,
      idProofNumber,
      emergencyContactName,
      emergencyContactPhone,
      accessibilityNeeds,
      preferredLanguage,
    } = body;

    // Build update data object
    const updateData: any = { updatedAt: new Date() };
    
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (gender !== undefined) updateData.gender = gender;
    if (idProofType !== undefined) updateData.idProofType = idProofType;
    if (idProofNumber !== undefined) updateData.idProofNumber = idProofNumber;
    if (emergencyContactName !== undefined) updateData.emergencyContactName = emergencyContactName;
    if (emergencyContactPhone !== undefined) updateData.emergencyContactPhone = emergencyContactPhone;
    if (accessibilityNeeds !== undefined) updateData.accessibilityNeeds = accessibilityNeeds;
    if (preferredLanguage !== undefined) updateData.preferredLanguage = preferredLanguage;

    // Update profile in database
    const { db } = await import('@/lib/db');
    const updatedUser = await db.users.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        dateOfBirth: true,
        gender: true,
        idProofType: true,
        idProofNumber: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        accessibilityNeeds: true,
        preferredLanguage: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating profile:', error);

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
          message: 'Failed to update profile. Please try again.',
        },
      },
      { status: 500 }
    );
  }
}
