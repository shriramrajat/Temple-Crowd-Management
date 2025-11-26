'use client'

import { AlertCircle, Zap, MapPin, Bell, BookOpen, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function DashboardContent() {
  const [crowdLevel, setCrowdLevel] = useState<'low' | 'medium' | 'high'>('medium')
  const [waitTime, setWaitTime] = useState(45)
  const [zones, setZones] = useState<Array<{ name: string; crowd: string; icon: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch real crowd data
    const fetchCrowdData = async () => {
      try {
        const response = await fetch('/api/crowd-data')
        if (response.ok) {
          const contentType = response.headers.get('content-type')
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text()
            console.error('Non-JSON response from /api/crowd-data:', text)
            setLoading(false)
            return
          }
          
          const data = await response.json()
          if (data.zones && data.zones.length > 0) {
            setCrowdLevel(data.overallLevel || 'medium')
            setWaitTime(data.averageWaitTime || 45)
            setZones(data.zones.map((zone: any) => ({
              name: zone.name,
              crowd: zone.level,
              icon: zone.level === 'low' ? '🟢' : zone.level === 'medium' ? '🟡' : '🔴'
            })))
          }
        }
      } catch (error) {
        console.error('Failed to fetch crowd data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCrowdData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchCrowdData, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Welcome, Devotee</h1>
          <p className="text-muted-foreground text-lg">Sri Veerabhadreshwara Temple - Darshan Management</p>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Crowd Level Indicator */}
          <Card className="md:col-span-1 p-6 border-2 border-orange-200 bg-white hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Live Crowd Level</h3>
              <AlertCircle className="text-primary w-5 h-5" />
            </div>
            <div className="space-y-3">
              <div className={`text-4xl font-bold ${
                crowdLevel === 'low' ? 'text-green-600' : 
                crowdLevel === 'medium' ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {crowdLevel === 'low' ? '🟢' : crowdLevel === 'medium' ? '🟡' : '🔴'}
              </div>
              <p className="text-sm text-muted-foreground">
                {crowdLevel === 'low' ? 'Low Crowd' : crowdLevel === 'medium' ? 'Medium Crowd' : 'High Crowd'}
              </p>
              <Badge className={`w-fit ${
                crowdLevel === 'low' ? 'bg-green-100 text-green-800' : 
                crowdLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'
              }`}>
                Manageable
              </Badge>
            </div>
          </Card>

          {/* Wait Time Card */}
          <Card className="md:col-span-1 p-6 border-2 border-orange-200 bg-white hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Average Wait Time</h3>
              <Zap className="text-primary w-5 h-5" />
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold text-primary">{waitTime}</div>
              <p className="text-sm text-muted-foreground">minutes</p>
              <p className="text-xs text-muted-foreground">Last updated 2 min ago</p>
            </div>
          </Card>

          {/* Book Darshan Button */}
          <Card className="md:col-span-1 p-6 border-2 border-primary bg-gradient-to-br from-primary to-orange-500 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Quick Actions</h3>
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <div className="space-y-3">
              <p className="text-white text-sm">Book your preferred darshan slot</p>
              <Link href="/booking">
                <Button size="sm" className="w-full bg-white text-primary hover:bg-gray-100">
                  Book Now
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Temple Map & Alerts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Mini Temple Map */}
          <Card className="p-6 border-2 border-orange-200">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Temple Zones
            </h3>
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">Loading...</div>
              ) : zones.length > 0 ? (
                zones.map((zone) => (
                  <div key={zone.name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{zone.name}</span>
                    <span className="text-lg">{zone.icon}</span>
                  </div>
                ))
              ) : (
                [
                  { name: 'Entrance', crowd: 'low', icon: '🟢' },
                  { name: 'Garbha Griha', crowd: 'high', icon: '🔴' },
                  { name: 'Prasad Counter', crowd: 'medium', icon: '🟡' },
                  { name: 'Parking', crowd: 'low', icon: '🟢' },
                ].map((zone) => (
                  <div key={zone.name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{zone.name}</span>
                    <span className="text-lg">{zone.icon}</span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Alerts List */}
          <Card className="p-6 border-2 border-orange-200">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Live Alerts
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-900">Garbha Griha Crowded</p>
                  <p className="text-yellow-700 text-xs">Consider visiting after 2 PM</p>
                </div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2">
                <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-900">Cloak Room Available</p>
                  <p className="text-green-700 text-xs">50+ seats available</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <Link href="/booking">
            <Button className="w-full bg-primary text-white hover:bg-orange-600 py-6 text-lg">
              📅 Book Darshan Slot
            </Button>
          </Link>
          <Link href="/heatmap">
            <Button className="w-full border-2 border-primary text-primary hover:bg-orange-50 py-6 text-lg">
              🗺️ Live Crowd Map
            </Button>
          </Link>
          <Link href="/forecast">
            <Button className="w-full border-2 border-primary text-primary hover:bg-orange-50 py-6 text-lg">
              📊 Crowd Forecast
            </Button>
          </Link>
        </div>
        
        {/* Secondary Actions */}
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <Link href="/sos">
            <Button className="w-full bg-red-600 text-white hover:bg-red-700 py-4 text-base">
              🆘 Emergency SOS
            </Button>
          </Link>
          <Link href="/routes">
            <Button className="w-full border-2 border-gray-300 text-foreground hover:bg-gray-50 py-4 text-base">
              🚶 Temple Routes
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
