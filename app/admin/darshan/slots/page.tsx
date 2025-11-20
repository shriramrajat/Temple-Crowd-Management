'use client'

import { useState, useEffect } from 'react'
import { Clock, Plus, Edit, Trash2, RefreshCw, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import AdminLayout from '@/components/admin/admin-layout'
import { format } from 'date-fns'
import type { SlotConfig, GetAdminSlotsResponse, APIError } from '@/lib/types/api'
import { toast } from 'sonner'

interface SlotFormData {
  date: string
  startTime: string
  endTime: string
  capacity: number
  isActive: boolean
}

export default function SlotManagementPage() {
  const [slots, setSlots] = useState<SlotConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Form states
  const [formData, setFormData] = useState<SlotFormData>({
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    capacity: 50,
    isActive: true,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  
  // Selected slot for edit/delete
  const [selectedSlot, setSelectedSlot] = useState<SlotConfig | null>(null)

  const fetchSlots = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/slots')
      
      if (!response.ok) {
        throw new Error('Failed to fetch slots')
      }
      
      const data: GetAdminSlotsResponse = await response.json()
      setSlots(data.slots)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlots()
  }, [])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!formData.date) {
      errors.date = 'Date is required'
    }
    
    if (!formData.startTime) {
      errors.startTime = 'Start time is required'
    }
    
    if (!formData.endTime) {
      errors.endTime = 'End time is required'
    }
    
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      errors.endTime = 'End time must be after start time'
    }
    
    if (!formData.capacity || formData.capacity < 1) {
      errors.capacity = 'Capacity must be at least 1'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateSlot = async () => {
    if (!validateForm()) {
      return
    }
    
    try {
      setSubmitting(true)
      const response = await fetch('/api/admin/slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        const errorData: APIError = await response.json()
        throw new Error(errorData.message || 'Failed to create slot')
      }
      
      toast.success('Slot created successfully')
      setCreateDialogOpen(false)
      resetForm()
      fetchSlots()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create slot'
      toast.error(errorMessage)
      setFormErrors({ submit: errorMessage })
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateSlot = async () => {
    if (!selectedSlot || !validateForm()) {
      return
    }
    
    try {
      setSubmitting(true)
      const response = await fetch(`/api/admin/slots/${selectedSlot.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startTime: formData.startTime,
          endTime: formData.endTime,
          capacity: formData.capacity,
          isActive: formData.isActive,
        }),
      })
      
      if (!response.ok) {
        const errorData: APIError = await response.json()
        throw new Error(errorData.message || 'Failed to update slot')
      }
      
      toast.success('Slot updated successfully')
      setEditDialogOpen(false)
      setSelectedSlot(null)
      resetForm()
      fetchSlots()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update slot'
      toast.error(errorMessage)
      setFormErrors({ submit: errorMessage })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSlot = async () => {
    if (!selectedSlot) {
      return
    }
    
    try {
      setSubmitting(true)
      const response = await fetch(`/api/admin/slots/${selectedSlot.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData: APIError = await response.json()
        throw new Error(errorData.message || 'Failed to delete slot')
      }
      
      toast.success('Slot deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedSlot(null)
      fetchSlots()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete slot'
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (slot: SlotConfig) => {
    try {
      const response = await fetch(`/api/admin/slots/${slot.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !slot.isActive,
        }),
      })
      
      if (!response.ok) {
        const errorData: APIError = await response.json()
        throw new Error(errorData.message || 'Failed to update slot')
      }
      
      toast.success(`Slot ${!slot.isActive ? 'enabled' : 'disabled'} successfully`)
      fetchSlots()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update slot'
      toast.error(errorMessage)
    }
  }

  const openEditDialog = (slot: SlotConfig) => {
    setSelectedSlot(slot)
    setFormData({
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      capacity: slot.capacity,
      isActive: slot.isActive,
    })
    setFormErrors({})
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (slot: SlotConfig) => {
    setSelectedSlot(slot)
    setDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00',
      capacity: 50,
      isActive: true,
    })
    setFormErrors({})
  }

  const openCreateDialog = () => {
    resetForm()
    setCreateDialogOpen(true)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Slot Management</h1>
              <p className="text-muted-foreground mt-1">Configure darshan time slots and capacity</p>
            </div>
          </div>
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-6 animate-pulse">
            <div className="h-64 bg-muted rounded" />
          </Card>
        </div>
      </AdminLayout>
    )
  }

  if (error && slots.length === 0) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchSlots}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </Card>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Slot Management</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Configure darshan time slots and capacity</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="outline" size="sm" onClick={fetchSlots} className="h-8 sm:h-9">
              <RefreshCw className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button onClick={openCreateDialog} size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
              <Plus className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              Create Slot
            </Button>
          </div>
        </div>

        {/* Slots Table */}
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Configured Slots
              </h2>
              <Badge variant="outline">{slots.length} slots</Badge>
            </div>

            {slots.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                <Clock className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                <p className="text-sm sm:text-base mb-1 sm:mb-2">No slots configured yet</p>
                <p className="text-xs sm:text-sm mb-3 sm:mb-4">Create your first slot to start accepting bookings</p>
                <Button onClick={openCreateDialog} variant="outline" size="sm" className="h-9 sm:h-10">
                  <Plus className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                  Create Slot
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Booked</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.map((slot) => {
                    const utilization = slot.capacity > 0 
                      ? Math.round((slot.bookedCount / slot.capacity) * 100)
                      : 0
                    
                    return (
                      <TableRow key={slot.id}>
                        <TableCell className="font-medium">
                          {format(new Date(slot.date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {slot.startTime} - {slot.endTime}
                        </TableCell>
                        <TableCell>{slot.capacity}</TableCell>
                        <TableCell>{slot.bookedCount}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full transition-all"
                                style={{
                                  width: `${utilization}%`,
                                  backgroundColor:
                                    utilization >= 80
                                      ? '#ef4444'
                                      : utilization >= 50
                                      ? '#eab308'
                                      : '#22c55e',
                                }}
                              />
                            </div>
                            <span className="text-xs font-medium">{utilization}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={slot.isActive}
                              onCheckedChange={() => handleToggleActive(slot)}
                            />
                            <Badge variant={slot.isActive ? 'default' : 'secondary'}>
                              {slot.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(slot)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(slot)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              </div>
            )}
          </div>
        </Card>

        {/* Create Slot Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Slot</DialogTitle>
              <DialogDescription>
                Configure a new time slot for darshan bookings
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  aria-invalid={!!formErrors.date}
                />
                {formErrors.date && (
                  <p className="text-xs text-red-500">{formErrors.date}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    aria-invalid={!!formErrors.startTime}
                  />
                  {formErrors.startTime && (
                    <p className="text-xs text-red-500">{formErrors.startTime}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    aria-invalid={!!formErrors.endTime}
                  />
                  {formErrors.endTime && (
                    <p className="text-xs text-red-500">{formErrors.endTime}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  aria-invalid={!!formErrors.capacity}
                />
                {formErrors.capacity && (
                  <p className="text-xs text-red-500">{formErrors.capacity}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              
              {formErrors.submit && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                  <p className="text-xs text-red-500">{formErrors.submit}</p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateSlot} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Slot'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Slot Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Slot</DialogTitle>
              <DialogDescription>
                Update slot configuration
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  disabled
                  className="opacity-50"
                />
                <p className="text-xs text-muted-foreground">Date cannot be changed</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-startTime">Start Time</Label>
                  <Input
                    id="edit-startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    aria-invalid={!!formErrors.startTime}
                  />
                  {formErrors.startTime && (
                    <p className="text-xs text-red-500">{formErrors.startTime}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-endTime">End Time</Label>
                  <Input
                    id="edit-endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    aria-invalid={!!formErrors.endTime}
                  />
                  {formErrors.endTime && (
                    <p className="text-xs text-red-500">{formErrors.endTime}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-capacity">Capacity</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  min={selectedSlot?.bookedCount || 1}
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  aria-invalid={!!formErrors.capacity}
                />
                {selectedSlot && selectedSlot.bookedCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Minimum capacity: {selectedSlot.bookedCount} (current bookings)
                  </p>
                )}
                {formErrors.capacity && (
                  <p className="text-xs text-red-500">{formErrors.capacity}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="edit-isActive">Active</Label>
              </div>
              
              {formErrors.submit && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                  <p className="text-xs text-red-500">{formErrors.submit}</p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateSlot} disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Slot'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Slot</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this slot?
                {selectedSlot && selectedSlot.bookedCount > 0 && (
                  <span className="block mt-2 text-red-500 font-medium">
                    Warning: This slot has {selectedSlot.bookedCount} existing booking(s).
                    Deletion may fail if bookings exist.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSlot}
                disabled={submitting}
                className="bg-red-500 hover:bg-red-600"
              >
                {submitting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  )
}
