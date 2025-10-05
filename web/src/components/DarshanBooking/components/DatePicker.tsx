import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useFocusManagement } from '../hooks/useFocusManagement';
import { 
  formatDisplayDate, 
  formatCompactDate, 
  isValidBookingDate, 
  isPastDate,
  getMinBookingDate,
  getMaxBookingDate,
  addDays,
  toISODateString
} from '@/utils/dateUtils';

export interface DatePickerProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  loading?: boolean;
  error?: string;
  className?: string;
  disabled?: boolean;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  isValid: boolean;
  isSelected: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onDateSelect,
  loading = false,
  error,
  className,
  disabled = false
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const minDate = getMinBookingDate();
    return new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  });
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);

  const minBookingDate = useMemo(() => getMinBookingDate(), []);
  const maxBookingDate = useMemo(() => getMaxBookingDate(), []);

  // Focus management
  const { containerRef, focusElement } = useFocusManagement(!loading && !disabled, {
    autoFocus: true
  });

  // Generate calendar days for the current month view
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of the month and how many days to show from previous month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
    
    // Generate 42 days (6 weeks) for consistent calendar layout
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.getTime() === today.getTime();
      const isPast = isPastDate(date);
      const isValid = isValidBookingDate(date) && !isPast;
      const isSelected = selectedDate ? 
        date.getTime() === new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime() : 
        false;
      
      days.push({
        date,
        isCurrentMonth,
        isToday,
        isPast,
        isValid,
        isSelected
      });
    }
    
    return days;
  }, [currentMonth, selectedDate]);

  const handleDateClick = useCallback((day: CalendarDay) => {
    if (disabled || loading || !day.isValid || day.isPast) {
      return;
    }
    
    onDateSelect(day.date);
    setFocusedDate(day.date);
  }, [disabled, loading, onDateSelect]);

  // Handle keyboard navigation within the calendar
  const handleCalendarKeyDown = useCallback((event: React.KeyboardEvent, day: CalendarDay) => {
    if (disabled || loading) return;

    const currentDate = focusedDate || selectedDate || new Date();
    let newDate: Date | null = null;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        newDate = addDays(currentDate, 1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        newDate = addDays(currentDate, -1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        newDate = addDays(currentDate, 7);
        break;
      case 'ArrowUp':
        event.preventDefault();
        newDate = addDays(currentDate, -7);
        break;
      case 'Home':
        event.preventDefault();
        newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        break;
      case 'End':
        event.preventDefault();
        newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        break;
      case 'PageUp':
        event.preventDefault();
        if (event.shiftKey) {
          newDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
        } else {
          newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
        }
        break;
      case 'PageDown':
        event.preventDefault();
        if (event.shiftKey) {
          newDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());
        } else {
          newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (day.isValid && !day.isPast) {
          handleDateClick(day);
        }
        return;
    }

    if (newDate) {
      // Update the month view if necessary
      if (newDate.getMonth() !== currentMonth.getMonth() || newDate.getFullYear() !== currentMonth.getFullYear()) {
        setCurrentMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
      }
      
      setFocusedDate(newDate);
      
      // Focus the new date button after a short delay to ensure it's rendered
      setTimeout(() => {
        const dateButton = containerRef.current?.querySelector(
          `button[data-date="${newDate!.toISOString().split('T')[0]}"]`
        ) as HTMLElement;
        if (dateButton) {
          dateButton.focus();
        }
      }, 0);
    }
  }, [disabled, loading, focusedDate, selectedDate, currentMonth, handleDateClick, containerRef]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    if (disabled || loading) return;
    
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  }, [disabled, loading]);

  const canNavigatePrev = useMemo(() => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(currentMonth.getMonth() - 1);
    return prevMonth >= new Date(minBookingDate.getFullYear(), minBookingDate.getMonth(), 1);
  }, [currentMonth, minBookingDate]);

  const canNavigateNext = useMemo(() => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(currentMonth.getMonth() + 1);
    return nextMonth <= new Date(maxBookingDate.getFullYear(), maxBookingDate.getMonth(), 1);
  }, [currentMonth, maxBookingDate]);

  const monthYearDisplay = useMemo(() => {
    return currentMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  }, [currentMonth]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div 
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className={cn('w-full max-w-sm sm:max-w-md mx-auto', className)}
      role="application"
      aria-label="Date picker calendar"
    >
      <Card className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('prev')}
          disabled={disabled || loading || !canNavigatePrev}
          className="p-2 touch-manipulation"
          aria-label={`Previous month, ${canNavigatePrev ? 'available' : 'not available'}`}
        >
          <svg
            className="h-4 w-4 sm:h-5 sm:w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Button>
        
        <h2 
          className="text-base sm:text-lg font-semibold text-gray-900 text-center"
          id="calendar-heading"
          aria-live="polite"
        >
          {monthYearDisplay}
        </h2>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('next')}
          disabled={disabled || loading || !canNavigateNext}
          className="p-2 touch-manipulation"
          aria-label={`Next month, ${canNavigateNext ? 'available' : 'not available'}`}
        >
          <svg
            className="h-4 w-4 sm:h-5 sm:w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Button>
      </div>

      {/* Calendar Content */}
      <div className="p-3 sm:p-4">
        {loading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" text="Loading calendar..." />
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        {!loading && (
          <>
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2" role="row">
              {weekDays.map(day => (
                <div
                  key={day}
                  className="h-6 sm:h-8 flex items-center justify-center text-xs font-medium text-gray-500"
                  role="columnheader"
                  aria-label={day}
                >
                  <abbr title={day} aria-label={day}>
                    {day}
                  </abbr>
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div 
              className="grid grid-cols-7 gap-1"
              role="grid"
              aria-labelledby="calendar-heading"
              aria-describedby="calendar-instructions"
              aria-readonly="false"
            >
              {calendarDays.map((day, index) => {
                const dayClasses = cn(
                  'h-10 sm:h-12 w-full flex items-center justify-center text-sm sm:text-base rounded-md transition-colors touch-manipulation',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                  'active:scale-95 transition-transform duration-75',
                  {
                    // Base styles
                    'text-gray-400': !day.isCurrentMonth,
                    'text-gray-900': day.isCurrentMonth && !day.isSelected,
                    
                    // Today styling
                    'bg-blue-50 text-blue-600 font-medium': day.isToday && !day.isSelected,
                    
                    // Selected styling
                    'bg-blue-600 text-white font-medium shadow-md': day.isSelected,
                    
                    // Valid/invalid styling
                    'hover:bg-gray-100 cursor-pointer active:bg-gray-200': day.isValid && !day.isSelected && !disabled && !loading,
                    'text-gray-300 cursor-not-allowed': day.isPast || !day.isValid,
                    
                    // Disabled state
                    'opacity-50': disabled || loading
                  }
                );
                
                const isAvailable = day.isValid && !day.isPast;
                const isFocused = focusedDate && day.date.toDateString() === focusedDate.toDateString();
                const shouldHaveTabIndex = day.isSelected || (day.isCurrentMonth && isAvailable && !selectedDate) || isFocused;
                const statusText = day.isSelected ? 'selected' : 
                                 day.isToday ? 'today' : 
                                 !isAvailable ? 'unavailable' : 'available';
                
                return (
                  <button
                    key={index}
                    type="button"
                    className={dayClasses}
                    onClick={() => handleDateClick(day)}
                    onKeyDown={(e) => handleCalendarKeyDown(e, day)}
                    disabled={disabled || loading || day.isPast || !day.isValid}
                    aria-label={`${formatDisplayDate(day.date)}, ${statusText}${day.isToday ? ', today' : ''}`}
                    aria-selected={day.isSelected}
                    aria-disabled={!isAvailable}
                    tabIndex={shouldHaveTabIndex ? 0 : -1}
                    role="gridcell"
                    aria-describedby={day.isSelected ? 'selected-date-info' : undefined}
                    data-date={day.date.toISOString().split('T')[0]}
                  >
                    <span aria-hidden="true">{day.date.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
        
        {/* Selected date display */}
        {selectedDate && !loading && (
          <div 
            className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md"
            id="selected-date-info"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm text-blue-800">
              <span className="font-medium">Selected date:</span>{' '}
              {formatDisplayDate(selectedDate)}
            </p>
          </div>
        )}
        
        {/* Booking range info and keyboard instructions */}
        {!loading && (
          <div className="mt-4 space-y-2">
            <div className="text-xs text-gray-500">
              <p>
                Available dates: {formatCompactDate(minBookingDate)} - {formatCompactDate(maxBookingDate)}
              </p>
            </div>
            
            {/* Keyboard instructions (screen reader only) */}
            <div className="sr-only" id="calendar-instructions">
              <p>Use arrow keys to navigate dates. Press Enter or Space to select a date.</p>
              <p>Use Page Up and Page Down to navigate months. Hold Shift for years.</p>
              <p>Use Home and End keys to go to first and last day of the month.</p>
            </div>
          </div>
        )}
      </div>
      </Card>
    </div>
  );
};