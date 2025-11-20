'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, Users, AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react'
import { PrioritySlotSelector } from '@/components/booking/priority-slot-selector'
import { SlotConfirmation } from '@/components/booking/slot-confirmation'
import { getProfile } from '@/lib/services/accessibility-service'
import { getAvailableSlots, allocateSlot } from '@/lib/services/priority-slot-service'
import { 
  triggerBookingConfirmation, 
  scheduleSlotReminders 
} from '@/lib/services/notification-triggers'
import { showBookingConfirmationToast } from '@/components/notifications/notification-toast'
import { 
  handleAccessibilityError, 
  handleAccessibilitySuccess,
  AccessibilityErrorType 
} from '@/lib/utils/error-handler'
import { LoadingSpinner } from '@/components/ui/loading-state'
import { toast } from 'sonner'
import type { AccessibilityProfile } from '@/lib/types/accessibility'
import type { PrioritySlot, SlotAllocation } from '@/lib/types/priority-slots'

interface Slot {
  id: string
  date: string
  startTime: string
  endTime: string
  capacity: number
  bookedCount: number
  status: string
}

export default function BookingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [accessibilityProfile, setAccessibilityProfile] = useState<AccessibilityProfile | null>(null)
  const [prioritySlots, setPrioritySlots] = useState<PrioritySlot[]>([])
  const [selectedPrioritySlot, setSelectedPrioritySlot] = useState<PrioritySlot | null>(null)
  const [allocation, setAllocation] = useState<SlotAllocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'general' | 'priority'>('general')
  const [slots, setSlots] = useState<Slot[]>([])
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    email: '',
    numberOfPeople: 1
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/booking')
    }
  }, [status, router])

  // Get pilgrim ID from session
  const pilgrimId = session?.user?.id || 'guest'

  // Load slots and accessibility profile
  useEffect(() => {
    async function loadData() {
      if (status === 'loading' || status === 'unauthenticated') return

      try {
        setIsLoading(true)
        setError(null)

        // Fetch available slots from API
        const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
        const slotsResponse = await fetch(`/api/slots?date=${today}`)
        if (slotsResponse.ok) {
          const slotsData = await slotsResponse.json()
          setSlots(slotsData.slots || [])
        } else {
          console.error('Failed to fetch slots:', await slotsResponse.text())
        }

        // Pre-fill user data if authenticated
        if (session?.user) {
          setBookingData(prev => ({
            ...prev,
            name: session.user.name || '',
            email: session.user.email || ''
          }))
        }

        // Fetch accessibility profile if authenticated
        if (pilgrimId !== 'guest') {
          try {
            const profile = await getProfile(pilgrimId)
            setAccessibilityProfile(profile)

            // If profile exists and has accessibility categories, fetch priority slots
            if (profile && profile.categories.length > 0) {
              const prioritySlotsData = getAvailableSlots(profile)
              setPrioritySlots(prioritySlotsData)
              
              // Default to priority tab if eligible
              if (prioritySlotsData.length > 0) {
                setActiveTab('priority')
              }
            }
          } catch (err) {
            // Accessibility profile is optional, don't block booking
            console.warn('Failed to load accessibility profile:', err)
          }
        }
      } catch (err) {
        console.error('Failed to load booking data:', err)
        setError('Failed to load booking information. Please try again.')
        toast.error('Failed to load slots')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [pilgrimId, session, status])

  // Handle priority slot selection
  const handlePrioritySlotSelect = (slot: PrioritySlot) => {
    setSelectedPrioritySlot(slot)
  }

  // Handle priority slot booking
  const handlePrioritySlotBooking = async () => {
    if (!selectedPrioritySlot || !accessibilityProfile) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Allocate the slot
      const newAllocation = await allocateSlot(
        selectedPrioritySlot.id,
        pilgrimId,
        accessibilityProfile
      )

      setAllocation(newAllocation)
      setShowConfirmation(true)

      // Send booking confirmation notification
      await triggerBookingConfirmation(
        newAllocation,
        selectedPrioritySlot.slotTime,
        selectedPrioritySlot.location
      )

      // Schedule slot reminders (30 min and 10 min before)
      scheduleSlotReminders(
        newAllocation,
        selectedPrioritySlot.slotTime,
        selectedPrioritySlot.location
      )

      // Show toast notification
      const slotTimeStr = selectedPrioritySlot.slotTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
      showBookingConfirmationToast(
        slotTimeStr,
        selectedPrioritySlot.location,
        `/booking/${newAllocation.allocationId}`
      )
    } catch (err: any) {
      handleAccessibilityError(
        AccessibilityErrorType.SLOT_ALLOCATION_ERROR,
        err,
        { slotId: selectedPrioritySlot.id, pilgrimId }
      )
      setError(err.message || 'Failed to book priority slot. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    if (!selectedSlot) return

    try {
      setIsBooking(true)
      setError(null)

      // Validate booking data
      if (!bookingData.name || !bookingData.email || !bookingData.phone) {
        toast.error('Please fill in all required fields')
        return
      }

      // Create booking via API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          name: bookingData.name,
          email: bookingData.email,
          phone: bookingData.phone,
          numberOfPeople: bookingData.numberOfPeople,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create booking')
      }

      // Show success message
      toast.success('Booking confirmed!', {
        description: 'Check your email for the QR code',
      })

      // Redirect to bookings page
      setTimeout(() => {
        router.push('/darshan/my-bookings')
      }, 2000)

    } catch (err: any) {
      console.error('Booking error:', err)
      setError(err.message || 'Failed to create booking')
      toast.error(err.message || 'Failed to create booking')
    } finally {
      setIsBooking(false)
    }
  }

  const getCrowdLevel = (slot: Slot) => {
    const remaining = slot.capacity - slot.bookedCount
    const percentage = (remaining / slot.capacity) * 100
    
    if (percentage > 60) return 'low'
    if (percentage > 30) return 'medium'
    return 'high'
  }

  const getCrowdColor = (crowd: string) => {
    if (crowd === 'low') return 'bg-green-100 text-green-800'
    if (crowd === 'medium') return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getCrowdIcon = (crowd: string) => {
    if (crowd === 'low') return '🟢'
    if (crowd === 'medium') return '🟡'
    return '🔴'
  }

  // Show loading state
  if (status === 'loading' || isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </main>
    )
  }

  // Show login prompt if not authenticated
  if (status === 'unauthenticated') {
    return null // Will redirect via useEffect
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Book Your Darshan Slot</h1>
        <p className="text-muted-foreground mb-8">Select a time slot based on crowd predictions</p>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Priority Access Info */}
        {accessibilityProfile && accessibilityProfile.categories.length > 0 && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              You're eligible for priority slots! We've reserved special time slots with reduced wait times for you.
            </AlertDescription>
          </Alert>
        )}

        {/* No Profile Info */}
        {!isLoading && !accessibilityProfile && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Do you need accessibility accommodations?{' '}
              <a href="/profile" className="underline font-medium">
                Set up your accessibility profile
              </a>{' '}
              to access priority slots and personalized assistance.
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs for General and Priority Slots */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'general' | 'priority')} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="general">General Slots</TabsTrigger>
            <TabsTrigger 
              value="priority" 
              disabled={!accessibilityProfile || prioritySlots.length === 0}
              className="relative"
            >
              Priority Slots
              {prioritySlots.length > 0 && (
                <Badge className="ml-2 bg-green-600 text-white text-xs">
                  {prioritySlots.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* General Slots Tab */}
          <TabsContent value="general" className="mt-6">
            {slots.length === 0 ? (
              <Card className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Slots Available</h3>
                <p className="text-muted-foreground">
                  Please check back later for available time slots.
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {slots.map((slot) => {
                  const remaining = slot.capacity - slot.bookedCount
                  const crowd = getCrowdLevel(slot)
                  const isAvailable = remaining > 0 && slot.status === 'active'
                  
                  return (
                    <Card 
                      key={slot.id} 
                      className={`p-6 border-2 border-orange-200 transition ${
                        isAvailable ? 'cursor-pointer hover:shadow-lg hover:border-primary' : 'opacity-60 cursor-not-allowed'
                      }`}
                      onClick={() => {
                        if (isAvailable) {
                          setSelectedSlot(slot)
                          setShowConfirmation(true)
                        }
                      }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-foreground">
                          {slot.startTime} - {slot.endTime}
                        </h3>
                        <Badge className={getCrowdColor(crowd)}>
                          {crowd === 'low' ? '✓ Low Crowd' : crowd === 'medium' ? '⚠ Medium' : '🔴 High'}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Capacity
                          </span>
                          <span className="font-medium">{remaining} / {slot.capacity} available</span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              crowd === 'low' ? 'bg-green-500' : 
                              crowd === 'medium' ? 'bg-yellow-500' : 
                              'bg-red-500'
                            }`}
                            style={{ width: `${(remaining / slot.capacity) * 100}%` }}
                          />
                        </div>

                        <Button 
                          className="w-full mt-4 bg-primary text-white hover:bg-orange-600"
                          disabled={!isAvailable}
                        >
                          {isAvailable ? 'Select Slot' : 'Fully Booked'}
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Priority Slots Tab */}
          <TabsContent value="priority" className="mt-6">
            {isLoading ? (
              <LoadingSpinner message="Loading priority slots..." />
            ) : prioritySlots.length > 0 && accessibilityProfile ? (
              <>
                <PrioritySlotSelector
                  slots={prioritySlots}
                  profile={accessibilityProfile}
                  onSelectSlot={handlePrioritySlotSelect}
                  selectedSlotId={selectedPrioritySlot?.id}
                />
                
                {selectedPrioritySlot && (
                  <div className="mt-6 flex justify-center">
                    <Button
                      size="lg"
                      onClick={handlePrioritySlotBooking}
                      disabled={isLoading}
                      className="min-w-[200px]"
                    >
                      {isLoading ? 'Booking...' : 'Confirm Priority Booking'}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Priority Slots Available</h3>
                <p className="text-muted-foreground">
                  Please check back later or select from general slots.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Priority Slot Confirmation Dialog */}
        {allocation && selectedPrioritySlot && (
          <SlotConfirmation
            allocation={allocation}
            slotTime={selectedPrioritySlot.slotTime}
            slotLocation={selectedPrioritySlot.location}
            open={showConfirmation}
            onClose={() => {
              setShowConfirmation(false)
              setAllocation(null)
              setSelectedPrioritySlot(null)
              // Refresh priority slots
              if (accessibilityProfile) {
                const updatedSlots = getAvailableSlots(accessibilityProfile)
                setPrioritySlots(updatedSlots)
              }
            }}
          />
        )}

        {/* General Slot Confirmation Dialog */}
        <Dialog open={showConfirmation && !allocation} onOpenChange={setShowConfirmation}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl">Confirm Your Booking</DialogTitle>
            </DialogHeader>

            {selectedSlot && (
              <div className="space-y-6">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-muted-foreground mb-1">Selected Slot</p>
                  <p className="text-xl font-bold text-foreground">
                    {selectedSlot.startTime} - {selectedSlot.endTime}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(selectedSlot.date).toLocaleDateString()}
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      value={bookingData.name}
                      onChange={(e) => setBookingData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <input
                      type="email"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      value={bookingData.email}
                      onChange={(e) => setBookingData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <input
                      type="tel"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      value={bookingData.phone}
                      onChange={(e) => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Number of People</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      value={bookingData.numberOfPeople}
                      onChange={(e) => setBookingData(prev => ({ ...prev, numberOfPeople: parseInt(e.target.value) || 1 }))}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowConfirmation(false)}
                    disabled={isBooking}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-primary text-white"
                    onClick={handleConfirmBooking}
                    disabled={isBooking}
                  >
                    {isBooking ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      'Confirm Booking'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}
