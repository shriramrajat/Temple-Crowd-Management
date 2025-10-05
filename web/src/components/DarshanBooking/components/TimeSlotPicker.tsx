import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TimeSlot, BookingError } from '@/types/booking';
import { bookingService } from '@/services/booking/bookingService';
import { formatDisplayDate, formatTime } from '@/utils/dateUtils';

export interface TimeSlotPickerProps {
  date: Date;
  selectedSlot: TimeSlot | null;
  onSlotSelect: (slot: TimeSlot) => void;
  loading?: boolean;
  error?: BookingError | null;
  className?: string;
  disabled?: boolean;
}

interface SlotDisplayInfo {
  slot: TimeSlot;
  isSelected: boolean;
  isAvailable: boolean;
  capacityText: string;
  availabilityText: string;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  date,
  selectedSlot,
  onSlotSelect,
  loading: externalLoading = false,
  error: externalError = null,
  className,
  disabled = false
}) => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState<BookingError | null>(null);

  const loading = externalLoading || internalLoading;
  const error = externalError || internalError;

  // Fetch available slots for the selected date
  const fetchSlots = useCallback(async () => {
    if (!date) return;

    setInternalLoading(true);
    setInternalError(null);

    try {
      const availableSlots = await bookingService.getAvailableSlots(date);
      setSlots(availableSlots);
    } catch (err: any) {
      console.error('Error fetching time slots:', err);
      setInternalError(err);
      setSlots([]);
    } finally {
      setInternalLoading(false);
    }
  }, [date]);

  // Fetch slots when date changes
  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Process slots for display
  const slotDisplayInfo = useMemo((): SlotDisplayInfo[] => {
    return slots.map(slot => {
      const isSelected = selectedSlot?.id === slot.id;
      const isAvailable = slot.available && slot.booked < slot.capacity;
      const remainingCapacity = slot.capacity - slot.booked;
      
      const capacityText = `${remainingCapacity}/${slot.capacity} available`;
      const availabilityText = isAvailable 
        ? remainingCapacity === 2 
          ? 'Last slot available'
          : 'Available'
        : 'Fully booked';

      return {
        slot,
        isSelected,
        isAvailable,
        capacityText,
        availabilityText
      };
    });
  }, [slots, selectedSlot]);

  // Group slots by time periods for better organization
  const groupedSlots = useMemo(() => {
    const groups = {
      morning: [] as SlotDisplayInfo[],
      afternoon: [] as SlotDisplayInfo[],
      evening: [] as SlotDisplayInfo[]
    };

    slotDisplayInfo.forEach(info => {
      const hour = parseInt(info.slot.time.split(':')[0]);
      if (hour < 12) {
        groups.morning.push(info);
      } else if (hour < 17) {
        groups.afternoon.push(info);
      } else {
        groups.evening.push(info);
      }
    });

    return groups;
  }, [slotDisplayInfo]);

  const handleSlotClick = useCallback((slot: TimeSlot) => {
    if (disabled || loading || !slot.available || slot.booked >= slot.capacity) {
      return;
    }
    onSlotSelect(slot);
  }, [disabled, loading, onSlotSelect]);

  const handleRetry = useCallback(() => {
    fetchSlots();
  }, [fetchSlots]);

  const renderSlotButton = (info: SlotDisplayInfo) => {
    const { slot, isSelected, isAvailable, capacityText, availabilityText } = info;
    
    const buttonClasses = cn(
      'w-full p-3 sm:p-4 text-left border rounded-lg transition-all duration-200 touch-manipulation',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
      'active:scale-[0.98] transition-transform duration-75',
      {
        // Available slot styling
        'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer active:bg-blue-100': 
          isAvailable && !isSelected && !disabled && !loading,
        
        // Selected slot styling
        'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-offset-1 shadow-md': 
          isSelected,
        
        // Unavailable slot styling
        'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed': 
          !isAvailable,
        
        // Disabled state
        'opacity-50 cursor-not-allowed': disabled || loading
      }
    );

    return (
      <button
        key={slot.id}
        type="button"
        className={buttonClasses}
        onClick={() => handleSlotClick(slot)}
        disabled={disabled || loading || !isAvailable}
        aria-label={`${formatTime(slot.time)} time slot, ${availabilityText}, ${capacityText}`}
        aria-pressed={isSelected}
        aria-describedby={isSelected ? 'selected-slot-info' : undefined}
        role="radio"
        aria-checked={isSelected}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                'text-base sm:text-lg font-medium',
                {
                  'text-gray-900': isAvailable || isSelected,
                  'text-gray-400': !isAvailable
                }
              )}>
                {formatTime(slot.time)}
              </span>
              {isSelected && (
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm">
              <span className={cn(
                'font-medium',
                {
                  'text-green-600': isAvailable && !isSelected,
                  'text-blue-600': isSelected,
                  'text-red-500': !isAvailable
                }
              )}>
                {availabilityText}
              </span>
              <span className={cn(
                'text-gray-500',
                {
                  'text-gray-400': !isAvailable
                }
              )}>
                {capacityText}
              </span>
            </div>
          </div>
          
          {/* Capacity indicator */}
          <div className="ml-3 sm:ml-4 flex items-center flex-shrink-0">
            <div className="flex gap-1">
              {Array.from({ length: Math.min(slot.capacity, 5) }).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'w-2 h-2 rounded-full',
                    {
                      'bg-red-400': index < slot.booked,
                      'bg-gray-200': index >= slot.booked && isAvailable,
                      'bg-gray-100': index >= slot.booked && !isAvailable
                    }
                  )}
                />
              ))}
              {slot.capacity > 5 && (
                <span className="ml-1 text-xs text-gray-400">
                  +{slot.capacity - 5}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
    );
  };

  const renderTimeGroup = (title: string, groupSlots: SlotDisplayInfo[]) => {
    if (groupSlots.length === 0) return null;

    const groupId = title.toLowerCase().replace(/[^a-z]/g, '');
    
    return (
      <div key={title} className="mb-4 sm:mb-6" role="group" aria-labelledby={`${groupId}-heading`}>
        <h3 
          id={`${groupId}-heading`}
          className="text-sm font-medium text-gray-700 mb-2 sm:mb-3 px-1"
        >
          {title}
        </h3>
        <div className="space-y-2" role="radiogroup" aria-labelledby={`${groupId}-heading`}>
          {groupSlots.map(renderSlotButton)}
        </div>
      </div>
    );
  };

  return (
    <Card 
      className={cn('w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto', className)}
      role="region"
      aria-labelledby="timeslot-heading"
    >
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <h2 
          id="timeslot-heading"
          className="text-base sm:text-lg font-semibold text-gray-900"
        >
          Select Time Slot
        </h2>
        <p className="text-sm text-gray-600 mt-1" aria-live="polite">
          {formatDisplayDate(date)}
        </p>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {loading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" text="Loading time slots..." />
          </div>
        )}

        {error && !loading && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Unable to load time slots
                </h3>
                <p className="text-sm text-red-600 mt-1">
                  {error.message}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="mt-3 text-red-600 border-red-300 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && slots.length === 0 && (
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No slots available
            </h3>
            <p className="text-gray-600 mb-4">
              There are no available time slots for {formatDisplayDate(date)}.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
            >
              Refresh
            </Button>
          </div>
        )}

        {!loading && !error && slots.length > 0 && (
          <div className="space-y-1" role="group" aria-label="Available time slots">
            {renderTimeGroup('Morning (6:00 AM - 12:00 PM)', groupedSlots.morning)}
            {renderTimeGroup('Afternoon (12:00 PM - 5:00 PM)', groupedSlots.afternoon)}
            {renderTimeGroup('Evening (5:00 PM - 8:00 PM)', groupedSlots.evening)}
          </div>
        )}

        {/* Selected slot summary */}
        {selectedSlot && !loading && (
          <div 
            className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md"
            id="selected-slot-info"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Selected Time Slot
                </p>
                <p className="text-sm text-blue-600">
                  {formatTime(selectedSlot.time)} on {formatDisplayDate(date)}
                </p>
              </div>
              <svg
                className="h-5 w-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Capacity legend */}
        {!loading && !error && slots.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-xs font-medium text-gray-700 mb-2">
              Capacity Indicator
            </h4>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                <span>Available</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};