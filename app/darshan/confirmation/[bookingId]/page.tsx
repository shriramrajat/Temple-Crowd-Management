"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { ErrorDisplay } from "@/components/error-display";
import type { GetBookingResponse, APIError, Booking } from "@/lib/types/api";
import {
  CheckCircle2,
  Calendar,
  Clock,
  Users,
  Mail,
  Phone,
  Download,
  CalendarPlus,
  ArrowLeft,
  QrCode,
  Info,
  RefreshCw,
} from "lucide-react";

/**
 * Booking Confirmation Page
 * Requirements: 4.3, 4.4, 5.1, 5.2
 * 
 * Features:
 * - Display booking summary (name, date, time slot, number of people)
 * - Render QR code image prominently
 * - Download QR code button
 * - Add to calendar button (optional)
 * - Display booking ID for reference
 * - Show instructions for temple entry
 */
export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFoundError, setNotFoundError] = useState(false);

  // Fetch booking details on mount
  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  /**
   * Fetch booking details from API
   * Requirements: 5.1, 5.2
   */
  const fetchBookingDetails = async () => {
    setLoading(true);
    setError(null);
    setNotFoundError(false);

    try {
      const response = await fetch(`/api/bookings/${bookingId}`);

      if (response.status === 404) {
        setNotFoundError(true);
        return;
      }

      if (!response.ok) {
        const errorData: APIError = await response.json();
        throw new Error(errorData.message || "Failed to fetch booking details");
      }

      const data: GetBookingResponse = await response.json();
      setBooking(data.booking);
      setQrCodeData(data.qrCodeData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load booking";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Download QR code as image
   * Requirements: 4.3
   */
  const handleDownloadQR = () => {
    if (!qrCodeData || !booking) return;

    try {
      // Create a link element and trigger download
      const link = document.createElement("a");
      link.href = qrCodeData;
      link.download = `darshan-qr-${booking.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("QR code downloaded successfully!");
    } catch (error) {
      console.error("Error downloading QR code:", error);
      toast.error("Failed to download QR code. Please try again.");
    }
  };

  /**
   * Add booking to calendar
   * Requirements: 4.3 (optional feature)
   */
  const handleAddToCalendar = () => {
    if (!booking) return;

    try {
      const slot = booking.slot;
      if (!slot) return;

      // Parse date and time
      const date = new Date(slot.date);
      const [startHour, startMinute] = slot.startTime.split(":").map(Number);
      const [endHour, endMinute] = slot.endTime.split(":").map(Number);

      // Create start and end datetime
      const startDate = new Date(date);
      startDate.setHours(startHour, startMinute, 0);

      const endDate = new Date(date);
      endDate.setHours(endHour, endMinute, 0);

      // Format for ICS file
      const formatICSDate = (d: Date) => {
        return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      };

      // Create ICS content
      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Darshan Booking//EN",
        "BEGIN:VEVENT",
        `UID:${booking.id}`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        `SUMMARY:Temple Darshan - ${booking.name}`,
        `DESCRIPTION:Darshan booking for ${booking.numberOfPeople} ${booking.numberOfPeople === 1 ? "person" : "people"}. Booking ID: ${booking.id}`,
        "LOCATION:Temple",
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");

      // Create blob and download
      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `darshan-${booking.id}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Calendar event created! Check your downloads.");
    } catch (error) {
      console.error("Error creating calendar event:", error);
      toast.error("Failed to create calendar event. Please try again.");
    }
  };

  // Loading state
  if (loading) {
    return <BookingConfirmationSkeleton />;
  }

  // Not found - trigger Next.js 404 page
  if (notFoundError) {
    notFound();
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <ErrorDisplay
            title="Failed to Load Booking"
            message={error}
            onRetry={fetchBookingDetails}
            showHomeButton={true}
          />
        </div>
      </div>
    );
  }

  // No booking data
  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <ErrorDisplay
            title="Booking Not Found"
            message="We couldn't find the booking you're looking for."
            onRetry={fetchBookingDetails}
            showHomeButton={true}
          />
        </div>
      </div>
    );
  }

  // Format date for display
  const formattedDate = booking.slot
    ? format(new Date(booking.slot.date), "EEEE, MMMM d, yyyy")
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-3 sm:mb-4">
            <CheckCircle2 className="size-6 sm:size-8 text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Your darshan slot has been successfully booked
          </p>
        </div>

        {/* QR Code Card */}
        {/* Requirements: 4.3, 4.4 */}
        <Card className="mb-4 sm:mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-orange-50">
          <CardHeader className="text-center pb-3 sm:pb-6">
            <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl md:text-2xl">
              <QrCode className="size-5 sm:size-6" />
              Your Entry Pass
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Show this QR code at the temple entrance
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center px-3 sm:px-6">
            {/* QR Code Image - Optimized for mobile */}
            {qrCodeData && (
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-4 sm:mb-6 w-full max-w-[280px] sm:max-w-none">
                <img
                  src={qrCodeData}
                  alt="Booking QR Code"
                  className="w-full h-auto max-w-[240px] sm:max-w-[280px] md:w-64 md:h-64 mx-auto"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
              <Button
                onClick={handleDownloadQR}
                variant="default"
                size="lg"
                className="flex-1 min-w-0 sm:min-w-[200px] h-11 sm:h-10 text-base sm:text-sm touch-manipulation"
              >
                <Download className="size-4" />
                Download QR Code
              </Button>
              <Button
                onClick={handleAddToCalendar}
                variant="outline"
                size="lg"
                className="flex-1 min-w-0 sm:min-w-[200px] h-11 sm:h-10 text-base sm:text-sm touch-manipulation"
              >
                <CalendarPlus className="size-4" />
                Add to Calendar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Booking Details Card */}
        {/* Requirements: 5.1, 5.2 */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Booking Details</CardTitle>
            <CardDescription className="text-xs sm:text-sm break-all">
              Reference ID: <span className="font-mono font-semibold text-gray-900">{booking.id}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {/* Name */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="size-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-lg font-semibold text-gray-900">{booking.name}</p>
              </div>
            </div>

            <Separator />

            {/* Date */}
            {booking.slot && (
              <>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="size-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="text-lg font-semibold text-gray-900">{formattedDate}</p>
                  </div>
                </div>

                <Separator />

                {/* Time Slot */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="size-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Time Slot</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {booking.slot.startTime} - {booking.slot.endTime}
                    </p>
                  </div>
                </div>

                <Separator />
              </>
            )}

            {/* Number of People */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="size-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Number of People</p>
                <p className="text-lg font-semibold text-gray-900">
                  {booking.numberOfPeople} {booking.numberOfPeople === 1 ? "Person" : "People"}
                </p>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="size-4 sm:size-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500">Phone</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 break-all">{booking.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="size-4 sm:size-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500">Email</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 break-all">{booking.email}</p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="pt-2">
              <Badge
                variant={
                  booking.status === "confirmed"
                    ? "default"
                    : booking.status === "checked-in"
                    ? "secondary"
                    : "outline"
                }
                className="text-sm"
              >
                {booking.status === "confirmed" && "Confirmed"}
                {booking.status === "checked-in" && "Checked In"}
                {booking.status === "cancelled" && "Cancelled"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Instructions Card */}
        {/* Requirements: 5.2 */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Info className="size-5" />
              Temple Entry Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-blue-900">
            <div className="flex gap-3">
              <span className="font-bold">1.</span>
              <p>
                <strong>Arrive 15 minutes early</strong> to ensure smooth entry before your scheduled time slot.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold">2.</span>
              <p>
                <strong>Present your QR code</strong> at the temple entrance. You can show it on your phone or print it out.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold">3.</span>
              <p>
                <strong>Keep your booking ID handy</strong> for reference: <span className="font-mono bg-white px-2 py-1 rounded">{booking.id.slice(0, 8)}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold">4.</span>
              <p>
                <strong>Check your email</strong> for a confirmation message with your QR code and booking details.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold">5.</span>
              <p>
                <strong>Cancellation policy:</strong> You can cancel your booking up to 2 hours before your scheduled time.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => router.push("/darshan")}
            variant="outline"
            size="lg"
            className="h-11 sm:h-10 text-base sm:text-sm touch-manipulation"
          >
            <ArrowLeft className="size-4" />
            Book Another Slot
          </Button>
          <Button
            onClick={() => router.push("/darshan/my-bookings")}
            variant="default"
            size="lg"
            className="h-11 sm:h-10 text-base sm:text-sm touch-manipulation"
          >
            View My Bookings
          </Button>
        </div>

        {/* Email Confirmation Notice */}
        <Card className="mt-4 sm:mt-6 border-green-200 bg-green-50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xs sm:text-sm text-green-900 break-words">
              <Mail className="size-3 sm:size-4 inline" /> A confirmation email with your QR code has been sent to{" "}
              <strong className="break-all">{booking.email}</strong>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for booking confirmation page
 */
function BookingConfirmationSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
          <Skeleton className="h-10 w-64 mx-auto mb-2" />
          <Skeleton className="h-5 w-48 mx-auto" />
        </div>

        {/* QR Code Card Skeleton */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Skeleton className="w-64 h-64 mb-6" />
            <div className="flex gap-3 w-full">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 flex-1" />
            </div>
          </CardContent>
        </Card>

        {/* Details Card Skeleton */}
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="flex items-start gap-3">
                  <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                </div>
                {i < 4 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Instructions Skeleton */}
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
