"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Calendar, Clock, Users, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  isActive: boolean;
  isAvailable: boolean;
  crowdLevel: string;
}

/**
 * Darshan Slot Selection Page
 * Allows users to select a slot for darshan booking
 */
export default function DarshanPage() {
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Load available slots
  useEffect(() => {
    async function loadSlots() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/slots?date=${selectedDate}`);
        
        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error("Non-JSON response from /api/slots:", text);
          setError("Failed to load slots. Please try again.");
          setIsLoading(false);
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load slots");
          setIsLoading(false);
          return;
        }

        setSlots(data.slots || []);
      } catch (err) {
        console.error("Failed to fetch slots:", err);
        setError("Failed to load slots. Please check your connection and try again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadSlots();
  }, [selectedDate]);

  // Handle slot selection
  const handleSlotSelect = (slot: Slot) => {
    const slotDate = slot.date || selectedDate;
    router.push(
      `/darshan/book?slotId=${slot.id}&date=${slotDate}&startTime=${slot.startTime}&endTime=${slot.endTime}`
    );
  };

  // Get crowd level based on booking percentage
  const getCrowdLevel = (slot: Slot): "low" | "medium" | "high" => {
    const percentage = (slot.bookedCount / slot.capacity) * 100;
    if (percentage < 50) return "low";
    if (percentage < 80) return "medium";
    return "high";
  };

  const getCrowdColor = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
    }
  };

  const formattedDate = format(new Date(selectedDate), "EEEE, MMMM d, yyyy");

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Book Your Darshan Slot
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Select an available time slot for your temple visit
          </p>
        </div>

        {/* Date Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5 text-primary" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-2 text-sm text-gray-600">
              Available slots for {formattedDate}
            </p>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="size-8 animate-spin text-primary" />
            <span className="ml-3 text-gray-600">Loading available slots...</span>
          </div>
        )}

        {/* Slots Grid */}
        {!isLoading && !error && (
          <>
            {slots.length === 0 ? (
              <Card className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Slots Available</h3>
                <p className="text-muted-foreground">
                  Please check back later for available time slots on this date.
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {slots.map((slot) => {
                  const remaining = slot.capacity - slot.bookedCount;
                  const crowd = getCrowdLevel(slot);
                  // Use the isAvailable flag from the API response
                  const isAvailable = slot.isAvailable && slot.isActive && remaining > 0;

                  return (
                    <Card
                      key={slot.id}
                      className={`p-4 sm:p-6 border-2 transition ${
                        isAvailable
                          ? "border-orange-200 cursor-pointer hover:shadow-lg hover:border-primary"
                          : "border-gray-200 opacity-60 cursor-not-allowed"
                      }`}
                      onClick={() => {
                        if (isAvailable) {
                          handleSlotSelect(slot);
                        }
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                          <Clock className="size-4 text-primary" />
                          {slot.startTime} - {slot.endTime}
                        </h3>
                        <Badge className={getCrowdColor(crowd)}>
                          {crowd === "low"
                            ? "✓ Low"
                            : crowd === "medium"
                            ? "⚠ Medium"
                            : "🔴 High"}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="size-4" />
                          <span>
                            {remaining} of {slot.capacity} spots available
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              crowd === "low"
                                ? "bg-green-500"
                                : crowd === "medium"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${(slot.bookedCount / slot.capacity) * 100}%`,
                            }}
                          />
                        </div>

                        {isAvailable ? (
                          <Button
                            className="w-full mt-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSlotSelect(slot);
                            }}
                          >
                            Select This Slot
                          </Button>
                        ) : (
                          <Button className="w-full mt-3" disabled variant="outline">
                            {remaining === 0 ? "Fully Booked" : "Not Available"}
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}