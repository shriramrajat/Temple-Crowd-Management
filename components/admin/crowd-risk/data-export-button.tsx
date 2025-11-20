/**
 * Data Export Button Component
 * 
 * Provides functionality to export historical data to CSV or JSON.
 * Requirements: 1.4
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileJson, FileSpreadsheet } from 'lucide-react'
import { DensityHistoryEntry, AlertEvent } from '@/lib/crowd-risk/types'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface DataExportButtonProps {
  densityData?: DensityHistoryEntry[]
  alertData?: AlertEvent[]
  filename?: string
}

/**
 * Convert data to CSV format
 */
function convertToCSV(data: any[], headers: string[]): string {
  const rows = [headers.join(',')]
  
  data.forEach(item => {
    const values = headers.map(header => {
      const value = item[header]
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value ?? ''
    })
    rows.push(values.join(','))
  })
  
  return rows.join('\n')
}

/**
 * Download file to user's computer
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Data Export Button Component
 * 
 * Requirement 1.4: Add export functionality for historical data
 */
export function DataExportButton({
  densityData = [],
  alertData = [],
  filename = 'crowd-risk-data',
}: DataExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  /**
   * Export density data to CSV
   */
  const exportDensityCSV = () => {
    try {
      setIsExporting(true)
      
      const headers = ['timestamp', 'date', 'time', 'areaId', 'densityValue', 'thresholdLevel']
      const data = densityData.map(entry => ({
        timestamp: entry.timestamp,
        date: format(new Date(entry.timestamp), 'yyyy-MM-dd'),
        time: format(new Date(entry.timestamp), 'HH:mm:ss'),
        areaId: entry.areaId,
        densityValue: entry.densityValue,
        thresholdLevel: entry.thresholdLevel,
      }))
      
      const csv = convertToCSV(data, headers)
      downloadFile(csv, `${filename}-density-${Date.now()}.csv`, 'text/csv')
      
      toast.success('Density data exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export density data')
    } finally {
      setIsExporting(false)
    }
  }

  /**
   * Export alert data to CSV
   */
  const exportAlertCSV = () => {
    try {
      setIsExporting(true)
      
      const headers = [
        'id',
        'timestamp',
        'date',
        'time',
        'type',
        'severity',
        'areaId',
        'areaName',
        'densityValue',
        'threshold',
        'location',
        'affectedPilgrimCount',
      ]
      
      const data = alertData.map(alert => ({
        id: alert.id,
        timestamp: alert.timestamp,
        date: format(new Date(alert.timestamp), 'yyyy-MM-dd'),
        time: format(new Date(alert.timestamp), 'HH:mm:ss'),
        type: alert.type,
        severity: alert.severity,
        areaId: alert.areaId,
        areaName: alert.areaName,
        densityValue: alert.densityValue,
        threshold: alert.threshold,
        location: alert.metadata.location,
        affectedPilgrimCount: alert.metadata.affectedPilgrimCount || 0,
      }))
      
      const csv = convertToCSV(data, headers)
      downloadFile(csv, `${filename}-alerts-${Date.now()}.csv`, 'text/csv')
      
      toast.success('Alert data exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export alert data')
    } finally {
      setIsExporting(false)
    }
  }

  /**
   * Export all data to JSON
   */
  const exportJSON = () => {
    try {
      setIsExporting(true)
      
      const data = {
        exportDate: new Date().toISOString(),
        densityData: densityData.map(entry => ({
          ...entry,
          date: format(new Date(entry.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        })),
        alertData: alertData.map(alert => ({
          ...alert,
          date: format(new Date(alert.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        })),
      }
      
      const json = JSON.stringify(data, null, 2)
      downloadFile(json, `${filename}-${Date.now()}.json`, 'application/json')
      
      toast.success('Data exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  const hasData = densityData.length > 0 || alertData.length > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasData || isExporting}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {densityData.length > 0 && (
          <DropdownMenuItem onClick={exportDensityCSV} disabled={isExporting}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Density (CSV)
          </DropdownMenuItem>
        )}
        {alertData.length > 0 && (
          <DropdownMenuItem onClick={exportAlertCSV} disabled={isExporting}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Alerts (CSV)
          </DropdownMenuItem>
        )}
        {hasData && (
          <DropdownMenuItem onClick={exportJSON} disabled={isExporting}>
            <FileJson className="h-4 w-4 mr-2" />
            Export All (JSON)
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
