import { AccessibilityCategory } from '@/lib/types/accessibility'
import { Badge } from '@/components/ui/badge'
import { 
  Accessibility, 
  CircleDot, 
  Users, 
  UserCircle 
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccessibilityBadgeProps {
  category: AccessibilityCategory
  variant?: 'default' | 'outline'
  className?: string
}

interface AccessibilityBadgesProps {
  categories: AccessibilityCategory[]
  variant?: 'default' | 'outline'
  className?: string
}

const categoryConfig: Record<
  AccessibilityCategory,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    colorClass: string
    bgClass: string
    textClass: string
  }
> = {
  elderly: {
    label: 'Elderly',
    icon: UserCircle,
    colorClass: 'border-blue-300',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-800',
  },
  'differently-abled': {
    label: 'Differently-Abled',
    icon: Accessibility,
    colorClass: 'border-purple-300',
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-800',
  },
  'wheelchair-user': {
    label: 'Wheelchair User',
    icon: CircleDot,
    colorClass: 'border-green-300',
    bgClass: 'bg-green-100',
    textClass: 'text-green-800',
  },
  'women-only-route': {
    label: 'Women-Only Route',
    icon: Users,
    colorClass: 'border-pink-300',
    bgClass: 'bg-pink-100',
    textClass: 'text-pink-800',
  },
}

/**
 * Single accessibility badge component
 * Displays a visual indicator for a specific accessibility category
 * with WCAG 2.1 AA compliant colors
 */
export function AccessibilityBadge({
  category,
  variant = 'default',
  className,
}: AccessibilityBadgeProps) {
  const config = categoryConfig[category]
  const Icon = config.icon

  return (
    <Badge
      variant={variant}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1',
        variant === 'default' && `${config.bgClass} ${config.textClass} border ${config.colorClass}`,
        className
      )}
      aria-label={`Accessibility category: ${config.label}`}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      <span className="text-xs font-medium">{config.label}</span>
    </Badge>
  )
}

/**
 * Multiple accessibility badges component
 * Displays a collection of accessibility category badges
 */
export function AccessibilityBadges({
  categories,
  variant = 'default',
  className,
}: AccessibilityBadgesProps) {
  if (categories.length === 0) {
    return null
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)} role="list">
      {categories.map((category) => (
        <div key={category} role="listitem">
          <AccessibilityBadge category={category} variant={variant} />
        </div>
      ))}
    </div>
  )
}
