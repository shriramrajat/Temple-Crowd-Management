'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { History, RefreshCw, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AdminLayout from '@/components/admin/admin-layout'
import { AlertHistoryFilters, type AlertHistoryFilterState } from '@/components/admin/crowd-risk/alert-history-filters'
import { AlertHistoryTable } from '@/components/admin/crowd-risk/alert-history-table'
import { ExportButton } from '@/components/admin/crowd-risk/export-button'
import { DensityProvider } from '@/lib/crowd-risk/density-context'
import { AlertProvider } from '@/lib/crowd-risk/alert-context'
import { getAlertLogger } from '@/lib/crowd-risk/alert-logger'
import { AlertLogEntry, AreaType } from '@/lib/crowd-risk/types'
import type { MonitoredArea } from '@/lib/crowd-risk/types'
import { cn } from '@/lib/utils'

/**
 * Alert History Page
 * 
 * Displays comprehensive alert history with filtering, sorting, and export capabilities.
 * Requirements: 14.2 - Alert history viewer with filters, table, and export
 */

// Mock monitored areas - matches the monitoring dashboard
const mockAreas: MonitoredArea[] = [
  {
    id: 'area-1',
    name: 'Main Entrance',
    location: { latitude: 21.1702, longitude: 72.8311 },
    capacity: 500,
    adjacentAreas: ['area-2'],
    metadata: {
      type: AreaType.ENTRANCE,
      description: 'Primary entrance to the temple complex',
    },
  },
  {
    id: 'area-2',
    name: 'Garbha Griha',
    location: { latitude: 21.1705, longitude: 72.8315 },
    capacity: 200,
    adjacentAreas: ['area-1', 'area-3'],
    metadata: {
      type: AreaType.GATHERING_SPACE,
      description: 'Main sanctum area',
    },
  },
  {
    id: 'area-3',
    name: 'Corridor A',
    location: { latitude: 21.1708, longitude: 72.8318 },
    capacity: 300,
    adjacentAreas: ['area-2', 'area-4'],
    metadata: {
      type: AreaType.CORRIDOR,
      description: 'Main corridor connecting areas',
    },
  },
  {
    id: 'area-4',
    name: 'East Exit',
    location: { latitude: 21.1710, longitude: 72.8320 },
    capacity: 400,
    adjacentAreas: ['area-3'],
    metadata: {
      type: AreaType.EXIT,
      description: 'Eastern exit point',
    },
  },
]

/**
 * Alert History Content Component
 */
function AlertHistoryContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [allAlerts, setAllAlerts] = useState<AlertLogEntry[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  
  // Filter state with default values
  const [filters, setFilters] = useState<AlertHistoryFilterState>({
    areaIds: [],
    severities: [],
    alertTypes: [],
    acknowledgmentStatus: 'all',
    timeRangePreset: 'last_24_hours',
    startTime: Date.now() - 24 * 60 * 60 * 1000,
    endTime: Date.now(),
  })

  const alertLogger = getAlertLogger(true) // Enable persistence

  /**
   * Load alert history from AlertLogger
   */
  const loadAlertHistory = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Fetch filtered alert history
      const history = await alertLogger.getFilteredAlertHistory({
        areaIds: filters.areaIds.length > 0 ? filters.areaIds : undefined,
        severities: filters.severities.length > 0 ? filters.severities : undefined,
        alertTypes: filters.alertTypes.length > 0 ? filters.alertTypes : undefined,
        acknowledgmentStatus: filters.acknowledgmentStatus,
        startTime: filters.startTime,
        endTime: filters.endTime,
      })

      setAllAlerts(history)
    } catch (error) {
      console.error('Failed to load alert history:', error)
      setAllAlerts([])
    } finally {
      setIsLoading(false)
    }
  }, [alertLogger, filters])

  /**
   * Load alert history on mount and when filters change
   */
  useEffect(() => {
    loadAlertHistory()
  }, [loadAlertHistory])

  /**
   * Handle refresh
   */
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await loadAlertHistory()
    setTimeout(() => setIsRefreshing(false), 500)
  }, [loadAlertHistory])

  /**
   * Handle filter changes
   */
  const handleFiltersChange = useCallback((newFilters: AlertHistoryFilterState) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }, [])

  /**
   * Handle page change
   */
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  /**
   * Get paginated data
   */
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return allAlerts.slice(startIndex, endIndex)
  }, [allAlerts, currentPage, pageSize])

  /**
   * Calculate statistics
   */
  const stats = useMemo(() => {
    const total = allAlerts.length
    const acknowledged = allAlerts.filter(a => a.acknowledgments.length > 0).length
    const resolved = allAlerts.filter(a => a.resolution !== undefined).length
    const avgSuccessRate = allAlerts.length > 0
      ? Math.round(
          allAlerts.reduce((sum, entry) => {
            const delivered = entry.notificationResults.adminNotifications.filter(n => n.delivered).length
            const total = entry.notificationResults.adminNotifications.length
            return sum + (total > 0 ? (delivered / total) * 100 : 0)
          }, 0) / allAlerts.length
        )
      : 0

    return { total, acknowledged, resolved, avgSuccessRate }
  }, [allAlerts])

  /**
   * Prepare area list for filters
   */
  const areaList = useMemo(() => {
    return mockAreas.map(area => ({ id: area.id, name: area.name }))
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <History className="h-8 w-8 text-primary" />
            Alert History
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse and analyze historical alert data
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <ExportButton
            data={allAlerts}
            filename="alert-history"
            disabled={isLoading || allAlerts.length === 0}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardDescription>Total Alerts</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardDescription>Acknowledged</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.acknowledged}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.acknowledged / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardDescription>Resolved</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.resolved}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardDescription>Avg. Success Rate</CardDescription>
            <CardTitle className={cn(
              'text-3xl',
              stats.avgSuccessRate >= 95 ? 'text-green-600' :
              stats.avgSuccessRate >= 80 ? 'text-yellow-600' :
              'text-red-600'
            )}>
              {stats.avgSuccessRate}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Notification delivery rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <AlertHistoryFilters
        areas={areaList}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Alert History Table */}
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Alert Records</CardTitle>
          <CardDescription>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading alert history...
              </span>
            ) : (
              `Showing ${paginatedData.length} of ${stats.total} alerts`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <AlertHistoryTable
              data={paginatedData}
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={stats.total}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Main Alert History Page
 * Wraps content with providers
 */
export default function AlertHistoryPage() {
  return (
    <AdminLayout>
      <DensityProvider autoStart={false}>
        <AlertProvider adminId="admin-1">
          <AlertHistoryContent />
        </AlertProvider>
      </DensityProvider>
    </AdminLayout>
  )
}
