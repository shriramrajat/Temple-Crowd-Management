import { Resend } from 'resend';

/**
 * Email Service
 * Handles sending emails using Resend API for authentication flows
 */

// Initialize Resend client only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Email configuration
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const APP_NAME = 'Shradha Secure';

/**
 * Email template utilities
 */

/**
 * Generate HTML email template with consistent styling
 * @param content - The main content of the email
 * @param title - The email title
 * @returns Formatted HTML email
 */
function generateEmailTemplate(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #2563eb;
      margin: 0;
      font-size: 28px;
    }
    .content {
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #1d4ed8;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
    .link {
      color: #2563eb;
      text-decoration: none;
    }
    .code {
      background-color: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${APP_NAME}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>This email was sent from ${APP_NAME}. If you didn't request this, please ignore this email.</p>
      <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate verification email content
 * @param verificationUrl - The verification URL with token
 * @returns HTML content for verification email
 */
function generateVerificationEmailContent(verificationUrl: string): string {
  return `
    <h2>Verify Your Email Address</h2>
    <p>Thank you for registering with ${APP_NAME}! To complete your registration and activate your account, please verify your email address.</p>
    <p style="text-align: center;">
      <a href="${verificationUrl}" class="button">Verify Email Address</a>
    </p>
    <p>Or copy and paste this link into your browser:</p>
    <p><a href="${verificationUrl}" class="link">${verificationUrl}</a></p>
    <p><strong>This link will expire in 24 hours.</strong></p>
    <p>If you didn't create an account with ${APP_NAME}, you can safely ignore this email.</p>
  `;
}

/**
 * Generate password reset email content
 * @param resetUrl - The password reset URL with token
 * @returns HTML content for password reset email
 */
function generatePasswordResetEmailContent(resetUrl: string): string {
  return `
    <h2>Reset Your Password</h2>
    <p>We received a request to reset your password for your ${APP_NAME} account.</p>
    <p style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </p>
    <p>Or copy and paste this link into your browser:</p>
    <p><a href="${resetUrl}" class="link">${resetUrl}</a></p>
    <p><strong>This link will expire in 1 hour.</strong></p>
    <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
    <p>For security reasons, we recommend changing your password if you didn't make this request.</p>
  `;
}

/**
 * Generate welcome email content
 * @param name - The user's name
 * @returns HTML content for welcome email
 */
function generateWelcomeEmailContent(name: string): string {
  const dashboardUrl = `${APP_URL}/darshan`;
  return `
    <h2>Welcome to ${APP_NAME}!</h2>
    <p>Hello ${name},</p>
    <p>Your email has been successfully verified, and your account is now active!</p>
    <p>You can now access all features of ${APP_NAME}, including:</p>
    <ul>
      <li>Book darshan slots</li>
      <li>Manage your bookings</li>
      <li>View your profile</li>
      <li>Receive important notifications</li>
    </ul>
    <p style="text-align: center;">
      <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
    </p>
    <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
    <p>Thank you for choosing ${APP_NAME}!</p>
  `;
}

/**
 * Email Service Interface
 */

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send verification email with token link
 * @param email - Recipient email address
 * @param token - Verification token
 * @returns Result of email sending operation
 */
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<SendEmailResult> {
  if (!resend) {
    console.warn('Resend API key not configured. Skipping verification email.');
    return { success: false, error: 'Email service not configured' };
  }
  
  try {
    const verificationUrl = `${APP_URL}/verify-email?token=${token}`;
    const htmlContent = generateVerificationEmailContent(verificationUrl);
    const emailHtml = generateEmailTemplate(htmlContent, 'Verify Your Email');

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: `Verify your email for ${APP_NAME}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Failed to send verification email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send verification email',
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Send password reset email with token link
 * @param email - Recipient email address
 * @param token - Password reset token
 * @returns Result of email sending operation
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<SendEmailResult> {
  if (!resend) {
    console.warn('Resend API key not configured. Skipping password reset email.');
    return { success: false, error: 'Email service not configured' };
  }
  
  try {
    const resetUrl = `${APP_URL}/reset-password?token=${token}`;
    const htmlContent = generatePasswordResetEmailContent(resetUrl);
    const emailHtml = generateEmailTemplate(htmlContent, 'Reset Your Password');

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: `Reset your password for ${APP_NAME}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Failed to send password reset email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send password reset email',
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Send welcome email after successful verification
 * @param email - Recipient email address
 * @param name - User's name
 * @returns Result of email sending operation
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<SendEmailResult> {
  if (!resend) {
    console.warn('Resend API key not configured. Skipping welcome email.');
    return { success: false, error: 'Email service not configured' };
  }
  
  try {
    const htmlContent = generateWelcomeEmailContent(name);
    const emailHtml = generateEmailTemplate(htmlContent, 'Welcome!');

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: `Welcome to ${APP_NAME}!`,
      html: emailHtml,
    });

    if (error) {
      console.error('Failed to send welcome email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send welcome email',
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Validate email service configuration
 * @returns True if email service is properly configured
 */
export function isEmailServiceConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

/**
 * Get email service configuration status
 * @returns Configuration status object
 */
export function getEmailServiceStatus() {
  return {
    configured: isEmailServiceConfigured(),
    hasApiKey: !!process.env.RESEND_API_KEY,
    hasFromAddress: !!process.env.EMAIL_FROM,
    fromAddress: process.env.EMAIL_FROM,
    appUrl: APP_URL,
  };
}

/**
 * Generate SOS alert email content for administrators
 * @param alertData - SOS alert data
 * @returns HTML content for SOS alert email
 */
function generateSOSAlertEmailContent(alertData: {
  alertId: string;
  emergencyType: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  location: { latitude: number; longitude: number } | null;
  manualLocation: string | null;
  message: string;
  timestamp: Date;
}): string {
  const locationInfo = alertData.location
    ? `
      <p><strong>GPS Location:</strong></p>
      <ul>
        <li>Latitude: ${alertData.location.latitude}</li>
        <li>Longitude: ${alertData.location.longitude}</li>
        <li><a href="https://www.google.com/maps?q=${alertData.location.latitude},${alertData.location.longitude}" class="link" target="_blank">View on Google Maps</a></li>
      </ul>
    `
    : alertData.manualLocation
    ? `
      <p><strong>Manual Location:</strong> ${alertData.manualLocation}</p>
    `
    : '<p><strong>Location:</strong> Not provided</p>';

  return `
    <h2 style="color: #dc2626;">🚨 Emergency SOS Alert</h2>
    <p style="background-color: #fee2e2; padding: 15px; border-left: 4px solid #dc2626; border-radius: 4px;">
      <strong>URGENT:</strong> An emergency SOS alert has been submitted and requires immediate attention.
    </p>
    
    <h3>Alert Details</h3>
    <ul>
      <li><strong>Alert ID:</strong> <span class="code">${alertData.alertId}</span></li>
      <li><strong>Emergency Type:</strong> ${alertData.emergencyType}</li>
      <li><strong>Time:</strong> ${alertData.timestamp.toLocaleString()}</li>
    </ul>

    <h3>User Information</h3>
    <ul>
      <li><strong>Name:</strong> ${alertData.userName}</li>
      <li><strong>Phone:</strong> ${alertData.userPhone}</li>
      <li><strong>Email:</strong> ${alertData.userEmail}</li>
    </ul>

    <h3>Location Information</h3>
    ${locationInfo}

    <h3>Message</h3>
    <p style="background-color: #f3f4f6; padding: 15px; border-radius: 4px;">
      ${alertData.message}
    </p>

    <p style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
      <strong>Action Required:</strong> Please respond to this emergency alert as soon as possible. Contact the user directly or dispatch assistance to the provided location.
    </p>
  `;
}

/**
 * Send SOS alert notification email to temple administrators
 * @param adminEmail - Administrator email address
 * @param alertData - SOS alert data
 * @returns Result of email sending operation
 */
export async function sendSOSAlertEmail(
  adminEmail: string,
  alertData: {
    alertId: string;
    emergencyType: string;
    userName: string;
    userPhone: string;
    userEmail: string;
    location: { latitude: number; longitude: number } | null;
    manualLocation: string | null;
    message: string;
    timestamp: Date;
  }
): Promise<SendEmailResult> {
  try {
    const htmlContent = generateSOSAlertEmailContent(alertData);
    const emailHtml = generateEmailTemplate(htmlContent, 'Emergency SOS Alert');

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: adminEmail,
      subject: `🚨 URGENT: SOS Alert - ${alertData.emergencyType}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Failed to send SOS alert email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send SOS alert email',
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error('Error sending SOS alert email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Generate booking confirmation email content with QR code
 * @param bookingData - Booking data with QR code
 * @returns HTML content for booking confirmation email
 */
function generateBookingConfirmationEmailContent(bookingData: {
  bookingId: string;
  userName: string;
  slotDate: string;
  slotTime: string;
  numberOfPeople: number;
  qrCodeDataUrl: string;
  templeContact?: string;
}): string {
  return `
    <h2>Booking Confirmation</h2>
    <p>Dear ${bookingData.userName},</p>
    <p>Your darshan booking has been confirmed! Please find your booking details and QR code below.</p>
    
    <h3>Booking Details</h3>
    <ul>
      <li><strong>Booking ID:</strong> <span class="code">${bookingData.bookingId}</span></li>
      <li><strong>Date:</strong> ${bookingData.slotDate}</li>
      <li><strong>Time:</strong> ${bookingData.slotTime}</li>
      <li><strong>Number of People:</strong> ${bookingData.numberOfPeople}</li>
    </ul>

    <h3>Your QR Code</h3>
    <p>Please present this QR code at the temple entrance for verification:</p>
    <div style="text-align: center; margin: 30px 0;">
      <img src="${bookingData.qrCodeDataUrl}" alt="Booking QR Code" style="max-width: 300px; border: 2px solid #e5e7eb; border-radius: 8px; padding: 10px;" />
    </div>

    <h3>Important Instructions</h3>
    <ul>
      <li>Please arrive 15 minutes before your scheduled time</li>
      <li>Show this QR code at the entrance for verification</li>
      <li>Keep this email for your records</li>
      <li>Contact us if you need to modify or cancel your booking</li>
    </ul>

    ${bookingData.templeContact ? `
    <h3>Contact Information</h3>
    <p>${bookingData.templeContact}</p>
    ` : ''}

    <p style="margin-top: 30px;">We look forward to welcoming you!</p>
  `;
}

/**
 * Send booking confirmation email with QR code
 * @param email - User email address
 * @param bookingData - Booking data with QR code
 * @returns Result of email sending operation
 */
export async function sendBookingConfirmationEmail(
  email: string,
  bookingData: {
    bookingId: string;
    userName: string;
    slotDate: string;
    slotTime: string;
    numberOfPeople: number;
    qrCodeDataUrl: string;
    templeContact?: string;
  }
): Promise<SendEmailResult> {
  try {
    const htmlContent = generateBookingConfirmationEmailContent(bookingData);
    const emailHtml = generateEmailTemplate(htmlContent, 'Booking Confirmation');

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: `Booking Confirmation - ${APP_NAME}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Failed to send booking confirmation email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send booking confirmation email',
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
