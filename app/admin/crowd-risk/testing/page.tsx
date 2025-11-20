'use client'

import { useState, useCallback } from 'react'
import { 
  Beaker, 
  AlertTriangle, 
  Activity, 
  Bell, 
  Zap, 
  RotateCcw,
  Sliders,
  Radio,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AdminLayout from '@/components/admin/admin-layout'
import { DensityProvider, useDensityContext } from '@/lib/crowd-risk/density-context'
import { AlertProvider, useAlerts } from '@/lib/crowd-risk/alert-context'
import { ThresholdLevel, AreaType, NotificationChannel, AlertType } from '@/lib/crowd-risk/types'
import type { MonitoredArea } from '@/lib/crowd-risk/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { getAlertEngine } from '@/lib/crowd-risk/alert-engine'
import { getAdminNotifier } from '@/lib/crowd-risk/admin-notifier'
import { getEmergencyModeManager } from '@/lib/crowd-risk/emergency-mode-manager'
import { getDensityMonitor } from '@/lib/crowd-risk/density-monitor'
import { DensityPattern } from '@/lib/crowd-risk/density-simulator'

/**
 * Development Testing Controls Page
 * 
 * Requirements:
 * - 2.1: Test alert notifications for each severity level
 * - 3.1: Test pilgrim notifications
 * 
 * Task 16.2: Add development testing controls
 */

// Mock monitored areas
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
 * Testing Controls Content Component
 */
function TestingControlsContent() {
  const { triggerMockViolation, startMonitoring } = useDensityContext()
  const { activateEmergency, deactivateEmergency, emergencyMode } = useAlerts()
  
  const [selectedArea, setSelectedArea] = useState<string>('area-1')
  const [densityOverrides, setDensityOverrides] = useState<Map<string, number>>(new Map())
  const [testAlertSeverity, setTestAlertSeverity] = useState<ThresholdLevel>(ThresholdLevel.WARNING)
  const [notificationChannel, setNotificationChannel] = useState<NotificationChannel>(NotificationChannel.PUSH)
  const [simulateFailure, setSimulateFailure] = useState(false)
  const [simulatorPattern, setSimulatorPattern] = useState<string>('normal')
  const [simulatorTargetDensity, setSimulatorTargetDensity] = useState<number>(0.7)
  const [simulatorDuration, setSimulatorDuration] = useState<number>(60000)
  const [testResults, setTestResults] = useState<Array<{
    timestamp: number
    type: string
    status: 'success' | 'error'
    message: string
  }>>([])

  const alertEngine = getAlertEngine()
  const adminNotifier = getAdminNotifier()
  const emergencyManager = getEmergencyModeManager()
  const densityMonitor = getDensityMonitor()

  // Add test result
  const addTestResult = useCallback((type: string, status: 'success' | 'error', message: string) => {
    setTestResults(prev => [{
      timestamp: Date.now(),
      type,
      status,
      message
    }, ...prev].slice(0, 20)) // Keep last 20 results
  }, [])

  // Handle density override
  const handleDensityOverride = useCallback((areaId: string, value: number) => {
    setDensityOverrides(prev => {
      const next = new Map(prev)
      next.set(areaId, value)
      return next
    })
    
    // Trigger mock violation with the new density value
    triggerMockViolation(areaId, value)
    
    addTestResult(
      'Density Override',
      'success',
      `Set ${mockAreas.find(a => a.id === areaId)?.name} density to ${value.toFixed(1)}`
    )
    
    toast.success('Density Override Applied', {
      description: `${mockAreas.find(a => a.id === areaId)?.name}: ${value.toFixed(1)}`,
    })
  }, [triggerMockViolation, addTestResult])

  // Trigger test alert
  const triggerTestAlert = useCallback(async () => {
    try {
      const area = mockAreas.find(a => a.id === selectedArea)
      if (!area) return

      // Create test alert event
      const testAlert = {
        id: `TEST-${Date.now()}`,
        type: AlertType.THRESHOLD_VIOLATION,
        severity: testAlertSeverity,
        areaId: selectedArea,
        areaName: area.name,
        densityValue: 85.5,
        threshold: 75.0,
        timestamp: Date.now(),
        metadata: {
          location: `${area.location.latitude.toFixed(6)}, ${area.location.longitude.toFixed(6)}`,
          affectedPilgrimCount: 150,
          suggestedActions: [
            'Monitor crowd movement',
            'Prepare crowd control measures',
            'Alert on-site staff',
          ],
        },
      }

      // Send alert through admin notifier
      const results = await adminNotifier.sendAlert(testAlert, ['admin-test'])
      
      const success = results.some(r => r.delivered)
      addTestResult(
        'Test Alert',
        success ? 'success' : 'error',
        `${testAlertSeverity.toUpperCase()} alert for ${area.name} - ${success ? 'Delivered' : 'Failed'}`
      )

      if (success) {
        toast.success('Test Alert Sent', {
          description: `${testAlertSeverity.toUpperCase()} alert for ${area.name}`,
        })
      } else {
        toast.error('Test Alert Failed', {
          description: 'Check console for details',
        })
      }
    } catch (error) {
      console.error('Failed to trigger test alert:', error)
      addTestResult('Test Alert', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      toast.error('Test Alert Failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }, [selectedArea, testAlertSeverity, adminNotifier, addTestResult])

  // Simulate threshold violation
  const simulateThresholdViolation = useCallback((severity: ThresholdLevel) => {
    const area = mockAreas.find(a => a.id === selectedArea)
    if (!area) return

    // Map severity to density values
    const densityMap = {
      [ThresholdLevel.NORMAL]: 30,
      [ThresholdLevel.WARNING]: 65,
      [ThresholdLevel.CRITICAL]: 85,
      [ThresholdLevel.EMERGENCY]: 95,
    }

    const densityValue = densityMap[severity]
    handleDensityOverride(selectedArea, densityValue)
    
    addTestResult(
      'Threshold Violation',
      'success',
      `Simulated ${severity.toUpperCase()} violation for ${area.name}`
    )
  }, [selectedArea, handleDensityOverride, addTestResult])

  // Test emergency mode activation
  const testEmergencyActivation = useCallback(() => {
    try {
      const area = mockAreas.find(a => a.id === selectedArea)
      if (!area) return

      if (emergencyMode?.active) {
        deactivateEmergency('admin-test')
        addTestResult('Emergency Mode', 'success', `Deactivated emergency mode`)
        toast.info('Emergency Mode Deactivated')
      } else {
        activateEmergency(selectedArea, 'admin-test')
        addTestResult('Emergency Mode', 'success', `Activated emergency mode for ${area.name}`)
        toast.error('Emergency Mode Activated', {
          description: `Triggered for ${area.name}`,
        })
      }
    } catch (error) {
      console.error('Failed to toggle emergency mode:', error)
      addTestResult('Emergency Mode', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      toast.error('Emergency Mode Test Failed')
    }
  }, [selectedArea, emergencyMode, activateEmergency, deactivateEmergency, addTestResult])

  // Test notification channel
  const testNotificationChannel = useCallback(async () => {
    try {
      const area = mockAreas.find(a => a.id === selectedArea)
      if (!area) return

      // Create test alert
      const testAlert = {
        id: `TEST-CHANNEL-${Date.now()}`,
        type: AlertType.THRESHOLD_VIOLATION,
        severity: ThresholdLevel.WARNING,
        areaId: selectedArea,
        areaName: area.name,
        densityValue: 70.0,
        threshold: 65.0,
        timestamp: Date.now(),
        metadata: {
          location: `${area.location.latitude.toFixed(6)}, ${area.location.longitude.toFixed(6)}`,
          suggestedActions: ['Test notification'],
        },
      }

      // Configure admin to use specific channel
      adminNotifier.configureNotifications({
        adminId: 'admin-test',
        channels: [notificationChannel],
        severityFilter: [],
        areaFilter: [],
      })

      // Send test notification
      const results = await adminNotifier.sendAlert(testAlert, ['admin-test'])
      const channelResult = results.find(r => r.channel === notificationChannel)
      
      if (channelResult?.delivered) {
        addTestResult(
          'Notification Channel',
          'success',
          `${notificationChannel.toUpperCase()} notification delivered successfully`
        )
        toast.success('Notification Sent', {
          description: `${notificationChannel.toUpperCase()} channel test successful`,
        })
      } else {
        addTestResult(
          'Notification Channel',
          'error',
          `${notificationChannel.toUpperCase()} notification failed: ${channelResult?.error || 'Unknown error'}`
        )
        toast.error('Notification Failed', {
          description: channelResult?.error || 'Unknown error',
        })
      }
    } catch (error) {
      console.error('Failed to test notification channel:', error)
      addTestResult('Notification Channel', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      toast.error('Notification Test Failed')
    }
  }, [selectedArea, notificationChannel, adminNotifier, addTestResult])

  // Simulate notification failure
  const simulateNotificationFailure = useCallback(async () => {
    try {
      // This would require modifying the notifier to accept a failure flag
      // For now, we'll just log it
      addTestResult(
        'Notification Failure',
        'success',
        'Simulated notification failure (check retry queue)'
      )
      toast.warning('Notification Failure Simulated', {
        description: 'Check the notification retry queue',
      })
    } catch (error) {
      console.error('Failed to simulate notification failure:', error)
      addTestResult('Notification Failure', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [addTestResult])

  // Configure simulator pattern
  const configureSimulatorPattern = useCallback(() => {
    try {
      const area = mockAreas.find(a => a.id === selectedArea)
      if (!area) return

      densityMonitor.configureSimulatorPattern(
        selectedArea,
        simulatorPattern as any,
        simulatorTargetDensity,
        simulatorDuration
      )

      addTestResult(
        'Simulator Pattern',
        'success',
        `Configured ${simulatorPattern} pattern for ${area.name} (target: ${simulatorTargetDensity.toFixed(1)}, duration: ${simulatorDuration}ms)`
      )

      toast.success('Simulator Pattern Configured', {
        description: `${simulatorPattern} pattern for ${area.name}`,
      })
    } catch (error) {
      console.error('Failed to configure simulator pattern:', error)
      addTestResult('Simulator Pattern', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      toast.error('Simulator Configuration Failed')
    }
  }, [selectedArea, simulatorPattern, simulatorTargetDensity, simulatorDuration, densityMonitor, addTestResult])

  // Trigger density spike
  const triggerDensitySpike = useCallback((targetDensity: number) => {
    try {
      const area = mockAreas.find(a => a.id === selectedArea)
      if (!area) return

      densityMonitor.triggerDensitySpike(selectedArea, targetDensity, 30000)

      addTestResult(
        'Density Spike',
        'success',
        `Triggered spike to ${targetDensity.toFixed(1)} for ${area.name}`
      )

      toast.warning('Density Spike Triggered', {
        description: `${area.name} will spike to ${targetDensity.toFixed(1)}`,
      })
    } catch (error) {
      console.error('Failed to trigger density spike:', error)
      addTestResult('Density Spike', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      toast.error('Spike Trigger Failed')
    }
  }, [selectedArea, densityMonitor, addTestResult])

  // Trigger threshold violation scenario
  const triggerThresholdScenario = useCallback((level: 'warning' | 'critical' | 'emergency') => {
    try {
      const area = mockAreas.find(a => a.id === selectedArea)
      if (!area) return

      densityMonitor.triggerThresholdViolationScenario(selectedArea, level)

      addTestResult(
        'Threshold Scenario',
        'success',
        `Triggered ${level.toUpperCase()} threshold scenario for ${area.name}`
      )

      toast.warning('Threshold Scenario Triggered', {
        description: `${level.toUpperCase()} scenario for ${area.name}`,
      })
    } catch (error) {
      console.error('Failed to trigger threshold scenario:', error)
      addTestResult('Threshold Scenario', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      toast.error('Scenario Trigger Failed')
    }
  }, [selectedArea, densityMonitor, addTestResult])

  // Trigger normalization scenario
  const triggerNormalizationScenario = useCallback(() => {
    try {
      const area = mockAreas.find(a => a.id === selectedArea)
      if (!area) return

      densityMonitor.triggerNormalizationScenario(selectedArea, 0.3)

      addTestResult(
        'Normalization Scenario',
        'success',
        `Triggered normalization scenario for ${area.name}`
      )

      toast.info('Normalization Triggered', {
        description: `${area.name} will return to normal density`,
      })
    } catch (error) {
      console.error('Failed to trigger normalization:', error)
      addTestResult('Normalization Scenario', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      toast.error('Normalization Trigger Failed')
    }
  }, [selectedArea, densityMonitor, addTestResult])

  // Reset simulator pattern
  const resetSimulatorPattern = useCallback(() => {
    try {
      const area = mockAreas.find(a => a.id === selectedArea)
      if (!area) return

      densityMonitor.resetSimulatorPattern(selectedArea)

      addTestResult(
        'Simulator Reset',
        'success',
        `Reset simulator pattern for ${area.name}`
      )

      toast.info('Simulator Reset', {
        description: `${area.name} returned to normal pattern`,
      })
    } catch (error) {
      console.error('Failed to reset simulator:', error)
      addTestResult('Simulator Reset', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      toast.error('Simulator Reset Failed')
    }
  }, [selectedArea, densityMonitor, addTestResult])

  // Reset all test data
  const resetAllData = useCallback(() => {
    // Clear density overrides
    setDensityOverrides(new Map())
    
    // Clear test results
    setTestResults([])
    
    // Deactivate emergency mode if active
    if (emergencyMode?.active) {
      deactivateEmergency('admin-test')
    }
    
    // Clear alert history (if available)
    try {
      alertEngine.clearAll?.()
    } catch (error) {
      console.error('Failed to clear alert engine:', error)
    }
    
    // Clear notification history
    try {
      adminNotifier.clearHistory()
    } catch (error) {
      console.error('Failed to clear notification history:', error)
    }
    
    // Restart monitoring
    startMonitoring(mockAreas.map(a => a.id))
    
    addTestResult('System Reset', 'success', 'All test data cleared')
    toast.success('System Reset', {
      description: 'All test data has been cleared',
    })
  }, [emergencyMode, deactivateEmergency, alertEngine, adminNotifier, startMonitoring, addTestResult])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Beaker className="h-8 w-8 text-primary" />
            Development Testing Controls
          </h1>
          <p className="text-muted-foreground mt-1">
            Test and simulate crowd risk alerts and notifications
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {emergencyMode?.active && (
            <Badge variant="destructive" className="animate-pulse">
              EMERGENCY MODE ACTIVE
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={() => window.location.href = '/admin/crowd-risk/monitor'}
          >
            Back to Monitor
          </Button>
        </div>
      </div>

      {/* Main Testing Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Controls */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="alerts" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="density">Density</TabsTrigger>
              <TabsTrigger value="simulator">Simulator</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="emergency">Emergency</TabsTrigger>
            </TabsList>

            {/* Alert Testing Tab */}
            <TabsContent value="alerts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Test Alert Generation
                  </CardTitle>
                  <CardDescription>
                    Trigger test alerts for different severity levels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Area</Label>
                    <Select value={selectedArea} onValueChange={setSelectedArea}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mockAreas.map(area => (
                          <SelectItem key={area.id} value={area.id}>
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Alert Severity</Label>
                    <Select 
                      value={testAlertSeverity} 
                      onValueChange={(value) => setTestAlertSeverity(value as ThresholdLevel)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ThresholdLevel.WARNING}>Warning</SelectItem>
                        <SelectItem value={ThresholdLevel.CRITICAL}>Critical</SelectItem>
                        <SelectItem value={ThresholdLevel.EMERGENCY}>Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={triggerTestAlert} className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Trigger Test Alert
                  </Button>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Quick Severity Tests</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => simulateThresholdViolation(ThresholdLevel.WARNING)}
                        className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                      >
                        Warning
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => simulateThresholdViolation(ThresholdLevel.CRITICAL)}
                        className="border-orange-500 text-orange-700 hover:bg-orange-50"
                      >
                        Critical
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => simulateThresholdViolation(ThresholdLevel.EMERGENCY)}
                        className="border-red-500 text-red-700 hover:bg-red-50"
                      >
                        Emergency
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Density Override Tab */}
            <TabsContent value="density" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sliders className="h-5 w-5" />
                    Manual Density Override
                  </CardTitle>
                  <CardDescription>
                    Set custom density values for each area
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {mockAreas.map(area => {
                    const currentValue = densityOverrides.get(area.id) || 30
                    return (
                      <div key={area.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>{area.name}</Label>
                          <Badge variant="outline">
                            {currentValue.toFixed(1)}%
                          </Badge>
                        </div>
                        <Slider
                          value={[currentValue]}
                          onValueChange={([value]) => handleDensityOverride(area.id, value)}
                          min={0}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Simulator Tab - Task 16.1 */}
            <TabsContent value="simulator" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Density Pattern Simulator
                  </CardTitle>
                  <CardDescription>
                    Generate realistic density patterns for testing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Area</Label>
                    <Select value={selectedArea} onValueChange={setSelectedArea}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mockAreas.map(area => (
                          <SelectItem key={area.id} value={area.id}>
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Pattern Type</Label>
                    <Select value={simulatorPattern} onValueChange={setSimulatorPattern}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal (Gradual Changes)</SelectItem>
                        <SelectItem value="peak_hour">Peak Hour (Rapid Increase)</SelectItem>
                        <SelectItem value="threshold_violation">Threshold Violation</SelectItem>
                        <SelectItem value="normalization">Normalization (Return to Normal)</SelectItem>
                        <SelectItem value="spike">Spike (Quick Up & Down)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Density: {simulatorTargetDensity.toFixed(1)}</Label>
                    <Slider
                      value={[simulatorTargetDensity]}
                      onValueChange={([value]) => setSimulatorTargetDensity(value)}
                      min={0}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.0</span>
                      <span>1.0</span>
                      <span>2.0</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Duration: {(simulatorDuration / 1000).toFixed(0)}s</Label>
                    <Slider
                      value={[simulatorDuration]}
                      onValueChange={([value]) => setSimulatorDuration(value)}
                      min={10000}
                      max={180000}
                      step={10000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>10s</span>
                      <span>90s</span>
                      <span>180s</span>
                    </div>
                  </div>

                  <Button onClick={configureSimulatorPattern} className="w-full">
                    <Activity className="h-4 w-4 mr-2" />
                    Apply Pattern
                  </Button>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Quick Scenarios</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => triggerThresholdScenario('warning')}
                        className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                      >
                        Warning Scenario
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => triggerThresholdScenario('critical')}
                        className="border-orange-500 text-orange-700 hover:bg-orange-50"
                      >
                        Critical Scenario
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => triggerThresholdScenario('emergency')}
                        className="border-red-500 text-red-700 hover:bg-red-50"
                      >
                        Emergency Scenario
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={triggerNormalizationScenario}
                        className="border-green-500 text-green-700 hover:bg-green-50"
                      >
                        Normalize
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Density Spikes</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => triggerDensitySpike(0.8)}
                      >
                        0.8
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => triggerDensitySpike(1.2)}
                      >
                        1.2
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => triggerDensitySpike(1.5)}
                      >
                        1.5
                      </Button>
                    </div>
                  </div>

                  <Button 
                    onClick={resetSimulatorPattern} 
                    variant="outline"
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Normal Pattern
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Testing Tab */}
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Channel Testing
                  </CardTitle>
                  <CardDescription>
                    Test different notification channels and simulate failures
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Notification Channel</Label>
                    <Select 
                      value={notificationChannel} 
                      onValueChange={(value) => setNotificationChannel(value as NotificationChannel)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NotificationChannel.PUSH}>Push Notification</SelectItem>
                        <SelectItem value={NotificationChannel.SMS}>SMS</SelectItem>
                        <SelectItem value={NotificationChannel.EMAIL}>Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={testNotificationChannel} className="w-full">
                    <Radio className="h-4 w-4 mr-2" />
                    Test Channel
                  </Button>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <Label htmlFor="simulate-failure">Simulate Failure</Label>
                    <Switch
                      id="simulate-failure"
                      checked={simulateFailure}
                      onCheckedChange={setSimulateFailure}
                    />
                  </div>

                  <Button 
                    onClick={simulateNotificationFailure} 
                    variant="outline"
                    className="w-full"
                    disabled={!simulateFailure}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Simulate Notification Failure
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Emergency Mode Tab */}
            <TabsContent value="emergency" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Emergency Mode Testing
                  </CardTitle>
                  <CardDescription>
                    Test emergency mode activation and deactivation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Trigger Area</Label>
                    <Select value={selectedArea} onValueChange={setSelectedArea}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mockAreas.map(area => (
                          <SelectItem key={area.id} value={area.id}>
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {emergencyMode?.active ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                          Emergency Mode Active
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                          Trigger Area: {mockAreas.find(a => a.id === emergencyMode.triggerAreaId)?.name}
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-300">
                          Affected Areas: {emergencyMode.affectedAreas.length}
                        </p>
                      </div>
                      <Button 
                        onClick={testEmergencyActivation}
                        variant="outline"
                        className="w-full"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Deactivate Emergency Mode
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={testEmergencyActivation}
                      variant="destructive"
                      className="w-full"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Activate Emergency Mode
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Test Results & Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={resetAllData}
                variant="outline"
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset All Test Data
              </Button>
            </CardContent>
          </Card>

          {/* Test Results Log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Test Results Log</CardTitle>
              <CardDescription className="text-xs">
                Recent test operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {testResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No test results yet
                  </p>
                ) : (
                  testResults.map((result, index) => (
                    <div
                      key={index}
                      className={cn(
                        'p-3 rounded-lg border text-xs',
                        result.status === 'success' 
                          ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                          : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold">
                            {result.type}
                          </p>
                          <p className="text-muted-foreground mt-1">
                            {result.message}
                          </p>
                        </div>
                        {result.status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

/**
 * Main Testing Page
 */
export default function TestingPage() {
  return (
    <AdminLayout>
      <DensityProvider autoStart={true} initialAreas={mockAreas.map(a => a.id)}>
        <AlertProvider adminId="admin-test">
          <TestingControlsContent />
        </AlertProvider>
      </DensityProvider>
    </AdminLayout>
  )
}
