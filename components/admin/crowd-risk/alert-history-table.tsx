'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, ChevronsUpDown, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { AlertLogEntry, ThresholdLevel } from '@/lib/crowd-risk/types'

/**
 * Sort direction type
 */
type SortDirection = 'asc' | 'desc' | null

/**
 * Sort field type
 */
type SortField = 'timestamp' | 'severity' | 'area' | null

/**
 * Alert History Table Component Props
 */
interface AlertHistoryTableProps {
  data: AlertLogEntry[]
  currentPage: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onSort?: (field: SortField, direction: SortDirection) => void
  className?: string
}

/**
 * Alert History Table Component
 * 
 * Displays alert log entries with pagination, sorting, and row expansion.
 * Requirements: 14.2 - Display alert log entries with all required columns
 */
export function AlertHistoryTable({
  data,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onSort,
  className,
}: AlertHistoryTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField>('timestamp')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  /**
   * Toggle row expansion
   */
  const toggleRowExpansion = (alertId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(alertId)) {
      newExpanded.delete(alertId)
    } else {
      newExpanded.add(alertId)
    }
    setExpandedRows(newExpanded)
  }

  /**
   * Handle sort
   */
  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = 'asc'
    
    if (sortField === field) {
      if (sortDirection === 'asc') {
        newDirection = 'desc'
      } else if (sortDirection === 'desc') {
        newDirection = null
      }
    }

    setSortField(newDirection ? field : null)
    setSortDirection(newDirection)
    
    if (onSort) {
      onSort(field, newDirection)
    }
  }

  /**
   * Get sort icon for column
   */
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="h-4 w-4" />
    }
    if (sortDirection === 'desc') {
      return <ChevronDown className="h-4 w-4" />
    }
    return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
  }

  /**
   * Get severity badge variant
   */
  const getSeverityBadge = (severity: ThresholdLevel) => {
    const variants = {
      [ThresholdLevel.EMERGENCY]: { variant: 'destructive' as const, className: '' },
      [ThresholdLevel.CRITICAL]: { variant: 'destructive' as const, className: 'bg-orange-600' },
      [ThresholdLevel.WARNING]: { variant: 'default' as const, className: 'bg-yellow-600' },
      [ThresholdLevel.NORMAL]: { variant: 'secondary' as const, className: '' },
    }
    
    const config = variants[severity]
    return (
      <Badge variant={config.variant} className={config.className}>
        {severity}
      </Badge>
    )
  }

  /**
   * Format timestamp
   */
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    }
  }

  /**
   * Calculate notification success rate
   */
  const calculateSuccessRate = (entry: AlertLogEntry) => {
    const { adminNotifications } = entry.notificationResults
    if (adminNotifications.length === 0) return 0
    
    const delivered = adminNotifications.filter(n => n.delivered).length
    return Math.round((delivered / adminNotifications.length) * 100)
  }

  /**
   * Get notification channels used
   */
  const getChannelsUsed = (entry: AlertLogEntry) => {
    const channels = new Set(
      entry.notificationResults.adminNotifications.map(n => n.channel)
    )
    return Array.from(channels).join(', ')
  }

  /**
   * Calculate pagination
   */
  const totalPages = Math.ceil(totalItems / pageSize)
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  /**
   * Sort data locally if no external sort handler
   */
  const sortedData = useMemo(() => {
    if (onSort || !sortField || !sortDirection) {
      return data
    }

    return [...data].sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'timestamp':
          comparison = a.alertEvent.timestamp - b.alertEvent.timestamp
          break
        case 'severity':
          const severityOrder = {
            [ThresholdLevel.EMERGENCY]: 0,
            [ThresholdLevel.CRITICAL]: 1,
            [ThresholdLevel.WARNING]: 2,
            [ThresholdLevel.NORMAL]: 3,
          }
          comparison = severityOrder[a.alertEvent.severity] - severityOrder[b.alertEvent.severity]
          break
        case 'area':
          comparison = a.alertEvent.areaName.localeCompare(b.alertEvent.areaName)
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [data, sortField, sortDirection, onSort])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Table */}
      <div className="rounded-md border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('timestamp')}
                  className="gap-2 hover:bg-transparent"
                >
                  Timestamp
                  {getSortIcon('timestamp')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('area')}
                  className="gap-2 hover:bg-transparent"
                >
                  Area
                  {getSortIcon('area')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('severity')}
                  className="gap-2 hover:bg-transparent"
                >
                  Severity
                  {getSortIcon('severity')}
                </Button>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Density</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Success Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No alerts found matching the current filters
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((entry) => {
                const isExpanded = expandedRows.has(entry.id)
                const timestamp = formatTimestamp(entry.alertEvent.timestamp)
                const successRate = calculateSuccessRate(entry)
                const channelsUsed = getChannelsUsed(entry)
                const isAcknowledged = entry.acknowledgments.length > 0
                const isResolved = !!entry.resolution

                return (
                  <Collapsible
                    key={entry.id}
                    open={isExpanded}
                    onOpenChange={() => toggleRowExpansion(entry.id)}
                    asChild
                  >
                    <>
                      <TableRow className="cursor-pointer hover:bg-muted/30">
                        <TableCell>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{timestamp.date}</span>
                            <span className="text-xs text-muted-foreground">{timestamp.time}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{entry.alertEvent.areaName}</span>
                        </TableCell>
                        <TableCell>
                          {getSeverityBadge(entry.alertEvent.severity)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm capitalize">
                            {entry.alertEvent.type.replace(/_/g, ' ')}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-medium">
                              {entry.alertEvent.densityValue.toFixed(1)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              / {entry.alertEvent.threshold.toFixed(1)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {isAcknowledged && (
                              <Badge variant="outline" className="gap-1 w-fit">
                                <CheckCircle className="h-3 w-3" />
                                Acknowledged
                              </Badge>
                            )}
                            {isResolved && (
                              <Badge variant="outline" className="gap-1 w-fit bg-green-50 dark:bg-green-950">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                Resolved
                              </Badge>
                            )}
                            {!isAcknowledged && !isResolved && (
                              <Badge variant="outline" className="gap-1 w-fit">
                                <Clock className="h-3 w-3" />
                                Pending
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className={cn(
                              'text-sm font-medium',
                              successRate >= 95 ? 'text-green-600' :
                              successRate >= 80 ? 'text-yellow-600' :
                              'text-red-600'
                            )}>
                              {successRate}%
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {entry.notificationResults.adminNotifications.filter(n => n.delivered).length}/
                              {entry.notificationResults.adminNotifications.length}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                      <CollapsibleContent asChild>
                        <TableRow>
                          <TableCell colSpan={8} className="bg-muted/20">
                            <div className="p-4 space-y-4">
                              {/* Alert Details */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                  <h4 className="text-sm font-semibold mb-2">Alert Details</h4>
                                  <dl className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <dt className="text-muted-foreground">Alert ID:</dt>
                                      <dd className="font-mono text-xs">{entry.id}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                      <dt className="text-muted-foreground">Area ID:</dt>
                                      <dd className="font-mono text-xs">{entry.alertEvent.areaId}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                      <dt className="text-muted-foreground">Location:</dt>
                                      <dd>{entry.alertEvent.metadata.location}</dd>
                                    </div>
                                  </dl>
                                </div>

                                <div>
                                  <h4 className="text-sm font-semibold mb-2">Notification Statistics</h4>
                                  <dl className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <dt className="text-muted-foreground">Channels Used:</dt>
                                      <dd>{channelsUsed || 'None'}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                      <dt className="text-muted-foreground">Pilgrims Notified:</dt>
                                      <dd>{entry.notificationResults.pilgrimCount}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                      <dt className="text-muted-foreground">Success Rate:</dt>
                                      <dd className={cn(
                                        'font-medium',
                                        successRate >= 95 ? 'text-green-600' :
                                        successRate >= 80 ? 'text-yellow-600' :
                                        'text-red-600'
                                      )}>
                                        {successRate}%
                                      </dd>
                                    </div>
                                  </dl>
                                </div>

                                <div>
                                  <h4 className="text-sm font-semibold mb-2">Status</h4>
                                  <dl className="space-y-1 text-sm">
                                    {entry.acknowledgments.length > 0 && (
                                      <>
                                        <div className="flex justify-between">
                                          <dt className="text-muted-foreground">Acknowledged By:</dt>
                                          <dd>{entry.acknowledgments[0].adminId}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                          <dt className="text-muted-foreground">Acknowledged At:</dt>
                                          <dd>{new Date(entry.acknowledgments[0].timestamp).toLocaleString()}</dd>
                                        </div>
                                      </>
                                    )}
                                    {entry.resolution && (
                                      <>
                                        <div className="flex justify-between">
                                          <dt className="text-muted-foreground">Resolved By:</dt>
                                          <dd>{entry.resolution.resolvedBy}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                          <dt className="text-muted-foreground">Resolved At:</dt>
                                          <dd>{new Date(entry.resolution.resolvedAt).toLocaleString()}</dd>
                                        </div>
                                      </>
                                    )}
                                  </dl>
                                </div>
                              </div>

                              {/* Resolution Notes */}
                              {entry.resolution && entry.resolution.notes && (
                                <div>
                                  <h4 className="text-sm font-semibold mb-2">Resolution Notes</h4>
                                  <p className="text-sm text-muted-foreground bg-background p-3 rounded-md border border-border/50">
                                    {entry.resolution.notes}
                                  </p>
                                </div>
                              )}

                              {/* Suggested Actions */}
                              {entry.alertEvent.metadata.suggestedActions && entry.alertEvent.metadata.suggestedActions.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold mb-2">Suggested Actions</h4>
                                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    {entry.alertEvent.metadata.suggestedActions.map((action, idx) => (
                                      <li key={idx}>{action}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {totalItems} alerts
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
