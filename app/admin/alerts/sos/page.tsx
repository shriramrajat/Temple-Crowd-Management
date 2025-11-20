'use client'

/**
 * SOS Alerts Admin Dashboard
 * 
 * Real-time feed of SOS emergency alerts for temple authorities.
 * Features:
 * - Real-time polling (every 5 seconds)
 * - Alert cards with all details (type, urgency, location, pilgrim info, timestamp)
 * - Visual emphasis for critical and high urgency alerts
 * - Sorted by urgency and timestamp
 * - Alert acknowledgment interface
 * - Filtering and search capabilities
 * - Location visualization
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { useState, useEffect, useCallback } from 'react'
import { 
  SOSAlert, 
  AlertStatus, 
  AlertType, 
  UrgencyLevel
} from '@/lib/types/sos'
import { AlertStatusBadge } from '@/components/sos/alert-status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  AlertCircle,
  Heart,
  Shield,
  Search as SearchIcon,
  MapPin,
  Clock,
  User,
  Phone,
  FileText,
  RefreshCw,
  Filter,
  X,
  CheckCircle2,
  Loader2
} from 'lucide-react'

// ============================================================================
// Constants and Configuration
// ============================================================================

const POLLING_INTERVAL = 5000 // 5 seconds

/**
 * Alert type configurations with icons and colors
 */
const ALERT_TYPE_CONFIG = {
  [AlertType.MEDICAL]: {
    label: 'Medical Emergency',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
  },
  [AlertType.SECURITY]: {
    label: 'Security Threat',
    icon: Shield,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
  },
  [AlertType.LOST]: {
    label: 'Lost Person',
    icon: SearchIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
  },
  [AlertType.ACCIDENT]: {
    label: 'Accident',
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
  },
  [AlertType.GENERAL]: {
    label: 'General Assistance',
    icon: AlertCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-950/30',
  },
}

/**
 * Urgency level configurations
 */
const URGENCY_CONFIG = {
  [UrgencyLevel.CRITICAL]: {
    label: 'Critical',
    color: 'text-red-700',
    bgColor: 'bg-red-100 dark:bg-red-950',
    borderColor: 'border-red-500',
    priority: 4,
  },
  [UrgencyLevel.HIGH]: {
    label: 'High',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100 dark:bg-orange-950',
    borderColor: 'border-orange-500',
    priority: 3,
  },
  [UrgencyLevel.MEDIUM]: {
    label: 'Medium',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100 dark:bg-yellow-950',
    borderColor: 'border-yellow-500',
    priority: 2,
  },
  [UrgencyLevel.LOW]: {
    label: 'Low',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
    borderColor: 'border-blue-500',
    priority: 1,
  },
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format timestamp to readable date/time
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  
  return date.toLocaleString()
}

/**
 * Format coordinates for display
 */
function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

/**
 * Sort alerts by urgency (highest first) and then by timestamp (newest first)
 * Requirements: 5.1, 5.4
 */
function sortAlerts(alerts: SOSAlert[]): SOSAlert[] {
  return [...alerts].sort((a, b) => {
    // First sort by urgency (critical > high > medium > low)
    const urgencyDiff = URGENCY_CONFIG[b.urgencyLevel].priority - URGENCY_CONFIG[a.urgencyLevel].priority
    if (urgencyDiff !== 0) return urgencyDiff
    
    // Then sort by timestamp (newest first)
    return b.createdAt - a.createdAt
  })
}

// ============================================================================
// Main Component
// ============================================================================

export default function SOSAlertsPage() {
  // State management
  const [alerts, setAlerts] = useState<SOSAlert[]>([])
  const [filteredAlerts, setFilteredAlerts] = useState<SOSAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all')
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<AlertType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Acknowledgment dialog state
  const [acknowledgeDialogOpen, setAcknowledgeDialogOpen] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<SOSAlert | null>(null)
  const [acknowledgeNotes, setAcknowledgeNotes] = useState('')
  const [acknowledging, setAcknowledging] = useState(false)

  /**
   * Fetch alerts from API
   * Requirements: 5.1, 5.2
   */
  const fetchAlerts = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      
      // Build query parameters based on filters
      const params = new URLSearchParams()
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (urgencyFilter !== 'all') {
        params.append('urgencyLevel', urgencyFilter)
      }
      if (typeFilter !== 'all') {
        params.append('alertType', typeFilter)
      }
      if (searchQuery.trim()) {
        params.append('searchQuery', searchQuery.trim())
      }
      
      const url = `/api/sos/alerts${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch alerts')
      }
      
      const data = await response.json()
      
      if (data.success && Array.isArray(data.alerts)) {
        const sorted = sortAlerts(data.alerts)
        setAlerts(sorted)
        setFilteredAlerts(sorted)
        setError(null)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      console.error('Error fetching alerts:', err)
      setError(err instanceof Error ? err.message : 'Failed to load alerts')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [statusFilter, urgencyFilter, typeFilter, searchQuery])

  /**
   * Initial load and polling setup
   * Requirements: 5.1 - polling every 5 seconds
   */
  useEffect(() => {
    fetchAlerts()
    
    // Set up polling interval
    const interval = setInterval(() => {
      fetchAlerts()
    }, POLLING_INTERVAL)
    
    return () => clearInterval(interval)
  }, [fetchAlerts])

  /**
   * Handle manual refresh
   */
  const handleRefresh = () => {
    fetchAlerts(true)
  }

  /**
   * Open acknowledgment dialog
   * Requirements: 7.1
   */
  const handleAcknowledgeClick = (alert: SOSAlert) => {
    setSelectedAlert(alert)
    setAcknowledgeNotes('')
    setAcknowledgeDialogOpen(true)
  }

  /**
   * Submit acknowledgment
   * Requirements: 7.1, 7.2, 7.3, 7.4
   */
  const handleAcknowledgeSubmit = async () => {
    if (!selectedAlert) return
    
    setAcknowledging(true)
    
    try {
      const response = await fetch(`/api/sos/alerts/${selectedAlert.id}/acknowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authorityId: 'admin-001', // TODO: Replace with actual auth user ID
          authorityName: 'Temple Authority', // TODO: Replace with actual auth user name
          notes: acknowledgeNotes.trim() || undefined,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Alert acknowledged successfully')
        setAcknowledgeDialogOpen(false)
        setSelectedAlert(null)
        setAcknowledgeNotes('')
        
        // Refresh alerts to show updated status
        fetchAlerts()
      } else {
        throw new Error(data.message || 'Failed to acknowledge alert')
      }
    } catch (err) {
      console.error('Error acknowledging alert:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to acknowledge alert')
    } finally {
      setAcknowledging(false)
    }
  }

  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    setStatusFilter('all')
    setUrgencyFilter('all')
    setTypeFilter('all')
    setSearchQuery('')
  }

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = statusFilter !== 'all' || urgencyFilter !== 'all' || typeFilter !== 'all' || searchQuery.trim() !== ''

  /**
   * Get filter counts
   */
  const filterCounts = {
    pending: alerts.filter(a => a.status === AlertStatus.PENDING).length,
    acknowledged: alerts.filter(a => a.status === AlertStatus.ACKNOWLEDGED).length,
    resolved: alerts.filter(a => a.status === AlertStatus.RESOLVED).length,
    critical: alerts.filter(a => a.urgencyLevel === UrgencyLevel.CRITICAL).length,
    high: alerts.filter(a => a.urgencyLevel === UrgencyLevel.HIGH).length,
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SOS Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Real-time emergency assistance requests from pilgrims
          </p>
        </div>
        
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`size-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{filterCounts.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Critical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{filterCounts.critical}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{filterCounts.high}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="size-4" />
              <CardTitle className="text-lg">Filters</CardTitle>
            </div>
            {hasActiveFilters && (
              <Button
                onClick={handleClearFilters}
                variant="ghost"
                size="sm"
              >
                <X className="size-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as AlertStatus | 'all')}
              >
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={AlertStatus.PENDING}>Pending ({filterCounts.pending})</SelectItem>
                  <SelectItem value={AlertStatus.ACKNOWLEDGED}>Acknowledged ({filterCounts.acknowledged})</SelectItem>
                  <SelectItem value={AlertStatus.RESOLVED}>Resolved ({filterCounts.resolved})</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Urgency Filter */}
            <div className="space-y-2">
              <Label htmlFor="urgency-filter">Urgency Level</Label>
              <Select
                value={urgencyFilter}
                onValueChange={(value) => setUrgencyFilter(value as UrgencyLevel | 'all')}
              >
                <SelectTrigger id="urgency-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value={UrgencyLevel.CRITICAL}>Critical</SelectItem>
                  <SelectItem value={UrgencyLevel.HIGH}>High</SelectItem>
                  <SelectItem value={UrgencyLevel.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={UrgencyLevel.LOW}>Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="type-filter">Alert Type</Label>
              <Select
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as AlertType | 'all')}
              >
                <SelectTrigger id="type-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={AlertType.MEDICAL}>Medical</SelectItem>
                  <SelectItem value={AlertType.SECURITY}>Security</SelectItem>
                  <SelectItem value={AlertType.LOST}>Lost Person</SelectItem>
                  <SelectItem value={AlertType.ACCIDENT}>Accident</SelectItem>
                  <SelectItem value={AlertType.GENERAL}>General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="size-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredAlerts.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="size-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No alerts found</h3>
              <p className="text-muted-foreground">
                {hasActiveFilters
                  ? 'Try adjusting your filters to see more results'
                  : 'There are no SOS alerts at this time'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert Cards */}
      {!loading && filteredAlerts.length > 0 && (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={handleAcknowledgeClick}
            />
          ))}
        </div>
      )}

      {/* Acknowledgment Dialog */}
      <Dialog open={acknowledgeDialogOpen} onOpenChange={setAcknowledgeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acknowledge Alert</DialogTitle>
            <DialogDescription>
              Confirm that you have received this alert and are taking action.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Alert Details</Label>
                <div className="text-sm space-y-1">
                  <p><strong>Type:</strong> {ALERT_TYPE_CONFIG[selectedAlert.alertType].label}</p>
                  <p><strong>Urgency:</strong> {URGENCY_CONFIG[selectedAlert.urgencyLevel].label}</p>
                  <p><strong>Location:</strong> {formatCoordinates(selectedAlert.location.latitude, selectedAlert.location.longitude)}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about your response..."
                  value={acknowledgeNotes}
                  onChange={(e) => setAcknowledgeNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAcknowledgeDialogOpen(false)}
              disabled={acknowledging}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAcknowledgeSubmit}
              disabled={acknowledging}
            >
              {acknowledging ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Acknowledging...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4 mr-2" />
                  Acknowledge
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================================================
// Alert Card Component
// ============================================================================

interface AlertCardProps {
  alert: SOSAlert
  onAcknowledge: (alert: SOSAlert) => void
}

function AlertCard({ alert, onAcknowledge }: AlertCardProps) {
  const typeConfig = ALERT_TYPE_CONFIG[alert.alertType]
  const urgencyConfig = URGENCY_CONFIG[alert.urgencyLevel]
  const TypeIcon = typeConfig.icon
  
  // Determine if alert should have visual emphasis (critical or high urgency)
  const isHighPriority = alert.urgencyLevel === UrgencyLevel.CRITICAL || alert.urgencyLevel === UrgencyLevel.HIGH
  
  return (
    <Card 
      className={`${isHighPriority ? `border-2 ${urgencyConfig.borderColor} ${urgencyConfig.bgColor}` : ''}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {/* Alert Type Icon */}
            <div className={`p-2 rounded-lg ${typeConfig.bgColor}`}>
              <TypeIcon className={`size-5 ${typeConfig.color}`} />
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-lg">{typeConfig.label}</CardTitle>
                <Badge variant="outline" className={`${urgencyConfig.color} ${urgencyConfig.bgColor}`}>
                  {urgencyConfig.label}
                </Badge>
                <AlertStatusBadge status={alert.status} size="sm" />
              </div>
              
              <CardDescription className="flex items-center gap-1">
                <Clock className="size-3" />
                {formatTimestamp(alert.createdAt)}
              </CardDescription>
            </div>
          </div>
          
          {/* Acknowledge Button */}
          {alert.status === AlertStatus.PENDING && (
            <Button
              onClick={() => onAcknowledge(alert)}
              size="sm"
            >
              <CheckCircle2 className="size-4 mr-2" />
              Acknowledge
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Location Information - Enhanced Visualization */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="size-4" />
            Location
          </div>
          
          {/* Location Details Card */}
          <div className="pl-6 space-y-3">
            {/* Coordinates - Prominent Display */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Coordinates</span>
                <Badge variant="outline" className="text-xs">
                  ±{alert.location.accuracy.toFixed(0)}m accuracy
                </Badge>
              </div>
              <p className="font-mono text-sm font-semibold">
                {formatCoordinates(alert.location.latitude, alert.location.longitude)}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => {
                    const url = `https://www.google.com/maps?q=${alert.location.latitude},${alert.location.longitude}`
                    window.open(url, '_blank')
                  }}
                >
                  <MapPin className="size-3 mr-1" />
                  Open in Google Maps
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => {
                    navigator.clipboard.writeText(formatCoordinates(alert.location.latitude, alert.location.longitude))
                    toast.success('Coordinates copied to clipboard')
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
            
            {/* Human-Readable Address */}
            {alert.location.address && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Address</span>
                <p className="text-sm">{alert.location.address}</p>
              </div>
            )}
            
            {/* Zone Information */}
            {alert.location.zone && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Zone</span>
                <Badge variant="secondary" className="text-xs">
                  {alert.location.zone}
                </Badge>
              </div>
            )}
            
            {/* Map Preview Placeholder */}
            <div className="border rounded-lg overflow-hidden bg-muted/30">
              <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30">
                <div className="text-center space-y-2 p-4">
                  <MapPin className="size-8 mx-auto text-blue-600 dark:text-blue-400" />
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Map Preview
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Interactive map integration coming soon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pilgrim Information */}
        {(alert.pilgrimInfo.name || alert.pilgrimInfo.phone) && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <User className="size-4" />
              Pilgrim Information
            </div>
            <div className="pl-6 space-y-1 text-sm">
              {alert.pilgrimInfo.name && (
                <p>{alert.pilgrimInfo.name}</p>
              )}
              {alert.pilgrimInfo.phone && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-3" />
                  {alert.pilgrimInfo.phone}
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Notes */}
        {alert.notes && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="size-4" />
              Notes
            </div>
            <p className="pl-6 text-sm text-muted-foreground">{alert.notes}</p>
          </div>
        )}
        
        {/* Acknowledgment Information */}
        {alert.acknowledgment && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
              <CheckCircle2 className="size-4" />
              Acknowledged
            </div>
            <div className="pl-6 space-y-1 text-sm">
              <p>By: {alert.acknowledgment.authorityName}</p>
              <p className="text-muted-foreground">
                {formatTimestamp(alert.acknowledgment.acknowledgedAt)}
              </p>
              {alert.acknowledgment.notes && (
                <p className="text-muted-foreground italic">"{alert.acknowledgment.notes}"</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
