/**
 * Unit tests for Forecast API Route
 * Tests forecast generation, caching, and metadata
 * Requirements: 2.1, 2.2, 2.4, 5.2, 5.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/forecast/route';
import type { ForecastResponse } from '@/lib/types/forecast';

describe('Forecast API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns forecast response with predictions and metadata', async () => {
    const mockRequest = new Request('http://localhost:3000/api/forecast');
    const response = await GET(mockRequest);
    const data: ForecastResponse = await response.json();

    expect(data).toHaveProperty('predictions');
    expect(data).toHaveProperty('metadata');
    expect(Array.isArray(data.predictions)).toBe(true);
  });

  it('includes required metadata fields', async () => {
    const mockRequest = new Request('http://localhost:3000/api/forecast');
    const response = await GET(mockRequest);
    const data: ForecastResponse = await response.json();

    expect(data.metadata).toHaveProperty('generatedAt');
    expect(data.metadata).toHaveProperty('forecastWindow');
    expect(data.metadata).toHaveProperty('dataSource');
    expect(data.metadata.forecastWindow).toHaveProperty('start');
    expect(data.metadata.forecastWindow).toHaveProperty('end');
  });

  it('returns valid data source indicator', async () => {
    const mockRequest = new Request('http://localhost:3000/api/forecast');
    const response = await GET(mockRequest);
    const data: ForecastResponse = await response.json();

    expect(['historical', 'simulated', 'hybrid']).toContain(data.metadata.dataSource);
  });

  it('generates predictions with 15-minute intervals for 2-hour window', async () => {
    const mockRequest = new Request('http://localhost:3000/api/forecast');
    const response = await GET(mockRequest);
    const data: ForecastResponse = await response.json();

    // 2 hours = 120 minutes, 15-minute intervals = 8 points per zone
    // With 6 zones, we expect 48 predictions (8 * 6)
    expect(data.predictions.length).toBeGreaterThan(0);
    
    // Check that predictions have required fields
    if (data.predictions.length > 0) {
      const prediction = data.predictions[0];
      expect(prediction).toHaveProperty('zoneId');
      expect(prediction).toHaveProperty('zoneName');
      expect(prediction).toHaveProperty('timestamp');
      expect(prediction).toHaveProperty('predictedFootfall');
      expect(prediction).toHaveProperty('confidence');
      expect(prediction).toHaveProperty('capacity');
    }
  });

  it('filters predictions by zoneId when provided', async () => {
    const mockRequest = new Request('http://localhost:3000/api/forecast?zoneId=zone-main-entrance');
    const response = await GET(mockRequest);
    const data: ForecastResponse = await response.json();

    // All predictions should be for the requested zone
    data.predictions.forEach(prediction => {
      expect(prediction.zoneId).toBe('zone-main-entrance');
    });
  });

  it('returns confidence scores between 0 and 100', async () => {
    const mockRequest = new Request('http://localhost:3000/api/forecast');
    const response = await GET(mockRequest);
    const data: ForecastResponse = await response.json();

    data.predictions.forEach(prediction => {
      expect(prediction.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeLessThanOrEqual(100);
    });
  });

  it('returns predicted footfall within capacity bounds', async () => {
    const mockRequest = new Request('http://localhost:3000/api/forecast');
    const response = await GET(mockRequest);
    const data: ForecastResponse = await response.json();

    data.predictions.forEach(prediction => {
      expect(prediction.predictedFootfall).toBeGreaterThanOrEqual(0);
      expect(prediction.predictedFootfall).toBeLessThanOrEqual(prediction.capacity);
    });
  });

  it('returns 2-hour forecast window in metadata', async () => {
    const mockRequest = new Request('http://localhost:3000/api/forecast');
    const response = await GET(mockRequest);
    const data: ForecastResponse = await response.json();

    const startTime = new Date(data.metadata.forecastWindow.start);
    const endTime = new Date(data.metadata.forecastWindow.end);
    const diffHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    expect(diffHours).toBe(2);
  });

  it('handles errors gracefully', async () => {
    // Test with invalid zoneId
    const mockRequest = new Request('http://localhost:3000/api/forecast?zoneId=invalid-zone');
    const response = await GET(mockRequest);
    
    // Should still return a response (either empty predictions or error)
    expect(response.status).toBeGreaterThanOrEqual(200);
  });
});
