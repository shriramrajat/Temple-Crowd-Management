/**
 * Crowd Heatmap Page
 * 
 * Displays real-time crowd density visualization for the temple complex.
 * Integrates the CrowdHeatmap component with live IoT sensor data.
 * 
 * Features:
 * - Real-time data updates every 3 seconds
 * - Color-coded density visualization (green/yellow/red)
 * - Interactive zone details
 * - Responsive design for all screen sizes
 * - Error handling and retry logic
 * - Error boundary for component errors
 */

import { CrowdHeatmap } from '@/components/crowd-heatmap';
import { ErrorBoundary } from '@/components/error-boundary';
import Link from 'next/link';

export default function HeatmapPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Live Crowd Heatmap
          </h1>
          <p className="text-muted-foreground">
            Real-time crowd density visualization across temple zones with auto-refresh
          </p>
        </div>

        {/* Heatmap Component with Error Boundary */}
        <ErrorBoundary>
          <CrowdHeatmap 
            refreshInterval={3000}
            maxCapacity={500}
            className="mb-8"
          />
        </ErrorBoundary>

        {/* Legend Section */}
        <div className="bg-white rounded-lg border-2 border-orange-200 p-6 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">
            Density Legend
          </h3>
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-md shadow-sm"></div>
              <div>
                <p className="font-medium">Low Density</p>
                <p className="text-xs text-muted-foreground">0-33% capacity</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-md shadow-sm"></div>
              <div>
                <p className="font-medium">Medium Density</p>
                <p className="text-xs text-muted-foreground">33-66% capacity</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-500 rounded-md shadow-sm"></div>
              <div>
                <p className="font-medium">High Density</p>
                <p className="text-xs text-muted-foreground">66-100% capacity</p>
              </div>
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-muted-foreground mb-4">
              💡 <strong>Tip:</strong> Click on any zone to view detailed information including exact footfall count, 
              density percentage, and trend indicators.
            </p>
            <div className="flex gap-3">
              <Link 
                href="/forecast"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                📊 View Crowd Forecast
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
