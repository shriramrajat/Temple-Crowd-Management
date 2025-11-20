import { db } from '@/lib/db';
import { sendSOSAlertEmail } from './email-service';

/**
 * SOS Alert Service
 * Handles emergency alert creation and notifications
 */

export interface SOSAlertInput {
  userId?: string;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  location?: {
    latitude: number;
    longitude: number;
  } | null;
  manualLocation?: string;
  message?: string;
  emergencyType: string;
}

export interface SOSAlertResult {
  success: boolean;
  alertId?: string;
  error?: string;
  errorCode?: string;
}

/**
 * Create a new SOS alert and send notifications to temple administrators
 * @param input - SOS alert data
 * @returns Result of SOS alert creation
 */
export async function createSOSAlert(
  input: SOSAlertInput
): Promise<SOSAlertResult> {
  const startTime = Date.now();
  
  try {
    // Validate input
    if (!input.emergencyType) {
      return {
        success: false,
        error: 'Emergency type is required',
        errorCode: 'MISSING_EMERGENCY_TYPE',
      };
    }

    // Validate that we have either location or manual location
    if (!input.location && !input.manualLocation) {
      return {
        success: false,
        error: 'Location information is required (GPS or manual)',
        errorCode: 'MISSING_LOCATION',
      };
    }

    // Create SOS alert record
    const sosAlert = await db.sOSAlert.create({
      data: {
        userId: input.userId || null,
        userName: input.userName || null,
        userPhone: input.userPhone || null,
        userEmail: input.userEmail || null,
        latitude: input.location?.latitude || null,
        longitude: input.location?.longitude || null,
        manualLocation: input.manualLocation || null,
        message: input.message || null,
        emergencyType: input.emergencyType,
        status: 'pending',
      },
    });

    console.info('SOS alert created:', {
      alertId: sosAlert.id,
      emergencyType: sosAlert.emergencyType,
      hasLocation: !!sosAlert.latitude,
      userId: sosAlert.userId,
      processingTime: Date.now() - startTime,
    });

    // Send notification emails to temple administrators asynchronously
    // Don't wait for email to complete - alert is already saved
    sendSOSAlertNotifications(sosAlert).catch((error) => {
      console.error('Failed to send SOS alert notifications:', error);
    });

    const processingTime = Date.now() - startTime;
    
    // Ensure processing time is within 2 seconds requirement
    if (processingTime > 2000) {
      console.warn('SOS alert processing exceeded 2 second requirement:', {
        alertId: sosAlert.id,
        processingTime,
      });
    }

    return {
      success: true,
      alertId: sosAlert.id,
    };
  } catch (error) {
    console.error('Error creating SOS alert:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create SOS alert',
      errorCode: 'SOS_CREATION_FAILED',
    };
  }
}

/**
 * Send SOS alert notifications to temple administrators
 * @param sosAlert - The created SOS alert
 */
async function sendSOSAlertNotifications(sosAlert: any): Promise<void> {
  try {
    // Get admin email addresses from environment or database
    const adminEmails = await getAdminEmails();
    
    if (adminEmails.length === 0) {
      console.warn('No admin emails configured for SOS alerts');
      return;
    }

    // Send email to each admin
    const emailPromises = adminEmails.map((adminEmail) =>
      sendSOSAlertEmail(adminEmail, {
        alertId: sosAlert.id,
        emergencyType: sosAlert.emergencyType,
        userName: sosAlert.userName || 'Unknown',
        userPhone: sosAlert.userPhone || 'Not provided',
        userEmail: sosAlert.userEmail || 'Not provided',
        location: sosAlert.latitude && sosAlert.longitude
          ? {
              latitude: sosAlert.latitude,
              longitude: sosAlert.longitude,
            }
          : null,
        manualLocation: sosAlert.manualLocation || null,
        message: sosAlert.message || 'No additional message',
        timestamp: sosAlert.createdAt,
      })
    );

    const results = await Promise.allSettled(emailPromises);
    
    // Log results
    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    const failureCount = results.filter((r) => r.status === 'rejected').length;
    
    console.info('SOS alert notifications sent:', {
      alertId: sosAlert.id,
      totalAdmins: adminEmails.length,
      successCount,
      failureCount,
    });

    if (failureCount > 0) {
      console.error('Some SOS alert notifications failed:', {
        alertId: sosAlert.id,
        failures: results
          .filter((r) => r.status === 'rejected')
          .map((r) => (r as PromiseRejectedResult).reason),
      });
    }
  } catch (error) {
    console.error('Error sending SOS alert notifications:', error);
    throw error;
  }
}

/**
 * Get admin email addresses for SOS notifications
 * @returns Array of admin email addresses
 */
async function getAdminEmails(): Promise<string[]> {
  try {
    // First check environment variable for admin emails
    const envAdminEmails = process.env.ADMIN_EMAILS;
    if (envAdminEmails) {
      return envAdminEmails.split(',').map((email) => email.trim());
    }

    // Fallback to querying admin users from database
    const adminUsers = await db.adminUser.findMany({
      select: {
        email: true,
      },
    });

    return adminUsers.map((admin: { email: string }) => admin.email);
  } catch (error) {
    console.error('Error fetching admin emails:', error);
    return [];
  }
}

/**
 * Get SOS alert by ID
 * @param alertId - The SOS alert ID
 * @returns The SOS alert or null if not found
 */
export async function getSOSAlertById(alertId: string) {
  try {
    return await db.sOSAlert.findUnique({
      where: { id: alertId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching SOS alert:', error);
    return null;
  }
}

/**
 * Update SOS alert status
 * @param alertId - The SOS alert ID
 * @param status - New status
 * @param resolvedBy - ID of admin who resolved the alert
 * @returns Updated SOS alert or null if failed
 */
export async function updateSOSAlertStatus(
  alertId: string,
  status: string,
  resolvedBy?: string
) {
  try {
    return await db.sOSAlert.update({
      where: { id: alertId },
      data: {
        status,
        resolvedAt: status === 'resolved' ? new Date() : null,
        resolvedBy: resolvedBy || null,
      },
    });
  } catch (error) {
    console.error('Error updating SOS alert status:', error);
    return null;
  }
}

/**
 * Get all pending SOS alerts
 * @returns Array of pending SOS alerts
 */
export async function getPendingSOSAlerts() {
  try {
    return await db.sOSAlert.findMany({
      where: {
        status: 'pending',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Error fetching pending SOS alerts:', error);
    return [];
  }
}
