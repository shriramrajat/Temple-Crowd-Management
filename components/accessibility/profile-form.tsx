'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AccessibilityProfileFormSchema } from '@/lib/schemas/accessibility'
import { AccessibilityCategory } from '@/lib/types/accessibility'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { 
  Accessibility, 
  CircleDot, 
  Users, 
  UserCircle,
  Phone,
  User,
  Bell,
  CloudRain,
  Navigation,
  MapPin
} from 'lucide-react'

type AccessibilityProfileFormData = z.infer<typeof AccessibilityProfileFormSchema>

interface AccessibilityProfileFormProps {
  defaultValues?: Partial<AccessibilityProfileFormData>
  onSubmit: (data: AccessibilityProfileFormData) => void
  isLoading?: boolean
}

const accessibilityOptions: Array<{
  value: AccessibilityCategory
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  {
    value: 'elderly',
    label: 'Elderly',
    description: 'Senior citizen requiring additional time and assistance',
    icon: UserCircle,
  },
  {
    value: 'differently-abled',
    label: 'Differently-Abled',
    description: 'Physical or cognitive accessibility needs',
    icon: Accessibility,
  },
  {
    value: 'wheelchair-user',
    label: 'Wheelchair User',
    description: 'Requires wheelchair-accessible routes and facilities',
    icon: CircleDot,
  },
  {
    value: 'women-only-route',
    label: 'Women-Only Route Preference',
    description: 'Prefer routes through designated women-only areas',
    icon: Users,
  },
]

export function AccessibilityProfileForm({
  defaultValues,
  onSubmit,
  isLoading = false,
}: AccessibilityProfileFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AccessibilityProfileFormData>({
    resolver: zodResolver(AccessibilityProfileFormSchema),
    defaultValues: {
      categories: defaultValues?.categories || [],
      mobilitySpeed: defaultValues?.mobilitySpeed || 'normal',
      requiresAssistance: defaultValues?.requiresAssistance || false,
      emergencyContact: defaultValues?.emergencyContact,
      preferences: {
        notifyOnAssistanceZone: defaultValues?.preferences?.notifyOnAssistanceZone ?? true,
        prioritySlotReminders: defaultValues?.preferences?.prioritySlotReminders ?? true,
        weatherAlerts: defaultValues?.preferences?.weatherAlerts ?? true,
        routeRecalculationAlerts: defaultValues?.preferences?.routeRecalculationAlerts ?? true,
      },
    },
  })

  const selectedCategories = watch('categories') || []
  const requiresAssistance = watch('requiresAssistance')
  const preferences = watch('preferences')

  const toggleCategory = (category: AccessibilityCategory) => {
    const current = selectedCategories
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category]
    setValue('categories', updated, { shouldValidate: true })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" aria-label="Accessibility profile form">
      {/* Accessibility Categories */}
      <Card className="p-6 border-2 border-orange-200">
        <fieldset>
          <legend className="text-lg font-semibold text-foreground mb-2">
            Accessibility Categories
          </legend>
          <p className="text-sm text-muted-foreground mb-4" id="categories-description">
            Select all categories that apply to you
          </p>

          <div className="space-y-3" role="group" aria-labelledby="categories-description">
            {accessibilityOptions.map((option) => {
              const Icon = option.icon
              const isSelected = selectedCategories.includes(option.value)

              return (
                <div
                  key={option.value}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleCategory(option.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleCategory(option.value);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`${option.label}: ${option.description}`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleCategory(option.value)}
                    className="mt-1"
                    aria-hidden="true"
                    tabIndex={-1}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                      <span className="text-sm font-medium cursor-pointer">
                        {option.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {errors.categories && (
            <p className="text-sm text-red-600 mt-2" role="alert" aria-live="polite">
              {errors.categories.message}
            </p>
          )}
        </fieldset>
      </Card>

      {/* Mobility Speed */}
      <Card className="p-6 border-2 border-orange-200">
        <fieldset>
          <legend className="text-lg font-semibold text-foreground mb-2">
            Mobility Speed
          </legend>
          <p className="text-sm text-muted-foreground mb-4" id="mobility-description">
            This helps us calculate accurate travel times for your routes
          </p>

          <div className="space-y-2" role="radiogroup" aria-labelledby="mobility-description">
            {(['slow', 'moderate', 'normal'] as const).map((speed) => (
              <label
                key={speed}
                className="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer hover:bg-gray-50 transition focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
              >
                <input
                  type="radio"
                  value={speed}
                  {...register('mobilitySpeed')}
                  className="w-4 h-4"
                  aria-label={`Mobility speed: ${speed}`}
                />
                <span className="text-sm font-medium capitalize">{speed}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </Card>

      {/* Assistance Requirement */}
      <Card className="p-6 border-2 border-orange-200">
        <div className="flex items-center justify-between">
          <div id="assistance-label">
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Requires Assistance
            </h3>
            <p className="text-sm text-muted-foreground">
              Enable if you need staff assistance during your visit
            </p>
          </div>
          <Switch
            checked={requiresAssistance}
            onCheckedChange={(checked) =>
              setValue('requiresAssistance', checked)
            }
            aria-labelledby="assistance-label"
            aria-checked={requiresAssistance}
            role="switch"
          />
        </div>
      </Card>

      {/* Emergency Contact */}
      <Card className="p-6 border-2 border-orange-200">
        <fieldset>
          <legend className="text-lg font-semibold text-foreground mb-2">
            Emergency Contact (Optional)
          </legend>
          <p className="text-sm text-muted-foreground mb-4">
            Provide emergency contact information for safety purposes
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="emergency-name" className="text-sm font-medium">
                <User className="w-4 h-4 inline mr-1" aria-hidden="true" />
                Name
              </Label>
              <Input
                id="emergency-name"
                {...register('emergencyContact.name')}
                placeholder="Contact person name"
                className="mt-1"
                aria-invalid={!!errors.emergencyContact?.name}
                aria-describedby={errors.emergencyContact?.name ? 'emergency-name-error' : undefined}
              />
              {errors.emergencyContact?.name && (
                <p id="emergency-name-error" className="text-sm text-red-600 mt-1" role="alert" aria-live="polite">
                  {errors.emergencyContact.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="emergency-phone" className="text-sm font-medium">
                <Phone className="w-4 h-4 inline mr-1" aria-hidden="true" />
                Phone Number
              </Label>
              <Input
                id="emergency-phone"
                {...register('emergencyContact.phone')}
                placeholder="+91 98765 43210"
                type="tel"
                className="mt-1"
                aria-invalid={!!errors.emergencyContact?.phone}
                aria-describedby={errors.emergencyContact?.phone ? 'emergency-phone-error' : undefined}
              />
              {errors.emergencyContact?.phone && (
                <p id="emergency-phone-error" className="text-sm text-red-600 mt-1" role="alert" aria-live="polite">
                  {errors.emergencyContact.phone.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="emergency-relationship" className="text-sm font-medium">
                Relationship
              </Label>
              <Input
                id="emergency-relationship"
                {...register('emergencyContact.relationship')}
                placeholder="e.g., Spouse, Child, Friend"
                className="mt-1"
                aria-invalid={!!errors.emergencyContact?.relationship}
                aria-describedby={errors.emergencyContact?.relationship ? 'emergency-relationship-error' : undefined}
              />
              {errors.emergencyContact?.relationship && (
                <p id="emergency-relationship-error" className="text-sm text-red-600 mt-1" role="alert" aria-live="polite">
                  {errors.emergencyContact.relationship.message}
                </p>
              )}
            </div>
          </div>
        </fieldset>
      </Card>

      {/* Notification Preferences */}
      <Card className="p-6 border-2 border-orange-200">
        <fieldset>
          <legend className="text-lg font-semibold text-foreground mb-2">
            Notification Preferences
          </legend>
          <p className="text-sm text-muted-foreground mb-4">
            Choose which notifications you'd like to receive
          </p>

          <div className="space-y-4" role="group" aria-label="Notification preferences">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2" id="notify-assistance-label">
                <MapPin className="w-4 h-4 text-primary" aria-hidden="true" />
                <Label htmlFor="notify-assistance" className="text-sm font-medium">
                  Assistance Zone Alerts
                </Label>
              </div>
              <Switch
                id="notify-assistance"
                checked={preferences?.notifyOnAssistanceZone}
                onCheckedChange={(checked) =>
                  setValue('preferences.notifyOnAssistanceZone', checked)
                }
                aria-labelledby="notify-assistance-label"
                aria-checked={preferences?.notifyOnAssistanceZone}
                role="switch"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2" id="slot-reminders-label">
                <Bell className="w-4 h-4 text-primary" aria-hidden="true" />
                <Label htmlFor="slot-reminders" className="text-sm font-medium">
                  Priority Slot Reminders
                </Label>
              </div>
              <Switch
                id="slot-reminders"
                checked={preferences?.prioritySlotReminders}
                onCheckedChange={(checked) =>
                  setValue('preferences.prioritySlotReminders', checked)
                }
                aria-labelledby="slot-reminders-label"
                aria-checked={preferences?.prioritySlotReminders}
                role="switch"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2" id="weather-alerts-label">
                <CloudRain className="w-4 h-4 text-primary" aria-hidden="true" />
                <Label htmlFor="weather-alerts" className="text-sm font-medium">
                  Weather & Condition Alerts
                </Label>
              </div>
              <Switch
                id="weather-alerts"
                checked={preferences?.weatherAlerts}
                onCheckedChange={(checked) =>
                  setValue('preferences.weatherAlerts', checked)
                }
                aria-labelledby="weather-alerts-label"
                aria-checked={preferences?.weatherAlerts}
                role="switch"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2" id="route-alerts-label">
                <Navigation className="w-4 h-4 text-primary" aria-hidden="true" />
                <Label htmlFor="route-alerts" className="text-sm font-medium">
                  Route Recalculation Alerts
                </Label>
              </div>
              <Switch
                id="route-alerts"
                checked={preferences?.routeRecalculationAlerts}
                onCheckedChange={(checked) =>
                  setValue('preferences.routeRecalculationAlerts', checked)
                }
                aria-labelledby="route-alerts-label"
                aria-checked={preferences?.routeRecalculationAlerts}
                role="switch"
              />
            </div>
          </div>
        </fieldset>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? 'Saving...' : 'Save Accessibility Profile'}
      </Button>
    </form>
  )
}
