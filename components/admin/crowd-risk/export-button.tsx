'use client'

import { useState } from 'react'
import { Download, FileJson, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AlertLogEntry } from '@/lib/crowd-risk/types'
import { toast } from 'sonner'

/**
 * Export Button Component Props
 */
interface ExportButtonProps {
  data: AlertLogEntry[]
  filename?: string
  disabled?: boolean
}

/**
 * Export Button Component
 * 
 * Provides CSV and JSON export functionality for alert history.
 * Requirements: 14.2 - Export functionality with CSV/JSON format selection
 */
export function ExportButton({ data, filename, disabled }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  /**
   * Generate filename with timestamp
   */
  const generateFilename = (extension: string): string => {
    const timestamp = new Date().toISOString().split('T')[0]
    return filename ? `${filename}-${timestamp}.${extension}` : `alert-history-${timestamp}.${extension}`
  }

  /**
   * Export data as CSV
   */
  const exportAsCSV = () => {
    setIsExporting(true)

    try {
      // Define CSV headers
      const headers = [
        'Alert ID',
        'Timestamp',
        'Area ID',
        'Area Name',
        'Severity',
        'Type',
        'Density Value',
        'Threshold',
        'Admin Notifications Sent',
        'Admin Notifications Delivered',
        'Pilgrim Count',
        'Acknowledgments',
        'Acknowledged By',
        'Acknowledged At',
        'Resolved',
        'Resolved By',
        'Resolved At',
        'Resolution Notes',
      ]

      // Convert data to CSV rows
      const rows = data.map((entry) => {
        const alert = entry.alertEvent
        const notificationResults = entry.notificationResults
        const deliveredCount = notificationResults.adminNotifications.filter(n => n.delivered).length
        const totalSent = notificationResults.adminNotifications.length
        
        const firstAck = entry.acknowledgments[0]
        const resolution = entry.resolution

        return [
          alert.id,
          new Date(alert.timestamp).toISOString(),
          alert.areaId,
          alert.areaName,
          alert.severity,
          alert.type,
          alert.densityValue.toFixed(2),
          alert.threshold.toFixed(2),
          totalSent,
          deliveredCount,
          notificationResults.pilgrimCount,
          entry.acknowledgments.length,
          firstAck ? firstAck.adminId : '',
          firstAck ? new Date(firstAck.timestamp).toISOString() : '',
          resolution ? 'Yes' : 'No',
          resolution ? resolution.resolvedBy : '',
          resolution ? new Date(resolution.resolvedAt).toISOString() : '',
          resolution ? resolution.notes.replace(/"/g, '""') : '', // Escape quotes
        ]
      })

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', generateFilename('csv'))
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('CSV exported successfully', {
        description: `${data.length} alert records exported`,
      })
    } catch (error) {
      console.error('Failed to export CSV:', error)
      toast.error('Failed to export CSV', {
        description: 'Please try again',
      })
    } finally {
      setIsExporting(false)
    }
  }

  /**
   * Export data as JSON
   */
  const exportAsJSON = () => {
    setIsExporting(true)

    try {
      // Convert data to JSON with pretty printing
      const jsonContent = JSON.stringify(data, null, 2)

      // Create blob and download
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', generateFilename('json'))
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('JSON exported successfully', {
        description: `${data.length} alert records exported`,
      })
    } catch (error) {
      console.error('Failed to export JSON:', error)
      toast.error('Failed to export JSON', {
        description: 'Please try again',
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isExporting || data.length === 0}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportAsCSV} className="gap-2">
          <FileText className="h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsJSON} className="gap-2">
          <FileJson className="h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
