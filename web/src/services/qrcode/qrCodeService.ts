import QRCode from 'qrcode';
import { QRCodeData, BookingError } from '../../types/booking';
import { BOOKING_ERROR_CODES, BOOKING_ERROR_MESSAGES } from '../../constants/booking';

/**
 * QR Code Service for generating and managing QR codes for darshan bookings
 */
export class QRCodeService {
  private static instance: QRCodeService;

  private constructor() {}

  /**
   * Get singleton instance of QRCodeService
   */
  public static getInstance(): QRCodeService {
    if (!QRCodeService.instance) {
      QRCodeService.instance = new QRCodeService();
    }
    return QRCodeService.instance;
  }

  /**
   * Generate a security verification code for the booking
   * This creates a simple hash based on booking data for verification
   */
  private generateVerificationCode(bookingId: string, userId: string, slotTime: string): string {
    const data = `${bookingId}-${userId}-${slotTime}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Create QR code data object with security verification
   */
  public createQRCodeData(bookingId: string, userId: string, slotTime: Date, status: string): QRCodeData {
    const slotTimeISO = slotTime.toISOString();
    const verificationCode = this.generateVerificationCode(bookingId, userId, slotTimeISO);

    return {
      bookingId,
      userId,
      slotTime: slotTimeISO,
      status: status as any, // Type assertion for BookingStatus
      verificationCode
    };
  }

  /**
   * Generate QR code as data URL
   */
  public async generateQRCode(qrData: QRCodeData): Promise<string> {
    try {
      const dataString = JSON.stringify(qrData);
      
      const qrCodeOptions: QRCode.QRCodeToDataURLOptions = {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      };

      const qrCodeDataURL = await QRCode.toDataURL(dataString, qrCodeOptions);
      return qrCodeDataURL;
    } catch (error) {
      console.error('QR Code generation failed:', error);
      throw this.createQRError('Failed to generate QR code', error);
    }
  }

  /**
   * Generate QR code as SVG string
   */
  public async generateQRCodeSVG(qrData: QRCodeData): Promise<string> {
    try {
      const dataString = JSON.stringify(qrData);
      
      const qrCodeOptions: QRCode.QRCodeToStringOptions = {
        type: 'svg',
        errorCorrectionLevel: 'M',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      };

      const qrCodeSVG = await QRCode.toString(dataString, qrCodeOptions);
      return qrCodeSVG;
    } catch (error) {
      console.error('QR Code SVG generation failed:', error);
      throw this.createQRError('Failed to generate QR code SVG', error);
    }
  }

  /**
   * Download QR code as PNG file
   */
  public downloadQRCode(qrCodeDataURL: string, filename: string = 'darshan-booking-qr.png'): void {
    try {
      // Create a temporary anchor element for download
      const link = document.createElement('a');
      link.href = qrCodeDataURL;
      link.download = filename;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('QR Code download failed:', error);
      throw this.createQRError('Failed to download QR code', error);
    }
  }

  /**
   * Save QR code to device (mobile-friendly)
   */
  public async saveQRCodeToDevice(qrCodeDataURL: string, filename: string = 'darshan-booking-qr.png'): Promise<void> {
    try {
      // Check if Web Share API is available (mobile devices)
      if (navigator.share && this.isMobileDevice()) {
        // Convert data URL to blob
        const response = await fetch(qrCodeDataURL);
        const blob = await response.blob();
        const file = new File([blob], filename, { type: 'image/png' });

        await navigator.share({
          title: 'Darshan Booking QR Code',
          text: 'Your darshan booking QR code',
          files: [file]
        });
      } else {
        // Fallback to download for desktop
        this.downloadQRCode(qrCodeDataURL, filename);
      }
    } catch (error) {
      console.error('QR Code save failed:', error);
      // Fallback to download if sharing fails
      this.downloadQRCode(qrCodeDataURL, filename);
    }
  }

  /**
   * Validate QR code data structure
   */
  public validateQRCodeData(qrData: QRCodeData): boolean {
    try {
      const requiredFields = ['bookingId', 'userId', 'slotTime', 'status', 'verificationCode'];
      
      for (const field of requiredFields) {
        if (!qrData[field as keyof QRCodeData]) {
          return false;
        }
      }

      // Validate date format
      const date = new Date(qrData.slotTime);
      if (isNaN(date.getTime())) {
        return false;
      }

      // Validate verification code format (8-character hex)
      const verificationCodeRegex = /^[0-9a-f]{8}$/i;
      if (!verificationCodeRegex.test(qrData.verificationCode)) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Parse QR code data from scanned string
   */
  public parseQRCodeData(qrString: string): QRCodeData {
    try {
      const qrData = JSON.parse(qrString) as QRCodeData;
      
      if (!this.validateQRCodeData(qrData)) {
        throw new Error('Invalid QR code data structure');
      }

      return qrData;
    } catch (error) {
      console.error('QR Code parsing failed:', error);
      throw this.createQRError('Invalid QR code format', error);
    }
  }

  /**
   * Verify QR code authenticity
   */
  public verifyQRCode(qrData: QRCodeData): boolean {
    try {
      const expectedVerificationCode = this.generateVerificationCode(
        qrData.bookingId,
        qrData.userId,
        qrData.slotTime
      );

      return qrData.verificationCode === expectedVerificationCode;
    } catch (error) {
      console.error('QR Code verification failed:', error);
      return false;
    }
  }

  /**
   * Check if device is mobile
   */
  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Create standardized QR code error
   */
  private createQRError(message: string, originalError?: any): BookingError {
    return {
      code: BOOKING_ERROR_CODES.QR_GENERATION_ERROR,
      message: BOOKING_ERROR_MESSAGES[BOOKING_ERROR_CODES.QR_GENERATION_ERROR],
      details: {
        originalMessage: message,
        originalError: originalError?.message || originalError
      }
    };
  }
}

// Export singleton instance
export const qrCodeService = QRCodeService.getInstance();

// Export default for easier importing
export default qrCodeService;