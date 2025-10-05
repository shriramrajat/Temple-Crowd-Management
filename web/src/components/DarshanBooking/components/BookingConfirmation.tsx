import React, { useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useQRCode } from '@/hooks/useQRCode';
import { formatDisplayDate, formatDisplayTime } from '@/utils/dateUtils';
import { BookingConfirmationProps } from '@/types/booking';

/**
 * BookingConfirmation component displays booking details and QR code
 * Provides download/save options and navigation back to booking interface
 */
export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  booking,
  qrCodeData,
  onBackToBooking,
  onDownloadQR,
  className
}) => {
  const {
    qrCodeUrl,
    loading: qrLoading,
    error: qrError,
    generateQRCode,
    downloadQRCode,
    saveQRCode,
    clearError,
    isReady
  } = useQRCode();

  // Generate QR code when component mounts or qrCodeData changes
  useEffect(() => {
    if (qrCodeData && !qrCodeUrl && !qrLoading) {
      generateQRCode(qrCodeData);
    }
  }, [qrCodeData, qrCodeUrl, qrLoading, generateQRCode]);

  // Format booking details for display
  const bookingDetails = useMemo(() => {
    return {
      date: formatDisplayDate(booking.slotTime, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: formatDisplayTime(
        booking.slotTime.toTimeString().substring(0, 5)
      ),
      bookingId: booking.id,
      status: booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
      createdAt: formatDisplayDate(booking.createdAt, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  }, [booking]);

  // Handle QR code download
  const handleDownloadQR = () => {
    if (isReady && qrCodeUrl) {
      const filename = `darshan-booking-${booking.id}.png`;
      downloadQRCode(filename);
      onDownloadQR?.();
    }
  };

  // Handle QR code save (mobile-friendly)
  const handleSaveQR = async () => {
    if (isReady && qrCodeUrl) {
      const filename = `darshan-booking-${booking.id}.png`;
      await saveQRCode(filename);
    }
  };

  // Handle retry QR generation
  const handleRetryQR = () => {
    clearError();
    generateQRCode(qrCodeData);
  };

  return (
    <div 
      className={cn('w-full max-w-sm sm:max-w-md lg:max-w-2xl mx-auto space-y-4 sm:space-y-6', className)}
      role="main"
      aria-labelledby="confirmation-heading"
    >
      {/* Success Header */}
      <Card variant="elevated" className="text-center">
        <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
          <div className="flex justify-center mb-3 sm:mb-4" role="img" aria-label="Success checkmark">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h1 
            id="confirmation-heading"
            className="text-xl sm:text-2xl font-bold text-gray-900 mb-2"
          >
            Booking Confirmed!
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Your darshan slot has been successfully booked. Please save your QR code for entry.
          </p>
        </CardContent>
      </Card>

      {/* Booking Details */}
      <Card role="region" aria-labelledby="booking-details-heading">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle id="booking-details-heading" className="text-base sm:text-lg">Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-3">
              <div>
                <dt className="text-xs sm:text-sm font-medium text-gray-500">Date</dt>
                <dd className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                  {bookingDetails.date}
                </dd>
              </div>
              <div>
                <dt className="text-xs sm:text-sm font-medium text-gray-500">Time</dt>
                <dd className="text-base sm:text-lg font-semibold text-gray-900">
                  {bookingDetails.time}
                </dd>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <dt className="text-xs sm:text-sm font-medium text-gray-500">Booking ID</dt>
                <dd className="text-xs sm:text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded break-all">
                  {bookingDetails.bookingId}
                </dd>
              </div>
              <div>
                <dt className="text-xs sm:text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-xs sm:text-sm font-semibold text-green-600">
                  {bookingDetails.status}
                </dd>
              </div>
            </div>
          </dl>
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Booked on <time dateTime={booking.createdAt.toISOString()}>{bookingDetails.createdAt}</time>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Section */}
      <Card role="region" aria-labelledby="qr-code-heading">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle id="qr-code-heading" className="text-base sm:text-lg">Entry QR Code</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="text-center">
            {qrLoading && (
              <div className="flex flex-col items-center py-6 sm:py-8" role="status" aria-live="polite">
                <LoadingSpinner size="lg" />
                <p className="mt-3 sm:mt-4 text-sm text-gray-600">
                  Generating your QR code...
                </p>
              </div>
            )}

            {qrError && (
              <div className="py-6 sm:py-8" role="alert">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                  <div className="flex items-start">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-xs sm:text-sm text-red-600 break-words">{qrError.message}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetryQR}
                  className="mx-auto touch-manipulation"
                  aria-describedby="qr-error-description"
                >
                  Retry QR Code Generation
                </Button>
                <div id="qr-error-description" className="sr-only">
                  Click to retry generating the QR code after an error occurred
                </div>
              </div>
            )}

            {isReady && qrCodeUrl && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-center">
                  <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                    <img
                      src={qrCodeUrl}
                      alt={`QR code for booking ${booking.id} on ${bookingDetails.date} at ${bookingDetails.time}`}
                      className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56"
                      style={{ imageRendering: 'pixelated' }}
                      role="img"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-xs sm:text-sm text-gray-600 px-2">
                    Present this QR code at the temple entrance for verification
                  </p>
                  
                  {/* QR Code Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 justify-center px-2" role="group" aria-label="QR code actions">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleDownloadQR}
                      className="flex items-center justify-center touch-manipulation"
                      aria-describedby="download-description"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Download QR Code
                    </Button>
                    <div id="download-description" className="sr-only">
                      Download the QR code as a PNG image file to your device
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveQR}
                      className="flex items-center justify-center touch-manipulation"
                      aria-describedby="save-description"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                        />
                      </svg>
                      Save to Device
                    </Button>
                    <div id="save-description" className="sr-only">
                      Save the QR code image to your device's photo gallery or downloads folder
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Important Instructions */}
      <Card variant="outlined">
        <CardContent className="px-4 sm:px-6">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="space-y-2 min-w-0 flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Important Instructions
              </h3>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                <li>• Please arrive 15 minutes before your scheduled time</li>
                <li>• Bring a valid photo ID for verification</li>
                <li>• The QR code must be presented at the entrance</li>
                <li>• Screenshots of the QR code are acceptable</li>
                <li>• Contact temple administration for any changes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Actions */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center px-2">
        <Button
          variant="outline"
          onClick={onBackToBooking}
          className="flex items-center justify-center touch-manipulation"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Book Another Slot
        </Button>
        
        <Button
          variant="ghost"
          onClick={() => window.print()}
          className="flex items-center justify-center touch-manipulation"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Print Details
        </Button>
      </div>
    </div>
  );
};