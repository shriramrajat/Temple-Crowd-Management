"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { format } from "date-fns";
import type { VerifyQRResponse, APIError, Booking } from "@/lib/types/api";
import {
  CheckCircle2,
  XCircle,
  Camera,
  CameraOff,
  Scan,
  Users,
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  KeyboardIcon,
} from "lucide-react";

/**
 * QR Scanner Page for Staff
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 * 
 * Features:
 * - Camera-based QR code scanner
 * - Booking validation display
 * - Check-in confirmation
 * - Error handling for invalid/used codes
 * - Manual QR code input option as fallback
 */
export default function QRScannerPage() {
  const [scannerActive, setScannerActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<VerifyQRResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualInput, setManualInput] = useState("");
  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerIdRef = useRef("qr-reader");

  /**
   * Initialize QR code scanner
   * Requirements: 6.1
   */
  const startScanner = async () => {
    try {
      setError(null);
      
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream

      // Initialize Html5Qrcode
      const html5QrCode = new Html5Qrcode(scannerIdRef.current);
      html5QrCodeRef.current = html5QrCode;

      // Start scanning
      await html5QrCode.start(
        { facingMode: "environment" }, // Use back camera on mobile
        {
          fps: 10, // Frames per second
          qrbox: { width: 250, height: 250 }, // Scanning box size
        },
        onScanSuccess,
        onScanFailure
      );

      setScannerActive(true);
      setScanning(true);
      toast.success("Camera started successfully");
    } catch (err) {
      console.error("Error starting scanner:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to start camera";
      setError(errorMessage);
      toast.error("Camera access denied. Please use manual input mode.");
    }
  };

  /**
   * Stop QR code scanner
   */
  const stopScanner = async () => {
    try {
      if (html5QrCodeRef.current && scannerActive) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      }
      setScannerActive(false);
      setScanning(false);
    } catch (err) {
      console.error("Error stopping scanner:", err);
    }
  };

  /**
   * Handle successful QR code scan
   * Requirements: 6.1, 6.2
   */
  const onScanSuccess = async (decodedText: string) => {
    if (verifying) return; // Prevent multiple simultaneous verifications

    setScanning(false);
    await verifyQRCode(decodedText);
  };

  /**
   * Handle scan failure (not an error, just no QR detected)
   */
  const onScanFailure = (errorMessage: string) => {
    // Ignore scan failures - they happen continuously when no QR is detected
    // Only log actual errors
    if (!errorMessage.includes("NotFoundException")) {
      console.debug("Scan error:", errorMessage);
    }
  };

  /**
   * Verify QR code with backend API
   * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
   */
  const verifyQRCode = async (qrData: string) => {
    setVerifying(true);
    setError(null);
    setLastScanResult(null);

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qrData }),
      });

      const data: VerifyQRResponse | APIError = await response.json();

      if (!response.ok) {
        // Handle error response
        const apiError = data as APIError;
        setError(apiError.message);
        setLastScanResult({
          valid: false,
          message: apiError.message,
          error: apiError.error,
        });
        toast.error(apiError.message);
      } else {
        // Handle success response
        const verifyResponse = data as VerifyQRResponse;
        setLastScanResult(verifyResponse);
        
        if (verifyResponse.valid) {
          toast.success("Entry granted! Booking verified successfully.");
        } else {
          toast.error(verifyResponse.message);
        }
      }
    } catch (err) {
      console.error("Error verifying QR code:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to verify QR code";
      setError(errorMessage);
      setLastScanResult({
        valid: false,
        message: errorMessage,
        error: "Network Error",
      });
      toast.error(errorMessage);
    } finally {
      setVerifying(false);
      
      // Resume scanning after 3 seconds
      setTimeout(() => {
        if (scannerActive) {
          setScanning(true);
        }
      }, 3000);
    }
  };

  /**
   * Handle manual QR code input
   * Requirements: 6.1, 6.2
   */
  const handleManualVerify = async () => {
    if (!manualInput.trim()) {
      toast.error("Please enter QR code data");
      return;
    }

    await verifyQRCode(manualInput.trim());
    setManualInput("");
  };

  /**
   * Toggle between camera and manual mode
   */
  const toggleMode = async () => {
    if (manualMode) {
      // Switching to camera mode
      setManualMode(false);
      setLastScanResult(null);
      setError(null);
    } else {
      // Switching to manual mode
      await stopScanner();
      setManualMode(true);
      setLastScanResult(null);
      setError(null);
    }
  };

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-3 sm:mb-4">
            <Scan className="size-6 sm:size-8 text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            QR Code Scanner
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Scan visitor QR codes for entry verification
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <Button
            onClick={toggleMode}
            variant="outline"
            size="lg"
            className="gap-2 h-11 sm:h-10 text-base sm:text-sm touch-manipulation"
          >
            {manualMode ? (
              <>
                <Camera className="size-4" />
                Switch to Camera Mode
              </>
            ) : (
              <>
                <KeyboardIcon className="size-4" />
                Switch to Manual Input
              </>
            )}
          </Button>
        </div>

        {/* Scanner Card */}
        {!manualMode && (
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Camera className="size-4 sm:size-5" />
                Camera Scanner
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Point your camera at the visitor's QR code
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Scanner Container - Optimized for mobile */}
              <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4 touch-none">
                <div
                  id={scannerIdRef.current}
                  className="w-full min-h-[300px] sm:min-h-[400px]"
                />
                
                {/* Overlay when not scanning */}
                {!scannerActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 p-4">
                    <div className="text-center text-white">
                      <CameraOff className="size-12 sm:size-16 mx-auto mb-3 sm:mb-4 opacity-50" />
                      <p className="text-base sm:text-lg mb-3 sm:mb-4">Camera is off</p>
                      <Button
                        onClick={startScanner}
                        size="lg"
                        variant="secondary"
                        className="h-11 sm:h-10 text-base sm:text-sm touch-manipulation"
                      >
                        <Camera className="size-4" />
                        Start Camera
                      </Button>
                    </div>
                  </div>
                )}

                {/* Scanning indicator */}
                {scanning && (
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4">
                    <Alert className="bg-blue-500/90 border-blue-400 text-white">
                      <Scan className="size-3 sm:size-4" />
                      <AlertDescription className="text-xs sm:text-sm">
                        Scanning... Position QR code within the frame
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Verifying indicator */}
                {verifying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 p-4">
                    <div className="text-center text-white">
                      <Loader2 className="size-12 sm:size-16 mx-auto mb-3 sm:mb-4 animate-spin" />
                      <p className="text-base sm:text-lg">Verifying QR code...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Scanner Controls */}
              {scannerActive && (
                <div className="flex justify-center">
                  <Button
                    onClick={stopScanner}
                    variant="destructive"
                    size="lg"
                    className="h-11 sm:h-10 text-base sm:text-sm touch-manipulation"
                  >
                    <CameraOff className="size-4" />
                    Stop Camera
                  </Button>
                </div>
              )}

              {/* Error Alert */}
              {error && !lastScanResult && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Manual Input Card */}
        {manualMode && (
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <KeyboardIcon className="size-4 sm:size-5" />
                Manual Input
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Enter the QR code data manually
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="manual-input" className="text-sm sm:text-base">QR Code Data</Label>
                  <Input
                    id="manual-input"
                    type="text"
                    placeholder="Paste or type QR code data here"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleManualVerify();
                      }
                    }}
                    disabled={verifying}
                    className="font-mono text-sm sm:text-base mt-2"
                  />
                </div>
                <Button
                  onClick={handleManualVerify}
                  disabled={verifying || !manualInput.trim()}
                  size="lg"
                  className="w-full h-11 sm:h-10 text-base sm:text-sm touch-manipulation"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Scan className="size-4" />
                      Verify QR Code
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verification Result */}
        {lastScanResult && (
          <Card
            className={
              lastScanResult.valid
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }
          >
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 ${
                  lastScanResult.valid ? "text-green-900" : "text-red-900"
                }`}
              >
                {lastScanResult.valid ? (
                  <>
                    <CheckCircle2 className="size-6" />
                    Entry Granted
                  </>
                ) : (
                  <>
                    <XCircle className="size-6" />
                    Entry Denied
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Success: Show booking details */}
              {/* Requirements: 6.2, 6.6 */}
              {lastScanResult.valid && lastScanResult.booking && (
                <div className="space-y-4">
                  <Alert className="bg-green-100 border-green-300">
                    <CheckCircle2 className="size-4 text-green-700" />
                    <AlertDescription className="text-green-900">
                      {lastScanResult.message}
                    </AlertDescription>
                  </Alert>

                  <Separator />

                  <div className="space-y-3">
                    {/* Name */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="size-5 text-green-700" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-green-700">Visitor Name</p>
                        <p className="text-xl font-bold text-green-900">
                          {lastScanResult.booking.name}
                        </p>
                      </div>
                    </div>

                    {/* Time Slot */}
                    {lastScanResult.booking.slot && (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Clock className="size-5 text-green-700" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-green-700">Time Slot</p>
                            <p className="text-lg font-semibold text-green-900">
                              {lastScanResult.booking.slot.startTime} -{" "}
                              {lastScanResult.booking.slot.endTime}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Calendar className="size-5 text-green-700" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-green-700">Date</p>
                            <p className="text-lg font-semibold text-green-900">
                              {format(
                                new Date(lastScanResult.booking.slot.date),
                                "EEEE, MMMM d, yyyy"
                              )}
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Number of People */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="size-5 text-green-700" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-green-700">Number of People</p>
                        <p className="text-lg font-semibold text-green-900">
                          {lastScanResult.booking.numberOfPeople}{" "}
                          {lastScanResult.booking.numberOfPeople === 1
                            ? "Person"
                            : "People"}
                        </p>
                      </div>
                    </div>

                    {/* Booking ID */}
                    <div className="pt-2">
                      <p className="text-sm text-green-700">Booking ID</p>
                      <p className="font-mono text-sm text-green-900 bg-green-100 px-3 py-2 rounded">
                        {lastScanResult.booking.id}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="pt-2">
                      <Badge className="bg-green-600 text-white">
                        Checked In
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Error: Show error message */}
              {/* Requirements: 6.3, 6.4, 6.5 */}
              {!lastScanResult.valid && (
                <Alert variant="destructive">
                  <XCircle className="size-4" />
                  <AlertDescription className="text-lg">
                    {lastScanResult.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions Card */}
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-blue-900">
            <p>• <strong>Camera Mode:</strong> Point the camera at the visitor's QR code</p>
            <p>• <strong>Manual Mode:</strong> Enter or paste the QR code data</p>
            <p>• <strong>Green Result:</strong> Entry granted - allow visitor to proceed</p>
            <p>• <strong>Red Result:</strong> Entry denied - check the error message</p>
            <p>• The scanner will automatically resume after each verification</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
