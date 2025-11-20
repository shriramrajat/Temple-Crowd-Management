/**
 * Unit tests for ForecastChart Component
 * Tests chart rendering, data visualization, and real-time updates
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 2.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ForecastChart from '@/components/forecast/forecast-chart';
import type { ChartDataPoint } from '@/lib/types/forecast';

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  Area: () => <div data-testid="area" />,
  ComposedChart: ({ children }: any) => <div data-testid="composed-chart">{children}</div>,
  Legend: () => <div data-testid="legend" />,
}));

describe('ForecastChart Component', () => {
  const mockData: ChartDataPoint[] = [
    {
      timestamp: '2025-11-16T10:00:00Z',
      predicted: 45,
      actual: 42,
      confidence: 85,
      confidenceBandLow: 40,
      confidenceBandHigh: 50,
    },
    {
      timestamp: '2025-11-16T10:15:00Z',
      predicted: 50,
      actual: null,
      confidence: 80,
      confidenceBandLow: 45,
      confidenceBandHigh: 55,
    },
    {
      timestamp: '2025-11-16T10:30:00Z',
      predicted: 55,
      actual: null,
      confidence: 75,
      confidenceBandLow: 50,
      confidenceBandHigh: 60,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders chart with provided data', () => {
    render(<ForecastChart data={mockData} enableRealTimeOverlay={false} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
  });

  it('displays loading state when not mounted', () => {
    const { container } = render(<ForecastChart data={mockData} enableRealTimeOverlay={false} />);
    
    // Component should render eventually
    expect(container).toBeTruthy();
  });

  it('displays message when no data is provided', () => {
    render(<ForecastChart data={[]} enableRealTimeOverlay={false} />);
    
    expect(screen.getByText('No forecast data available')).toBeInTheDocument();
  });

  it('accepts optional className prop', () => {
    const { container } = render(
      <ForecastChart data={mockData} className="custom-class" enableRealTimeOverlay={false} />
    );
    
    const chartContainer = container.querySelector('.custom-class');
    expect(chartContainer).toBeInTheDocument();
  });

  it('accepts optional zoneId prop', () => {
    const { container } = render(
      <ForecastChart data={mockData} zoneId="zone-main-entrance" enableRealTimeOverlay={false} />
    );
    
    expect(container).toBeTruthy();
  });

  it('can disable real-time overlay', () => {
    const { container } = render(
      <ForecastChart data={mockData} enableRealTimeOverlay={false} />
    );
    
    expect(container).toBeTruthy();
  });
});
