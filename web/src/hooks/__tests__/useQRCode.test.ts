import { renderHook, act } from '@testing-library/react';
import { useQRCode, useQRCodeVerification } from '../useQRCode';
import { QRCodeData, BookingStatus } from '../../types/booking';
import { qrCodeService } from '../../services/qrcode/qrCodeService';

// Mock the QR code service
jest.mock('../../services/qrcode/qrCodeService', () => ({
  qrCodeService: {
    validateQRCodeData: jest.fn(),
    generateQRCode: jest.fn(),
    downloadQRCode: jest.fn(),
    saveQRCodeToDevice: jest.fn(),
    parseQRCodeData: jest.fn(),
    verifyQRCode: jest.fn(),
  },
}));

const mockQRCodeService = qrCodeService as jest.Mocked<typeof qrCodeService>;

describe('useQRCode', () => {
  const mockQRData: QRCodeData = {
    bookingId: 'booking-123',
    userId: 'user-456',
    slotTime: '2024-12-25T10:00:00.000Z',
    status: 'confirmed' as BookingStatus,
    verificationCode: 'abc12345'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useQRCode());

      expect(result.current.qrCodeUrl).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isReady).toBe(false);
    });
  });

  describe('generateQRCode', () => {
    it('should generate QR code successfully', async () => {
      const mockDataURL = 'data:image/png;base64,mockdata';
      mockQRCodeService.validateQRCodeData.mockReturnValue(true);
      mockQRCodeService.generateQRCode.mockResolvedValue(mockDataURL);

      const { result } = renderHook(() => useQRCode());

      await act(async () => {
        await result.current.generateQRCode(mockQRData);
      });

      expect(result.current.qrCodeUrl).toBe(mockDataURL);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isReady).toBe(true);
      expect(mockQRCodeService.validateQRCodeData).toHaveBeenCalledWith(mockQRData);
      expect(mockQRCodeService.generateQRCode).toHaveBeenCalledWith(mockQRData);
    });

    it('should handle validation errors', async () => {
      mockQRCodeService.validateQRCodeData.mockReturnValue(false);

      const { result } = renderHook(() => useQRCode());

      await act(async () => {
        await result.current.generateQRCode(mockQRData);
      });

      expect(result.current.qrCodeUrl).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toEqual({
        code: 'qr_generation_error',
        message: 'Failed to generate QR code',
        details: expect.any(Error)
      });
      expect(result.current.isReady).toBe(false);
    });

    it('should handle generation errors', async () => {
      const mockError = new Error('Generation failed');
      mockQRCodeService.validateQRCodeData.mockReturnValue(true);
      mockQRCodeService.generateQRCode.mockRejectedValue(mockError);

      const { result } = renderHook(() => useQRCode());

      await act(async () => {
        await result.current.generateQRCode(mockQRData);
      });

      expect(result.current.qrCodeUrl).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toEqual({
        code: 'qr_generation_error',
        message: 'Failed to generate QR code',
        details: mockError
      });
      expect(result.current.isReady).toBe(false);
    });

    it('should handle BookingError instances correctly', async () => {
      const mockBookingError = new Error('Custom error message') as any;
      mockBookingError.code = 'custom_error';
      mockBookingError.details = { custom: 'details' };
      
      mockQRCodeService.validateQRCodeData.mockReturnValue(true);
      mockQRCodeService.generateQRCode.mockRejectedValue(mockBookingError);

      const { result } = renderHook(() => useQRCode());

      await act(async () => {
        await result.current.generateQRCode(mockQRData);
      });

      expect(result.current.error).toEqual(mockBookingError);
    });

    it('should set loading state during generation', async () => {
      mockQRCodeService.validateQRCodeData.mockReturnValue(true);
      mockQRCodeService.generateQRCode.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('data:image/png;base64,mockdata'), 100))
      );

      const { result } = renderHook(() => useQRCode());

      act(() => {
        result.current.generateQRCode(mockQRData);
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.isReady).toBe(false);
    });
  });

  describe('downloadQRCode', () => {
    it('should download QR code when available', async () => {
      const mockDataURL = 'data:image/png;base64,mockdata';
      mockQRCodeService.validateQRCodeData.mockReturnValue(true);
      mockQRCodeService.generateQRCode.mockResolvedValue(mockDataURL);

      const { result } = renderHook(() => useQRCode());

      // First generate a QR code
      await act(async () => {
        await result.current.generateQRCode(mockQRData);
      });

      // Then download it
      act(() => {
        result.current.downloadQRCode('custom-filename.png');
      });

      expect(mockQRCodeService.downloadQRCode).toHaveBeenCalledWith(
        mockDataURL,
        'custom-filename.png'
      );
    });

    it('should use default filename when not provided', async () => {
      const mockDataURL = 'data:image/png;base64,mockdata';
      mockQRCodeService.validateQRCodeData.mockReturnValue(true);
      mockQRCodeService.generateQRCode.mockResolvedValue(mockDataURL);

      const { result } = renderHook(() => useQRCode());

      await act(async () => {
        await result.current.generateQRCode(mockQRData);
      });

      act(() => {
        result.current.downloadQRCode();
      });

      expect(mockQRCodeService.downloadQRCode).toHaveBeenCalledWith(
        mockDataURL,
        expect.stringMatching(/^darshan-booking-\d+\.png$/)
      );
    });

    it('should set error when no QR code is available', () => {
      const { result } = renderHook(() => useQRCode());

      act(() => {
        result.current.downloadQRCode();
      });

      expect(result.current.error).toEqual({
        code: 'qr_generation_error',
        message: 'No QR code available for download',
        details: 'Generate a QR code first before attempting to download'
      });
    });

    it('should handle download errors', async () => {
      const mockDataURL = 'data:image/png;base64,mockdata';
      const mockError = new Error('Download failed');
      mockQRCodeService.validateQRCodeData.mockReturnValue(true);
      mockQRCodeService.generateQRCode.mockResolvedValue(mockDataURL);
      mockQRCodeService.downloadQRCode.mockImplementation(() => {
        throw mockError;
      });

      const { result } = renderHook(() => useQRCode());

      await act(async () => {
        await result.current.generateQRCode(mockQRData);
      });

      act(() => {
        result.current.downloadQRCode();
      });

      expect(result.current.error).toEqual({
        code: 'qr_generation_error',
        message: 'Failed to download QR code',
        details: mockError
      });
    });
  });

  describe('saveQRCode', () => {
    it('should save QR code when available', async () => {
      const mockDataURL = 'data:image/png;base64,mockdata';
      mockQRCodeService.validateQRCodeData.mockReturnValue(true);
      mockQRCodeService.generateQRCode.mockResolvedValue(mockDataURL);
      mockQRCodeService.saveQRCodeToDevice.mockResolvedValue();

      const { result } = renderHook(() => useQRCode());

      await act(async () => {
        await result.current.generateQRCode(mockQRData);
      });

      await act(async () => {
        await result.current.saveQRCode('custom-filename.png');
      });

      expect(mockQRCodeService.saveQRCodeToDevice).toHaveBeenCalledWith(
        mockDataURL,
        'custom-filename.png'
      );
    });

    it('should set error when no QR code is available', async () => {
      const { result } = renderHook(() => useQRCode());

      await act(async () => {
        await result.current.saveQRCode();
      });

      expect(result.current.error).toEqual({
        code: 'qr_generation_error',
        message: 'No QR code available for saving',
        details: 'Generate a QR code first before attempting to save'
      });
    });

    it('should handle save errors', async () => {
      const mockDataURL = 'data:image/png;base64,mockdata';
      const mockError = new Error('Save failed');
      mockQRCodeService.validateQRCodeData.mockReturnValue(true);
      mockQRCodeService.generateQRCode.mockResolvedValue(mockDataURL);
      mockQRCodeService.saveQRCodeToDevice.mockRejectedValue(mockError);

      const { result } = renderHook(() => useQRCode());

      await act(async () => {
        await result.current.generateQRCode(mockQRData);
      });

      await act(async () => {
        await result.current.saveQRCode();
      });

      expect(result.current.error).toEqual({
        code: 'qr_generation_error',
        message: 'Failed to save QR code',
        details: mockError
      });
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      mockQRCodeService.validateQRCodeData.mockReturnValue(false);

      const { result } = renderHook(() => useQRCode());

      // Generate an error
      await act(async () => {
        await result.current.generateQRCode(mockQRData);
      });

      expect(result.current.error).not.toBeNull();

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state', async () => {
      const mockDataURL = 'data:image/png;base64,mockdata';
      mockQRCodeService.validateQRCodeData.mockReturnValue(true);
      mockQRCodeService.generateQRCode.mockResolvedValue(mockDataURL);

      const { result } = renderHook(() => useQRCode());

      // Generate QR code
      await act(async () => {
        await result.current.generateQRCode(mockQRData);
      });

      expect(result.current.qrCodeUrl).toBe(mockDataURL);
      expect(result.current.isReady).toBe(true);

      // Reset state
      act(() => {
        result.current.reset();
      });

      expect(result.current.qrCodeUrl).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isReady).toBe(false);
    });
  });

  describe('getQrCodeUrl', () => {
    it('should return QR code URL when ready', async () => {
      const mockDataURL = 'data:image/png;base64,mockdata';
      mockQRCodeService.validateQRCodeData.mockReturnValue(true);
      mockQRCodeService.generateQRCode.mockResolvedValue(mockDataURL);

      const { result } = renderHook(() => useQRCode());

      await act(async () => {
        await result.current.generateQRCode(mockQRData);
      });

      expect(result.current.qrCodeUrl).toBe(mockDataURL);
    });

    it('should return null when loading', () => {
      mockQRCodeService.validateQRCodeData.mockReturnValue(true);
      mockQRCodeService.generateQRCode.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('data:image/png;base64,mockdata'), 100))
      );

      const { result } = renderHook(() => useQRCode());

      act(() => {
        result.current.generateQRCode(mockQRData);
      });

      expect(result.current.qrCodeUrl).toBeNull();
    });

    it('should return null when error exists', async () => {
      mockQRCodeService.validateQRCodeData.mockReturnValue(false);

      const { result } = renderHook(() => useQRCode());

      await act(async () => {
        await result.current.generateQRCode(mockQRData);
      });

      expect(result.current.qrCodeUrl).toBeNull();
    });
  });
});

describe('useQRCodeVerification', () => {
  const mockQRData: QRCodeData = {
    bookingId: 'booking-123',
    userId: 'user-456',
    slotTime: '2024-12-25T10:00:00.000Z',
    status: 'confirmed' as BookingStatus,
    verificationCode: 'abc12345'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useQRCodeVerification());

      expect(result.current.verificationResult).toEqual({
        isValid: false,
        data: null,
        error: null
      });
    });
  });

  describe('verifyQRCode', () => {
    it('should verify valid QR code successfully', () => {
      const qrString = JSON.stringify(mockQRData);
      mockQRCodeService.parseQRCodeData.mockReturnValue(mockQRData);
      mockQRCodeService.verifyQRCode.mockReturnValue(true);

      const { result } = renderHook(() => useQRCodeVerification());

      act(() => {
        result.current.verifyQRCode(qrString);
      });

      expect(result.current.verificationResult).toEqual({
        isValid: true,
        data: mockQRData,
        error: null
      });
      expect(mockQRCodeService.parseQRCodeData).toHaveBeenCalledWith(qrString);
      expect(mockQRCodeService.verifyQRCode).toHaveBeenCalledWith(mockQRData);
    });

    it('should handle invalid QR code verification', () => {
      const qrString = JSON.stringify(mockQRData);
      mockQRCodeService.parseQRCodeData.mockReturnValue(mockQRData);
      mockQRCodeService.verifyQRCode.mockReturnValue(false);

      const { result } = renderHook(() => useQRCodeVerification());

      act(() => {
        result.current.verifyQRCode(qrString);
      });

      expect(result.current.verificationResult).toEqual({
        isValid: false,
        data: mockQRData,
        error: 'QR code verification failed'
      });
    });

    it('should handle parsing errors', () => {
      const invalidQRString = 'invalid json';
      const mockError = new Error('Invalid JSON');
      mockQRCodeService.parseQRCodeData.mockImplementation(() => {
        throw mockError;
      });

      const { result } = renderHook(() => useQRCodeVerification());

      act(() => {
        result.current.verifyQRCode(invalidQRString);
      });

      expect(result.current.verificationResult).toEqual({
        isValid: false,
        data: null,
        error: 'Invalid JSON'
      });
    });

    it('should handle non-Error exceptions', () => {
      const invalidQRString = 'invalid json';
      mockQRCodeService.parseQRCodeData.mockImplementation(() => {
        throw 'String error';
      });

      const { result } = renderHook(() => useQRCodeVerification());

      act(() => {
        result.current.verifyQRCode(invalidQRString);
      });

      expect(result.current.verificationResult).toEqual({
        isValid: false,
        data: null,
        error: 'Invalid QR code format'
      });
    });
  });

  describe('clearVerification', () => {
    it('should clear verification result', () => {
      const qrString = JSON.stringify(mockQRData);
      mockQRCodeService.parseQRCodeData.mockReturnValue(mockQRData);
      mockQRCodeService.verifyQRCode.mockReturnValue(true);

      const { result } = renderHook(() => useQRCodeVerification());

      // First verify a QR code
      act(() => {
        result.current.verifyQRCode(qrString);
      });

      expect(result.current.verificationResult.isValid).toBe(true);

      // Then clear verification
      act(() => {
        result.current.clearVerification();
      });

      expect(result.current.verificationResult).toEqual({
        isValid: false,
        data: null,
        error: null
      });
    });
  });
});