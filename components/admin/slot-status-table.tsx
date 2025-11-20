'use client'

import { useState } from 'react'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical } from 'lucide-react'

interface Slot {
  id: string
  timeRange: string
  capacity: number
  booked: number
  status: string
}

interface SlotStatusTableProps {
  slots: Slot[]
  onStatusChange: (slotId: string, newStatus: string) => void
}

export default function SlotStatusTable({ slots, onStatusChange }: SlotStatusTableProps) {
  const getUtilization = (booked: number, capacity: number) => {
    return Math.round((booked / capacity) * 100)
  }

  const getStatusBadge = (status: string, utilization: number) => {
    if (status === 'Closed') return <Badge variant="secondary" className="bg-muted text-muted-foreground">Closed</Badge>
    if (utilization >= 80) return <Badge variant="destructive">Crowded</Badge>
    if (utilization >= 50) return <Badge className="bg-yellow-600 hover:bg-yellow-700">Moderate</Badge>
    return <Badge className="bg-green-600 hover:bg-green-700">Open</Badge>
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return 'text-destructive font-semibold'
    if (utilization >= 50) return 'text-yellow-500 font-semibold'
    return 'text-green-500 font-semibold'
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="text-muted-foreground">Slot ID</TableHead>
            <TableHead className="text-muted-foreground">Time Range</TableHead>
            <TableHead className="text-right text-muted-foreground">Capacity</TableHead>
            <TableHead className="text-right text-muted-foreground">Booked</TableHead>
            <TableHead className="text-right text-muted-foreground">Remaining</TableHead>
            <TableHead className="text-center text-muted-foreground">Utilization</TableHead>
            <TableHead className="text-center text-muted-foreground">Status</TableHead>
            <TableHead className="text-center text-muted-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {slots.map((slot) => {
            const utilization = getUtilization(slot.booked, slot.capacity)
            const remaining = slot.capacity - slot.booked

            return (
              <TableRow key={slot.id} className="border-border/50 hover:bg-muted/30 transition-colors">
                <TableCell className="font-mono text-sm font-semibold text-primary">{slot.id}</TableCell>
                <TableCell className="text-foreground">{slot.timeRange}</TableCell>
                <TableCell className="text-right text-foreground">{slot.capacity.toLocaleString()}</TableCell>
                <TableCell className="text-right text-foreground">{slot.booked}</TableCell>
                <TableCell className={`text-right ${remaining <= 50 ? 'text-destructive font-semibold' : 'text-foreground'}`}>
                  {remaining}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          utilization >= 80
                            ? 'bg-destructive'
                            : utilization >= 50
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${utilization}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${getUtilizationColor(utilization)}`}>
                      {utilization}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(slot.status, utilization)}
                </TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onStatusChange(slot.id, 'Open')} className="cursor-pointer">
                        Mark as Open
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onStatusChange(slot.id, 'Crowded')} className="cursor-pointer">
                        Mark as Crowded
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onStatusChange(slot.id, 'Closed')} className="cursor-pointer text-destructive">
                        Close Slot
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
