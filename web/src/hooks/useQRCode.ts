import { useState, useCallback, useMemo } from 'react';
import { QRCodeData, BookingError, UseQRCodeReturn } from '../types/booking';
import { qrCodeService } from '../services/qrcode/qrCodeService';

/**
 * Custom hook for QR code generation and management
 * Provides lazy loading and memoization for performance optimization
 */
export function useQRCode(): UseQRCodeReturn {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<BookingError | null>(null);

  /**
   * Generate QR code from booking data
   */
  const generateQRCode = useCallback(async (data: QRCodeData): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Validate QR code data before generation
      if (!qrCodeService.validateQRCodeData(data)) {
        throw new Error('Invalid QR code data provided');
      }

      const qrDataURL = await qrCodeService.generateQRCode(data);
      setQrCodeUrl(qrDataURL);
    } catch (err) {
      console.error('QR code generation failed:', err);
      
      const bookingError: BookingError = err instanceof Error && 'code' in err 
        ? err as BookingError
        : {
            code: 'qr_generation_error',
            message: 'Failed to generate QR code',
            details: err
          };
      
      setError(bookingError);
      setQrCodeUrl(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Download QR code with custom filename
   */
  const downloadQRCode = useCallback((filename?: string): void => {
    if (!qrCodeUrl) {
      setError({
        code: 'qr_generation_error',
        message: 'No QR code available for download',
        details: 'Generate a QR code first before attempting to download'
      });
      return;
    }

    try {
      const downloadFilename = filename || `darshan-booking-${Date.now()}.png`;
      qrCodeService.downloadQRCode(qrCodeUrl, downloadFilename);
    } catch (err) {
      console.error('QR code download failed:', err);
      setError({
        code: 'qr_generation_error',
        message: 'Failed to download QR code',
        details: err
      });
    }
  }, [qrCodeUrl]);

  /**
   * Save QR code to device (mobile-friendly)
   */
  const saveQRCode = useCallback(async (filename?: string): Promise<void> => {
    if (!qrCodeUrl) {
      setError({
        code: 'qr_generation_error',
        message: 'No QR code available for saving',
        details: 'Generate a QR code first before attempting to save'
      });
      return;
    }

    try {
      const saveFilename = filename || `darshan-booking-${Date.now()}.png`;
      await qrCodeService.saveQRCodeToDevice(qrCodeUrl, saveFilename);
    } catch (err) {
      console.error('QR code save failed:', err);
      setError({
        code: 'qr_generation_error',
        message: 'Failed to save QR code',
        details: err
      });
    }
  }, [qrCodeUrl]);

  /**
   * Clear error state
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback((): void => {
    setQrCodeUrl(null);
    setLoading(false);
    setError(null);
  }, []);

  /**
   * Check if QR code is ready for use
   */
  const isReady = useMemo((): boolean => {
    return !loading && !error && qrCodeUrl !== null;
  }, [loading, error, qrCodeUrl]);

  /**
   * Get QR code data URL with validation
   */
  const getQrCodeUrl = useCallback((): string | null => {
    if (!qrCodeUrl || loading || error) {
      return null;
    }
    return qrCodeUrl;
  }, [qrCodeUrl, loading, error]);

  return {
    qrCodeUrl: getQrCodeUrl(),
    loading,
    error,
    generateQRCode,
    downloadQRCode,
    saveQRCode,
    clearError,
    reset,
    isReady
  };
}

/**
 * Hook for QR code verification (for scanning/validation purposes)
 */
export function useQRCodeVerification() {
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    data: QRCodeData | null;
    error: string | null;
  }>({
    isValid: false,
    data: null,
    error: null
  });

  const verifyQRCode = useCallback((qrString: string): void => {
    try {
      const qrData = qrCodeService.parseQRCodeData(qrString);
      const isValid = qrCodeService.verifyQRCode(qrData);

      setVerificationResult({
        isValid,
        data: qrData,
        error: isValid ? null : 'QR code verification failed'
      });
    } catch (error) {
      setVerificationResult({
        isValid: false,
        data: null,
        error: error instanceof Error ? error.message : 'Invalid QR code format'
      });
    }
  }, []);

  const clearVerification = useCallback((): void => {
    setVerificationResult({
      isValid: false,
      data: null,
      error: null
    });
  }, []);

  return {
    verificationResult,
    verifyQRCode,
    clearVerification
  };
}

export default useQRCode;