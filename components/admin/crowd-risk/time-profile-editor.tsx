'use client'

import { useState } from 'react'
import { Plus, Trash2, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { TimeBasedProfile } from '@/lib/crowd-risk/types'
import { validateTimeProfiles } from '@/lib/crowd-risk/schemas'

interface TimeProfileEditorProps {
  profiles: TimeBasedProfile[]
  onChange: (profiles: TimeBasedProfile[]) => void
}

export function TimeProfileEditor({ profiles, onChange }: TimeProfileEditorProps) {
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const addProfile = () => {
    const newProfile: TimeBasedProfile = {
      startTime: '00:00',
      endTime: '23:59',
      thresholds: {
        warningThreshold: 0,
        criticalThreshold: 0,
        emergencyThreshold: 0,
      },
    }
    const updatedProfiles = [...profiles, newProfile]
    onChange(updatedProfiles)
    validateProfiles(updatedProfiles)
  }

  const removeProfile = (index: number) => {
    const updatedProfiles = profiles.filter((_, i) => i !== index)
    onChange(updatedProfiles)
    validateProfiles(updatedProfiles)
  }

  const updateProfile = (index: number, field: string, value: any) => {
    const updatedProfiles = [...profiles]
    
    if (field.startsWith('thresholds.')) {
      const thresholdField = field.split('.')[1] as keyof TimeBasedProfile['thresholds']
      updatedProfiles[index] = {
        ...updatedProfiles[index],
        thresholds: {
          ...updatedProfiles[index].thresholds,
          [thresholdField]: parseFloat(value),
        },
      }
    } else {
      updatedProfiles[index] = {
        ...updatedProfiles[index],
        [field]: value,
      }
    }
    
    onChange(updatedProfiles)
    validateProfiles(updatedProfiles)
  }

  const validateProfiles = (profilesToValidate: TimeBasedProfile[]) => {
    const result = validateTimeProfiles(profilesToValidate)
    setValidationErrors(result.errors)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time-Based Profiles
            </CardTitle>
            <CardDescription>
              Configure different thresholds for specific times of day (optional)
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addProfile}>
            <Plus className="mr-2 h-4 w-4" />
            Add Profile
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {profiles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No time-based profiles configured</p>
            <p className="text-xs mt-1">
              Add profiles to use different thresholds at different times
            </p>
          </div>
        ) : (
          profiles.map((profile, index) => (
            <Card key={index} className="border-border/50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Time Range */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label htmlFor={`start-time-${index}`}>Start Time</Label>
                      <Input
                        id={`start-time-${index}`}
                        type="time"
                        value={profile.startTime}
                        onChange={(e) => updateProfile(index, 'startTime', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`end-time-${index}`}>End Time</Label>
                      <Input
                        id={`end-time-${index}`}
                        type="time"
                        value={profile.endTime}
                        onChange={(e) => updateProfile(index, 'endTime', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProfile(index)}
                      className="mt-6"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  {/* Thresholds */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`warning-${index}`}>Warning</Label>
                      <Input
                        id={`warning-${index}`}
                        type="number"
                        placeholder="50"
                        value={profile.thresholds.warningThreshold || ''}
                        onChange={(e) =>
                          updateProfile(index, 'thresholds.warningThreshold', e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`critical-${index}`}>Critical</Label>
                      <Input
                        id={`critical-${index}`}
                        type="number"
                        placeholder="75"
                        value={profile.thresholds.criticalThreshold || ''}
                        onChange={(e) =>
                          updateProfile(index, 'thresholds.criticalThreshold', e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`emergency-${index}`}>Emergency</Label>
                      <Input
                        id={`emergency-${index}`}
                        type="number"
                        placeholder="90"
                        value={profile.thresholds.emergencyThreshold || ''}
                        onChange={(e) =>
                          updateProfile(index, 'thresholds.emergencyThreshold', e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-1">Time Profile Validation Errors:</div>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
