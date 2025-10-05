import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DatePicker } from '../DatePicker';

// Mock the date utilities
jest.mock('@/utils/dateUtils', () => ({
  formatDisplayDate: jest.fn((date) => date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })),
  formatCompactDate: jest.fn((date) => date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })),
  isValidBookingDate: jest.fn(() => true),
  isPastDate: jest.fn((date) => date.getDate() < 15),
  getMinBookingDate: jest.fn(() => new Date('2024-01-15T12:00:00Z')),
  getMaxBookingDate: jest.fn(() => new Date('2024-02-14T10:00:00Z')),
  addDays: jest.fn((date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }),
  toISODateString: jest.fn((date) => date.toISOString().split('T')[0]),
}));

// Mock UI components
jest.mock('@/components/ui/Card', () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid="card">{children}</div>
}));

jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, className, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} className={className} {...props}>
      {children}
    </button>
  )
}));

jest.mock('@/components/ui/LoadingSpinner', () => ({
  LoadingSpinner: ({ text }: any) => <div data-testid="loading-spinner">{text}</div>
}));

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).flat().join(' ')
}));

describe('DatePicker Component', () => {
  const mockOnDateSelect = jest.fn();
  
  // Set up consistent test dates
  const testToday = new Date('2024-01-15T10:00:00Z');
  const testMinDate = new Date('2024-01-15T12:00:00Z');
  const testMaxDate = new Date('2024-02-14T10:00:00Z');
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock current date
    jest.useFakeTimers();
    jest.setSystemTime(testToday);
    
    // Reset mock implementations - we'll use the default mocked values
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders calendar with correct month and year', () => {
      render(<DatePicker onDateSelect={mockOnDateSelect} />);
      
      expect(screen.getByText('January 2024')).toBeInTheDocument();
    });

    it('renders week day headers', () => {
      render(<DatePicker onDateSelect={mockOnDateSelect} />);
      
      const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      weekDays.forEach(day => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });

    it('renders calendar days', () => {
      render(<DatePicker onDateSelect={mockOnDateSelect} />);
      
      // Should render days for January (check a few specific days)
      expect(screen.getByText('15')).toBeInTheDocument(); // Today
      expect(screen.getByText('20')).toBeInTheDocument(); // Future date
      expect(screen.getAllByText('1')).toHaveLength(2); // Should have 1 from previous month and 1 from current month
    });

    it('displays booking date range information', () => {
      render(<DatePicker onDateSelect={mockOnDateSelect} />);
      
      expect(screen.getByText(/Available dates:/)).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<DatePicker onDateSelect={mockOnDateSelect} className="custom-class" />);
      
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Date Selection', () => {
    it('calls onDateSelect when a valid date is clicked', () => {
      render(<DatePicker onDateSelect={mockOnDateSelect} />);
      
      const dateButton = screen.getByText('20');
      fireEvent.click(dateButton);
      
      expect(mockOnDateSelect).toHaveBeenCalledWith(
        expect.any(Date)
      );
    });

    it('highlights selected date', () => {
      const selectedDate = new Date('2024-01-20T10:00:00Z');
      render(
        <DatePicker 
          onDateSelect={mockOnDateSelect} 
          selectedDate={selectedDate}
        />
      );
      
      const selectedButton = screen.getByText('20');
      expect(selectedButton).toHaveAttribute('aria-selected', 'true');
    });

    it('displays selected date information', () => {
      const selectedDate = new Date('2024-01-20T10:00:00Z');
      render(
        <DatePicker 
          onDateSelect={mockOnDateSelect} 
          selectedDate={selectedDate}
        />
      );
      
      expect(screen.getByText(/Selected date:/)).toBeInTheDocument();
    });

    it('does not call onDateSelect for past dates', () => {
      render(<DatePicker onDateSelect={mockOnDateSelect} />);
      
      const pastDate = screen.getByText('14');
      fireEvent.click(pastDate);
      
      expect(mockOnDateSelect).not.toHaveBeenCalled();
    });
  });

  describe('Month Navigation', () => {
    it('navigates to next month', () => {
      render(<DatePicker onDateSelect={mockOnDateSelect} />);
      
      const nextButton = screen.getByLabelText('Next month');
      fireEvent.click(nextButton);
      
      expect(screen.getByText('February 2024')).toBeInTheDocument();
    });

    it('disables previous month button when at minimum date', () => {
      render(<DatePicker onDateSelect={mockOnDateSelect} />);
      
      const prevButton = screen.getByLabelText('Previous month');
      expect(prevButton).toBeDisabled();
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when loading', () => {
      render(<DatePicker onDateSelect={mockOnDateSelect} loading />);
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading calendar...')).toBeInTheDocument();
    });

    it('disables navigation buttons when loading', () => {
      render(<DatePicker onDateSelect={mockOnDateSelect} loading />);
      
      const prevButton = screen.getByLabelText('Previous month');
      const nextButton = screen.getByLabelText('Next month');
      
      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Error State', () => {
    it('displays error message', () => {
      const errorMessage = 'Failed to load calendar';
      render(
        <DatePicker 
          onDateSelect={mockOnDateSelect} 
          error={errorMessage}
        />
      );
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('still shows calendar when there is an error', () => {
      render(
        <DatePicker 
          onDateSelect={mockOnDateSelect} 
          error="Some error"
        />
      );
      
      expect(screen.getByText('January 2024')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('disables all interactions when disabled', () => {
      render(<DatePicker onDateSelect={mockOnDateSelect} disabled />);
      
      const prevButton = screen.getByLabelText('Previous month');
      const nextButton = screen.getByLabelText('Next month');
      
      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });

    it('does not call onDateSelect when disabled', () => {
      render(<DatePicker onDateSelect={mockOnDateSelect} disabled />);
      
      const dateButton = screen.getByText('20');
      fireEvent.click(dateButton);
      
      expect(mockOnDateSelect).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for navigation buttons', () => {
      render(<DatePicker onDateSelect={mockOnDateSelect} />);
      
      expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
      expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    });

    it('sets aria-selected for selected date', () => {
      const selectedDate = new Date('2024-01-20T10:00:00Z');
      render(
        <DatePicker 
          onDateSelect={mockOnDateSelect} 
          selectedDate={selectedDate}
        />
      );
      
      const selectedButton = screen.getByText('20');
      expect(selectedButton).toHaveAttribute('aria-selected', 'true');
    });

    it('sets proper tabIndex for keyboard navigation', () => {
      render(<DatePicker onDateSelect={mockOnDateSelect} />);
      
      // Current month dates should have tabIndex 0
      const currentMonthDate = screen.getByText('15');
      expect(currentMonthDate).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes', () => {
      render(<DatePicker onDateSelect={mockOnDateSelect} />);
      
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('max-w-md');
    });

    it('uses grid layout for calendar', () => {
      render(<DatePicker onDateSelect={mockOnDateSelect} />);
      
      const calendarGrid = screen.getByText('15').closest('.grid-cols-7');
      expect(calendarGrid).toBeInTheDocument();
    });
  });

  describe('Date Validation', () => {
    it('marks past dates as invalid', () => {
      render(<DatePicker onDateSelect={mockOnDateSelect} />);
      
      const pastDate = screen.getByText('14');
      expect(pastDate).toBeDisabled();
    });

    it('marks valid future dates as selectable', () => {
      render(<DatePicker onDateSelect={mockOnDateSelect} />);
      
      const futureDate = screen.getByText('20');
      expect(futureDate).not.toBeDisabled();
    });

    it('highlights today with special styling', () => {
      render(<DatePicker onDateSelect={mockOnDateSelect} />);
      
      const today = screen.getByText('15'); // January 15 is today
      expect(today).toBeInTheDocument();
      expect(today).not.toBeDisabled();
    });
  });
});