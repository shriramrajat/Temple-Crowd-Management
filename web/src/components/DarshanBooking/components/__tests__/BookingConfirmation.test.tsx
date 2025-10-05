import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BookingConfirmation } from '../BookingConfirmation';
import { Booking, QRCodeData } from '@/types/booking';
import { BOOKING_STATUS } from '@/constants/booking';

// Mock the useQRCode hook
const mockUseQRCode = {
  qrCodeUrl: null,
  loading: false,
  error: null,
  generateQRCode: jest.fn(),
  downloadQRCode: jest.fn(),
  saveQRCode: jest.fn(),
  clearError: jest.fn(),
  reset: jest.fn(),
  isReady: false
};

jest.mock('@/hooks/useQRCode', () => ({
  useQRCode: () => mockUseQRCode
}));

// Mock date utilities
jest.mock('@/utils/dateUtils', () => ({
  formatDisplayDate: jest.fn((date, options) => {
    if (options?.hour && options?.minute) {
      return 'Jan 20, 2024, 10:30 AM';
    }
    return 'Saturday, January 20, 2024';
  }),
  formatDisplayTime: jest.fn(() => '10:30 AM')
}));

// Mock UI components
jest.mock('@/components/ui/Card', () => ({
  Card: ({ children, className, variant }: any) => (
    <div className={className} data-testid={`card-${variant || 'default'}`}>
      {children}
    </div>
  ),
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h3 data-testid="card-title">{children}</h3>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>
}));

jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, variant, className, ...props }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={className}
      data-testid={`button-${variant || 'primary'}`}
      {...props}
    >
      {children}
    </button>
  )
}));

jest.mock('@/components/ui/LoadingSpinner', () => ({
  LoadingSpinner: ({ size, text }: any) => (
    <div data-testid="loading-spinner" data-size={size}>
      {text}
    </div>
  )
}));

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).flat().join(' ')
}));

describe('BookingConfirmation Component', () => {
  const mockBooking: Booking = {
    id: 'booking-123',
    userId: 'user-456',
    slotTime: new Date('2024-01-20T10:30:00Z'),
    status: BOOKING_STATUS.CONFIRMED,
    createdAt: new Date('2024-01-15T08:00:00Z'),
    updatedAt: new Date('2024-01-15T08:00:00Z')
  };

  const mockQRCodeData: QRCodeData = {
    bookingId: 'booking-123',
    userId: 'user-456',
    slotTime: '2024-01-20T10:30:00Z',
    status: BOOKING_STATUS.CONFIRMED,
    verificationCode: 'abc123'
  };

  const mockProps = {
    booking: mockBooking,
    qrCodeData: mockQRCodeData,
    onBackToBooking: jest.fn(),
    onDownloadQR: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock hook state
    mockUseQRCode.qrCodeUrl = null;
    mockUseQRCode.loading = false;
    mockUseQRCode.error = null;
    mockUseQRCode.isReady = false;
  });

  describe('Rendering', () => {
    it('renders success header with confirmation message', () => {
      render(<BookingConfirmation {...mockProps} />);
      
      expect(screen.getByText('Booking Confirmed!')).toBeInTheDocument();
      expect(screen.getByText(/Your darshan slot has been successfully booked/)).toBeInTheDocument();
    });

    it('displays booking details correctly', () => {
      render(<BookingConfirmation {...mockProps} />);
      
      expect(screen.getByText('Booking Details')).toBeInTheDocument();
      expect(screen.getByText('Saturday, January 20, 2024')).toBeInTheDocument();
      expect(screen.getByText('10:30 AM')).toBeInTheDocument();
      expect(screen.getByText('booking-123')).toBeInTheDocument();
      expect(screen.getByText('Confirmed')).toBeInTheDocument();
    });

    it('shows QR code section', () => {
      render(<BookingConfirmation {...mockProps} />);
      
      expect(screen.getByText('Entry QR Code')).toBeInTheDocument();
    });

    it('displays important instructions', () => {
      render(<BookingConfirmation {...mockProps} />);
      
      expect(screen.getByText('Important Instructions')).toBeInTheDocument();
      expect(screen.getByText(/Please arrive 15 minutes before/)).toBeInTheDocument();
      expect(screen.getByText(/Bring a valid photo ID/)).toBeInTheDocument();
    });

    it('shows navigation buttons', () => {
      render(<BookingConfirmation {...mockProps} />);
      
      expect(screen.getByText('Book Another Slot')).toBeInTheDocument();
      expect(screen.getByText('Print Details')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<BookingConfirmation {...mockProps} className="custom-class" />);
      
      const container = screen.getByText('Booking Confirmed!').closest('.custom-class');
      expect(container).toBeInTheDocument();
    });
  });

  describe('QR Code Generation', () => {
    it('calls generateQRCode on mount', () => {
      render(<BookingConfirmation {...mockProps} />);
      
      expect(mockUseQRCode.generateQRCode).toHaveBeenCalledWith(mockQRCodeData);
    });

    it('shows loading state while generating QR code', () => {
      mockUseQRCode.loading = true;
      
      render(<BookingConfirmation {...mockProps} />);
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Generating your QR code...')).toBeInTheDocument();
    });

    it('displays QR code when ready', () => {
      mockUseQRCode.qrCodeUrl = 'data:image/png;base64,test-qr-code';
      mockUseQRCode.isReady = true;
      
      render(<BookingConfirmation {...mockProps} />);
      
      const qrImage = screen.getByAltText('Booking QR Code');
      expect(qrImage).toBeInTheDocument();
      expect(qrImage).toHaveAttribute('src', 'data:image/png;base64,test-qr-code');
    });

    it('shows QR code actions when ready', () => {
      mockUseQRCode.qrCodeUrl = 'data:image/png;base64,test-qr-code';
      mockUseQRCode.isReady = true;
      
      render(<BookingConfirmation {...mockProps} />);
      
      expect(screen.getByText('Download QR Code')).toBeInTheDocument();
      expect(screen.getByText('Save to Device')).toBeInTheDocument();
    });

    it('displays error state when QR generation fails', () => {
      mockUseQRCode.error = {
        code: 'qr_generation_error',
        message: 'Failed to generate QR code'
      };
      
      render(<BookingConfirmation {...mockProps} />);
      
      expect(screen.getByText('Failed to generate QR code')).toBeInTheDocument();
      expect(screen.getByText('Retry QR Code Generation')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('handles back to booking navigation', () => {
      render(<BookingConfirmation {...mockProps} />);
      
      const backButton = screen.getByText('Book Another Slot');
      fireEvent.click(backButton);
      
      expect(mockProps.onBackToBooking).toHaveBeenCalledTimes(1);
    });

    it('handles QR code download', () => {
      mockUseQRCode.qrCodeUrl = 'data:image/png;base64,test-qr-code';
      mockUseQRCode.isReady = true;
      
      render(<BookingConfirmation {...mockProps} />);
      
      const downloadButton = screen.getByText('Download QR Code');
      fireEvent.click(downloadButton);
      
      expect(mockUseQRCode.downloadQRCode).toHaveBeenCalledWith('darshan-booking-booking-123.png');
      expect(mockProps.onDownloadQR).toHaveBeenCalledTimes(1);
    });

    it('handles QR code save to device', async () => {
      mockUseQRCode.qrCodeUrl = 'data:image/png;base64,test-qr-code';
      mockUseQRCode.isReady = true;
      
      render(<BookingConfirmation {...mockProps} />);
      
      const saveButton = screen.getByText('Save to Device');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockUseQRCode.saveQRCode).toHaveBeenCalledWith('darshan-booking-booking-123.png');
      });
    });

    it('handles QR code retry', () => {
      mockUseQRCode.error = {
        code: 'qr_generation_error',
        message: 'Failed to generate QR code'
      };
      
      render(<BookingConfirmation {...mockProps} />);
      
      const retryButton = screen.getByText('Retry QR Code Generation');
      fireEvent.click(retryButton);
      
      expect(mockUseQRCode.clearError).toHaveBeenCalledTimes(1);
      expect(mockUseQRCode.generateQRCode).toHaveBeenCalledWith(mockQRCodeData);
    });

    it('handles print functionality', () => {
      // Mock window.print
      const mockPrint = jest.fn();
      Object.defineProperty(window, 'print', {
        value: mockPrint,
        writable: true
      });
      
      render(<BookingConfirmation {...mockProps} />);
      
      const printButton = screen.getByText('Print Details');
      fireEvent.click(printButton);
      
      expect(mockPrint).toHaveBeenCalledTimes(1);
    });
  });

  describe('QR Code Display', () => {
    it('shows proper QR code sizing', () => {
      mockUseQRCode.qrCodeUrl = 'data:image/png;base64,test-qr-code';
      mockUseQRCode.isReady = true;
      
      render(<BookingConfirmation {...mockProps} />);
      
      const qrImage = screen.getByAltText('Booking QR Code');
      expect(qrImage).toHaveClass('w-48', 'h-48', 'md:w-56', 'md:h-56');
    });

    it('applies pixelated rendering for QR code', () => {
      mockUseQRCode.qrCodeUrl = 'data:image/png;base64,test-qr-code';
      mockUseQRCode.isReady = true;
      
      render(<BookingConfirmation {...mockProps} />);
      
      const qrImage = screen.getByAltText('Booking QR Code');
      expect(qrImage).toHaveStyle({ imageRendering: 'pixelated' });
    });

    it('shows QR code instructions', () => {
      mockUseQRCode.qrCodeUrl = 'data:image/png;base64,test-qr-code';
      mockUseQRCode.isReady = true;
      
      render(<BookingConfirmation {...mockProps} />);
      
      expect(screen.getByText(/Present this QR code at the temple entrance/)).toBeInTheDocument();
    });
  });

  describe('Booking Details Display', () => {
    it('formats booking status correctly', () => {
      const cancelledBooking = {
        ...mockBooking,
        status: BOOKING_STATUS.CANCELLED
      };
      
      render(<BookingConfirmation {...mockProps} booking={cancelledBooking} />);
      
      expect(screen.getByText('Cancelled')).toBeInTheDocument();
    });

    it('displays booking ID in monospace font', () => {
      render(<BookingConfirmation {...mockProps} />);
      
      const bookingIdElement = screen.getByText('booking-123');
      expect(bookingIdElement).toHaveClass('font-mono');
    });

    it('shows creation timestamp', () => {
      render(<BookingConfirmation {...mockProps} />);
      
      expect(screen.getByText(/Booked on/)).toBeInTheDocument();
      expect(screen.getByText(/Jan 20, 2024, 10:30 AM/)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive grid layout for booking details', () => {
      render(<BookingConfirmation {...mockProps} />);
      
      const detailsGrid = screen.getByText('Date').closest('.grid-cols-1');
      expect(detailsGrid).toHaveClass('md:grid-cols-2');
    });

    it('uses responsive button layout', () => {
      render(<BookingConfirmation {...mockProps} />);
      
      const buttonContainer = screen.getByText('Book Another Slot').parentElement;
      expect(buttonContainer).toHaveClass('flex-col', 'sm:flex-row');
    });

    it('applies responsive QR code actions layout', () => {
      mockUseQRCode.qrCodeUrl = 'data:image/png;base64,test-qr-code';
      mockUseQRCode.isReady = true;
      
      render(<BookingConfirmation {...mockProps} />);
      
      const actionsContainer = screen.getByText('Download QR Code').parentElement;
      expect(actionsContainer).toHaveClass('flex-col', 'sm:flex-row');
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<BookingConfirmation {...mockProps} />);
      
      expect(screen.getByRole('heading', { name: 'Booking Confirmed!' })).toBeInTheDocument();
      expect(screen.getAllByTestId('card-title')).toHaveLength(2); // Booking Details and Entry QR Code
    });

    it('provides alt text for QR code image', () => {
      mockUseQRCode.qrCodeUrl = 'data:image/png;base64,test-qr-code';
      mockUseQRCode.isReady = true;
      
      render(<BookingConfirmation {...mockProps} />);
      
      const qrImage = screen.getByAltText('Booking QR Code');
      expect(qrImage).toBeInTheDocument();
    });

    it('uses semantic button elements', () => {
      render(<BookingConfirmation {...mockProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('provides descriptive button text', () => {
      mockUseQRCode.qrCodeUrl = 'data:image/png;base64,test-qr-code';
      mockUseQRCode.isReady = true;
      
      render(<BookingConfirmation {...mockProps} />);
      
      expect(screen.getByRole('button', { name: /Download QR Code/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Save to Device/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Book Another Slot/ })).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing onDownloadQR callback gracefully', () => {
      mockUseQRCode.qrCodeUrl = 'data:image/png;base64,test-qr-code';
      mockUseQRCode.isReady = true;
      
      const propsWithoutCallback = {
        ...mockProps,
        onDownloadQR: undefined
      };
      
      render(<BookingConfirmation {...propsWithoutCallback} />);
      
      const downloadButton = screen.getByText('Download QR Code');
      fireEvent.click(downloadButton);
      
      expect(mockUseQRCode.downloadQRCode).toHaveBeenCalled();
      // Should not throw error when callback is undefined
    });

    it('disables QR actions when not ready', () => {
      mockUseQRCode.qrCodeUrl = null;
      mockUseQRCode.isReady = false;
      
      render(<BookingConfirmation {...mockProps} />);
      
      // QR actions should not be visible when not ready
      expect(screen.queryByText('Download QR Code')).not.toBeInTheDocument();
      expect(screen.queryByText('Save to Device')).not.toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('regenerates QR code when qrCodeData changes', () => {
      const { rerender } = render(<BookingConfirmation {...mockProps} />);
      
      const newQRCodeData = {
        ...mockQRCodeData,
        bookingId: 'new-booking-456'
      };
      
      rerender(<BookingConfirmation {...mockProps} qrCodeData={newQRCodeData} />);
      
      expect(mockUseQRCode.generateQRCode).toHaveBeenCalledWith(newQRCodeData);
    });

    it('does not regenerate QR code when already loading', () => {
      mockUseQRCode.loading = true;
      
      render(<BookingConfirmation {...mockProps} />);
      
      // Should not call generateQRCode when already loading
      expect(mockUseQRCode.generateQRCode).not.toHaveBeenCalled();
    });

    it('does not regenerate QR code when already exists', () => {
      mockUseQRCode.qrCodeUrl = 'existing-qr-code';
      
      render(<BookingConfirmation {...mockProps} />);
      
      // Should not call generateQRCode when QR code already exists
      expect(mockUseQRCode.generateQRCode).not.toHaveBeenCalled();
    });
  });
});