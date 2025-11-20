'use client'

import { useState, useEffect } from 'react'
import { History, User, Clock, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { ConfigAuditEntry, ThresholdConfig } from '@/lib/crowd-risk/types'
import { format } from 'date-fns'

interface ConfigAuditLogProps {
  areaId: string
  areaName: string
  auditLog: ConfigAuditEntry[]
}

interface AuditEntryItemProps {
  entry: ConfigAuditEntry
  index: number
}

function ThresholdComparison({ 
  label, 
  previous, 
  current 
}: { 
  label: string
  previous: number
  current: number
}) {
  const hasChanged = previous !== current
  
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}:</span>
      <div className="flex items-center gap-2">
        <span className={hasChanged ? 'line-through text-muted-foreground' : 'font-medium'}>
          {previous}
        </span>
        {hasChanged && (
          <>
            <span className="text-muted-foreground">→</span>
            <span className="font-medium text-primary">{current}</span>
          </>
        )}
      </div>
    </div>
  )
}

function AuditEntryItem({ entry, index }: AuditEntryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const hasThresholdChanges = 
    entry.previousConfig.warningThreshold !== entry.newConfig.warningThreshold ||
    entry.previousConfig.criticalThreshold !== entry.newConfig.criticalThreshold ||
    entry.previousConfig.emergencyThreshold !== entry.newConfig.emergencyThreshold
  
  const hasTimeProfileChanges = 
    JSON.stringify(entry.previousConfig.timeProfile) !== JSON.stringify(entry.newConfig.timeProfile)
  
  return (
    <div className="border border-border/50 rounded-lg p-4 hover:border-primary/30 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <History className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">Configuration Update</span>
              <Badge variant="outline" className="text-xs">
                #{index + 1}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(entry.timestamp), 'MMM dd, yyyy HH:mm:ss')}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {entry.adminId}
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8 p-0"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Reason */}
      {entry.reason && (
        <div className="mb-3 flex items-start gap-2 text-sm">
          <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <span className="text-muted-foreground italic">{entry.reason}</span>
        </div>
      )}

      {/* Change Summary */}
      <div className="flex flex-wrap gap-2 mb-3">
        {hasThresholdChanges && (
          <Badge variant="secondary" className="text-xs">
            Threshold Changes
          </Badge>
        )}
        {hasTimeProfileChanges && (
          <Badge variant="secondary" className="text-xs">
            Time Profile Changes
          </Badge>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <>
          <Separator className="my-3" />
          <div className="space-y-4">
            {/* Threshold Changes */}
            {hasThresholdChanges && (
              <div>
                <h4 className="text-sm font-medium mb-2">Threshold Values</h4>
                <div className="space-y-2 bg-muted/30 rounded-md p-3">
                  <ThresholdComparison
                    label="Warning"
                    previous={entry.previousConfig.warningThreshold}
                    current={entry.newConfig.warningThreshold}
                  />
                  <ThresholdComparison
                    label="Critical"
                    previous={entry.previousConfig.criticalThreshold}
                    current={entry.newConfig.criticalThreshold}
                  />
                  <ThresholdComparison
                    label="Emergency"
                    previous={entry.previousConfig.emergencyThreshold}
                    current={entry.newConfig.emergencyThreshold}
                  />
                </div>
              </div>
            )}

            {/* Time Profile Changes */}
            {hasTimeProfileChanges && (
              <div>
                <h4 className="text-sm font-medium mb-2">Time-Based Profiles</h4>
                <div className="space-y-2">
                  <div className="bg-muted/30 rounded-md p-3">
                    <div className="text-xs text-muted-foreground mb-1">Previous:</div>
                    <div className="text-sm">
                      {entry.previousConfig.timeProfile && entry.previousConfig.timeProfile.length > 0 ? (
                        <span>{entry.previousConfig.timeProfile.length} profile(s)</span>
                      ) : (
                        <span className="text-muted-foreground">No profiles</span>
                      )}
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-md p-3">
                    <div className="text-xs text-muted-foreground mb-1">Current:</div>
                    <div className="text-sm">
                      {entry.newConfig.timeProfile && entry.newConfig.timeProfile.length > 0 ? (
                        <span>{entry.newConfig.timeProfile.length} profile(s)</span>
                      ) : (
                        <span className="text-muted-foreground">No profiles</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export function ConfigAuditLog({ areaId, areaName, auditLog }: ConfigAuditLogProps) {
  const sortedLog = [...auditLog].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <CardTitle>Configuration Audit Log</CardTitle>
        </div>
        <CardDescription>
          History of threshold configuration changes for {areaName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedLog.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No configuration changes recorded</p>
            <p className="text-xs mt-1">
              Changes will appear here when thresholds are updated
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {sortedLog.map((entry, index) => (
                <AuditEntryItem key={entry.timestamp} entry={entry} index={index} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
