/**
 * Forecast Dashboard Page
 * 
 * Displays AI-powered crowd forecasting with 2-hour ahead predictions,
 * expected vs actual comparisons, and peak hours identification.
 * 
 * Features:
 * - 2-hour ahead crowd predictions with confidence scores
 * - Expected vs actual crowd level visualization
 * - Peak hours identification and display
 * - Auto-refresh mechanism (5 min for forecast, 30s for actual data)
 * - Data source indicators (historical/simulated/hybrid)
 * - Error handling with user-friendly messages
 * - Responsive design for all screen sizes
 * 
 * Requirements: 3.1, 3.2, 3.3
 */

import { Metadata } from 'next'
import ForecastDashboard from '@/components/forecast/forecast-dashboard'
import ForecastErrorBoundary from '@/components/forecast/forecast-error-boundary'
import Link from 'next/link'
import { TrendingUp, Clock, BarChart3 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Crowd Forecast - ShraddhaSecure',
  description: 'AI-powered crowd forecasting with 2-hour ahead predictions and peak hours identification for temple visits',
  keywords: ['crowd forecast', 'temple predictions', 'peak hours', 'AI predictions', 'crowd management'],
  openGraph: {
    title: 'Crowd Forecast - ShraddhaSecure',
    description: 'View AI-powered crowd predictions and plan your temple visit during less crowded times',
    type: 'website',
  },
}

export default function ForecastPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">
              Crowd Forecast
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            AI-powered predictions to help you plan your visit during less crowded times
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border-2 border-orange-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">2-Hour Forecast</p>
                <p className="text-xs text-muted-foreground">Updated every 5 minutes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border-2 border-orange-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Real-time Comparison</p>
                <p className="text-xs text-muted-foreground">Expected vs actual data</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border-2 border-orange-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Peak Hours</p>
                <p className="text-xs text-muted-foreground">Avoid crowded times</p>
              </div>
            </div>
          </div>
        </div>

        {/* Forecast Dashboard with Error Boundary */}
        <ForecastErrorBoundary>
          <ForecastDashboard showPeakHours={true} />
        </ForecastErrorBoundary>

        {/* Additional Information Section */}
        <div className="mt-8 bg-white rounded-lg border-2 border-orange-200 p-6 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">
            How Predictions Work
          </h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Historical Analysis:</strong> Our AI analyzes past crowd patterns 
              from the same day of week and time period to generate accurate predictions.
            </p>
            <p>
              <strong className="text-foreground">Confidence Scores:</strong> Each prediction includes a confidence 
              level based on data availability and pattern consistency. Higher confidence means more reliable predictions.
            </p>
            <p>
              <strong className="text-foreground">Real-time Updates:</strong> Actual crowd data is overlaid on predictions 
              every 30 seconds, allowing you to see how accurate the forecasts are.
            </p>
            <p>
              <strong className="text-foreground">Peak Hours:</strong> Time periods when crowd density exceeds 80% of 
              maximum capacity are identified as peak hours to help you plan accordingly.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-foreground mb-3">Quick Actions</p>
            <div className="flex flex-wrap gap-3">
              <Link 
                href="/heatmap"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                View Live Heatmap
              </Link>
              <Link 
                href="/darshan"
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-primary text-primary rounded-md hover:bg-orange-50 transition-colors text-sm font-medium"
              >
                Book Darshan Slot
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
