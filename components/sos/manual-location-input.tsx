'use client'

/**
 * Manual Location Input Component
 * 
 * Provides a fallback mechanism for users to manually enter their location
 * when geolocation is unavailable, denied, or fails.
 * 
 * Requirements: 9.4 - Implement manual location input as fallback
 */

import * as React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LocationData } from '@/lib/types/sos'
import { MapPin, Navigation } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ManualLocationInputProps {
  /** Callback when location is manually entered */
  onLocationSubmit: (location: LocationData) => void
  
  /** Callback when user cancels manual input */
  onCancel?: () => void
  
  /** Additional CSS classes */
  className?: string
}

/**
 * ManualLocationInput Component
 * 
 * Allows users to manually enter their location information when
 * automatic geolocation fails or is unavailable.
 * 
 * Features:
 * - Text description of location
 * - Optional coordinate input
 * - Validation of coordinate format
 * - Accessible form design
 */
export function ManualLocationInput({
  onLocationSubmit,
  onCancel,
  className
}: ManualLocationInputProps) {
  const [locationDescription, setLocationDescription] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [errors, setErrors] = useState<{
    description?: string
    latitude?: string
    longitude?: string
  }>({})

  /**
   * Validate coordinate input
   */
  const validateCoordinates = (): boolean => {
    const newErrors: typeof errors = {}
    
    // If coordinates are provided, validate them
    if (latitude || longitude) {
      const lat = parseFloat(latitude)
      const lng = parseFloat(longitude)
      
      if (latitude && (isNaN(lat) || lat < -90 || lat > 90)) {
        newErrors.latitude = 'Latitude must be between -90 and 90'
      }
      
      if (longitude && (isNaN(lng) || lng < -180 || lng > 180)) {
        newErrors.longitude = 'Longitude must be between -180 and 180'
      }
      
      // Both must be provided if one is provided
      if (latitude && !longitude) {
        newErrors.longitude = 'Longitude is required when latitude is provided'
      }
      if (longitude && !latitude) {
        newErrors.latitude = 'Latitude is required when longitude is provided'
      }
    }
    
    // Description is required if no coordinates
    if (!locationDescription.trim() && !latitude && !longitude) {
      newErrors.description = 'Please provide a location description or coordinates'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateCoordinates()) {
      return
    }
    
    // Build location data
    const locationData: LocationData = {
      latitude: latitude ? parseFloat(latitude) : 0,
      longitude: longitude ? parseFloat(longitude) : 0,
      accuracy: 0, // Manual input has no accuracy
      address: locationDescription.trim() || 'Manual location input',
      timestamp: Date.now()
    }
    
    onLocationSubmit(locationData)
  }

  return (
    <div 
      className={cn(
        'w-full rounded-lg border-2 border-orange-200',
        'bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 p-4 sm:p-6',
        className
      )}
      role="region"
      aria-label="Manual location input"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <MapPin className="size-5 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg text-orange-900 dark:text-orange-100">
              Enter Location Manually
            </h3>
            <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-300 mt-1">
              Describe your location or provide coordinates if known
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Location Description */}
          <div className="space-y-2">
            <Label 
              htmlFor="location-description"
              className="text-sm font-medium text-orange-900 dark:text-orange-100"
            >
              Location Description *
            </Label>
            <Textarea
              id="location-description"
              value={locationDescription}
              onChange={(e) => setLocationDescription(e.target.value)}
              placeholder="e.g., Near main temple entrance, Gate 3, Parking lot B..."
              className={cn(
                'min-h-[80px] resize-none',
                errors.description && 'border-destructive focus-visible:ring-destructive'
              )}
              aria-describedby={errors.description ? 'description-error' : undefined}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p 
                id="description-error"
                className="text-xs text-destructive"
                role="alert"
              >
                {errors.description}
              </p>
            )}
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Provide as much detail as possible to help responders find you
            </p>
          </div>

          {/* Optional Coordinates */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Navigation className="size-4 text-orange-600 dark:text-orange-400" />
              <Label className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Coordinates (Optional)
              </Label>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Latitude */}
              <div className="space-y-2">
                <Label 
                  htmlFor="latitude"
                  className="text-xs text-orange-700 dark:text-orange-300"
                >
                  Latitude
                </Label>
                <Input
                  id="latitude"
                  type="text"
                  inputMode="decimal"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g., 28.6139"
                  className={cn(
                    'font-mono text-sm',
                    errors.latitude && 'border-destructive focus-visible:ring-destructive'
                  )}
                  aria-describedby={errors.latitude ? 'latitude-error' : undefined}
                  aria-invalid={!!errors.latitude}
                />
                {errors.latitude && (
                  <p 
                    id="latitude-error"
                    className="text-xs text-destructive"
                    role="alert"
                  >
                    {errors.latitude}
                  </p>
                )}
              </div>

              {/* Longitude */}
              <div className="space-y-2">
                <Label 
                  htmlFor="longitude"
                  className="text-xs text-orange-700 dark:text-orange-300"
                >
                  Longitude
                </Label>
                <Input
                  id="longitude"
                  type="text"
                  inputMode="decimal"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g., 77.2090"
                  className={cn(
                    'font-mono text-sm',
                    errors.longitude && 'border-destructive focus-visible:ring-destructive'
                  )}
                  aria-describedby={errors.longitude ? 'longitude-error' : undefined}
                  aria-invalid={!!errors.longitude}
                />
                {errors.longitude && (
                  <p 
                    id="longitude-error"
                    className="text-xs text-destructive"
                    role="alert"
                  >
                    {errors.longitude}
                  </p>
                )}
              </div>
            </div>
            
            <p className="text-xs text-orange-600 dark:text-orange-400">
              If you know your GPS coordinates, you can enter them here
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 min-h-[48px]"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white min-h-[48px]"
            >
              Use This Location
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

/**
 * Export display name for debugging
 */
ManualLocationInput.displayName = 'ManualLocationInput'
