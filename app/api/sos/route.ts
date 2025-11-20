/**
 * SOS Alert Acknowledgment API Route
 * 
 * Handles acknowledgment of SOS alerts by temple authorities.
 * Updates alert status and records acknowledgment details.
 * 
 * Endpoint: POST /api/sos/alerts/[id]/acknowledge
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  SOSAlert,
  AlertStatus,
  AuthorityAcknowledgment
} from '@/lib/types/sos';
import { getAlertById, updateAlert } from '@/lib/storage/sos-storage';

// ============================================================================
// Validation Schemas
// ============================================================================

/**
 * Zod schema for acknowledgment request validation
 * Requirements: 7.1, 7.4
 */
const AcknowledgeAlertSchema = z.object({
  authorityId: z.string().min(1, 'Authority ID is required'),
  authorityName: z.string().min(2, 'Authority name must be at least 2 characters').max(100),
  notes: z.string().max(500).optional()
});

// ============================================================================
// POST /api/sos/alerts/[id]/acknowledge - Acknowledge Alert
// ============================================================================

/**
 * Acknowledge an SOS alert
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();

  try {
    // Extract alert ID from route parameters
    const alertId = params.id;

    if (!alertId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Alert ID is required'
        },
        { status: 400 }
      );
    }

    // Check if alert exists
    const existingAlert = getAlertById(alertId);

    if (!existingAlert) {
      return NextResponse.json(
        {
          success: false,
          error: 'Alert not found',
          message: `No alert found with ID: ${alertId}`
        },
        { status: 404 }
      );
    }

    // Check if alert is already acknowledged
    if (existingAlert.status !== AlertStatus.PENDING) {
      return NextResponse.json(
        {
          success: false,
          error: 'Alert already processed',
          message: `Alert is already in ${existingAlert.status} status`,
          alert: existingAlert
        },
        { status: 409 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = AcknowledgeAlertSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { authorityId, authorityName, notes } = validationResult.data;

    // Create acknowledgment object
    const acknowledgment: AuthorityAcknowledgment = {
      authorityId,
      authorityName,
      acknowledgedAt: Date.now(),
      notes
    };

    // Update alert with acknowledgment
    const updatedAlert = updateAlert(alertId, {
      status: AlertStatus.ACKNOWLEDGED,
      acknowledgment
    });

    // Calculate processing time (Requirements: 7.2 - within 2 seconds)
    const processingTime = Date.now() - startTime;

    // Log for monitoring
    console.log(
      `SOS alert ${alertId} acknowledged by ${authorityName} (${authorityId}) in ${processingTime}ms`
    );

    // Build response
    const response = {
      success: true,
      message: 'Alert acknowledged successfully',
      alert: updatedAlert,
      processingTime
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error acknowledging SOS alert:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'StorageError') {
        return NextResponse.json(
          {
            success: false,
            error: 'Storage error',
            message: error.message
          },
          { status: 500 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to acknowledge alert',
        message: 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}
