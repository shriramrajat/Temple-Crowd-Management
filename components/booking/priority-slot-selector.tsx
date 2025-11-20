'use client';

import { useState } from 'react';
import { PrioritySlot } from '@/lib/types/priority-slots';
import { AccessibilityProfile } from '@/lib/types/accessibility';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AccessibilityBadges } from '@/components/accessibility/badges';
import { Clock, MapPin, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrioritySlotSelectorProps {
  slots: PrioritySlot[];
  profile: AccessibilityProfile;
  onSelectSlot: (slot: PrioritySlot) => void;
  selectedSlotId?: string;
  className?: string;
}

/**
 * Priority Slot Selector Component
 * 
 * Displays available priority slots with visual indicators for:
 * - Priority eligibility
 * - Real-time capacity
 * - Wait time information
 * - Accessibility category badges
 */
export function PrioritySlotSelector({
  slots,
  profile,
  onSelectSlot,
  selectedSlotId,
  className,
}: PrioritySlotSelectorProps) {
  const [hoveredSlotId, setHoveredSlotId] = useState<string | null>(null);

  if (slots.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            No priority slots available
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Please check back later or contact support for assistance
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)} role="region" aria-label="Priority slot selection">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Available Priority Slots</h2>
          <p className="text-sm text-muted-foreground" id="slot-selector-description">
            Select a time slot that works best for you
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200" aria-live="polite">
          {slots.length} slot{slots.length !== 1 ? 's' : ''} available
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" role="list" aria-labelledby="slot-selector-description">
        {slots.map((slot) => {
          const isSelected = selectedSlotId === slot.id;
          const isHovered = hoveredSlotId === slot.id;
          const capacityPercentage = (slot.reserved / slot.capacity) * 100;
          const isPriorityEligible = slot.accessibilityCategories.some(cat =>
            profile.categories.includes(cat)
          );

          return (
            <Card
              key={slot.id}
              className={cn(
                'relative cursor-pointer transition-all duration-200',
                'hover:shadow-lg hover:scale-[1.02]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isSelected && 'ring-2 ring-primary shadow-lg',
                slot.status === 'filling' && 'border-orange-300',
                slot.status === 'full' && 'opacity-60 cursor-not-allowed'
              )}
              onMouseEnter={() => setHoveredSlotId(slot.id)}
              onMouseLeave={() => setHoveredSlotId(null)}
              onClick={() => slot.status !== 'full' && onSelectSlot(slot)}
              role="listitem"
              tabIndex={slot.status === 'full' ? -1 : 0}
              aria-label={`${slot.status === 'full' ? 'Full slot' : 'Available slot'} at ${formatTime(slot.slotTime)}, ${slot.location}, ${slot.available} of ${slot.capacity} spots available, estimated wait time ${calculateEstimatedWaitTime(slot)} minutes${isPriorityEligible ? ', priority eligible' : ''}`}
              aria-pressed={isSelected}
              aria-disabled={slot.status === 'full'}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && slot.status !== 'full') {
                  e.preventDefault();
                  onSelectSlot(slot);
                }
              }}
            >
              {/* Priority Badge */}
              {isPriorityEligible && (
                <div className="absolute -top-2 -right-2 z-10">
                  <Badge className="bg-green-600 text-white shadow-md" aria-label="Priority eligible slot">
                    <CheckCircle2 className="w-3 h-3 mr-1" aria-hidden="true" />
                    <span>Priority</span>
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold">
                      {formatTime(slot.slotTime)}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {slot.duration} minutes
                    </CardDescription>
                  </div>
                  <SlotStatusBadge status={slot.status} />
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Location */}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{slot.location}</span>
                </div>

                {/* Capacity Information */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Capacity</span>
                    </div>
                    <span className="font-medium">
                      {slot.available} / {slot.capacity} available
                    </span>
                  </div>

                  {/* Capacity Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all duration-300',
                        capacityPercentage < 50 && 'bg-green-500',
                        capacityPercentage >= 50 && capacityPercentage < 80 && 'bg-yellow-500',
                        capacityPercentage >= 80 && 'bg-orange-500'
                      )}
                      style={{ width: `${capacityPercentage}%` }}
                      role="progressbar"
                      aria-valuenow={capacityPercentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${capacityPercentage.toFixed(0)}% capacity used`}
                    />
                  </div>
                </div>

                {/* Wait Time */}
                {(isHovered || isSelected) && (
                  <div className="flex items-center justify-between text-sm p-2 bg-blue-50 rounded-md">
                    <span className="text-blue-700 font-medium">Estimated wait time</span>
                    <span className="text-blue-900 font-semibold">
                      ~{calculateEstimatedWaitTime(slot)} min
                    </span>
                  </div>
                )}

                {/* Accessibility Categories */}
                <div className="pt-2 border-t">
                  <AccessibilityBadges
                    categories={slot.accessibilityCategories}
                    variant="outline"
                  />
                </div>

                {/* Select Button */}
                {(isHovered || isSelected) && slot.status !== 'full' && (
                  <Button
                    className="w-full mt-2"
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    aria-hidden="true"
                    tabIndex={-1}
                  >
                    {isSelected ? 'Selected' : 'Select This Slot'}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Slot Status Badge Component
 */
function SlotStatusBadge({ status }: { status: PrioritySlot['status'] }) {
  const config = {
    available: {
      label: 'Available',
      className: 'bg-green-100 text-green-800 border-green-300',
    },
    filling: {
      label: 'Filling Fast',
      className: 'bg-orange-100 text-orange-800 border-orange-300',
    },
    full: {
      label: 'Full',
      className: 'bg-red-100 text-red-800 border-red-300',
    },
  };

  const { label, className } = config[status];

  return (
    <Badge variant="outline" className={cn('text-xs', className)}>
      {label}
    </Badge>
  );
}

/**
 * Format time for display
 */
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Calculate estimated wait time based on slot capacity
 */
function calculateEstimatedWaitTime(slot: PrioritySlot): number {
  const hour = slot.slotTime.getHours();
  const isPeakHour = (hour >= 8 && hour < 10) || (hour >= 17 && hour < 19);
  
  const utilizationRate = slot.reserved / slot.capacity;
  let baseWaitTime = 10;
  
  if (isPeakHour) {
    baseWaitTime = 15;
  }
  
  const waitTime = Math.round(baseWaitTime + (utilizationRate * 15));
  return Math.min(waitTime, 30);
}
