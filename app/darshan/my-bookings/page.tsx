"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { format, isPast, differenceInHours, parseISO } from "date-fns";
import type { GetBookingsResponse, Booking, APIError } from "@/lib/types/api";
import {
  Search,
  Calendar,
  Clock,
  Users,
  Mail,
  Phone,
  QrCode,
  X,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

/**
 * My Bookings Page
 * Requirements: 5.3, 5.4, 5.5, 5.6
 * 
 * Features:
 * - Search form with phone or email input
 * - Display list of bookings with status badges
 * - Show upcoming bookings separately from past bookings
 * - View QR code in a dialog
 * - Cancel booking with confirmation dialog
 * - Disable cancel button if within 2-hour window
 * - Handle empty state when no bookings found
 */

// Search form validation schema
const searchSchema = z.object({
  identifier: z.string().min(1, "Please enter a phone number or email address"),
});

type SearchFormData = z.infer<typeof searchSchema>;

export default function MyBookingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [qrLoading, setQrLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = session?.user?.userType === "pilgrim";

  // Initialize search form
  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      identifier: "",
    },
  });

  // Auto-fetch bookings for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      fetchAuthenticatedUserBookings();
    }
  }, [isAuthenticated]);

  /**
   * Fetch bookings for authenticated user
   * Requirements: 1.1, 3.5
   */
  const fetchAuthenticatedUserBookings = async () => {
    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch("/api/bookings/my-bookings");

      if (!response.ok) {
        const errorData: APIError = await response.json();
        throw new Error(errorData.message || "Failed to fetch bookings");
      }

      const responseData: GetBookingsResponse = await response.json();
      setBookings(responseData.bookings);

      if (responseData.bookings.length === 0) {
        toast.info("You don't have any bookings yet.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch bookings";
      toast.error(errorMessage);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle search form submission
   * Requirements: 5.3, 5.4
   */
  const onSearch = async (data: SearchFormData) => {
    setLoading(true);
    setSearched(true);

    try {
      // Determine if identifier is phone or email
      const isEmail = data.identifier.includes("@");
      const queryParam = isEmail ? `email=${encodeURIComponent(data.identifier)}` : `phone=${encodeURIComponent(data.identifier)}`;

      // Fetch bookings from API
      const response = await fetch(`/api/bookings?${queryParam}`);

      if (!response.ok) {
        const errorData: APIError = await response.json();
        throw new Error(errorData.message || "Failed to fetch bookings");
      }

      const responseData: GetBookingsResponse = await response.json();
      setBookings(responseData.bookings);

      if (responseData.bookings.length === 0) {
        toast.info("No bookings found for this phone number or email.");
      } else {
        toast.success(`Found ${responseData.bookings.length} booking(s)`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch bookings";
      toast.error(errorMessage);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle view QR code
   * Requirements: 5.4
   */
  const handleViewQR = async (booking: Booking) => {
    setSelectedBooking(booking);
    setQrDialogOpen(true);
    setQrLoading(true);

    try {
      // Fetch booking details with QR code
      const response = await fetch(`/api/bookings/${booking.id}`);

      if (!response.ok) {
        const errorData: APIError = await response.json();
        throw new Error(errorData.message || "Failed to fetch QR code");
      }

      const data = await response.json();
      setQrCodeData(data.qrCodeData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load QR code";
      toast.error(errorMessage);
      setQrDialogOpen(false);
    } finally {
      setQrLoading(false);
    }
  };

  /**
   * Handle cancel booking button click
   * Requirements: 5.5, 5.6
   */
  const handleCancelClick = (booking: Booking) => {
    setBookingToCancel(booking);
    setCancelDialogOpen(true);
  };

  /**
   * Confirm booking cancellation
   * Requirements: 5.5, 5.6
   */
  const confirmCancellation = async () => {
    if (!bookingToCancel) return;

    setCancelling(true);

    try {
      // Send DELETE request to cancel booking
      const response = await fetch(`/api/bookings/${bookingToCancel.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData: APIError = await response.json();
        throw new Error(errorData.message || "Failed to cancel booking");
      }

      // Update bookings list
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingToCancel.id ? { ...b, status: "cancelled" } : b
        )
      );

      toast.success("Booking cancelled successfully");
      setCancelDialogOpen(false);
      setBookingToCancel(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to cancel booking";
      toast.error(errorMessage);
    } finally {
      setCancelling(false);
    }
  };

  /**
   * Check if booking can be cancelled
   * Requirements: 5.6
   */
  const canCancelBooking = (booking: Booking): boolean => {
    if (booking.status !== "confirmed") return false;
    if (!booking.slot) return false;

    // Parse slot date and time
    const slotDate = parseISO(booking.slot.date);
    const [hours, minutes] = booking.slot.startTime.split(":").map(Number);
    slotDate.setHours(hours, minutes, 0, 0);

    // Check if more than 2 hours before slot time
    const hoursUntilSlot = differenceInHours(slotDate, new Date());
    return hoursUntilSlot >= 2;
  };

  /**
   * Get time remaining until slot
   */
  const getTimeUntilSlot = (booking: Booking): string => {
    if (!booking.slot) return "";

    const slotDate = parseISO(booking.slot.date);
    const [hours, minutes] = booking.slot.startTime.split(":").map(Number);
    slotDate.setHours(hours, minutes, 0, 0);

    const hoursUntil = differenceInHours(slotDate, new Date());
    
    if (hoursUntil < 0) return "Past";
    if (hoursUntil < 2) return `${hoursUntil}h remaining (cannot cancel)`;
    return `${hoursUntil}h remaining`;
  };

  /**
   * Separate bookings into upcoming and past
   */
  const upcomingBookings = bookings.filter((booking) => {
    if (!booking.slot) return false;
    const slotDate = parseISO(booking.slot.date);
    const [hours, minutes] = booking.slot.startTime.split(":").map(Number);
    slotDate.setHours(hours, minutes, 0, 0);
    return !isPast(slotDate) && booking.status !== "cancelled";
  });

  const pastBookings = bookings.filter((booking) => {
    if (!booking.slot) return true;
    const slotDate = parseISO(booking.slot.date);
    const [hours, minutes] = booking.slot.startTime.split(":").map(Number);
    slotDate.setHours(hours, minutes, 0, 0);
    return isPast(slotDate) || booking.status === "cancelled";
  });

  /**
   * Get status badge configuration
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return {
          variant: "default" as const,
          label: "Confirmed",
          icon: CheckCircle2,
          className: "bg-green-500 hover:bg-green-600",
        };
      case "checked-in":
        return {
          variant: "secondary" as const,
          label: "Checked In",
          icon: CheckCircle2,
          className: "bg-blue-500 hover:bg-blue-600 text-white",
        };
      case "cancelled":
        return {
          variant: "outline" as const,
          label: "Cancelled",
          icon: XCircle,
          className: "bg-red-100 text-red-700 border-red-300",
        };
      default:
        return {
          variant: "outline" as const,
          label: status,
          icon: AlertCircle,
          className: "",
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/darshan")}
          className="mb-4"
        >
          <ArrowLeft className="size-4" />
          Back to Booking
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            My Bookings
          </h1>
          <p className="text-gray-600">
            View and manage your darshan bookings
          </p>
        </div>

        {/* Search Form - Only show for guest users */}
        {!isAuthenticated && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="size-5" />
                Find Your Bookings
              </CardTitle>
              <CardDescription>
                Enter your phone number or email address to retrieve your bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSearch)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number or Email</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter phone number or email"
                              {...field}
                              disabled={loading}
                              className="flex-1"
                            />
                            <Button type="submit" disabled={loading}>
                              {loading ? (
                                <>
                                  <Loader2 className="size-4 animate-spin" />
                                  Searching...
                                </>
                              ) : (
                                <>
                                  <Search className="size-4" />
                                  Search
                                </>
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Authenticated User Info */}
        {isAuthenticated && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-sm text-gray-700">
                Showing bookings for <strong>{session?.user?.email}</strong>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && <BookingsListSkeleton />}

        {/* Empty State */}
        {!loading && searched && bookings.length === 0 && (
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Search className="size-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Bookings Found
              </h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any bookings for this phone number or email address.
              </p>
              <Button onClick={() => router.push("/darshan")} variant="default">
                Book a Slot
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Bookings List */}
        {!loading && bookings.length > 0 && (
          <div className="space-y-8">
            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Upcoming Bookings ({upcomingBookings.length})
                </h2>
                <div className="grid gap-4">
                  {upcomingBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onViewQR={handleViewQR}
                      onCancel={handleCancelClick}
                      canCancel={canCancelBooking(booking)}
                      timeUntilSlot={getTimeUntilSlot(booking)}
                      getStatusBadge={getStatusBadge}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Past Bookings ({pastBookings.length})
                </h2>
                <div className="grid gap-4">
                  {pastBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onViewQR={handleViewQR}
                      onCancel={handleCancelClick}
                      canCancel={false}
                      timeUntilSlot={getTimeUntilSlot(booking)}
                      getStatusBadge={getStatusBadge}
                      isPast
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* QR Code Dialog */}
        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="size-5" />
                Your Entry Pass
              </DialogTitle>
              <DialogDescription>
                Show this QR code at the temple entrance
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center py-6">
              {qrLoading ? (
                <Skeleton className="w-64 h-64" />
              ) : qrCodeData ? (
                <>
                  <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
                    <img
                      src={qrCodeData}
                      alt="Booking QR Code"
                      className="w-64 h-64"
                    />
                  </div>
                  {selectedBooking && (
                    <div className="text-center space-y-1">
                      <p className="font-semibold text-gray-900">
                        {selectedBooking.name}
                      </p>
                      {selectedBooking.slot && (
                        <>
                          <p className="text-sm text-gray-600">
                            {format(parseISO(selectedBooking.slot.date), "MMM d, yyyy")}
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedBooking.slot.startTime} - {selectedBooking.slot.endTime}
                          </p>
                        </>
                      )}
                      <p className="text-xs text-gray-500 font-mono">
                        ID: {selectedBooking.id.slice(0, 8)}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-red-500">Failed to load QR code</p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setQrDialogOpen(false)}
                className="w-full"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Confirmation Dialog */}
        <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div>
                  <p className="mb-2">Are you sure you want to cancel this booking? This action cannot be undone.</p>
                  {bookingToCancel && bookingToCancel.slot && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md space-y-1">
                      <p className="font-semibold text-gray-900">
                        {bookingToCancel.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(parseISO(bookingToCancel.slot.date), "EEEE, MMMM d, yyyy")}
                      </p>
                      <p className="text-sm text-gray-600">
                        {bookingToCancel.slot.startTime} - {bookingToCancel.slot.endTime}
                      </p>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={cancelling}>
                Keep Booking
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmCancellation}
                disabled={cancelling}
                className="bg-red-500 hover:bg-red-600"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Booking"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

/**
 * Booking Card Component
 */
interface BookingCardProps {
  booking: Booking;
  onViewQR: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  canCancel: boolean;
  timeUntilSlot: string;
  getStatusBadge: (status: string) => {
    variant: "default" | "secondary" | "outline";
    label: string;
    icon: any;
    className: string;
  };
  isPast?: boolean;
}

function BookingCard({
  booking,
  onViewQR,
  onCancel,
  canCancel,
  timeUntilSlot,
  getStatusBadge,
  isPast = false,
}: BookingCardProps) {
  const statusBadge = getStatusBadge(booking.status);
  const StatusIcon = statusBadge.icon;

  return (
    <Card className={`transition-all hover:shadow-md ${isPast ? "opacity-75" : ""}`}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* Booking Details */}
          <div className="flex-1 space-y-3">
            {/* Header with Name and Status */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {booking.name}
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  ID: {booking.id.slice(0, 8)}
                </p>
              </div>
              <Badge variant={statusBadge.variant} className={statusBadge.className}>
                <StatusIcon className="size-3 mr-1" />
                {statusBadge.label}
              </Badge>
            </div>

            <Separator />

            {/* Slot Details */}
            {booking.slot && (
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-primary flex-shrink-0" />
                  <span className="text-gray-700">
                    {format(parseISO(booking.slot.date), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="size-4 text-primary flex-shrink-0" />
                  <span className="text-gray-700">
                    {booking.slot.startTime} - {booking.slot.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="size-4 text-primary flex-shrink-0" />
                  <span className="text-gray-700">
                    {booking.numberOfPeople} {booking.numberOfPeople === 1 ? "Person" : "People"}
                  </span>
                </div>
                {!isPast && booking.status === "confirmed" && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="size-4 text-orange-500 flex-shrink-0" />
                    <span className="text-gray-700">{timeUntilSlot}</span>
                  </div>
                )}
              </div>
            )}

            {/* Contact Info */}
            <div className="grid sm:grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Phone className="size-3" />
                <span>{booking.phone}</span>
              </div>
              <div className="flex items-center gap-1 truncate">
                <Mail className="size-3 flex-shrink-0" />
                <span className="truncate">{booking.email}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex sm:flex-col gap-2">
            <Button
              onClick={() => onViewQR(booking)}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <QrCode className="size-4" />
              View QR
            </Button>
            {booking.status === "confirmed" && (
              <Button
                onClick={() => onCancel(booking)}
                variant="outline"
                size="sm"
                disabled={!canCancel}
                className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="size-4" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for bookings list
 */
function BookingsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
                <Separator />
                <div className="grid sm:grid-cols-2 gap-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
              <div className="flex sm:flex-col gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
