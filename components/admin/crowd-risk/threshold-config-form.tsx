'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Save, AlertCircle, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getAuthService } from '@/lib/crowd-risk/auth-service'
import { Permission } from '@/lib/crowd-risk/types'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ThresholdConfigSchema } from '@/lib/crowd-risk/schemas'
import type { ThresholdConfig, MonitoredArea } from '@/lib/crowd-risk/types'
import { TimeProfileEditor } from './time-profile-editor'

interface ThresholdConfigFormProps {
  areas: MonitoredArea[]
  initialConfig?: ThresholdConfig
  onSubmit: (config: ThresholdConfig) => Promise<void>
  onCancel?: () => void
  adminId?: string // Task 15.1: Admin ID for permission checking
}

export function ThresholdConfigForm({
  areas,
  initialConfig,
  onSubmit,
  onCancel,
  adminId,
}: ThresholdConfigFormProps) {
  // Task 15.1: Check if user has permission to configure thresholds
  const authService = getAuthService();
  const canConfigureThresholds = adminId 
    ? authService.checkPermission(adminId, Permission.CONFIGURE_THRESHOLDS)
    : true; // Default to true if no adminId provided (for backward compatibility)
  
  const form = useForm<ThresholdConfig>({
    resolver: zodResolver(ThresholdConfigSchema),
    defaultValues: initialConfig || {
      areaId: '',
      warningThreshold: 0,
      criticalThreshold: 0,
      emergencyThreshold: 0,
      timeProfile: [],
    },
  })

  const handleSubmit = async (data: ThresholdConfig) => {
    try {
      await onSubmit(data)
      form.reset()
    } catch (error) {
      console.error('Failed to save threshold configuration:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Task 15.1: Show read-only notice for users without permission */}
        {!canConfigureThresholds && (
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              You have view-only access to threshold configurations. Contact a Super Admin or Safety Admin to make changes.
            </AlertDescription>
          </Alert>
        )}
        {/* Area Selection */}
        <FormField
          control={form.control}
          name="areaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monitored Area</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full" disabled={!canConfigureThresholds}>
                    <SelectValue placeholder="Select an area to configure" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name} ({area.metadata.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the area for which you want to configure density thresholds
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Threshold Values */}
        <Card>
          <CardHeader>
            <CardTitle>Threshold Values</CardTitle>
            <CardDescription>
              Set density thresholds for different alert levels. Values must be in ascending order.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="warningThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warning Threshold</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 50"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      disabled={!canConfigureThresholds}
                    />
                  </FormControl>
                  <FormDescription>
                    Density level that triggers a warning alert (people per sqm or %)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="criticalThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Critical Threshold</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 75"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      disabled={!canConfigureThresholds}
                    />
                  </FormControl>
                  <FormDescription>
                    Density level that triggers a critical alert (must be higher than warning)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergencyThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Threshold</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 90"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      disabled={!canConfigureThresholds}
                    />
                  </FormControl>
                  <FormDescription>
                    Density level that triggers emergency mode (must be higher than critical)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Validation Alert */}
            {form.formState.errors.warningThreshold?.message?.includes('less than') && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Thresholds must be in ascending order: Warning &lt; Critical &lt; Emergency
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Time-Based Profiles */}
        <FormField
          control={form.control}
          name="timeProfile"
          render={({ field }) => (
            <FormItem>
              <TimeProfileEditor
                profiles={field.value || []}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting || !canConfigureThresholds}>
            <Save className="mr-2 h-4 w-4" />
            {form.formState.isSubmitting ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>

        {/* Success Message */}
        {form.formState.isSubmitSuccessful && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Threshold configuration saved successfully! Changes will be applied within 10 seconds.
            </AlertDescription>
          </Alert>
        )}
      </form>
    </Form>
  )
}
