'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { QRCodeData, BookingError } from '../../../types/booking';
import { useErrorHandler } from '../../../hooks/useErrorHandler';

interface UseQRCodeReturn {
  // State
  qrCodeUrl: string | null;
  loading: boolean;
  error: BookingError | null;
  
  // Actions
  generateQRCode: (data: QRCodeData) => Promise<void>;
  downloadQRCode: (filename?: string) => void;
  saveQRCode: (filename?: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
  
  // Computed properties
  isReady: boolean;
  canDownload: boolean;
}

/**
 * Custom hook for QR code generation with lazy loading and memoization
 * Optimized for the DarshanBooking component with performance considerations
 */
export function useQRCode(): UseQRCodeReturn {
  const { captureError, handleAsyncError } = useErrorHandler({
    context: { component: 'useQRCode' }
  });

  // State
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<BookingError | null>(null);

  // Lazy loading reference for QR code service
  const qrServiceRef = useRef<any>(null);

  /**
   * Lazy load QR code service
   */
  const getQRService = useCallback(async () => {
    if (!qrServiceRef.current) {
      try {
        // Dynamic import for lazy loading
        const { qrCodeService } = await import('../../../services/qrcode/qrCodeService');
        qrServiceRef.current = qrCodeService;
      } catch (err) {
        throw new Error('Failed to load QR code service');
      }
    }
    return qrServiceRef.current;
  }, []);

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
   * Generate QR code from booking data with memoization
   */
  const generateQRCode = useCallback(async (data: QRCodeData): Promise<void> => {
    // Prevent duplicate generation for same data
    const dataHash = JSON.stringify(data);
    
    setLoading(true);
    setError(null);

    const result = await handleAsyncError(
      async () => {
        const qrService = await getQRService();
        
        // Validate QR code data before generation
        if (!qrService.validateQRCodeData(data)) {
          throw new Error('Invalid QR code data provided');
        }

        const qrDataURL = await qrService.generateQRCode(data);
        setQrCodeUrl(qrDataURL);
        
        return qrDataURL;
      },
      { 
        operation: 'generateQRCode', 
        bookingId: data.bookingId,
        dataHash 
      }
    );

    if (!result) {
      setError({
        code: 'qr_generation_error',
        message: 'Failed to generate QR code. Please try again.'
      });
      setQrCodeUrl(null);
    }

    setLoading(false);
  }, [handleAsyncError, getQRService]);

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
      
      // Create download link
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      captureError(
        err instanceof Error ? err : new Error('Download failed'),
        { operation: 'downloadQRCode', filename }
      );
      setError({
        code: 'qr_generation_error',
        message: 'Failed to download QR code. Please try again.'
      });
    }
  }, [qrCodeUrl, captureError]);

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

    const result = await handleAsyncError(
      async () => {
        const qrService = await getQRService();
        const saveFilename = filename || `darshan-booking-${Date.now()}.png`;
        
        // Check if Web Share API is available (mobile)
        if (navigator.share && navigator.canShare) {
          // Convert data URL to blob
          const response = await fetch(qrCodeUrl);
          const blob = await response.blob();
          const file = new File([blob], saveFilename, { type: 'image/png' });
          
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'Darshan Booking QR Code',
              text: 'Your darshan booking QR code',
              files: [file]
            });
            return;
          }
        }
        
        // Fallback to download
        downloadQRCode(saveFilename);
      },
      { operation: 'saveQRCode', filename }
    );

    if (!result) {
      setError({
        code: 'qr_generation_error',
        message: 'Failed to save QR code. Please try again.'
      });
    }
  }, [qrCodeUrl, handleAsyncError, getQRService, downloadQRCode]);

  // Computed properties with memoization
  const isReady = useMemo((): boolean => {
    return !loading && !error && qrCodeUrl !== null;
  }, [loading, error, qrCodeUrl]);

  const canDownload = useMemo((): boolean => {
    return isReady && qrCodeUrl !== null;
  }, [isReady, qrCodeUrl]);

  return {
    // State
    qrCodeUrl: isReady ? qrCodeUrl : null,
    loading,
    error,
    
    // Actions
    generateQRCode,
    downloadQRCode,
    saveQRCode,
    clearError,
    reset,
    
    // Computed properties
    isReady,
    canDownload,
  };
}

/**
 * Hook for QR code verification (for scanning/validation purposes)
 * Separate hook to keep concerns separated and optimize performance
 */
export function useQRCodeVerification() {
  const { handleAsyncError } = useErrorHandler({
    context: { component: 'useQRCodeVerification' }
  });

  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    data: QRCodeData | null;
    error: string | null;
    loading: boolean;
  }>({
    isValid: false,
    data: null,
    error: null,
    loading: false
  });

  // Lazy loading reference for QR code service
  const qrServiceRef = useRef<any>(null);

  /**
   * Lazy load QR code service
   */
  const getQRService = useCallback(async () => {
    if (!qrServiceRef.current) {
      const { qrCodeService } = await import('../../../services/qrcode/qrCodeService');
      qrServiceRef.current = qrCodeService;
    }
    return qrServiceRef.current;
  }, []);

  /**
   * Verify QR code string
   */
  const verifyQRCode = useCallback(async (qrString: string): Promise<void> => {
    setVerificationResult(prev => ({ ...prev, loading: true, error: null }));

    const result = await handleAsyncError(
      async () => {
        const qrService = await getQRService();
        const qrData = qrService.parseQRCodeData(qrString);
        const isValid = qrService.verifyQRCode(qrData);

        setVerificationResult({
          isValid,
          data: qrData,
          error: isValid ? null : 'QR code verification failed',
          loading: false
        });

        return { isValid, data: qrData };
      },
      { operation: 'verifyQRCode' }
    );

    if (!result) {
      setVerificationResult({
        isValid: false,
        data: null,
        error: 'Failed to verify QR code',
        loading: false
      });
    }
  }, [handleAsyncError, getQRService]);

  /**
   * Clear verification result
   */
  const clearVerification = useCallback((): void => {
    setVerificationResult({
      isValid: false,
      data: null,
      error: null,
      loading: false
    });
  }, []);

  return {
    verificationResult,
    verifyQRCode,
    clearVerification
  };
}

export default useQRCode;