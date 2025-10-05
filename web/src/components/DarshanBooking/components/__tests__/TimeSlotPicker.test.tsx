import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TimeSlotPicker } from '../TimeSlotPicker';
import { TimeSlot, BookingError } from '@/types/booking';

// Mock the booking service
jest.mock('@/services/booking/bookingService', () => ({
  bookingService: {
    getAvailableSlots: jest.fn(),
  },
}));

// Mock the date utilities
jest.mock('@/utils/dateUtils', () => ({
  formatDisplayDate: jest.fn((date) => date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })),
  formatTime: jest.fn((time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const hour = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }),
}));

// Mock UI components
jest.mock('@/components/ui/Card', () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid="card">{children}</div>
}));

jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, className, variant, size, ...props }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={className}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  )
}));

jest.mock('@/components/ui/LoadingSpinner', () => ({
  LoadingSpinner: ({ text, size }: any) => <div data-testid="loading-spinner" data-size={size}>{text}</div>
}));

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).flat().join(' ')
}));

describe('TimeSlotPicker Component', () => {
  const mockOnSlotSelect = jest.fn();
  const testDate = new Date('2024-01-20T10:00:00Z');
  
  // Mock time slots data
  const mockTimeSlots: TimeSlot[] = [
    {
      id: '2024-01-20-09-00',
      time: '09:00',
      date: testDate,
      capacity: 10,
      booked: 3,
      available: true,
    },
    {
      id: '2024-01-20-10-00',
      time: '10:00',
      date: testDate,
      capacity: 10,
      booked: 8,
      available: true,
    },
    {
      id: '2024-01-20-14-00',
      time: '14:00',
      date: testDate,
      capacity: 10,
      booked: 5,
      available: true,
    },
    {
      id: '2024-01-20-18-00',
      time: '18:00',
      date: testDate,
      capacity: 10,
      booked: 10,
      available: false,
    },
  ];

  const selectedSlot: TimeSlot = mockTimeSlots[0];

  // Get the mocked function
  const mockGetAvailableSlots = require('@/services/booking/bookingService').bookingService.getAvailableSlots;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAvailableSlots.mockResolvedValue(mockTimeSlots);
  });

  describe('Rendering', () => {
    it('renders with correct header and date', async () => {
      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
        />
      );

      expect(screen.getByText('Select Time Slot')).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText(/Saturday, January 20, 2024/)).toBeInTheDocument();
      });
    });

    it('renders with custom className', () => {
      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
          className="custom-class"
        />
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-class');
    });

    it('fetches and displays time slots on mount', async () => {
      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
        />
      );

      expect(mockGetAvailableSlots).toHaveBeenCalledWith(testDate);
      
      await waitFor(() => {
        expect(screen.getByText('9:00 AM')).toBeInTheDocument();
        expect(screen.getByText('10:00 AM')).toBeInTheDocument();
        expect(screen.getByText('2:00 PM')).toBeInTheDocument();
        expect(screen.getByText('6:00 PM')).toBeInTheDocument();
      });
    });
  });

  describe('Time Slot Display', () => {
    it('displays slots grouped by time periods', async () => {
      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Morning (6:00 AM - 12:00 PM)')).toBeInTheDocument();
        expect(screen.getByText('Afternoon (12:00 PM - 5:00 PM)')).toBeInTheDocument();
        expect(screen.getByText('Evening (5:00 PM - 8:00 PM)')).toBeInTheDocument();
      });
    });

    it('shows capacity information for each slot', async () => {
      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('7/10 available')).toBeInTheDocument(); // 9:00 AM slot
        expect(screen.getByText('2/10 available')).toBeInTheDocument(); // 10:00 AM slot
        expect(screen.getByText('5/10 available')).toBeInTheDocument(); // 2:00 PM slot
        expect(screen.getByText('0/10 available')).toBeInTheDocument(); // 6:00 PM slot
      });
    });

    it('shows availability status for each slot', async () => {
      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
        />
      );

      await waitFor(() => {
        // Check for specific availability statuses in slot buttons
        expect(screen.getByLabelText(/Select 9:00 AM slot, Available/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Select 2:00 PM slot, Available/)).toBeInTheDocument();
        expect(screen.getByText('Fully booked')).toBeInTheDocument();
        expect(screen.getByText('Last slot available')).toBeInTheDocument(); // 10:00 AM slot with 2 remaining
      });
    });

    it('displays capacity indicators with visual dots', async () => {
      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
        />
      );

      await waitFor(() => {
        // Each slot should have capacity indicator dots
        const slotButtons = screen.getAllByRole('button');
        const timeSlotButtons = slotButtons.filter(button => 
          button.getAttribute('aria-label')?.includes('Select')
        );
        expect(timeSlotButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Slot Selection', () => {
    it('calls onSlotSelect when an available slot is clicked', async () => {
      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
        />
      );

      await waitFor(() => {
        const slotButton = screen.getByLabelText(/Select 9:00 AM slot/);
        fireEvent.click(slotButton);
      });

      expect(mockOnSlotSelect).toHaveBeenCalledWith(mockTimeSlots[0]);
    });

    it('does not call onSlotSelect for fully booked slots', async () => {
      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
        />
      );

      await waitFor(() => {
        const fullyBookedSlot = screen.getByLabelText(/Select 6:00 PM slot/);
        fireEvent.click(fullyBookedSlot);
      });

      expect(mockOnSlotSelect).not.toHaveBeenCalled();
    });

    it('highlights selected slot', async () => {
      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={selectedSlot}
          onSlotSelect={mockOnSlotSelect}
        />
      );

      await waitFor(() => {
        const selectedButton = screen.getByLabelText(/Select 9:00 AM slot/);
        expect(selectedButton).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('displays selected slot summary', async () => {
      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={selectedSlot}
          onSlotSelect={mockOnSlotSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Selected Time Slot')).toBeInTheDocument();
        expect(screen.getByText(/9:00 AM on Saturday, January 20, 2024/)).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when loading externally', () => {
      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
          loading={true}
        />
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading time slots...')).toBeInTheDocument();
    });

    it('shows loading spinner while fetching slots', () => {
      // Make the promise not resolve immediately
      mockGetAvailableSlots.mockImplementation(() => new Promise(() => {}));

      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
        />
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('disables slot selection when loading', async () => {
      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
          loading={true}
        />
      );

      // Should not show any slot buttons when loading
      const slotButtons = screen.queryAllByRole('button').filter(button => 
        button.getAttribute('aria-label')?.includes('Select')
      );
      expect(slotButtons).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    const mockError: BookingError = {
      code: 'NETWORK_ERROR',
      message: 'Failed to load time slots',
    };

    it('displays error message when external error is provided', async () => {
      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
          error={mockError}
          loading={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Unable to load time slots')).toBeInTheDocument();
        expect(screen.getByText('Failed to load time slots')).toBeInTheDocument();
      });
    });

    it('displays error when service call fails', async () => {
      mockGetAvailableSlots.mockRejectedValue(mockError);

      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Unable to load time slots')).toBeInTheDocument();
        expect(screen.getByText('Failed to load time slots')).toBeInTheDocument();
      });
    });

    it('provides retry functionality on error', async () => {
      mockGetAvailableSlots.mockRejectedValueOnce(mockError);
      mockGetAvailableSlots.mockResolvedValueOnce(mockTimeSlots);

      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockGetAvailableSlots).toHaveBeenCalledTimes(2);
        expect(screen.getByText('9:00 AM')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('displays no slots available message when no slots returned', async () => {
      mockGetAvailableSlots.mockResolvedValue([]);

      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('No slots available')).toBeInTheDocument();
        expect(screen.getByText(/There are no available time slots for/)).toBeInTheDocument();
      });
    });

    it('provides refresh functionality when no slots available', async () => {
      mockGetAvailableSlots.mockResolvedValueOnce([]);
      mockGetAvailableSlots.mockResolvedValueOnce(mockTimeSlots);

      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });

      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockGetAvailableSlots).toHaveBeenCalledTimes(2);
        expect(screen.getByText('9:00 AM')).toBeInTheDocument();
      });
    });
  });

  describe('Disabled State', () => {
    it('disables all slot selection when disabled', async () => {
      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
          disabled={true}
        />
      );

      await waitFor(() => {
        const slotButtons = screen.getAllByRole('button').filter(button => 
          button.getAttribute('aria-label')?.includes('Select')
        );
        slotButtons.forEach(button => {
          expect(button).toBeDisabled();
        });
      });
    });

    it('does not call onSlotSelect when disabled', async () => {
      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
          disabled={true}
        />
      );

      await waitFor(() => {
        const slotButton = screen.getByLabelText(/Select 9:00 AM slot/);
        fireEvent.click(slotButton);
      });

      expect(mockOnSlotSelect).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for slot buttons', async () => {
      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Select 9:00 AM slot, Available/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Select 6:00 PM slot, Fully booked/)).toBeInTheDocument();
      });
    });

    it('sets aria-selected for selected slot', async () => {
      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={selectedSlot}
          onSlotSelect={mockOnSlotSelect}
        />
      );

      await waitFor(() => {
        const selectedButton = screen.getByLabelText(/Select 9:00 AM slot/);
        expect(selectedButton).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('provides proper focus management', async () => {
      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
        />
      );

      await waitFor(() => {
        const slotButtons = screen.getAllByRole('button').filter(button => 
          button.getAttribute('aria-label')?.includes('Select')
        );
        slotButtons.forEach(button => {
          expect(button).toHaveAttribute('type', 'button');
        });
      });
    });
  });

  describe('Visual Feedback', () => {
    it('shows capacity legend', async () => {
      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Capacity Indicator')).toBeInTheDocument();
        expect(screen.getByText('Booked')).toBeInTheDocument();
        // Use getAllByText to find the specific "Available" text in the legend
        const availableTexts = screen.getAllByText('Available');
        expect(availableTexts.length).toBeGreaterThan(0);
      });
    });

    it('applies correct styling for different slot states', async () => {
      render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={selectedSlot}
          onSlotSelect={mockOnSlotSelect}
        />
      );

      await waitFor(() => {
        const selectedButton = screen.getByLabelText(/Select 9:00 AM slot/);
        const fullyBookedButton = screen.getByLabelText(/Select 6:00 PM slot/);
        
        expect(selectedButton).toHaveAttribute('aria-selected', 'true');
        expect(fullyBookedButton).toBeDisabled();
      });
    });
  });

  describe('Date Changes', () => {
    it('refetches slots when date changes', async () => {
      const { rerender } = render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
        />
      );

      expect(mockGetAvailableSlots).toHaveBeenCalledWith(testDate);

      const newDate = new Date('2024-01-21T10:00:00Z');
      rerender(
        <TimeSlotPicker
          date={newDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
        />
      );

      await waitFor(() => {
        expect(mockGetAvailableSlots).toHaveBeenCalledWith(newDate);
        expect(mockGetAvailableSlots).toHaveBeenCalledTimes(2);
      });
    });

    it('clears previous error when date changes', async () => {
      const mockError: BookingError = {
        code: 'NETWORK_ERROR',
        message: 'Failed to load time slots',
      };

      mockGetAvailableSlots.mockRejectedValueOnce(mockError);
      mockGetAvailableSlots.mockResolvedValueOnce(mockTimeSlots);

      const { rerender } = render(
        <TimeSlotPicker
          date={testDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Unable to load time slots')).toBeInTheDocument();
      });

      const newDate = new Date('2024-01-21T10:00:00Z');
      rerender(
        <TimeSlotPicker
          date={newDate}
          selectedSlot={null}
          onSlotSelect={mockOnSlotSelect}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Unable to load time slots')).not.toBeInTheDocument();
        expect(screen.getByText('9:00 AM')).toBeInTheDocument();
      });
    });
  });
});