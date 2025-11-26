/**
 * Notification Service
 * Handles email notifications for booking confirmations and cancellations
 * Requirements: 4.4, 4.5, 5.2
 */

import { Resend } from "resend";
import type { BookingData } from "./booking.service";

/**
 * Email configuration
 */
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.EMAIL_FROM || "onboarding@resend.dev";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Notification Service Class
 * Provides methods for sending email notifications with retry logic
 */
export class NotificationService {
  private resend: Resend | null;

  constructor() {
    // Only initialize Resend if API key is available
    this.resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
  }

  /**
   * Send booking confirmation email with QR code
   * Requirements: 4.4, 5.2
   * 
   * Sends email with:
   * - Booking details (name, date, time, number of people)
   * - Embedded QR code image
   * - Instructions for temple entry
   * 
   * @param booking - Booking data with slot information
   * @param qrCodeDataUrl - Base64 encoded QR code image (data URL)
   * @returns Success status
   */
  async sendConfirmationEmail(
    booking: BookingData,
    qrCodeDataUrl: string
  ): Promise<boolean> {
    // Skip if Resend is not configured
    if (!this.resend) {
      console.warn("Resend API key not configured. Skipping email.");
      return false;
    }
    
    try {
      // Format date and time for display
      const bookingDate = new Date(booking.slot.date).toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const slotTime = `${booking.slot.startTime} - ${booking.slot.endTime}`;

      // Extract base64 data from data URL
      const base64Data = qrCodeDataUrl.split(",")[1];

      // Create email HTML template
      const htmlContent = this.createConfirmationEmailTemplate(
        booking.name,
        bookingDate,
        slotTime,
        booking.numberOfPeople,
        booking.id,
        base64Data
      );

      // Send email with retry logic
      const success = await this.sendEmailWithRetry({
        to: booking.email,
        subject: "Darshan Booking Confirmation - Your QR Code Pass",
        html: htmlContent,
      });

      return success;
    } catch (error) {
      console.error("Failed to send confirmation email:", error);
      // Log error but don't throw - email failure shouldn't block booking
      return false;
    }
  }

  /**
   * Send booking cancellation email
   * Requirements: 4.5
   * 
   * Sends email notification when booking is cancelled
   * 
   * @param booking - Cancelled booking data
   * @returns Success status
   */
  async sendCancellationEmail(booking: BookingData): Promise<boolean> {
    // Skip if Resend is not configured
    if (!this.resend) {
      console.warn("Resend API key not configured. Skipping email.");
      return false;
    }
    
    try {
      // Format date and time for display
      const bookingDate = new Date(booking.slot.date).toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const slotTime = `${booking.slot.startTime} - ${booking.slot.endTime}`;

      // Create email HTML template
      const htmlContent = this.createCancellationEmailTemplate(
        booking.name,
        bookingDate,
        slotTime,
        booking.id
      );

      // Send email with retry logic
      const success = await this.sendEmailWithRetry({
        to: booking.email,
        subject: "Darshan Booking Cancelled",
        html: htmlContent,
      });

      return success;
    } catch (error) {
      console.error("Failed to send cancellation email:", error);
      // Log error but don't throw
      return false;
    }
  }

  /**
   * Send email with retry logic
   * 
   * Implements exponential backoff retry mechanism for failed email sends
   * 
   * @param emailData - Email parameters (to, subject, html)
   * @returns Success status
   */
  private async sendEmailWithRetry(emailData: {
    to: string;
    subject: string;
    html: string;
  }): Promise<boolean> {
    if (!this.resend) {
      return false;
    }
    
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const { data, error } = await this.resend.emails.send({
          from: FROM_EMAIL,
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
        });

        if (error) {
          throw new Error(error.message);
        }

        console.log(`Email sent successfully to ${emailData.to}:`, data?.id);
        return true;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");
        console.error(`Email send attempt ${attempt} failed:`, lastError.message);

        // Wait before retrying (exponential backoff)
        if (attempt < MAX_RETRIES) {
          const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    console.error(
      `Failed to send email after ${MAX_RETRIES} attempts:`,
      lastError?.message
    );
    return false;
  }

  /**
   * Create HTML template for confirmation email
   * 
   * @param name - Devotee name
   * @param date - Formatted booking date
   * @param time - Formatted time slot
   * @param numberOfPeople - Number of people
   * @param bookingId - Booking ID
   * @param qrCodeBase64 - Base64 encoded QR code image
   * @returns HTML email content
   */
  private createConfirmationEmailTemplate(
    name: string,
    date: string,
    time: string,
    numberOfPeople: number,
    bookingId: string,
    qrCodeBase64: string
  ): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Darshan Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🙏 Darshan Booking Confirmed
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #333333;">
                Dear <strong>${name}</strong>,
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; color: #333333; line-height: 1.6;">
                Your darshan booking has been confirmed! Please find your booking details and QR code pass below.
              </p>
              
              <!-- Booking Details -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px; background-color: #f8f9fa; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <h2 style="margin: 0 0 15px; font-size: 18px; color: #667eea;">Booking Details</h2>
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666666;">Booking ID:</td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333333; font-weight: bold;">${bookingId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666666;">Date:</td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333333; font-weight: bold;">${date}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666666;">Time Slot:</td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333333; font-weight: bold;">${time}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666666;">Number of People:</td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333333; font-weight: bold;">${numberOfPeople}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- QR Code -->
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px; font-size: 18px; color: #667eea;">Your QR Code Pass</h2>
                <div style="background-color: #ffffff; padding: 20px; border: 2px solid #667eea; border-radius: 8px; display: inline-block;">
                  <img src="data:image/png;base64,${qrCodeBase64}" alt="QR Code" style="width: 250px; height: 250px; display: block;" />
                </div>
                <p style="margin: 15px 0 0; font-size: 12px; color: #666666;">
                  Please save this QR code or show this email at the temple entrance
                </p>
              </div>
              
              <!-- Instructions -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px; font-size: 16px; color: #856404;">Important Instructions</h3>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #856404; line-height: 1.6;">
                  <li>Please arrive 10 minutes before your scheduled time slot</li>
                  <li>Show this QR code at the temple entrance for verification</li>
                  <li>The QR code can only be used once</li>
                  <li>Cancellations must be made at least 2 hours before your slot</li>
                  <li>Carry a valid ID proof for verification</li>
                </ul>
              </div>
              
              <p style="margin: 0 0 20px; font-size: 14px; color: #666666; line-height: 1.6;">
                If you need to cancel or modify your booking, please visit our website and use your booking ID or contact information.
              </p>
              
              <!-- Temple Contact Information -->
              <div style="background-color: #e7f3ff; border-left: 4px solid #2563eb; padding: 15px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px; font-size: 16px; color: #1e40af;">Temple Contact Information</h3>
                <p style="margin: 0; font-size: 14px; color: #1e40af; line-height: 1.6;">
                  <strong>For assistance or inquiries:</strong><br/>
                  📞 Phone: +91-XXXX-XXXXXX<br/>
                  📧 Email: temple@example.com<br/>
                  🕐 Office Hours: 6:00 AM - 8:00 PM (Daily)
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #666666;">
                Thank you for using our Smart Darshan Booking System
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">
                This is an automated email. Please do not reply to this message.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * Create HTML template for cancellation email
   * 
   * @param name - Devotee name
   * @param date - Formatted booking date
   * @param time - Formatted time slot
   * @param bookingId - Booking ID
   * @returns HTML email content
   */
  private createCancellationEmailTemplate(
    name: string,
    date: string,
    time: string,
    bookingId: string
  ): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Darshan Booking Cancelled</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                Booking Cancelled
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #333333;">
                Dear <strong>${name}</strong>,
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; color: #333333; line-height: 1.6;">
                Your darshan booking has been successfully cancelled. The slot is now available for other devotees.
              </p>
              
              <!-- Cancelled Booking Details -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px; background-color: #f8f9fa; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <h2 style="margin: 0 0 15px; font-size: 18px; color: #f5576c;">Cancelled Booking Details</h2>
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666666;">Booking ID:</td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333333; font-weight: bold;">${bookingId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666666;">Date:</td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333333; font-weight: bold;">${date}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666666;">Time Slot:</td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333333; font-weight: bold;">${time}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Info Box -->
              <div style="background-color: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 14px; color: #0c5460; line-height: 1.6;">
                  <strong>Note:</strong> Your previous QR code is no longer valid. If you wish to book another slot, please visit our website and create a new booking.
                </p>
              </div>
              
              <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.6;">
                We hope to serve you again soon. Feel free to book another slot at your convenience.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #666666;">
                Thank you for using our Smart Darshan Booking System
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">
                This is an automated email. Please do not reply to this message.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }
}
