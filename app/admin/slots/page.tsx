'use client'

import { useState } from 'react'
import { Plus, Edit2, X, TrendingUp, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import AdminLayout from '@/components/admin/admin-layout'
import SlotStatusTable from '@/components/admin/slot-status-table'
import BookingTrendsChart from '@/components/admin/booking-trends-chart'
import CreateSlotForm from '@/components/admin/create-slot-form'

export default function SlotsManagement() {
  const [slots, setSlots] = useState([
    { id: 'S001', timeRange: '06:00 - 07:00', capacity: 500, booked: 480, status: 'Crowded' },
    { id: 'S002', timeRange: '07:00 - 08:00', capacity: 500, booked: 350, status: 'Open' },
    { id: 'S003', timeRange: '08:00 - 09:00', capacity: 500, booked: 425, status: 'Crowded' },
    { id: 'S004', timeRange: '09:00 - 10:00', capacity: 500, booked: 200, status: 'Open' },
    { id: 'S005', timeRange: '10:00 - 11:00', capacity: 500, booked: 480, status: 'Crowded' },
    { id: 'S006', timeRange: '11:00 - 12:00', capacity: 500, booked: 100, status: 'Open' },
  ])

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [alerts, setAlerts] = useState([
    { slotId: 'S001', message: 'Slot S001 has reached 96% capacity', time: '2 min ago' },
    { slotId: 'S003', message: 'Slot S003 has reached 85% capacity', time: '5 min ago' },
    { slotId: 'S005', message: 'Slot S005 has reached 96% capacity', time: '8 min ago' },
  ])

  const handleStatusChange = (slotId: string, newStatus: string) => {
    setSlots(slots.map(slot =>
      slot.id === slotId ? { ...slot, status: newStatus } : slot
    ))
  }

  const handleCreateSlot = (newSlot: any) => {
    const newId = `S${String(slots.length + 1).padStart(3, '0')}`
    setSlots([...slots, {
      id: newId,
      timeRange: `${newSlot.startTime} - ${newSlot.endTime}`,
      capacity: newSlot.capacity,
      booked: 0,
      status: 'Open'
    }])
    setShowCreateForm(false)
  }

  const crowdedSlots = slots.filter(slot => {
    const utilization = (slot.booked / slot.capacity) * 100
    return utilization >= 80
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Create Slot Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Slot Management</h1>
            <p className="text-muted-foreground mt-1">Manage darshan slots and queue capacity</p>
          </div>
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Plus className="w-4 h-4" />
                Create New Slot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Darshan Slot</DialogTitle>
              </DialogHeader>
              <CreateSlotForm onCreateSlot={handleCreateSlot} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Alert Banner for High Capacity Slots */}
        {alerts.length > 0 && (
          <Card className="bg-destructive/10 border-destructive/30 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-destructive mb-2">Active Capacity Alerts</h3>
              <div className="space-y-1 text-sm text-destructive/90">
                {alerts.map((alert, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{alert.message}</span>
                    <span className="text-xs ml-2 text-destructive/70">{alert.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-5">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Slots</p>
              <p className="text-2xl font-bold text-foreground">{slots.length}</p>
            </div>
          </Card>
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-5">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Crowded Slots</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold text-destructive">{crowdedSlots.length}</p>
                <p className="text-xs text-destructive/70">≥80% capacity</p>
              </div>
            </div>
          </Card>
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-5">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Bookings</p>
              <p className="text-2xl font-bold text-foreground">
                {slots.reduce((sum, slot) => sum + slot.booked, 0).toLocaleString()}
              </p>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Slot Table - Main Content */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Darshan Slots</h2>
              <SlotStatusTable
                slots={slots}
                onStatusChange={handleStatusChange}
              />
            </Card>
          </div>

          {/* Booking Trends Chart - Right Column */}
          <div>
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-6">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Hourly Bookings
              </h2>
              <BookingTrendsChart slots={slots} />
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
