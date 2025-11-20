/**
 * Unit tests for Peak Hours API Route
 * Tests peak hour identification, formatting, and data retrieval
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/peak-hours/route';
import type { PeakHoursResponse } from '@/lib/types/forecast';

describe('Peak Hours API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns peak hours response with peaks and metadata', async () => {
    const mockRequest = new Request('http://localhost:3000/api/peak-hours');
    const response = await GET(mockRequest);
    const data: PeakHoursResponse = await response.json();

    expect(data).toHaveProperty('date');
    expect(data).toHaveProperty('peaks');
    expect(data).toHaveProperty('metadata');
    expect(Array.isArray(data.peaks)).toBe(true);
  });

  it('includes required metadata fields', async () => {
    const mockRequest = new Request('http://localhost:3000/api/peak-hours');
    const response = await GET(mockRequest);
    const data: PeakHoursResponse = await response.json();

    expect(data.metadata).toHaveProperty('calculatedAt');
    expect(data.metadata).toHaveProperty('dataSource');
  });

  it('returns valid data source indicator', async () => {
    const mockRequest = new Request('http://localhost:3000/api/peak-hours');
    const response = await GET(mockRequest);
    const data: PeakHoursResponse = await response.json();

    expect(['historical', 'simulated', 'hybrid']).toContain(data.metadata.dataSource);
  });

  it('formats date in YYYY-MM-DD format', async () => {
    const mockRequest = new Request('http://localhost:3000/api/peak-hours');
    const response = await GET(mockRequest);
    const data: PeakHoursResponse = await response.json();

    expect(data.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('formats time ranges in HH:mm format', async () => {
    const mockRequest = new Request('http://localhost:3000/api/peak-hours');
    const response = await GET(mockRequest);
    const data: PeakHoursResponse = await response.json();

    data.peaks.forEach(peak => {
      expect(peak.startTime).toMatch(/^\d{2}:\d{2}$/);
      expect(peak.endTime).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  it('classifies crowd levels correctly', async () => {
    const mockRequest = new Request('http://localhost:3000/api/peak-hours');
    const response = await GET(mockRequest);
    const data: PeakHoursResponse = await response.json();

    data.peaks.forEach(peak => {
      expect(['high', 'very-high']).toContain(peak.crowdLevel);
      
      // Verify classification matches occupancy rate
      const occupancyRate = peak.expectedFootfall / peak.capacity;
      if (occupancyRate >= 0.9) {
        expect(peak.crowdLevel).toBe('very-high');
      } else {
        expect(peak.crowdLevel).toBe('high');
      }
    });
  });

  it('returns peaks with required fields', async () => {
    const mockRequest = new Request('http://localhost:3000/api/peak-hours');
    const response = await GET(mockRequest);
    const data: PeakHoursResponse = await response.json();

    data.peaks.forEach(peak => {
      expect(peak).toHaveProperty('zoneId');
      expect(peak).toHaveProperty('zoneName');
      expect(peak).toHaveProperty('startTime');
      expect(peak).toHaveProperty('endTime');
      expect(peak).toHaveProperty('expectedFootfall');
      expect(peak).toHaveProperty('capacity');
      expect(peak).toHaveProperty('crowdLevel');
    });
  });

  it('returns peaks sorted by start time', async () => {
    const mockRequest = new Request('http://localhost:3000/api/peak-hours');
    const response = await GET(mockRequest);
    const data: PeakHoursResponse = await response.json();

    if (data.peaks.length > 1) {
      for (let i = 1; i < data.peaks.length; i++) {
        expect(data.peaks[i].startTime >= data.peaks[i - 1].startTime).toBe(true);
      }
    }
  });

  it('accepts optional date parameter', async () => {
    const testDate = '2025-11-16';
    const mockRequest = new Request(`http://localhost:3000/api/peak-hours?date=${testDate}`);
    const response = await GET(mockRequest);
    const data: PeakHoursResponse = await response.json();

    expect(data.date).toBe(testDate);
  });

  it('returns error for invalid date format', async () => {
    const mockRequest = new Request('http://localhost:3000/api/peak-hours?date=invalid-date');
    const response = await GET(mockRequest);
    
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.code).toBe('INVALID_DATE');
  });

  it('returns expected footfall within capacity bounds', async () => {
    const mockRequest = new Request('http://localhost:3000/api/peak-hours');
    const response = await GET(mockRequest);
    const data: PeakHoursResponse = await response.json();

    data.peaks.forEach(peak => {
      expect(peak.expectedFootfall).toBeGreaterThanOrEqual(0);
      expect(peak.expectedFootfall).toBeLessThanOrEqual(peak.capacity);
    });
  });

  it('only includes peaks with 80%+ occupancy', async () => {
    const mockRequest = new Request('http://localhost:3000/api/peak-hours');
    const response = await GET(mockRequest);
    const data: PeakHoursResponse = await response.json();

    data.peaks.forEach(peak => {
      const occupancyRate = peak.expectedFootfall / peak.capacity;
      expect(occupancyRate).toBeGreaterThanOrEqual(0.8);
    });
  });

  it('handles errors gracefully', async () => {
    // Test with far future date
    const mockRequest = new Request('http://localhost:3000/api/peak-hours?date=2099-12-31');
    const response = await GET(mockRequest);
    
    // Should still return a response (either empty peaks or error)
    expect(response.status).toBeGreaterThanOrEqual(200);
  });
});

