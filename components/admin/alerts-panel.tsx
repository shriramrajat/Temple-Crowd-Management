'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertTriangle, AlertCircle, ShieldAlert, Gauge as Gate, Clock, MapPin, Siren } from 'lucide-react'
import { getAlerts, updateAlert } from '@/lib/storage/sos-storage'
import { SOSAlert, AlertStatus as SOSAlertStatus, AlertType, UrgencyLevel } from '@/lib/types/sos'
import { AlertStatusBadge } from '@/components/sos/alert-status-badge'

interface Alert {
  id: string
  severity: 'critical' | 'high' | 'medium'
  type: 'medical' | 'safety' | 'crowd_surge' | 'gate_issue' | 'sos'
  zone: string
  message: string
  timestamp: Date
  status: 'active' | 'acknowledged' | 'resolved'
  blinking?: boolean
  sosData?: SOSAlert // Additional SOS-specific data
}

const mockAlerts: Alert[] = [
  {
    id: 'A001',
    severity: 'critical',
    type: 'crowd_surge',
    zone: 'Main Prayer Hall',
    message: 'Excessive crowd density detected, immediate intervention needed',
    timestamp: new Date(Date.now() - 2 * 60000),
    status: 'active',
    blinking: true,
  },
  {
    id: 'A002',
    severity: 'high',
    type: 'medical',
    zone: 'East Gate',
    message: 'Medical emergency reported - elderly visitor collapsed',
    timestamp: new Date(Date.now() - 5 * 60000),
    status: 'acknowledged',
  },
  {
    id: 'A003',
    severity: 'high',
    type: 'gate_issue',
    zone: 'North Entrance',
    message: 'Gate control malfunction, queue backing up',
    timestamp: new Date(Date.now() - 12 * 60000),
    status: 'active',
  },
  {
    id: 'A004',
    severity: 'medium',
    type: 'safety',
    zone: 'West Corridor',
    message: 'Minor slip hazard detected on floor',
    timestamp: new Date(Date.now() - 18 * 60000),
    status: 'acknowledged',
  },
  {
    id: 'A005',
    severity: 'medium',
    type: 'safety',
    zone: 'Parking Area',
    message: 'Unauthorized vehicle detected in restricted area',
    timestamp: new Date(Date.now() - 25 * 60000),
    status: 'resolved',
  },
]

const AlertIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'medical':
      return <AlertCircle className="w-5 h-5 text-red-500" />
    case 'safety':
      return <ShieldAlert className="w-5 h-5 text-orange-500" />
    case 'crowd_surge':
      return <AlertTriangle className="w-5 h-5 text-red-600" />
    case 'gate_issue':
      return <Gate className="w-5 h-5 text-yellow-500" />
    case 'sos':
      return <Siren className="w-5 h-5 text-red-600 animate-pulse" />
    default:
      return <AlertTriangle className="w-5 h-5" />
  }
}

/**
 * Convert SOS alert to unified Alert format
 * Requirements: 5.1, 7.1, 7.5
 */
function convertSOSToAlert(sosAlert: SOSAlert): Alert {
  // Map urgency level to severity
  const severityMap: Record<UrgencyLevel, 'critical' | 'high' | 'medium'> = {
    [UrgencyLevel.CRITICAL]: 'critical',
    [UrgencyLevel.HIGH]: 'high',
    [UrgencyLevel.MEDIUM]: 'medium',
    [UrgencyLevel.LOW]: 'medium',
  }

  // Map SOS status to alert status
  const statusMap: Record<SOSAlertStatus, 'active' | 'acknowledged' | 'resolved'> = {
    [SOSAlertStatus.PENDING]: 'active',
    [SOSAlertStatus.ACKNOWLEDGED]: 'acknowledged',
    [SOSAlertStatus.RESPONDING]: 'acknowledged',
    [SOSAlertStatus.RESOLVED]: 'resolved',
  }

  // Create message from SOS data
  const alertTypeLabels: Record<AlertType, string> = {
    [AlertType.MEDICAL]: 'Medical Emergency',
    [AlertType.SECURITY]: 'Security Threat',
    [AlertType.LOST]: 'Lost Person',
    [AlertType.ACCIDENT]: 'Accident',
    [AlertType.GENERAL]: 'General Assistance',
  }

  const pilgrimName = sosAlert.pilgrimInfo.name || 'Unknown Pilgrim'
  const alertTypeLabel = alertTypeLabels[sosAlert.alertType]
  const message = `SOS: ${alertTypeLabel} - ${pilgrimName}${sosAlert.pilgrimInfo.phone ? ` (${sosAlert.pilgrimInfo.phone})` : ''}`

  return {
    id: `SOS-${sosAlert.id}`,
    severity: severityMap[sosAlert.urgencyLevel],
    type: 'sos',
    zone: sosAlert.location.zone || sosAlert.location.address || `${sosAlert.location.latitude.toFixed(4)}, ${sosAlert.location.longitude.toFixed(4)}`,
    message,
    timestamp: new Date(sosAlert.createdAt),
    status: statusMap[sosAlert.status],
    blinking: sosAlert.status === SOSAlertStatus.PENDING && sosAlert.urgencyLevel === UrgencyLevel.CRITICAL,
    sosData: sosAlert,
  }
}

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterZone, setFilterZone] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('active')
  const [filterType, setFilterType] = useState<string>('all')

  // Load and merge SOS alerts with existing alerts
  // Requirements: 5.1
  useEffect(() => {
    const loadAlerts = () => {
      try {
        // Get SOS alerts from storage
        const sosAlerts = getAlerts()
        const convertedSOSAlerts = sosAlerts.map(convertSOSToAlert)
        
        // Merge with mock alerts
        const mergedAlerts = [...mockAlerts, ...convertedSOSAlerts]
        
        // Sort by timestamp (newest first)
        mergedAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        
        setAlerts(mergedAlerts)
      } catch (error) {
        console.error('Error loading SOS alerts:', error)
        // Fall back to mock alerts only
        setAlerts(mockAlerts)
      }
    }

    // Initial load
    loadAlerts()

    // Poll for updates every 5 seconds
    // Requirements: 5.1
    const pollInterval = setInterval(loadAlerts, 5000)

    return () => clearInterval(pollInterval)
  }, [])

  // Simulate real-time updates (blinking effect)
  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.blinking ? { ...alert, blinking: !alert.blinking } : alert
        )
      )
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  const filteredAlerts = alerts.filter((alert) => {
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false
    if (filterZone !== 'all' && alert.zone !== filterZone) return false
    if (filterStatus !== 'all' && alert.status !== filterStatus) return false
    if (filterType !== 'all' && alert.type !== filterType) return false
    return true
  })

  const zones = Array.from(new Set(alerts.map((a) => a.zone)))
  const activeAlerts = alerts.filter((a) => a.status === 'active').length
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical').length
  const sosAlerts = alerts.filter((a) => a.type === 'sos').length

  const handleAcknowledge = (id: string) => {
    // Check if this is an SOS alert
    // Requirements: 7.1, 7.2
    if (id.startsWith('SOS-')) {
      const sosId = id.replace('SOS-', '')
      try {
        // Update SOS alert in storage
        updateAlert(sosId, {
          status: SOSAlertStatus.ACKNOWLEDGED,
          acknowledgment: {
            authorityId: 'admin-user', // In production, use actual user ID
            authorityName: 'Temple Authority',
            acknowledgedAt: Date.now(),
          },
        })
      } catch (error) {
        console.error('Error acknowledging SOS alert:', error)
      }
    }

    // Update local state
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, status: 'acknowledged' } : alert
      )
    )
  }

  const handleResolve = (id: string) => {
    // Check if this is an SOS alert
    // Requirements: 7.1, 7.5
    if (id.startsWith('SOS-')) {
      const sosId = id.replace('SOS-', '')
      try {
        // Update SOS alert in storage
        updateAlert(sosId, {
          status: SOSAlertStatus.RESOLVED,
        })
      } catch (error) {
        console.error('Error resolving SOS alert:', error)
      }
    }

    // Update local state
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, status: 'resolved', blinking: false } : alert
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Active Alerts</div>
            <div className="text-3xl font-bold text-foreground mt-2">{activeAlerts}</div>
            <div className="text-xs text-orange-500 mt-2">requires action</div>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Critical</div>
            <div className="text-3xl font-bold text-red-500 mt-2">{criticalAlerts}</div>
            <div className="text-xs text-destructive mt-2">urgent</div>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border border-red-500/30">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Siren className="w-4 h-4" />
              SOS Alerts
            </div>
            <div className="text-3xl font-bold text-red-500 mt-2">{sosAlerts}</div>
            <div className="text-xs text-red-500 mt-2">emergency</div>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Acknowledged</div>
            <div className="text-3xl font-bold text-yellow-500 mt-2">
              {alerts.filter((a) => a.status === 'acknowledged').length}
            </div>
            <div className="text-xs text-yellow-500 mt-2">in progress</div>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Resolved</div>
            <div className="text-3xl font-bold text-green-500 mt-2">
              {alerts.filter((a) => a.status === 'resolved').length}
            </div>
            <div className="text-xs text-green-500 mt-2">handled</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Filter Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sos">SOS</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="safety">Safety</SelectItem>
                <SelectItem value="crowd_surge">Crowd Surge</SelectItem>
                <SelectItem value="gate_issue">Gate Issue</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterZone} onValueChange={setFilterZone}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Zones</SelectItem>
                {zones.map((zone) => (
                  <SelectItem key={zone} value={zone}>
                    {zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle>Alert Log</CardTitle>
          <CardDescription>Real-time incident tracking and response</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/50">
                  <TableHead className="text-foreground">Type</TableHead>
                  <TableHead className="text-foreground">Zone</TableHead>
                  <TableHead className="text-foreground">Message</TableHead>
                  <TableHead className="text-foreground">Time</TableHead>
                  <TableHead className="text-foreground">Severity</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No alerts match the selected filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAlerts.map((alert) => (
                    <TableRow
                      key={alert.id}
                      className={`border-border hover:bg-muted/50 transition-colors ${
                        alert.blinking ? 'animate-pulse-neon bg-red-950/30' : ''
                      } ${alert.type === 'sos' ? 'border-l-4 border-l-red-500' : ''}`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <AlertIcon type={alert.type} />
                          <span className="text-xs text-muted-foreground capitalize">
                            {alert.type === 'sos' ? 'SOS' : alert.type.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{alert.zone}</span>
                      </TableCell>
                      <TableCell className="text-sm max-w-xs">{alert.message}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)}m ago
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            alert.severity === 'critical'
                              ? 'destructive'
                              : alert.severity === 'high'
                                ? 'secondary'
                                : 'outline'
                          }
                          className={
                            alert.severity === 'critical'
                              ? 'bg-red-600/80 text-white'
                              : alert.severity === 'high'
                                ? 'bg-orange-600/80 text-white'
                                : 'bg-yellow-600/80 text-white'
                          }
                        >
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {alert.type === 'sos' && alert.sosData ? (
                          <AlertStatusBadge status={alert.sosData.status} size="sm" />
                        ) : (
                          <Badge
                            variant="outline"
                            className={
                              alert.status === 'active'
                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : alert.status === 'acknowledged'
                                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                  : 'bg-green-500/20 text-green-400 border-green-500/30'
                            }
                          >
                            {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {alert.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAcknowledge(alert.id)}
                              className="text-xs border-primary/50 hover:bg-primary/10"
                            >
                              Acknowledge
                            </Button>
                          )}
                          {alert.status !== 'resolved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResolve(alert.id)}
                              className="text-xs border-green-500/50 hover:bg-green-500/10"
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
