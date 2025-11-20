'use client';

import { SlotAllocation } from '@/lib/types/priority-slots';
import { AccessibilityBadges } from '@/components/accessibility/badges';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  Clock,
  MapPin,
  QrCode,
  Bell,
  Phone,
  Calendar,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlotConfirmationProps {
  allocation: SlotAllocation;
  slotTime: Date;
  slotLocation: string;
  open: boolean;
  onClose: () => void;
  className?: string;
}

/**
 * Slot Confirmation Dialog Component
 * 
 * Displays booking confirmation with:
 * - QR code for check-in
 * - Reminder schedule
 * - Accessibility accommodations
 * - Emergency contact information
 */
export function SlotConfirmation({
  allocation,
  slotTime,
  slotLocation,
  open,
  onClose,
  className,
}: SlotConfirmationProps) {
  const handleDownloadQR = () => {
    // In production, this would generate and download an actual QR code image
    console.log('Downloading QR code:', allocation.qrCode);
    alert('QR code download functionality would be implemented here');
  };

  const handleAddToCalendar = () => {
    // In production, this would create a calendar event
    console.log('Adding to calendar:', slotTime);
    alert('Calendar integration would be implemented here');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn('max-w-2xl max-h-[90vh] overflow-y-auto', className)} aria-labelledby="confirmation-title" aria-describedby="confirmation-description">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100" aria-hidden="true">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <DialogTitle id="confirmation-title" className="text-2xl">Booking Confirmed!</DialogTitle>
              <DialogDescription id="confirmation-description">
                Your priority darshan slot has been successfully reserved
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4" role="document">
          {/* Booking Details */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-semibold text-lg">
                      {formatDateTime(slotTime)}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-600 text-white" aria-label="Priority slot booking">Priority Slot</Badge>
              </div>

              <Separator aria-hidden="true" />

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{slotLocation}</p>
                </div>
              </div>

              <Separator aria-hidden="true" />

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Wait Time</p>
                  <p className="font-medium">~{allocation.estimatedWaitTime} minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                  <h3 className="font-semibold">Your Check-in QR Code</h3>
                </div>
                
                {/* QR Code Placeholder */}
                <div 
                  className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
                  role="img"
                  aria-label={`QR code for booking ID ${allocation.allocationId.slice(0, 8)}`}
                >
                  <div className="text-center">
                    <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-2" aria-hidden="true" />
                    <p className="text-xs text-gray-500">QR Code</p>
                    <p className="text-xs text-gray-400 mt-1">
                      ID: {allocation.allocationId.slice(0, 8)}...
                    </p>
                  </div>
                </div>

                <p className="text-sm text-center text-muted-foreground max-w-md">
                  Show this QR code at the entrance for quick check-in. You can also download it for offline access.
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadQR}
                  className="w-full max-w-xs"
                  aria-label="Download QR code for offline access"
                >
                  <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                  Download QR Code
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Accessibility Accommodations */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" aria-hidden="true" />
                <span>Your Accessibility Accommodations</span>
              </h3>
              
              <AccessibilityBadges
                categories={allocation.accessibilityProfile.categories}
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2" role="region" aria-label="Special accommodations">
                <p className="text-sm font-medium text-blue-900">
                  Special Accommodations Available:
                </p>
                <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                  {allocation.accessibilityProfile.categories.includes('wheelchair-user') && (
                    <li>Wheelchair-accessible entrance and pathways</li>
                  )}
                  {allocation.accessibilityProfile.categories.includes('elderly') && (
                    <li>Priority seating and assistance available</li>
                  )}
                  {allocation.accessibilityProfile.categories.includes('differently-abled') && (
                    <li>Dedicated assistance staff on-site</li>
                  )}
                  {allocation.accessibilityProfile.categories.includes('women-only-route') && (
                    <li>Access to women-only waiting area</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Reminder Schedule */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" aria-hidden="true" />
                <span>Reminder Schedule</span>
              </h3>

              <ul className="space-y-3" aria-label="Notification reminders">
                <li className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold" aria-hidden="true">
                    30
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">30 minutes before</p>
                    <p className="text-xs text-muted-foreground">
                      We'll send you a reminder to start preparing
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold" aria-hidden="true">
                    10
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">10 minutes before</p>
                    <p className="text-xs text-muted-foreground">
                      Final reminder to head to the location
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          {allocation.accessibilityProfile.emergencyContact && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3" role="region" aria-label="Emergency contact information">
                  <Phone className="w-5 h-5 text-orange-600 mt-0.5" aria-hidden="true" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900 mb-2">
                      Emergency Contact on File
                    </h3>
                    <dl className="space-y-1 text-sm">
                      <div className="text-orange-800">
                        <dt className="font-medium inline">Name:</dt>{' '}
                        <dd className="inline">{allocation.accessibilityProfile.emergencyContact.name}</dd>
                      </div>
                      <div className="text-orange-800">
                        <dt className="font-medium inline">Phone:</dt>{' '}
                        <dd className="inline">{allocation.accessibilityProfile.emergencyContact.phone}</dd>
                      </div>
                      <div className="text-orange-800">
                        <dt className="font-medium inline">Relationship:</dt>{' '}
                        <dd className="inline">{allocation.accessibilityProfile.emergencyContact.relationship}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4" role="group" aria-label="Confirmation actions">
            <Button
              variant="outline"
              onClick={handleAddToCalendar}
              className="flex-1"
              aria-label="Add booking to calendar"
            >
              <Calendar className="w-4 h-4 mr-2" aria-hidden="true" />
              Add to Calendar
            </Button>
            <Button onClick={onClose} className="flex-1" aria-label="Close confirmation dialog">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Format date and time for display
 */
function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}
