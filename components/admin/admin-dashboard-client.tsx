'use client'

import { useState } from 'react'
import { Heart, AlertTriangle, Users, Gauge as Gate, Zap, Bell, MapPin, Radio } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import AdminLayout from '@/components/admin/admin-layout'
import TempleHeatmap from '@/components/admin/temple-heatmap'
import LiveAlertsFeed from '@/components/admin/live-alerts-feed'
import FootfallChart from '@/components/admin/footfall-chart'
import AlertsTable from '@/components/admin/alerts-table'
import QuickActions from '@/components/admin/quick-actions'
import AccessibilitySummary from '@/components/admin/accessibility-summary'

/**
 * Admin Dashboard Client Component
 * 
 * Client-side interactive dashboard for admin users
 * Separated from server component for proper session verification
 */
export default function AdminDashboardClient() {
  const [emergencyMode, setEmergencyMode] = useState(false)

  const metrics = [
    {
      label: 'Current Footfall',
      value: '2,847',
      change: '+12%',
      icon: Users,
      color: 'text-blue-400',
    },
    {
      label: 'Active Alerts',
      value: '5',
      change: '↑ High',
      icon: AlertTriangle,
      color: 'text-red-400',
    },
    {
      label: 'Slot Utilization',
      value: '78%',
      change: '+5%',
      icon: Zap,
      color: 'text-yellow-400',
    },
    {
      label: 'High-Density Zones',
      value: '3',
      change: 'Garbha Griha',
      icon: MapPin,
      color: 'text-orange-400',
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Control Room</h1>
            <p className="text-muted-foreground mt-1">Real-time Temple Operations Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={emergencyMode ? 'destructive' : 'secondary'} className="px-3 py-1">
              {emergencyMode ? '🔴 EMERGENCY MODE' : '🟢 NORMAL OPS'}
            </Badge>
            <div className="text-sm text-muted-foreground">Last update: 2s ago</div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <Card
                key={metric.label}
                className="bg-card/50 border-border/50 backdrop-blur-sm p-5 hover:border-primary/30 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{metric.label}</p>
                    <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  </div>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <p className={`text-xs font-medium ${metric.color}`}>{metric.change}</p>
              </Card>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Heatmap + Chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Temple Heatmap */}
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Live Temple Heatmap
                </h2>
                <Radio className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <TempleHeatmap />
            </Card>

            {/* Footfall Chart */}
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-6">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                6-Hour Footfall Trend
              </h2>
              <FootfallChart />
            </Card>
          </div>

          {/* Right Sidebar: Alerts & Actions */}
          <div className="space-y-6">
            {/* Live Alerts Feed */}
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-4 max-h-96 overflow-hidden flex flex-col">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Live Alerts
              </h2>
              <LiveAlertsFeed />
            </Card>

            {/* Quick Actions */}
            <QuickActions emergencyMode={emergencyMode} setEmergencyMode={setEmergencyMode} />

            {/* Accessibility Summary */}
            <AccessibilitySummary />
          </div>
        </div>

        {/* Alerts Table */}
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Recent Alerts Log
          </h2>
          <AlertsTable />
        </Card>
      </div>
    </AdminLayout>
  )
}
