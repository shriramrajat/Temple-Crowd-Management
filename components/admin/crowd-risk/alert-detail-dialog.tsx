'use client'

import * as React from 'react'
import { X, MapPin, Clock, AlertTriangle, CheckCircle2, Users, TrendingUp } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertEvent, ThresholdLevel } from '@/lib/crowd-risk/types'
import { cn } from '@/lib/utils'

/**
 * Alert Detail Dialog Component
 * 
 * Displays full alert information with acknowledgment workflow.
 * Requirements:
 * - 2.1: Alert detail display
 * - 2.2: Alert acknowledgment button and workflow
 */

interface AlertDetailDialogProps {
  alert: AlertEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAcknowledge?: (alertId: string) => void
  isAcknowledged?: boolean
}

export function AlertDetailDialog({
  alert,
  open,
  onOpenChange,
  onAcknowledge,
  isAcknowledged = false,
}: AlertDetailDialogProps) {
  if (!alert) return null

  const severityColors = {
    [ThresholdLevel.NORMAL]: 'text-green-600 bg-green-100 dark:bg-green-950',
    [ThresholdLevel.WARNING]: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-950',
    [ThresholdLevel.CRITICAL]: 'text-orange-600 bg-orange-100 dark:bg-orange-950',
    [ThresholdLevel.EMERGENCY]: 'text-red-600 bg-red-100 dark:bg-red-950',
  }

  const severityIcons = {
    [ThresholdLevel.NORMAL]: CheckCircle2,
    [ThresholdLevel.WARNING]: AlertTriangle,
    [ThresholdLevel.CRITICAL]: AlertTriangle,
    [ThresholdLevel.EMERGENCY]: AlertTriangle,
  }

  const SeverityIcon = severityIcons[alert.severity]
  const alertDate = new Date(alert.timestamp)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className={cn(
                'p-2 rounded-lg',
                severityColors[alert.severity]
              )}>
                <SeverityIcon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl">
                  {alert.areaName} Alert
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Alert ID: {alert.id}
                </DialogDescription>
              </div>
            </div>
            <Badge
              variant={isAcknowledged ? 'secondary' : 'destructive'}
              className="shrink-0"
            >
              {isAcknowledged ? 'Acknowledged' : 'Unacknowledged'}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Alert Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Severity Level</p>
              <Badge className={cn('capitalize', severityColors[alert.severity])}>
                {alert.severity}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Alert Type</p>
              <p className="text-sm font-medium capitalize">
                {alert.type.replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          <Separator />

          {/* Density Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Density Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Current Density</p>
                <p className="text-2xl font-bold">{alert.densityValue.toFixed(1)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Threshold</p>
                <p className="text-2xl font-bold">{alert.threshold.toFixed(1)}</p>
              </div>
            </div>
            {alert.densityValue > alert.threshold && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Density exceeds threshold by{' '}
                  <span className="font-bold">
                    {((alert.densityValue - alert.threshold) / alert.threshold * 100).toFixed(1)}%
                  </span>
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Location Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Location Details
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Area</span>
                <span className="text-sm font-medium">{alert.areaName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Location</span>
                <span className="text-sm font-medium">{alert.metadata.location}</span>
              </div>
              {alert.metadata.affectedPilgrimCount !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    Affected Pilgrims
                  </span>
                  <span className="text-sm font-medium">
                    ~{alert.metadata.affectedPilgrimCount}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Suggested Actions */}
          {alert.metadata.suggestedActions && alert.metadata.suggestedActions.length > 0 && (
            <>
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Suggested Actions</h4>
                <ul className="space-y-2">
                  {alert.metadata.suggestedActions.map((action, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Separator />
            </>
          )}

          {/* Alternative Routes */}
          {alert.metadata.alternativeRoutes && alert.metadata.alternativeRoutes.length > 0 && (
            <>
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Alternative Routes</h4>
                <div className="flex flex-wrap gap-2">
                  {alert.metadata.alternativeRoutes.map((route, index) => (
                    <Badge key={index} variant="outline">
                      {route}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Timestamp */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Timestamp
            </h4>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {alertDate.toLocaleDateString()} at {alertDate.toLocaleTimeString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {Math.floor((Date.now() - alert.timestamp) / 1000)} seconds ago
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            {!isAcknowledged && onAcknowledge && (
              <Button
                onClick={() => {
                  onAcknowledge(alert.id)
                  onOpenChange(false)
                }}
              >
                Acknowledge Alert
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
