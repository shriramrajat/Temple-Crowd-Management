'use client'

/**
 * SOS Emergency Alert Page
 * 
 * Main interface for pilgrims to send emergency alerts.
 * Implements a multi-step flow:
 * 1. Press SOS button
 * 2. Capture location
 * 3. Select alert type
 * 4. Select urgency level
 * 5. Confirm and submit
 * 6. Show success/acknowledgment status
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.5, 2.1, 3.1, 4.1, 6.1, 6.2, 6.3, 6.5
 */

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useLocation } from '@/hooks/use-location'
import { useSOSStatus } from '@/hooks/use-sos-status'
import { SOSButton } from '@/components/sos/sos-button'
import { AlertTypeSelector } from '@/components/sos/alert-type-selector'
import { UrgencyLevelSelector } from '@/components/sos/urgency-level-selector'
import { LocationDisplay } from '@/components/sos/location-display'
import { ManualLocationInput } from '@/components/sos/manual-location-input'
import { AlertStatusBadge } from '@/components/sos/alert-status-badge'
import { Button } from '@/components/ui/button'
import { useLiveRegion } from '@/components/accessibility/live-region'
import { 
  AlertType, 
  UrgencyLevel, 
  AlertStatus,
  LocationData,
  SOSAlert,
  CreateSOSAlertRequest
} from '@/lib/types/sos'
import { 
  checkRateLimit, 
  recordAlertSent, 
  formatRemainingTime 
} from '@/lib/utils/rate-limit'
import { toast } from 'sonner'
import { 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  MapPin,
  Clock,
  User,
  ShieldAlert
} from 'lucide-react'

/**
 * SOS Flow Steps
 */
enum SOSStep {
  INITIAL = 'initial',
  CAPTURING_LOCATION = 'capturing_location',
  SELECT_TYPE = 'select_type',
  SELECT_URGENCY = 'select_urgency',
  CONFIRM = 'confirm',
  SUBMITTING = 'submitting',
  SUCCESS = 'success',
  ERROR = 'error'
}

/**
 * Retry configuration for exponential backoff
 * Requirement: 4.4, 4.5, 6.4
 */
const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 1000 // 1 second

export default function SOSPage() {
  // Location hook
  const { loading: locationLoading, error: locationError, requestLocation } = useLocation()
  
  // SOS status polling hook
  const { alert: polledAlert, isPolling, isAcknowledged, startPolling } = useSOSStatus()
  
  // Live region for screen reader announcements
  const { announce, LiveRegionComponent } = useLiveRegion()
  
  // Flow state
  const [currentStep, setCurrentStep] = useState<SOSStep>(SOSStep.INITIAL)
  const [selectedType, setSelectedType] = useState<AlertType | null>(null)
  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyLevel>(UrgencyLevel.HIGH)
  const [capturedLocation, setCapturedLocation] = useState<LocationData | null>(null)
  const [showManualInput, setShowManualInput] = useState(false)
  
  // Alert state
  const [submittedAlert, setSubmittedAlert] = useState<SOSAlert | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Rate limiting state
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [remainingCooldown, setRemainingCooldown] = useState(0)

  /**
   * Handle SOS button press
   * Requirement: 1.1 - Capture location within 3 seconds
   * Requirement: 1.1 - Check rate limit before allowing alert
   */
  const handleSOSPress = async () => {
    // Check rate limit first
    const rateLimitCheck = checkRateLimit()
    
    if (!rateLimitCheck.allowed) {
      setIsRateLimited(true)
      setRemainingCooldown(rateLimitCheck.remainingTime)
      
      // Announce to screen readers
      announce(
        `Please wait ${formatRemainingTime(rateLimitCheck.remainingTime)} before sending another alert.`,
        'assertive'
      )
      
      // Show rate limit message
      toast.error('Please wait before sending another alert', {
        description: `You can send another SOS in ${formatRemainingTime(rateLimitCheck.remainingTime)}`,
        duration: 5000
      })
      
      return
    }
    
    setCurrentStep(SOSStep.CAPTURING_LOCATION)
    setErrorMessage(null)
    setIsRateLimited(false)
    
    // Announce to screen readers
    // Requirement: 1.3 - Implement status announcements for loading states
    announce('Capturing your location, please wait', 'polite')
    
    // Show loading toast after 2 seconds
    // Requirement: 1.3 - Show loading spinner after 2 seconds
    const loadingToastTimer = setTimeout(() => {
      if (currentStep === SOSStep.CAPTURING_LOCATION) {
        toast.loading('Capturing your location...', { id: 'location-loading' })
      }
    }, 2000)
    
    try {
      const locationData = await requestLocation()
      clearTimeout(loadingToastTimer)
      toast.dismiss('location-loading')
      
      if (locationData) {
        setCapturedLocation(locationData)
        setCurrentStep(SOSStep.SELECT_TYPE)
        
        // Announce success to screen readers
        announce('Location captured successfully. Please select emergency type.', 'polite')
        
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(100)
        }
      } else {
        // Location failed but we can still proceed
        handleLocationError()
      }
    } catch (error) {
      clearTimeout(loadingToastTimer)
      toast.dismiss('location-loading')
      handleLocationError()
    }
  }

  /**
   * Handle location errors
   * Requirement: 4.4, 4.5 - Handle location errors with clear messaging
   * Requirement: 9.4 - Provide manual location input as fallback
   */
  const handleLocationError = () => {
    if (locationError) {
      setErrorMessage(locationError.message)
      
      // Announce error to screen readers
      // Requirement: 6.4 - Ensure error messages are announced
      announce(`Location error: ${locationError.message}. You can retry, enter location manually, or continue without location.`, 'assertive')
      
      // Show error toast with retry option
      toast.error(locationError.message, {
        action: {
          label: 'Retry',
          onClick: () => handleRetryLocation()
        },
        duration: 10000
      })
    }
    
    // Show manual input option
    setShowManualInput(true)
    setCurrentStep(SOSStep.SELECT_TYPE)
  }

  /**
   * Retry location capture
   * Requirement: 4.5 - Handle location unavailable with retry option
   */
  const handleRetryLocation = async () => {
    setErrorMessage(null)
    setShowManualInput(false)
    setCurrentStep(SOSStep.CAPTURING_LOCATION)
    
    try {
      const locationData = await requestLocation()
      if (locationData) {
        setCapturedLocation(locationData)
        setShowManualInput(false)
        toast.success('Location captured successfully')
      }
    } catch (error) {
      handleLocationError()
    }
  }

  /**
   * Handle manual location input submission
   * Requirement: 9.4 - Implement manual location input as fallback
   */
  const handleManualLocationSubmit = (location: LocationData) => {
    setCapturedLocation(location)
    setShowManualInput(false)
    setErrorMessage(null)
    
    // Announce to screen readers
    announce('Manual location entered successfully. Please select emergency type.', 'polite')
    
    toast.success('Location entered successfully')
  }

  /**
   * Handle showing manual input
   */
  const handleShowManualInput = () => {
    setShowManualInput(true)
    
    // Announce to screen readers
    announce('Showing manual location input form.', 'polite')
  }

  /**
   * Handle canceling manual input
   */
  const handleCancelManualInput = () => {
    setShowManualInput(false)
  }

  /**
   * Handle alert type selection
   * Requirement: 2.1 - Show AlertTypeSelector after location is captured
   */
  const handleTypeSelect = (type: AlertType) => {
    setSelectedType(type)
  }

  /**
   * Handle alert type auto-submit or manual proceed
   * Requirement: 2.4 - Auto-submit after 10 seconds
   */
  const handleTypeProceed = () => {
    if (!selectedType) {
      // Default to GENERAL if no selection
      setSelectedType(AlertType.GENERAL)
    }
    
    // Announce to screen readers
    announce('Alert type selected. Please select urgency level.', 'polite')
    
    setCurrentStep(SOSStep.SELECT_URGENCY)
  }

  /**
   * Handle urgency level selection
   * Requirement: 3.1 - Show UrgencyLevelSelector after alert type is selected
   */
  const handleUrgencySelect = (level: UrgencyLevel) => {
    setSelectedUrgency(level)
  }

  /**
   * Handle urgency auto-submit or manual proceed
   * Requirement: 3.5 - Auto-submit after 10 seconds with default level
   */
  const handleUrgencyProceed = () => {
    // Announce to screen readers
    announce('Urgency level selected. Please review and confirm your emergency alert.', 'polite')
    
    setCurrentStep(SOSStep.CONFIRM)
  }

  /**
   * Handle final confirmation and submission
   * Requirement: 1.2 - Transmit alert within 5 seconds
   */
  const handleConfirmSubmit = async () => {
    setCurrentStep(SOSStep.SUBMITTING)
    setRetryCount(0)
    
    // Announce to screen readers
    announce('Sending emergency alert, please wait', 'polite')
    
    await submitAlert()
  }

  /**
   * Submit alert to API with exponential backoff retry
   * Requirement: 6.4 - Implement exponential backoff for retries (3 attempts)
   */
  const submitAlert = async (attempt: number = 0): Promise<void> => {
    try {
      // Build request payload
      const requestData: CreateSOSAlertRequest = {
        alertType: selectedType || AlertType.GENERAL,
        urgencyLevel: selectedUrgency,
        location: capturedLocation || {
          latitude: 0,
          longitude: 0,
          accuracy: 0,
          timestamp: Date.now(),
          address: 'Location unavailable'
        },
        pilgrimInfo: {
          // In a real app, this would come from user profile
          name: 'Pilgrim User',
          phone: '+91 98765-43210'
        }
      }

      // Submit to API (using database-backed endpoint)
      const response = await fetch('/api/sos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emergencyType: requestData.alertType,
          location: requestData.location ? {
            latitude: requestData.location.latitude,
            longitude: requestData.location.longitude,
          } : null,
          manualLocation: requestData.location?.address,
          message: requestData.notes,
          userName: requestData.pilgrimInfo?.name,
          userPhone: requestData.pilgrimInfo?.phone,
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.alert) {
        // Success!
        setSubmittedAlert(data.alert)
        setCurrentStep(SOSStep.SUCCESS)
        
        // Record alert sent for rate limiting
        // Requirement: 1.1 - Store last alert timestamp
        recordAlertSent()
        
        // Announce success to screen readers
        // Requirement: 1.3, 6.1 - Implement status announcements for success states
        announce('Emergency alert sent successfully! Help is on the way. Stay calm and safe.', 'assertive')
        
        // Show success feedback
        // Requirement: 6.1, 6.2, 6.3 - Visual, haptic feedback
        toast.success('SOS Alert Sent Successfully!', {
          description: 'Help is on the way. Stay calm and safe.',
          duration: 5000
        })
        
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200])
        }
        
        // Start polling for acknowledgment using the hook
        // Requirement: 6.5, 7.3 - Poll for acknowledgment status
        startPolling(data.alert.id, data.alert)
      } else {
        throw new Error(data.error || 'Failed to create alert')
      }
    } catch (error) {
      console.error('Error submitting SOS alert:', error)
      
      // Retry with exponential backoff
      if (attempt < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt)
        setRetryCount(attempt + 1)
        
        toast.loading(`Retrying... (Attempt ${attempt + 2}/${MAX_RETRIES + 1})`, {
          id: 'retry-toast'
        })
        
        await new Promise(resolve => setTimeout(resolve, delay))
        toast.dismiss('retry-toast')
        
        return submitAlert(attempt + 1)
      } else {
        // Max retries reached
        setCurrentStep(SOSStep.ERROR)
        const errorMsg = error instanceof Error 
          ? error.message 
          : 'Failed to send SOS alert. Please try again.'
        setErrorMessage(errorMsg)
        
        // Announce error to screen readers
        // Requirement: 6.4 - Ensure error messages are announced
        announce(`Error: ${errorMsg}. Please check your connection and try again.`, 'assertive')
        
        toast.error('Failed to send SOS alert', {
          description: 'Please check your connection and try again.',
          action: {
            label: 'Retry',
            onClick: () => handleConfirmSubmit()
          },
          duration: 10000
        })
      }
    }
  }

  /**
   * Handle acknowledgment notification
   * Requirement: 6.5, 7.3 - Show acknowledgment notification with authority name and time
   */
  useEffect(() => {
    if (isAcknowledged && polledAlert && polledAlert.acknowledgment) {
      // Update the submitted alert with the latest data
      setSubmittedAlert(polledAlert)
      
      // Announce to screen readers
      // Requirement: 6.1 - Add live regions for dynamic content
      announce(
        `Your alert has been acknowledged by ${polledAlert.acknowledgment.authorityName}. Help is on the way.`,
        'assertive'
      )
      
      // Show acknowledgment notification
      // Requirement: 7.3 - Display toast notification when alert is acknowledged
      toast.success('Your alert has been acknowledged!', {
        description: `Help is on the way. ${polledAlert.acknowledgment.authorityName} is responding.`,
        duration: 10000
      })
      
      // Haptic feedback on mobile
      // Requirement: 6.5 - Provide haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100])
      }
    }
  }, [isAcknowledged, polledAlert, announce])

  /**
   * Cooldown timer effect
   * Requirement: 1.1 - Show cooldown timer if user tries to send multiple alerts
   */
  useEffect(() => {
    if (!isRateLimited || remainingCooldown <= 0) {
      return
    }

    const interval = setInterval(() => {
      setRemainingCooldown(prev => {
        const newValue = prev - 1000
        
        if (newValue <= 0) {
          setIsRateLimited(false)
          return 0
        }
        
        return newValue
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRateLimited, remainingCooldown])

  /**
   * Check rate limit on component mount
   * Requirement: 1.1 - Display appropriate message during cooldown period
   */
  useEffect(() => {
    const rateLimitCheck = checkRateLimit()
    
    if (!rateLimitCheck.allowed) {
      setIsRateLimited(true)
      setRemainingCooldown(rateLimitCheck.remainingTime)
    }
  }, [])

  /**
   * Handle cancel at any step
   */
  const handleCancel = () => {
    setCurrentStep(SOSStep.INITIAL)
    setSelectedType(null)
    setSelectedUrgency(UrgencyLevel.HIGH)
    setCapturedLocation(null)
    setErrorMessage(null)
    setRetryCount(0)
    setShowManualInput(false)
  }

  /**
   * Handle starting a new alert
   */
  const handleNewAlert = () => {
    setCurrentStep(SOSStep.INITIAL)
    setSelectedType(null)
    setSelectedUrgency(UrgencyLevel.HIGH)
    setCapturedLocation(null)
    setSubmittedAlert(null)
    setErrorMessage(null)
    setRetryCount(0)
    setShowManualInput(false)
  }

  /**
   * Render content based on current step
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case SOSStep.INITIAL:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 sm:gap-8 px-4">
            <div className="text-center space-y-3 sm:space-y-4 max-w-md">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                Emergency SOS
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground px-4">
                Press the button below to send an emergency alert to temple authorities
              </p>
            </div>
            
            {/* Rate limit warning */}
            {isRateLimited && remainingCooldown > 0 && (
              <div 
                className="bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-300 dark:border-orange-700 rounded-lg p-4 max-w-md w-full"
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-start gap-3">
                  <ShieldAlert className="size-5 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold text-orange-900 dark:text-orange-200">
                      Cooldown Active
                    </p>
                    <p className="text-xs sm:text-sm text-orange-800 dark:text-orange-300">
                      Please wait <strong>{formatRemainingTime(remainingCooldown)}</strong> before sending another alert.
                    </p>
                    <p className="text-xs text-orange-700 dark:text-orange-400 mt-2">
                      This helps prevent accidental duplicate alerts.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <SOSButton
              onTrigger={handleSOSPress}
              label="SEND SOS"
              disabled={isRateLimited}
              className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 text-xl sm:text-2xl md:text-3xl"
            />
            
            <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-md px-4">
              Your location will be captured and shared with emergency responders
            </p>
          </div>
        )

      case SOSStep.CAPTURING_LOCATION:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 sm:gap-8 px-4">
            <Loader2 className="size-12 sm:size-16 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold">Capturing Location...</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Please wait while we get your current location
              </p>
            </div>
          </div>
        )

      case SOSStep.SELECT_TYPE:
        return (
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-4">
            {/* Location display or manual input */}
            {showManualInput && !capturedLocation ? (
              <ManualLocationInput
                onLocationSubmit={handleManualLocationSubmit}
                onCancel={handleCancelManualInput}
              />
            ) : (
              <>
                <LocationDisplay
                  location={capturedLocation}
                  loading={locationLoading}
                  error={locationError}
                />
                
                {/* Show manual input button if location failed */}
                {locationError && !capturedLocation && !showManualInput && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      onClick={handleRetryLocation}
                      className="flex-1 min-h-[48px]"
                    >
                      Retry Location
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleShowManualInput}
                      className="flex-1 min-h-[48px]"
                    >
                      Enter Location Manually
                    </Button>
                  </div>
                )}
              </>
            )}
            
            {/* Alert type selector - only show if not in manual input mode */}
            {!showManualInput && (
              <AlertTypeSelector
                value={selectedType}
                onChange={handleTypeSelect}
                onAutoSubmit={handleTypeProceed}
                onCancel={handleCancel}
                useBottomSheet={true}
              />
            )}
          </div>
        )

      case SOSStep.SELECT_URGENCY:
        return (
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-4">
            {/* Location display or manual input */}
            {showManualInput && !capturedLocation ? (
              <ManualLocationInput
                onLocationSubmit={handleManualLocationSubmit}
                onCancel={handleCancelManualInput}
              />
            ) : (
              <>
                <LocationDisplay
                  location={capturedLocation}
                  loading={false}
                  error={locationError}
                />
                
                {/* Show manual input button if location failed */}
                {locationError && !capturedLocation && !showManualInput && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      onClick={handleRetryLocation}
                      className="flex-1 min-h-[48px]"
                    >
                      Retry Location
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleShowManualInput}
                      className="flex-1 min-h-[48px]"
                    >
                      Enter Location Manually
                    </Button>
                  </div>
                )}
              </>
            )}
            
            {/* Urgency level selector - only show if not in manual input mode */}
            {!showManualInput && (
              <UrgencyLevelSelector
                value={selectedUrgency}
                onChange={handleUrgencySelect}
                onAutoSubmit={handleUrgencyProceed}
                onCancel={handleCancel}
                useBottomSheet={true}
              />
            )}
          </div>
        )

      case SOSStep.CONFIRM:
        return (
          <div className="max-w-2xl mx-auto px-4">
            <ConfirmationDialog
              alertType={selectedType || AlertType.GENERAL}
              urgencyLevel={selectedUrgency}
              location={capturedLocation}
              onConfirm={handleConfirmSubmit}
              onCancel={handleCancel}
            />
          </div>
        )

      case SOSStep.SUBMITTING:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 sm:gap-8 px-4">
            <Loader2 className="size-12 sm:size-16 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold">Sending Alert...</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Please wait while we send your emergency alert
              </p>
              {retryCount > 0 && (
                <p className="text-sm text-orange-600">
                  Retry attempt {retryCount} of {MAX_RETRIES}
                </p>
              )}
            </div>
          </div>
        )

      case SOSStep.SUCCESS:
        return (
          <div className="max-w-2xl mx-auto px-4">
            <SuccessView
              alert={polledAlert || submittedAlert}
              isPolling={isPolling}
              isAcknowledged={isAcknowledged}
              onNewAlert={handleNewAlert}
            />
          </div>
        )

      case SOSStep.ERROR:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 sm:gap-8 px-4">
            <AlertCircle className="size-12 sm:size-16 text-destructive" />
            <div className="text-center space-y-2 max-w-md">
              <h2 className="text-xl sm:text-2xl font-bold text-destructive">
                Failed to Send Alert
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                {errorMessage || 'An error occurred while sending your alert'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-xs">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="min-h-[48px] flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSubmit}
                className="bg-red-600 hover:bg-red-700 min-h-[48px] flex-1"
              >
                Try Again
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <main 
      id="main-content"
      className="min-h-screen bg-gradient-to-br from-background via-orange-50/30 to-red-50/30 dark:from-background dark:via-orange-950/10 dark:to-red-950/10"
      role="main"
      aria-label="SOS Emergency Alert Page"
    >
      {/* Live region for screen reader announcements */}
      <LiveRegionComponent />
      
      <div className="container mx-auto px-4 py-8">
        {renderStepContent()}
      </div>
    </main>
  )
}

/**
 * Confirmation Dialog Component
 * Requirement: Implement confirmation dialog with all alert details
 */
interface ConfirmationDialogProps {
  alertType: AlertType
  urgencyLevel: UrgencyLevel
  location: LocationData | null
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmationDialog({
  alertType,
  urgencyLevel,
  location,
  onConfirm,
  onCancel
}: ConfirmationDialogProps) {
  const confirmButtonRef = React.useRef<HTMLButtonElement>(null)

  // Auto-focus the confirm button when dialog appears
  React.useEffect(() => {
    confirmButtonRef.current?.focus()
  }, [])

  const alertTypeLabels: Record<AlertType, string> = {
    [AlertType.MEDICAL]: 'Medical Emergency',
    [AlertType.SECURITY]: 'Security Threat',
    [AlertType.LOST]: 'Lost Person',
    [AlertType.ACCIDENT]: 'Accident',
    [AlertType.GENERAL]: 'General Assistance'
  }

  const urgencyLabels: Record<UrgencyLevel, string> = {
    [UrgencyLevel.LOW]: 'Low',
    [UrgencyLevel.MEDIUM]: 'Medium',
    [UrgencyLevel.HIGH]: 'High',
    [UrgencyLevel.CRITICAL]: 'Critical'
  }

  return (
    <div 
      className="space-y-4 sm:space-y-6"
      role="dialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <div className="text-center space-y-2">
        <h2 
          id="confirm-dialog-title"
          className="text-2xl sm:text-3xl font-bold text-foreground"
        >
          Confirm Emergency Alert
        </h2>
        <p 
          id="confirm-dialog-description"
          className="text-sm sm:text-base text-muted-foreground"
        >
          Please review your alert details before sending
        </p>
      </div>

      <div 
        className="bg-card border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4"
        role="region"
        aria-label="Alert details summary"
      >
        {/* Alert Type */}
        <div className="flex items-start gap-2 sm:gap-3">
          <AlertCircle className="size-4 sm:size-5 text-orange-600 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Alert Type</p>
            <p className="text-base sm:text-lg font-semibold">{alertTypeLabels[alertType]}</p>
          </div>
        </div>

        {/* Urgency Level */}
        <div className="flex items-start gap-2 sm:gap-3">
          <Clock className="size-4 sm:size-5 text-orange-600 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Urgency Level</p>
            <p className="text-base sm:text-lg font-semibold">{urgencyLabels[urgencyLevel]}</p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 sm:gap-3">
          <MapPin className="size-4 sm:size-5 text-orange-600 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Location</p>
            {location ? (
              <div className="space-y-1">
                {location.address && (
                  <p className="text-xs sm:text-sm break-words">{location.address}</p>
                )}
                {location.zone && (
                  <p className="text-xs sm:text-sm text-muted-foreground">{location.zone}</p>
                )}
                <p className="text-xs font-mono text-muted-foreground break-all">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-muted-foreground">Location unavailable</p>
            )}
          </div>
        </div>

        {/* Pilgrim Info */}
        <div className="flex items-start gap-2 sm:gap-3">
          <User className="size-4 sm:size-5 text-orange-600 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Your Information</p>
            <p className="text-xs sm:text-sm">Pilgrim User</p>
            <p className="text-xs text-muted-foreground">+91 98765-43210</p>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-orange-900 dark:text-orange-200">
          <strong>Important:</strong> By sending this alert, you confirm that you need emergency assistance. 
          Temple authorities will be notified immediately and will respond to your location.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 min-h-[48px]"
          aria-label="Cancel emergency alert"
        >
          Cancel
        </Button>
        <Button
          ref={confirmButtonRef}
          onClick={onConfirm}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white min-h-[48px]"
          aria-label="Confirm and send emergency SOS alert"
        >
          Send SOS Alert
        </Button>
      </div>
    </div>
  )
}

/**
 * Success View Component
 * Requirement: 6.1, 6.2, 6.3 - Show success confirmation with visual feedback
 * Requirement: 6.5, 7.3 - Update alert status badge in UI
 */
interface SuccessViewProps {
  alert: SOSAlert | null
  isPolling: boolean
  isAcknowledged: boolean
  onNewAlert: () => void
}

function SuccessView({ alert, isPolling, isAcknowledged, onNewAlert }: SuccessViewProps) {
  if (!alert) return null

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Success animation */}
      <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 py-6 sm:py-8">
        <div className="relative">
          <div className="absolute inset-0 animate-ping">
            <CheckCircle2 className="size-16 sm:size-20 md:size-24 text-green-500 opacity-75" />
          </div>
          <CheckCircle2 className="size-16 sm:size-20 md:size-24 text-green-600 relative" />
        </div>
        
        <div className="text-center space-y-2 px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-green-600">
            Alert Sent Successfully!
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Help is on the way. Stay calm and safe.
          </p>
        </div>
      </div>

      {/* Alert details */}
      <div className="bg-card border-2 border-green-200 dark:border-green-800 rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <h3 className="font-semibold text-base sm:text-lg">Alert Details</h3>
          <div className="flex items-center gap-2">
            <AlertStatusBadge status={alert.status} size="sm" />
            {isPolling && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="size-3 animate-spin" />
                <span className="hidden sm:inline">Checking status...</span>
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
          <div>
            <p className="text-muted-foreground">Alert ID</p>
            <p className="font-mono text-xs sm:text-sm break-all">{alert.id}</p>
          </div>
          
          <div>
            <p className="text-muted-foreground">Time Sent</p>
            <p className="text-xs sm:text-sm">{new Date(alert.createdAt).toLocaleString()}</p>
          </div>

          {alert.acknowledgment && (
            <div className="pt-2 sm:pt-3 border-t">
              <p className="text-green-600 font-semibold mb-2 text-xs sm:text-sm">
                ✓ Acknowledged by {alert.acknowledgment.authorityName}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(alert.acknowledgment.acknowledgedAt).toLocaleString()}
              </p>
              {alert.acknowledgment.notes && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  Note: {alert.acknowledgment.notes}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Next steps */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
        <h4 className="font-semibold text-sm sm:text-base text-blue-900 dark:text-blue-200 mb-2">
          What happens next?
        </h4>
        <ul className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
          <li>Temple authorities have been notified of your location</li>
          {isAcknowledged ? (
            <>
              <li className="font-semibold">✓ Your alert has been acknowledged - help is on the way!</li>
              <li>Emergency responders are heading to your location</li>
            </>
          ) : (
            <>
              <li>Help will be dispatched to your location shortly</li>
              <li>You'll be notified when your alert is acknowledged</li>
            </>
          )}
          <li>Stay where you are if it's safe to do so</li>
        </ul>
      </div>

      <Button
        onClick={onNewAlert}
        variant="outline"
        className="w-full min-h-[48px]"
      >
        Send Another Alert
      </Button>
    </div>
  )
}
