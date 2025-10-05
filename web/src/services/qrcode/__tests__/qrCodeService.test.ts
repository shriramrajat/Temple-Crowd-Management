import { qrCodeService, QRCodeService } from '../qrCodeService';
import { QRCodeData, BookingStatus } from '../../../types/booking';
import { BOOKING_ERROR_CODES } from '../../../constants/booking';

// Mock the qrcode library
jest.mock('qrcode', () => ({
  toDataURL: jest.fn(),
  toString: jest.fn(),
}));

// Mock DOM methods for download functionality
const mockElement = {
  href: '',
  download: '',
  click: jest.fn(),
};

const mockCreateElement = jest.fn(() => mockElement);
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
  writable: true,
});

Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild,
  writable: true,
});

Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild,
  writable: true,
});

// Mock navigator.share for mobile testing
Object.defineProperty(navigator, 'share', {
  value: jest.fn(),
  writable: true,
});

// Mock fetch for saveQRCodeToDevice
global.fetch = jest.fn();

describe('QRCodeService', () => {
  let mockQRCode: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockQRCode = require('qrcode');
    
    // Reset navigator.share mock
    (navigator.share as jest.Mock) = jest.fn();
    
    // Reset fetch mock
    (global.fetch as jest.Mock) = jest.fn();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = QRCodeService.getInstance();
      const instance2 = QRCodeService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should export the singleton instance', () => {
      expect(qrCodeService).toBeInstanceOf(QRCodeService);
    });
  });

  describe('createQRCodeData', () => {
    it('should create QR code data with all required fields', () => {
      const bookingId = 'booking-123';
      const userId = 'user-456';
      const slotTime = new Date('2024-12-25T10:00:00Z');
      const status = 'confirmed';

      const qrData = qrCodeService.createQRCodeData(bookingId, userId, slotTime, status);

      expect(qrData).toEqual({
        bookingId,
        userId,
        slotTime: slotTime.toISOString(),
        status,
        verificationCode: expect.stringMatching(/^[0-9a-f]{8}$/i)
      });
    });

    it('should generate consistent verification codes for same input', () => {
      const bookingId = 'booking-123';
      const userId = 'user-456';
      const slotTime = new Date('2024-12-25T10:00:00Z');
      const status = 'confirmed';

      const qrData1 = qrCodeService.createQRCodeData(bookingId, userId, slotTime, status);
      const qrData2 = qrCodeService.createQRCodeData(bookingId, userId, slotTime, status);

      expect(qrData1.verificationCode).toBe(qrData2.verificationCode);
    });

    it('should generate different verification codes for different inputs', () => {
      const slotTime = new Date('2024-12-25T10:00:00Z');
      const status = 'confirmed';

      const qrData1 = qrCodeService.createQRCodeData('booking-123', 'user-456', slotTime, status);
      const qrData2 = qrCodeService.createQRCodeData('booking-456', 'user-789', slotTime, status);

      expect(qrData1.verificationCode).not.toBe(qrData2.verificationCode);
    });
  });

  describe('generateQRCode', () => {
    const mockQRData: QRCodeData = {
      bookingId: 'booking-123',
      userId: 'user-456',
      slotTime: '2024-12-25T10:00:00.000Z',
      status: 'confirmed' as BookingStatus,
      verificationCode: 'abc12345'
    };

    it('should generate QR code successfully', async () => {
      const mockDataURL = 'data:image/png;base64,mockdata';
      mockQRCode.toDataURL.mockResolvedValue(mockDataURL);

      const result = await qrCodeService.generateQRCode(mockQRData);

      expect(result).toBe(mockDataURL);
      expect(mockQRCode.toDataURL).toHaveBeenCalledWith(
        JSON.stringify(mockQRData),
        expect.objectContaining({
          errorCorrectionLevel: 'M',
          type: 'image/png',
          margin: 1,
          width: 256,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
      );
    });

    it('should handle QR code generation errors', async () => {
      const mockError = new Error('QR generation failed');
      mockQRCode.toDataURL.mockRejectedValue(mockError);

      await expect(qrCodeService.generateQRCode(mockQRData)).rejects.toEqual(
        expect.objectContaining({
          code: BOOKING_ERROR_CODES.QR_GENERATION_ERROR,
          message: expect.any(String),
          details: expect.objectContaining({
            originalMessage: 'Failed to generate QR code',
            originalError: 'QR generation failed'
          })
        })
      );
    });
  });

  describe('generateQRCodeSVG', () => {
    const mockQRData: QRCodeData = {
      bookingId: 'booking-123',
      userId: 'user-456',
      slotTime: '2024-12-25T10:00:00.000Z',
      status: 'confirmed' as BookingStatus,
      verificationCode: 'abc12345'
    };

    it('should generate QR code SVG successfully', async () => {
      const mockSVG = '<svg>mock svg content</svg>';
      mockQRCode.toString.mockResolvedValue(mockSVG);

      const result = await qrCodeService.generateQRCodeSVG(mockQRData);

      expect(result).toBe(mockSVG);
      expect(mockQRCode.toString).toHaveBeenCalledWith(
        JSON.stringify(mockQRData),
        expect.objectContaining({
          type: 'svg',
          errorCorrectionLevel: 'M',
          margin: 1,
          width: 256
        })
      );
    });

    it('should handle SVG generation errors', async () => {
      const mockError = new Error('SVG generation failed');
      mockQRCode.toString.mockRejectedValue(mockError);

      await expect(qrCodeService.generateQRCodeSVG(mockQRData)).rejects.toEqual(
        expect.objectContaining({
          code: BOOKING_ERROR_CODES.QR_GENERATION_ERROR,
          message: expect.any(String),
          details: expect.objectContaining({
            originalMessage: 'Failed to generate QR code SVG',
            originalError: 'SVG generation failed'
          })
        })
      );
    });
  });

  describe('downloadQRCode', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockElement.href = '';
      mockElement.download = '';
      mockElement.click = jest.fn();
    });

    it('should create download link and trigger download', () => {
      const qrCodeDataURL = 'data:image/png;base64,mockdata';
      const filename = 'test-qr.png';

      qrCodeService.downloadQRCode(qrCodeDataURL, filename);

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockElement.href).toBe(qrCodeDataURL);
      expect(mockElement.download).toBe(filename);
      expect(mockAppendChild).toHaveBeenCalledWith(mockElement);
      expect(mockElement.click).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalledWith(mockElement);
    });

    it('should use default filename when not provided', () => {
      const qrCodeDataURL = 'data:image/png;base64,mockdata';

      qrCodeService.downloadQRCode(qrCodeDataURL);

      expect(mockElement.download).toBe('darshan-booking-qr.png');
    });
  });

  describe('saveQRCodeToDevice', () => {
    beforeEach(() => {
      // Mock user agent for mobile detection
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true,
      });
    });

    it('should use Web Share API on mobile devices', async () => {
      const mockBlob = new Blob(['mock data'], { type: 'image/png' });
      (global.fetch as jest.Mock).mockResolvedValue({
        blob: () => Promise.resolve(mockBlob),
      });

      const mockShare = jest.fn().mockResolvedValue(undefined);
      (navigator.share as jest.Mock) = mockShare;

      const qrCodeDataURL = 'data:image/png;base64,mockdata';
      const filename = 'test-qr.png';

      await qrCodeService.saveQRCodeToDevice(qrCodeDataURL, filename);

      expect(global.fetch).toHaveBeenCalledWith(qrCodeDataURL);
      expect(mockShare).toHaveBeenCalledWith({
        title: 'Darshan Booking QR Code',
        text: 'Your darshan booking QR code',
        files: [expect.any(File)],
      });
    });

    it('should fallback to download when Web Share API fails', async () => {
      const mockBlob = new Blob(['mock data'], { type: 'image/png' });
      (global.fetch as jest.Mock).mockResolvedValue({
        blob: () => Promise.resolve(mockBlob),
      });

      const mockShare = jest.fn().mockRejectedValue(new Error('Share failed'));
      (navigator.share as jest.Mock) = mockShare;

      const qrCodeDataURL = 'data:image/png;base64,mockdata';

      await qrCodeService.saveQRCodeToDevice(qrCodeDataURL);

      expect(mockElement.click).toHaveBeenCalled();
    });

    it('should use download on desktop devices', async () => {
      // Mock desktop user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true,
      });

      const qrCodeDataURL = 'data:image/png;base64,mockdata';

      await qrCodeService.saveQRCodeToDevice(qrCodeDataURL);

      expect(mockElement.click).toHaveBeenCalled();
    });
  });

  describe('validateQRCodeData', () => {
    it('should validate correct QR code data', () => {
      const validQRData: QRCodeData = {
        bookingId: 'booking-123',
        userId: 'user-456',
        slotTime: '2024-12-25T10:00:00.000Z',
        status: 'confirmed' as BookingStatus,
        verificationCode: 'abc12345'
      };

      expect(qrCodeService.validateQRCodeData(validQRData)).toBe(true);
    });

    it('should reject QR code data with missing fields', () => {
      const invalidQRData = {
        bookingId: 'booking-123',
        userId: 'user-456',
        // missing slotTime, status, verificationCode
      } as QRCodeData;

      expect(qrCodeService.validateQRCodeData(invalidQRData)).toBe(false);
    });

    it('should reject QR code data with invalid date', () => {
      const invalidQRData: QRCodeData = {
        bookingId: 'booking-123',
        userId: 'user-456',
        slotTime: 'invalid-date',
        status: 'confirmed' as BookingStatus,
        verificationCode: 'abc12345'
      };

      expect(qrCodeService.validateQRCodeData(invalidQRData)).toBe(false);
    });

    it('should reject QR code data with invalid verification code format', () => {
      const invalidQRData: QRCodeData = {
        bookingId: 'booking-123',
        userId: 'user-456',
        slotTime: '2024-12-25T10:00:00.000Z',
        status: 'confirmed' as BookingStatus,
        verificationCode: 'invalid' // Should be 8-character hex
      };

      expect(qrCodeService.validateQRCodeData(invalidQRData)).toBe(false);
    });
  });

  describe('parseQRCodeData', () => {
    it('should parse valid QR code string', () => {
      const validQRData: QRCodeData = {
        bookingId: 'booking-123',
        userId: 'user-456',
        slotTime: '2024-12-25T10:00:00.000Z',
        status: 'confirmed' as BookingStatus,
        verificationCode: 'abc12345'
      };
      const qrString = JSON.stringify(validQRData);

      const result = qrCodeService.parseQRCodeData(qrString);

      expect(result).toEqual(validQRData);
    });

    it('should throw error for invalid JSON', () => {
      const invalidQRString = 'invalid json';

      expect(() => qrCodeService.parseQRCodeData(invalidQRString)).toThrow(
        expect.objectContaining({
          code: BOOKING_ERROR_CODES.QR_GENERATION_ERROR
        })
      );
    });

    it('should throw error for invalid QR data structure', () => {
      const invalidQRData = { invalid: 'data' };
      const qrString = JSON.stringify(invalidQRData);

      expect(() => qrCodeService.parseQRCodeData(qrString)).toThrow(
        expect.objectContaining({
          code: BOOKING_ERROR_CODES.QR_GENERATION_ERROR
        })
      );
    });
  });

  describe('verifyQRCode', () => {
    it('should verify QR code with correct verification code', () => {
      const qrData = qrCodeService.createQRCodeData(
        'booking-123',
        'user-456',
        new Date('2024-12-25T10:00:00Z'),
        'confirmed'
      );

      expect(qrCodeService.verifyQRCode(qrData)).toBe(true);
    });

    it('should reject QR code with incorrect verification code', () => {
      const qrData: QRCodeData = {
        bookingId: 'booking-123',
        userId: 'user-456',
        slotTime: '2024-12-25T10:00:00.000Z',
        status: 'confirmed' as BookingStatus,
        verificationCode: 'wrongcode'
      };

      expect(qrCodeService.verifyQRCode(qrData)).toBe(false);
    });

    it('should handle verification errors gracefully', () => {
      const invalidQRData = null as any;

      expect(qrCodeService.verifyQRCode(invalidQRData)).toBe(false);
    });
  });
});