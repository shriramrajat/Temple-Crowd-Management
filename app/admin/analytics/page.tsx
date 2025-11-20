'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin/admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, TrendingUp, TrendingDown } from 'lucide-react'
import DailyFootfallChart from '@/components/admin/daily-footfall-chart'
import HourlyPeaksChart from '@/components/admin/hourly-peaks-chart'
import PredictionVsActualChart from '@/components/admin/prediction-vs-actual-chart'
import ZoneDistributionChart from '@/components/admin/zone-distribution-chart'
import HistoricalTrendsChart from '@/components/admin/historical-trends-chart'

const trendData = [
  { zone: 'Main Sanctum', current: 2450, lastWeek: 2100, change: 16.7, trend: 'up' },
  { zone: 'North Gate', current: 1820, lastWeek: 1950, change: -6.7, trend: 'down' },
  { zone: 'South Entrance', current: 3200, lastWeek: 2800, change: 14.3, trend: 'up' },
  { zone: 'Prayer Hall', current: 950, lastWeek: 1100, change: -13.6, trend: 'down' },
]

const nextSurge = {
  predictedTime: '18:30 - 20:00',
  expectedPeak: 5400,
  confidence: 92,
  zones: ['Main Sanctum', 'South Entrance'],
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7days')

  const handleDownload = (format: 'pdf' | 'csv') => {
    console.log(`[v0] Downloading ${format} report`)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics & Insights</h1>
            <p className="text-sm text-muted-foreground mt-1">Real-time crowd data analysis and predictions</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload('pdf')}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload('csv')}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              CSV
            </Button>
          </div>
        </div>

        {/* Next Predicted Surge - Hero Card */}
        <Card className="border-primary/30 bg-gradient-to-br from-card to-card/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
          <CardContent className="pt-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Next Predicted Surge</p>
                <p className="text-2xl font-bold text-primary">{nextSurge.predictedTime}</p>
                <p className="text-sm text-foreground/60 mt-2">Expected peak footfall</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Expected Peak</p>
                <p className="text-2xl font-bold text-foreground">{nextSurge.expectedPeak.toLocaleString()}</p>
                <p className="text-sm text-foreground/60 mt-2">Expected visitors</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Prediction Confidence</p>
                <p className="text-2xl font-bold text-foreground">{nextSurge.confidence}%</p>
                <p className="text-sm text-foreground/60 mt-2">
                  Likely zones: {nextSurge.zones.join(', ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Footfall */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily Footfall Trend</CardTitle>
              <CardDescription>Last 30 days overview</CardDescription>
            </CardHeader>
            <CardContent>
              <DailyFootfallChart />
            </CardContent>
          </Card>

          {/* Hourly Peaks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hourly Peak Analysis</CardTitle>
              <CardDescription>Today's hourly distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <HourlyPeaksChart />
            </CardContent>
          </Card>

          {/* Prediction vs Actual */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Prediction vs Actual Crowd Levels</CardTitle>
              <CardDescription>AI predictions compared to actual visitor counts</CardDescription>
            </CardHeader>
            <CardContent>
              <PredictionVsActualChart />
            </CardContent>
          </Card>

          {/* Zone Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zone Distribution</CardTitle>
              <CardDescription>Current crowd spread by zone</CardDescription>
            </CardHeader>
            <CardContent>
              <ZoneDistributionChart />
            </CardContent>
          </Card>

          {/* Historical Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historical Trends</CardTitle>
              <CardDescription>3-month crowd pattern analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <HistoricalTrendsChart />
            </CardContent>
          </Card>
        </div>

        {/* Trend Indicators */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Zone Performance vs Last Week</CardTitle>
            <CardDescription>Trends showing increase or decrease in visitor distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Zone</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Current</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Last Week</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Change</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {trendData.map((item, idx) => (
                    <tr key={idx} className="border-b border-border/30 hover:bg-card/50 transition-colors">
                      <td className="py-3 px-4 text-foreground font-medium">{item.zone}</td>
                      <td className="text-right py-3 px-4 text-foreground">{item.current.toLocaleString()}</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">{item.lastWeek.toLocaleString()}</td>
                      <td
                        className={`text-right py-3 px-4 font-medium ${
                          item.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {item.change > 0 ? '+' : ''}{item.change}%
                      </td>
                      <td className="text-right py-3 px-4">
                        {item.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
