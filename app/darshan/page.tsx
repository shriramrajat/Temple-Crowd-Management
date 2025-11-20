"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2, Calendar, Clock, Users, ArrowLeft } from "lucide-react";
import { bookingFormSchema, type BookingFormData } from "@/lib/validations/booking";
import type { CreateBookingResponse, APIError } from "@/lib/types/api";
import { format } from "date-fns";
import { useSession } from "next-auth/react";

/**
 * Booking Form Page
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 * 
 * Features:
 * - Collect user information (name, phone, email, numberOfPeople)
 * - Real-time validation with Zod schema
 * - Submit booking to API
 * - Handle loading states and errors
 * - Navigate to confirmation page on success
 */
function BookingFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();

  // Extract slot details from URL params
  const slotId = searchParams.get("slotId");
  const date = searchParams.get("date");
  const startTime = searchParams.get("startTime");
  const endTime = searchParams.get("endTime");

  // Check if user is authenticated
  const isAuthenticated = session?.user?.userType === "pilgrim";
  const user = isAuthenticated ? session.user : null;

  // Initialize form with React Hook Form and Zod validation
  // Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: user?.name || "",
      phone: "",
      email: user?.email || "",
      numberOfPeople: 1,
      slotId: slotId || "",
    },
  });

  // Redirect if slot details are missing
  useEffect(() => {
    if (!slotId || !date || !startTime || !endTime) {
      toast.error("Invalid booking request. Please select a slot first.");
      router.push("/darshan");
    }
  }, [slotId, date, startTime, endTime, router]);

  // Pre-fill form with user data if authenticated
  useEffect(() => {
    if (user) {
      form.setValue("name", user.name || "");
      form.setValue("email", user.email || "");
    }
  }, [user, form]);

  /**
   * Handle form submission
   * Requirements: 2.6, 8.4
   */
  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);

    try {
      // Submit booking to API
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server returned an invalid response. Please check the server logs.");
      }

      const responseData = await response.json();

      if (!response.ok) {
        // Handle API errors
        const error = responseData as APIError;
        
        // Display specific error messages
        if (response.status === 409) {
          // Slot full or duplicate booking
          // Requirements: 8.4 - Refresh availability after failed booking
          toast.error(error.message || "This slot is no longer available.", {
            description: "Redirecting to slot selection to view updated availability...",
            duration: 4000,
          });
          
          // Redirect back to slot selection with refresh flag
          setTimeout(() => {
            router.push(`/darshan?refresh=true&date=${date}`);
          }, 2000);
        } else if (response.status === 400) {
          // Validation errors
          toast.error(error.message || "Please check your input and try again.");
        } else {
          // Server errors
          toast.error(error.message || "Failed to create booking. Please try again.");
        }
        
        return;
      }

      // Success - navigate to confirmation page
      const bookingResponse = responseData as CreateBookingResponse;
      toast.success("Booking confirmed! Redirecting to confirmation page...");
      
      // Navigate to confirmation page with booking ID
      router.push(`/darshan/confirmation/${bookingResponse.booking.id}`);
      
    } catch (error) {
      // Handle network errors
      console.error("Error creating booking:", error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formattedDate = date ? format(new Date(date), "EEEE, MMMM d, yyyy") : "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-3 sm:mb-4 h-9 text-sm"
        >
          <ArrowLeft className="size-4" />
          Back to Slots
        </Button>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Complete Your Booking
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Fill in your details to confirm your darshan slot
          </p>
        </div>

        {/* Slot Details Card */}
        <Card className="mb-4 sm:mb-6 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Selected Slot Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
              <Calendar className="size-4 sm:size-5 text-primary flex-shrink-0" />
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
              <Clock className="size-4 sm:size-5 text-primary flex-shrink-0" />
              <span className="font-medium">
                {startTime} - {endTime}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Booking Form */}
        <Card>
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Your Information</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Please provide your details for the booking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                {/* Name Field */}
                {/* Requirements: 2.1, 2.2 */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Full Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          {...field}
                          disabled={isSubmitting || isAuthenticated}
                          className="text-base"
                        />
                      </FormControl>
                      <FormDescription className="text-xs sm:text-sm">
                        {isAuthenticated 
                          ? "Using your account name" 
                          : "Name should contain only letters and spaces (2-100 characters)"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Field */}
                {/* Requirements: 2.1, 2.2, 2.3 */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Phone Number *</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="Enter 10-digit phone number"
                          maxLength={10}
                          {...field}
                          disabled={isSubmitting}
                          className="text-base"
                        />
                      </FormControl>
                      <FormDescription className="text-xs sm:text-sm">
                        Indian phone number starting with 6-9 (10 digits)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email Field */}
                {/* Requirements: 2.1, 2.2, 2.4 */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Email Address *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          inputMode="email"
                          placeholder="Enter your email address"
                          {...field}
                          disabled={isSubmitting || isAuthenticated}
                          className="text-base"
                        />
                      </FormControl>
                      <FormDescription className="text-xs sm:text-sm">
                        {isAuthenticated 
                          ? "Using your account email" 
                          : "We'll send your booking confirmation and QR code to this email"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Number of People Field */}
                {/* Requirements: 2.1, 2.2, 2.5 */}
                <FormField
                  control={form.control}
                  name="numberOfPeople"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Number of People *</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const currentValue = field.value;
                              if (currentValue > 1) {
                                field.onChange(currentValue - 1);
                              }
                            }}
                            disabled={isSubmitting || field.value <= 1}
                            className="h-10 w-10 sm:h-11 sm:w-11 text-lg touch-manipulation"
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={10}
                            className="text-center w-16 sm:w-20 text-base sm:text-lg font-semibold"
                            {...field}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (!isNaN(value)) {
                                field.onChange(value);
                              }
                            }}
                            disabled={isSubmitting}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const currentValue = field.value;
                              if (currentValue < 10) {
                                field.onChange(currentValue + 1);
                              }
                            }}
                            disabled={isSubmitting || field.value >= 10}
                            className="h-10 w-10 sm:h-11 sm:w-11 text-lg touch-manipulation"
                          >
                            +
                          </Button>
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                            <Users className="size-3 sm:size-4" />
                            <span>{field.value} {field.value === 1 ? "person" : "people"}</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs sm:text-sm">
                        Maximum 10 people allowed per booking
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Hidden Slot ID Field */}
                <input type="hidden" {...form.register("slotId")} />

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                    className="flex-1 h-11 sm:h-10 text-base sm:text-sm touch-manipulation"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-11 sm:h-10 text-base sm:text-sm touch-manipulation"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Confirm Booking"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Information Notice */}
        <Card className="mt-4 sm:mt-6 border-blue-200 bg-blue-50">
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-blue-900">
              <strong>Note:</strong> After booking, you'll receive a QR code via email. 
              Please present this QR code at the temple entrance for quick check-in.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


export default function BookingFormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-orange-50 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    }>
      <BookingFormContent />
    </Suspense>
  );
}
