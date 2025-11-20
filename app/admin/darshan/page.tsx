'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, TrendingUp, ArrowRight, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import AdminLayout from '@/components/admin/admin-layout'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { format } from 'date-fns'
import Link from 'next/link'
import type { GetDashboardResponse } from '@/lib/types/api'

export default function DarshanAdminDashboard() {
  const [dashboardData, setDashboardData] = useState<GetDashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/dashboard')
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      
      const data: GetDashboardResponse = await response.json()
      setDashboardData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 80) return 'text-red-500'
    if (percentage >= 50) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return '#ef4444'
    if (percentage >= 50) return '#eab308'
    return '#22c55e'
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Darshan Dashboard</h1>
              <p className="text-muted-foreground mt-1">Slot booking management and analytics</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-card/50 border-border/50 backdrop-blur-sm p-5 animate-pulse">
                <div className="h-20 bg-muted rounded" />
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !dashboardData) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error || 'Failed to load dashboard data'}</p>
              <Button onClick={fetchDashboardData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </Card>
        </div>
      </AdminLayout>
    )
  }

  const { stats } = dashboardData

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Darshan Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Slot booking management and analytics</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Badge variant="secondary" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
              {format(selectedDate, 'MMM dd, yyyy')}
            </Badge>
            <Button variant="outline" size="sm" onClick={fetchDashboardData} className="h-8 sm:h-9">
              <RefreshCw className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-3 sm:p-5 hover:border-primary/30 transition-all">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Today's Bookings</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.todayBookingsCount}</p>
              </div>
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-blue-400">Total devotees booked</p>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-3 sm:p-5 hover:border-primary/30 transition-all">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Total Capacity</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalCapacity}</p>
              </div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-green-400">Available slots capacity</p>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-3 sm:p-5 hover:border-primary/30 transition-all">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Capacity Utilization</p>
                <p className={`text-xl sm:text-2xl font-bold ${getUtilizationColor(stats.capacityUtilization)}`}>
                  {stats.capacityUtilization}%
                </p>
              </div>
              <TrendingUp className={`w-4 h-4 sm:w-5 sm:h-5 ${getUtilizationColor(stats.capacityUtilization)} flex-shrink-0`} />
            </div>
            <p className={`text-[10px] sm:text-xs font-medium ${getUtilizationColor(stats.capacityUtilization)}`}>
              {stats.capacityUtilization >= 80 ? 'High utilization' : stats.capacityUtilization >= 50 ? 'Moderate' : 'Low utilization'}
            </p>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-3 sm:p-5 hover:border-primary/30 transition-all">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Active Slots</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.activeSlots}</p>
              </div>
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-purple-400">Available time slots</p>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Slot-wise Booking Breakdown */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Today's Slot Breakdown
                </h2>
                <Badge variant="outline">{stats.slotBreakdown.length} slots</Badge>
              </div>

              {stats.slotBreakdown.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No slots configured for today</p>
                  <Link href="/admin/slots">
                    <Button variant="outline" size="sm" className="mt-4">
                      Configure Slots
                    </Button>
                  </Link>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.slotBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="slotTime" 
                      stroke="#888"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #333',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'bookedCount') return [value, 'Booked']
                        if (name === 'capacity') return [value, 'Capacity']
                        return [value, name]
                      }}
                    />
                    <Bar dataKey="bookedCount" name="Booked" radius={[8, 8, 0, 0]}>
                      {stats.slotBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.utilizationPercentage)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}

              {/* Slot Details Table */}
              {stats.slotBreakdown.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Slot Details</h3>
                  <div className="space-y-2">
                    {stats.slotBreakdown.map((slot, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{slot.slotTime}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {slot.bookedCount} / {slot.capacity}
                            </p>
                            <p className="text-xs text-muted-foreground">bookings</p>
                          </div>
                          <div className="w-24">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full transition-all"
                                  style={{ 
                                    width: `${slot.utilizationPercentage}%`,
                                    backgroundColor: getBarColor(slot.utilizationPercentage)
                                  }}
                                />
                              </div>
                              <span className={`text-xs font-medium ${getUtilizationColor(slot.utilizationPercentage)}`}>
                                {slot.utilizationPercentage}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Quick Links & Actions */}
          <div className="space-y-6">
            {/* Quick Links */}
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/admin/slots">
                  <Button variant="outline" className="w-full justify-between group">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Manage Slots
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/admin/darshan/bookings">
                  <Button variant="outline" className="w-full justify-between group">
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      View Bookings
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/darshan">
                  <Button variant="outline" className="w-full justify-between group">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Public Booking Page
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Summary Stats */}
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Available Capacity</span>
                  <span className="text-sm font-semibold">
                    {stats.totalCapacity - stats.todayBookingsCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg. per Slot</span>
                  <span className="text-sm font-semibold">
                    {stats.activeSlots > 0 
                      ? Math.round(stats.todayBookingsCount / stats.activeSlots)
                      : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge 
                    variant={stats.capacityUtilization >= 80 ? 'destructive' : 'secondary'}
                  >
                    {stats.capacityUtilization >= 80 ? 'High Demand' : 'Normal'}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
