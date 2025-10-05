import { renderHook, act } from '@testing-library/react';
import { useQRCode, useQRCodeVerification } from '../useQRCode';
import { QRCodeData, BookingStatus } from '../../../../types/booking';

// Mock dependencies
jest.mock('../../../../hooks/useErrorHandler', () => ({
  useErrorHandler: jest.fn(),
}));

// Mock dynamic import
const mockQRCodeService = {
  validateQRCodeData: jest.fn(),
  generateQRCode: jest.fn(),
  parseQRCodeData: jest.fn(),
  verifyQRCode: jest.fn(),
};

// Mock the dynamic import in the hook
jest.mock('../../../../services/qrcode/qrCodeService', () => ({
  qrCodeService: mockQRCodeService,
}));

// Import mocked modules
import { useErrorHandler } from '../../../../hooks/useErrorHandler';

const mockUseErrorHandler = useErrorHandler as jest.MockedFunction<typeof useErrorHandler>;

describe('useQRCode', () => {
  const mockQRData: QRCodeData = {
    bookingId: 'booking-123',
    userId: 'user-456',
    slotTime: '2024-12-25T10:00:00.000Z',
    status: 'confirmed' as BookingStatus,
    verificationCode: 'abc12345'
  };

  const mockErrorHandler = {
    captureError: jest.fn(),
    handleAsyncError: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseErrorHandler.mockReturnValue(mockErrorHandler);
    
    // Mock handleAsyncError to execute the function by default
    mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => {
      try {
        return await fn();
      } catch (error) {
        return null;
      }
    });

    // Mock document methods for download functionality
    Object.defineProperty(document, 'createElement', {
      value: jest.fn(() => ({
        href: '',
        download: '',
        click: jest.fn(),
      })),
      writable: true,
    });

    Object.defineProperty(document.body, 'appendChild', {
      value: jest.fn(),
      writable: true,
    });

    Object.defineProperty(document.body, 'removeChild', {
      value: jest.fn(),
      writable: true,
    });

    // Mock fetch for saveQRCode
    global.fetch = jest.fn();
    
    // Mock navigator.share
    Object.defineProperty(navigator, 'share', {
      value: jest.fn(),
      writable: true,
    });

    Object.defineProperty(navigator, 'canShare', {
      value: jest.fn(),
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useQRCode());

      expect(result.current.qrCodeUrl).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isReady).toBe(false);
      expect(result.current.canDownload).toBe(false);
    });
  });

  describe('generateQRCode', () => {
    it('should generate QR code successfully with lazy loading', async () => {
      const mockDataURL = 'data:image/png;base64,mockdata';
      mockQRCodeService.validateQRCodeData.mockReturnValue(true);
      mockQRCodeService.generateQRCode.mockResolvedValue(mockDataURL);
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());

      const { result } = renderHook(() => useQRCode());

      await act(async () => {
        await result.current.generateQRCode(mockQRData);
      });

      expect(result.current.qrCodeUrl).toBe(mockDataURL);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isReady).toBe(true);
      expect(result.current.canDownload).toBe(true);
    });

    it('should handle validation errors', async () => {
      mockQRCodeService.validateQRCodeData.mockReturnValue(false);
      mockErrorHandler.handleAsyncError.mockResolvedValue(null);

      const { result } = renderHook(() => useQRCode());

      await act(async () => {
        await result.current.generateQRCode(mockQRData);
      });

      expect(result.current.qrCodeUrl).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toEqual({
        code: 'qr_generation_error',
        message: 'Failed to generate QR code. Please try again.'
      });
      expect(result.current.isReady).toBe(false);
    });

    it('should handle generation errors', async () => {
      mockQRCodeService.validateQRCodeData.mockReturnValue(true);
      mockQRCodeService.generateQRCode.mockRejectedValue(new Error('Generation failed'));
      mockErrorHandler.handleAsyncError.mockResolvedValue(null);

      const { result } = renderHook(() => useQRCode());

      await act(async () => {
        await result.current.generateQRCode(mockQRData);
      });

      expect(result.current.qrCodeUrl).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toEqual({
        code: 'qr_generation_error',
        message: 'Failed to generate QR code. Please try again.'
      });
      expect(result.current.isReady).toBe(false);
    });

    it('should handle lazy loading service errors', async () => {
      // Mock import failure
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => {
        try {
          return await fn();
        } catch (error) {
          throw new Error('Failed to load QR code service');
        }
      });

      const { result } = renderHook(() => useQRCode());

      await act(async () => {
        await result.current.generateQRCode(mockQRData);
      });

      expect(result.current.error).toEqual({
        code: 'qr_generation_error',
        message: 'Failed to generate QR code. Please try again.'
      });
    });

    it('should set loading state during generation', async () => {
      let resolvePromise: (value: string) => void;
      const promise = new Promise<string>((resolve) => {
        resolvePromise = resolve;
      });
      
      mockQRCodeService.validateQRCodeData.mockReturnValue(true);
      mockQRCodeService.generateQRCode.mockReturnValue(promise);
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());

      const { result } = renderHook(() => useQRCode());

      act(() => {
        result.current.generateQRCode(mockQRData);
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.isReady).toBe(false);

      await act(async () => {
        resolvePromise!('data:image/png;base64,mockdata');
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.isReady).toBe(true);
    });
  });

  describe('downloadQRCode', () => {
    it('should download QR code when available', async () => {
      const mockDataURL = 'data:image/png;base64,mockdata';
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      };
      
      (document.createElement as jest.Mock).mockReturnValue(mockLink);
      mockQRCodeService.validateQRCodeData.mockReturnValue(true);
      mockQRCodeService.generateQRCode.mockResolvedValue(mockDataURL);
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());

      const { result } = renderHook(() => useQRCode());

      // First generate a QR code
      await act(async () => {
        await result.current.generateQRCode(mockQRData);
      });

      // Then download it
      act(() => {
        result.current.downloadQRCode('custom-filename.png');
      });

      expect(mockLink.href).toBe(mockDataURL);
      expect(mockLink.download).toBe('custom-filename.png');
      expect(mockLink.click).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);
    });

    it('should use default filename when not provided', async () => {
      const mockDataURL = 'data:image/png;base64,mockdata';
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      };
      
      (document.createElement as jest.Mock).mockReturnValue(mockLink);
      mockQRCodeService.validateQRCodeData.mockReturnValue(true);
      mockQRCodeService.generateQRCode.mockResolvedValue(mockDataURL);
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());

      const { result } = renderHook(() => useQRCode());

      await act(async () => {
        await result.current.generateQRCode(mockQRData);
      });

      act(() => {
        result.current.downloadQRCode();
      });

      expect(mockLink.download).toMatch(/^darshan-booking-\d+\.png$/);
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
      
      (document.createElement as jest.Mock).mockImplementation(() => {
        throw mockError;
      });
      
      mockQRCodeService.validateQRCodeData.mockReturnValue(true);
      mockQRCodeService.generateQRCode.mockResolvedValue(mockDataURL);
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());

      const { result } = renderHook(() => useQRCode());

      await act(async () => {
        await result.current.generateQRCode(mockQRData);
      });

      act(() => {
        result.current.downloadQRCode();
      });

      expect(result.current.error).toEqual({
        code: 'qr_generation_error',
        message: 'Failed to download QR code. Please try again.'
      });
      expect(mockErrorHandler.captureError).toHaveBeenCalledWith(
        mockError,
        { operation: 'downloadQRCode', filename: expect.any(String) }
      );
    });
  });

  describe('saveQRCode', () => {
    it('should save QR code using Web Share API when available', async () => {
      const mockDataURL = 'data:image/png;base64,mockdata';
      const mockBlob = new Blob(['mock'], { type: 'image/png' });
      const mockFile = new File([mockBlob], 'test.png', { type: 'image/png' });
      
      (global.fetch as jest.Mock).mockResolvedValue({
        blob: () => Promise.resolve(mockBlob)
      });
      
      (navigator.canShare as jest.Mock).mockReturnValue(true);
      (navigator.share as jest.Mock).mockResolvedValue(undefined);
      
      mockQRCodeService.validateQRCodeData.mockReturnValue(true);
      mockQRCodeService.generateQRCode.mockResolvedValue(mockDataURL);
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());

      const { result } = renderHook(() => useQRCode());

      await act(async () => {
        await result.current.generateQRCode(mockQRData);
      });

      await act(async () => {
        await result.current.saveQRCode('custom-filename.png');
      });

      expect(global.fetch).toHaveBeenCalledWith(mockDataURL);
      expect(navigator.share).toHaveBeenCalledWith({
        title: 'Darshan Booking QR Code',
        text: 'Your darshan booking QR code',
        files: expect.any(Array)
      });
    });

    it('should fallback to download when Web Share API is not available', async () => {
      const mockDataURL = 'data:image/png;base64,mockdata';
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      };
      
      (document.createElement as jest.Mock).mockReturnValue(mockLink);
      (navigator.canShare as jest.Mock).mockReturnValue(false);
      
      mockQRCodeService.validateQRCodeData.mockReturnValue(true);
      mockQRCodeService.generateQRCode.mockResolvedValue(mockDataURL);
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());

      const { result } = renderHook(() => useQRCode());

      await act(async () => {
        await result.current.generateQRCode(mockQRData);
      });

      await act(async () => {
        await result.current.saveQRCode('custom-filename.png');
      });

      expect(mockLink.click).toHaveBeenCalled();
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
      mockQRCodeService.validateQRCodeData.mockReturnValue(true);
      mockQRCodeService.generateQRCode.mockResolvedValue(mockDataURL);
      mockErrorHandler.handleAsyncError.mockResolvedValue(null);

      const { result } = renderHook(() => useQRCode());

      await act(async () => {
        await result.current.generateQRCode(mockQRData);
      });

      await act(async () => {
        await result.current.saveQRCode();
      });

      expect(result.current.error).toEqual({
        code: 'qr_generation_error',
        message: 'Failed to save QR code. Please try again.'
      });
    });
  });

  describe('Utility functions', () => {
    it('should clear error state', async () => {
      mockQRCodeService.validateQRCodeData.mockReturnValue(false);
      mockErrorHandler.handleAsyncError.mockResolvedValue(null);

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

    it('should reset all state', async () => {
      const mockDataURL = 'data:image/png;base64,mockdata';
      mockQRCodeService.validateQRCodeData.mockReturnValue(true);
      mockQRCodeService.generateQRCode.mockResolvedValue(mockDataURL);
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());

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
      expect(result.current.canDownload).toBe(false);
    });
  });

  describe('Computed properties', () => {
    it('should compute isReady correctly', async () => {
      const mockDataURL = 'data:image/png;base64,mockdata';
      mockQRCodeService.validateQRCodeData.mockReturnValue(true);
      mockQRCodeService.generateQRCode.mockResolvedValue(mockDataURL);
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());

      const { result } = renderHook(() => useQRCode());

      expect(result.current.isReady).toBe(false);

      await act(async () => {
        await result.current.generateQRCode(mockQRData);
      });

      expect(result.current.isReady).toBe(true);
    });

    it('should compute canDownload correctly', async () => {
      const mockDataURL = 'data:image/png;base64,mockdata';
      mockQRCodeService.validateQRCodeData.mockReturnValue(true);
      mockQRCodeService.generateQRCode.mockResolvedValue(mockDataURL);
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());

      const { result } = renderHook(() => useQRCode());

      expect(result.current.canDownload).toBe(false);

      await act(async () => {
        await result.current.generateQRCode(mockQRData);
      });

      expect(result.current.canDownload).toBe(true);
    });

    it('should return null for qrCodeUrl when not ready', () => {
      const { result } = renderHook(() => useQRCode());

      expect(result.current.qrCodeUrl).toBeNull();
      expect(result.current.isReady).toBe(false);
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

  const mockErrorHandler = {
    captureError: jest.fn(),
    handleAsyncError: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseErrorHandler.mockReturnValue(mockErrorHandler);
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useQRCodeVerification());

      expect(result.current.verificationResult).toEqual({
        isValid: false,
        data: null,
        error: null,
        loading: false
      });
    });
  });

  describe('verifyQRCode', () => {
    it('should verify valid QR code successfully', async () => {
      const qrString = JSON.stringify(mockQRData);
      mockQRCodeService.parseQRCodeData.mockReturnValue(mockQRData);
      mockQRCodeService.verifyQRCode.mockReturnValue(true);
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());

      const { result } = renderHook(() => useQRCodeVerification());

      await act(async () => {
        await result.current.verifyQRCode(qrString);
      });

      expect(result.current.verificationResult).toEqual({
        isValid: true,
        data: mockQRData,
        error: null,
        loading: false
      });
    });

    it('should handle invalid QR code verification', async () => {
      const qrString = JSON.stringify(mockQRData);
      mockQRCodeService.parseQRCodeData.mockReturnValue(mockQRData);
      mockQRCodeService.verifyQRCode.mockReturnValue(false);
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());

      const { result } = renderHook(() => useQRCodeVerification());

      await act(async () => {
        await result.current.verifyQRCode(qrString);
      });

      expect(result.current.verificationResult).toEqual({
        isValid: false,
        data: mockQRData,
        error: 'QR code verification failed',
        loading: false
      });
    });

    it('should handle verification errors', async () => {
      const qrString = 'invalid';
      mockErrorHandler.handleAsyncError.mockResolvedValue(null);

      const { result } = renderHook(() => useQRCodeVerification());

      await act(async () => {
        await result.current.verifyQRCode(qrString);
      });

      expect(result.current.verificationResult).toEqual({
        isValid: false,
        data: null,
        error: 'Failed to verify QR code',
        loading: false
      });
    });

    it('should set loading state during verification', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      mockErrorHandler.handleAsyncError.mockReturnValue(promise);

      const { result } = renderHook(() => useQRCodeVerification());

      act(() => {
        result.current.verifyQRCode('test');
      });

      expect(result.current.verificationResult.loading).toBe(true);

      await act(async () => {
        resolvePromise!({ isValid: true, data: mockQRData });
      });

      expect(result.current.verificationResult.loading).toBe(false);
    });
  });

  describe('clearVerification', () => {
    it('should clear verification result', async () => {
      const qrString = JSON.stringify(mockQRData);
      mockQRCodeService.parseQRCodeData.mockReturnValue(mockQRData);
      mockQRCodeService.verifyQRCode.mockReturnValue(true);
      mockErrorHandler.handleAsyncError.mockImplementation(async (fn) => await fn());

      const { result } = renderHook(() => useQRCodeVerification());

      // First verify a QR code
      await act(async () => {
        await result.current.verifyQRCode(qrString);
      });

      expect(result.current.verificationResult.isValid).toBe(true);

      // Then clear verification
      act(() => {
        result.current.clearVerification();
      });

      expect(result.current.verificationResult).toEqual({
        isValid: false,
        data: null,
        error: null,
        loading: false
      });
    });
  });
});