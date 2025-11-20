'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CreateSlotFormProps {
  onCreateSlot: (slot: { startTime: string; endTime: string; capacity: number }) => void
}

export default function CreateSlotForm({ onCreateSlot }: CreateSlotFormProps) {
  const [startTime, setStartTime] = useState('06:00')
  const [endTime, setEndTime] = useState('07:00')
  const [capacity, setCapacity] = useState(500)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreateSlot({ startTime, endTime, capacity })
    setStartTime('06:00')
    setEndTime('07:00')
    setCapacity(500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime" className="text-foreground text-sm font-medium">
            Start Time
          </Label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="bg-input border-border text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime" className="text-foreground text-sm font-medium">
            End Time
          </Label>
          <Input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="bg-input border-border text-foreground"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="capacity" className="text-foreground text-sm font-medium">
          Slot Capacity
        </Label>
        <Input
          id="capacity"
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(parseInt(e.target.value))}
          min="10"
          max="1000"
          className="bg-input border-border text-foreground"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
          Create Slot
        </Button>
      </div>
    </form>
  )
}
