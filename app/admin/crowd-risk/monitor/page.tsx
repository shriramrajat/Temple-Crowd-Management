'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Activity, RefreshCw, Clock, AlertCircle, Filter, Bell, Settings } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import AdminLayout from '@/components/admin/admin-layout'
import { AreaMonitoringGrid } from '@/components/admin/crowd-risk/area-monitoring-grid'
import { IndicatorLegend } from '@/components/admin/crowd-risk/indicator-legend'
import { AlertList } from '@/components/admin/crowd-risk/alert-list'
import { AlertDetailDialog } from '@/components/admin/crowd-risk/alert-detail-dialog'
import { ConnectionStatus } from '@/components/admin/crowd-risk/connection-status'
import { DensityProvider, useDensityContext, useDensityConnectionState } from '@/lib/crowd-risk/density-context'
import { AlertProvider, useAlerts, useAlertConnectionState } from '@/lib/crowd-risk/alert-context'
import { ThresholdLevel, AreaType, AlertEvent } from '@/lib/crowd-risk/types'
import type { MonitoredArea } from '@/lib/crowd-risk/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { getAlertEngine } from '@/lib/crowd-risk/alert-engine'

/**
 * Real-time Monitoring Dashboard Page
 * 
 * Requirements:
 * - 2.1: Display active alerts from AlertContext
 * - 4.1: Integrate AreaMonitoringGrid with real-time density data
 * - 4.4: Sub-2-second state update rendering
 */

// Mock monitored areas - will be replaced with API call
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
 * Monitoring Dashboard Content Component
 * Separated to use context hooks
 */
function MonitoringDashboardContent() {
  const { densities, evaluations, isMonitoring, startMonitoring } = useDensityContext()
  const { activeAlerts, emergencyMode, unacknowledgedCount, acknowledgeAlert } = useAlerts()
  const densityConnectionState = useDensityConnectionState()
  const alertConnectionState = useAlertConnectionState()
  
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<AlertEvent | null>(null)
  const [alertDialogOpen, setAlertDialogOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  const alertEngine = getAlertEngine()
  const previousAlertsRef = useRef<Set<string>>(new Set())
  const audioContextRef = useRef<AudioContext | null>(null)

  // Initialize audio context for sound alerts
  useEffect(() => {
    if (typeof window !== 'undefined' && soundEnabled) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [soundEnabled])

  // Play sound alert for critical/emergency levels
  const playSoundAlert = useCallback((severity: ThresholdLevel) => {
    if (!soundEnabled || !audioContextRef.current) return
    
    const ctx = audioContextRef.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    // Different frequencies for different severity levels
    if (severity === ThresholdLevel.EMERGENCY) {
      oscillator.frequency.value = 880 // A5 - high pitch for emergency
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.5)
      
      // Play twice for emergency
      setTimeout(() => {
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.frequency.value = 880
        gain2.gain.setValueAtTime(0.3, ctx.currentTime)
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
        osc2.start(ctx.currentTime)
        osc2.stop(ctx.currentTime + 0.5)
      }, 600)
    } else if (severity === ThresholdLevel.CRITICAL) {
      oscillator.frequency.value = 660 // E5 - medium pitch for critical
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.4)
    }
  }, [soundEnabled])

  // Handle new alerts with toast notifications and sound
  useEffect(() => {
    const currentAlertIds = new Set(activeAlerts.map(a => a.id))
    const previousAlertIds = previousAlertsRef.current
    
    // Find new alerts
    const newAlerts = activeAlerts.filter(alert => !previousAlertIds.has(alert.id))
    
    // Show toast and play sound for each new alert
    newAlerts.forEach(alert => {
      const severityColors = {
        [ThresholdLevel.NORMAL]: 'default',
        [ThresholdLevel.WARNING]: 'default',
        [ThresholdLevel.CRITICAL]: 'default',
        [ThresholdLevel.EMERGENCY]: 'default',
      }
      
      // Play sound for critical and emergency alerts
      if (alert.severity === ThresholdLevel.CRITICAL || alert.severity === ThresholdLevel.EMERGENCY) {
        playSoundAlert(alert.severity)
      }
      
      // Show toast notification
      toast(
        `${alert.severity.toUpperCase()}: ${alert.areaName}`,
        {
          description: `Density: ${alert.densityValue.toFixed(1)} (Threshold: ${alert.threshold.toFixed(1)})`,
          action: {
            label: 'View Details',
            onClick: () => {
              setSelectedAlert(alert)
              setAlertDialogOpen(true)
            },
          },
          duration: alert.severity === ThresholdLevel.EMERGENCY ? 10000 : 5000,
          className: cn(
            alert.severity === ThresholdLevel.EMERGENCY && 'border-red-500 bg-red-50 dark:bg-red-950',
            alert.severity === ThresholdLevel.CRITICAL && 'border-orange-500 bg-orange-50 dark:bg-orange-950',
            alert.severity === ThresholdLevel.WARNING && 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
          ),
        }
      )
    })
    
    // Update previous alerts
    previousAlertsRef.current = currentAlertIds
  }, [activeAlerts, playSoundAlert])

  // Start monitoring all areas on mount
  useEffect(() => {
    const areaIds = mockAreas.map(area => area.id)
    startMonitoring(areaIds)
  }, [startMonitoring])

  // Update last update timestamp when densities change
  useEffect(() => {
    if (densities.size > 0) {
      setLastUpdate(new Date())
    }
  }, [densities])

  // Build threshold levels map from evaluations
  const thresholdLevels = new Map<string, ThresholdLevel>()
  evaluations.forEach((evaluation, areaId) => {
    thresholdLevels.set(areaId, evaluation.currentLevel)
  })

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    // Restart monitoring to trigger fresh data
    const areaIds = mockAreas.map(area => area.id)
    startMonitoring(areaIds)
    
    setTimeout(() => {
      setIsRefreshing(false)
      setLastUpdate(new Date())
    }, 500)
  }, [startMonitoring])

  // Handle area selection
  const handleAreaClick = useCallback((areaId: string) => {
    setSelectedAreaId(areaId === selectedAreaId ? null : areaId)
  }, [selectedAreaId])

  // Handle alert acknowledgment
  const handleAcknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId, 'admin-1') // TODO: Get actual admin ID from auth
      toast.success('Alert acknowledged', {
        description: 'The alert has been marked as acknowledged',
      })
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
      toast.error('Failed to acknowledge alert', {
        description: 'Please try again',
      })
    }
  }, [acknowledgeAlert])

  // Handle alert click
  const handleAlertClick = useCallback((alert: AlertEvent) => {
    setSelectedAlert(alert)
    setAlertDialogOpen(true)
  }, [])

  // Check if alert is acknowledged
  const isAlertAcknowledged = useCallback((alertId: string) => {
    return alertEngine.isAlertAcknowledged(alertId)
  }, [alertEngine])

  // Get selected area details
  const selectedArea = selectedAreaId 
    ? mockAreas.find(a => a.id === selectedAreaId)
    : null
  const selectedDensity = selectedAreaId 
    ? densities.get(selectedAreaId)
    : null
  const selectedEvaluation = selectedAreaId
    ? evaluations.get(selectedAreaId)
    : null

  // Calculate statistics
  const totalAreas = mockAreas.length
  const areasWithData = densities.size
  const criticalAreas = Array.from(thresholdLevels.values()).filter(
    level => level === ThresholdLevel.CRITICAL || level === ThresholdLevel.EMERGENCY
  ).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            Real-time Crowd Monitoring
          </h1>
          <p className="text-muted-foreground mt-1">
            Live density monitoring and alert management
          </p>
        </div>
        
        {/* Status Badges */}
        <div className="flex items-center gap-3">
          {/* Connection Status Indicators */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50">
            <span className="text-xs text-muted-foreground">Density:</span>
            <ConnectionStatus state={densityConnectionState} showLabel={false} />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50">
            <span className="text-xs text-muted-foreground">Alerts:</span>
            <ConnectionStatus state={alertConnectionState} showLabel={false} />
          </div>
          
          {emergencyMode?.active && (
            <Badge variant="destructive" className="animate-pulse">
              EMERGENCY MODE ACTIVE
            </Badge>
          )}
          {unacknowledgedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 relative"
              onClick={() => {
                const firstUnacknowledged = activeAlerts.find(
                  alert => !isAlertAcknowledged(alert.id)
                )
                if (firstUnacknowledged) {
                  handleAlertClick(firstUnacknowledged)
                }
              }}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">
                {unacknowledgedCount}
              </span>
              Unacknowledged
            </Button>
          )}
          <Badge 
            variant={isMonitoring ? 'default' : 'secondary'}
            className={cn(isMonitoring && 'bg-green-600')}
          >
            {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="gap-2"
          >
            <Bell className={cn('h-4 w-4', !soundEnabled && 'text-muted-foreground')} />
            {soundEnabled ? 'Sound On' : 'Sound Off'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/admin/crowd-risk/testing'}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Testing
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardDescription>Total Areas</CardDescription>
            <CardTitle className="text-3xl">{totalAreas}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardDescription>Areas with Data</CardDescription>
            <CardTitle className="text-3xl">{areasWithData}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardDescription>Active Alerts</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{activeAlerts.length}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardDescription>Critical Areas</CardDescription>
            <CardTitle className="text-3xl text-red-600">{criticalAreas}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Controls Bar */}
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>
            
            {selectedAreaId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAreaId(null)}
              >
                Clear Selection
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Area Details */}
      {selectedArea && (
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              {selectedArea.name} - Detailed Information
            </CardTitle>
            <CardDescription>{selectedArea.metadata.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground">Current Density</h4>
                <p className="text-2xl font-bold">
                  {selectedDensity ? selectedDensity.densityValue.toFixed(1) : '—'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedDensity?.unit === 'people_per_sqm' ? 'people/m²' : '%'}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground">Threshold Level</h4>
                <p className="text-2xl font-bold capitalize">
                  {selectedEvaluation?.currentLevel || 'Unknown'}
                </p>
                {selectedEvaluation?.isEscalation && (
                  <Badge variant="destructive" className="text-xs">Escalating</Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground">Capacity</h4>
                <p className="text-2xl font-bold">{selectedArea.capacity}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedDensity 
                    ? `${Math.round((selectedDensity.densityValue / selectedArea.capacity) * 100)}% utilized`
                    : 'No data'
                  }
                </p>
              </div>
            </div>
            
            {selectedArea.adjacentAreas.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border/50">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Adjacent Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedArea.adjacentAreas.map(adjacentId => {
                    const adjacentArea = mockAreas.find(a => a.id === adjacentId)
                    return adjacentArea ? (
                      <Badge key={adjacentId} variant="outline">
                        {adjacentArea.name}
                      </Badge>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Area Monitoring Grid */}
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Monitored Areas
          </CardTitle>
          <CardDescription>
            Click on an area to view detailed information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AreaMonitoringGrid
            areas={mockAreas}
            densities={densities}
            thresholdLevels={thresholdLevels}
            onAreaClick={handleAreaClick}
          />
        </CardContent>
      </Card>

      {/* Alert List */}
      <AlertList
        alerts={activeAlerts}
        areas={mockAreas.map(a => ({ id: a.id, name: a.name }))}
        onAlertClick={handleAlertClick}
        onAcknowledge={handleAcknowledgeAlert}
        isAlertAcknowledged={isAlertAcknowledged}
      />

      {/* Indicator Legend */}
      <IndicatorLegend variant="card" />

      {/* Alert Detail Dialog */}
      <AlertDetailDialog
        alert={selectedAlert}
        open={alertDialogOpen}
        onOpenChange={setAlertDialogOpen}
        onAcknowledge={handleAcknowledgeAlert}
        isAcknowledged={selectedAlert ? isAlertAcknowledged(selectedAlert.id) : false}
      />
    </div>
  )
}

/**
 * Main Monitoring Dashboard Page
 * Wraps content with providers
 */
export default function MonitoringDashboardPage() {
  return (
    <AdminLayout>
      <DensityProvider autoStart={false}>
        <AlertProvider adminId="admin-1">
          <MonitoringDashboardContent />
        </AlertProvider>
      </DensityProvider>
    </AdminLayout>
  )
}
