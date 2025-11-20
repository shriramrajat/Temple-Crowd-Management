'use client'

import { useState } from 'react'
import { Zap, Users, Gauge as Gate, AlertTriangle, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface QuickActionsProps {
  emergencyMode: boolean
  setEmergencyMode: (value: boolean) => void
}

export default function QuickActions({ emergencyMode, setEmergencyMode }: QuickActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleAction = async (action: string) => {
    setLoading(action)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (action === 'emergency') {
      setEmergencyMode(!emergencyMode)
    }
    setLoading(null)
  }

  const actions = [
    {
      id: 'announcement',
      label: 'Trigger Announcement',
      icon: Zap,
      color: 'hover:border-blue-500/50',
      bgColor: 'hover:bg-blue-900/20',
    },
    {
      id: 'emergency',
      label: 'Emergency Mode',
      icon: AlertTriangle,
      color: emergencyMode ? 'border-red-500/50' : 'hover:border-red-500/50',
      bgColor: emergencyMode ? 'bg-red-900/40' : 'hover:bg-red-900/20',
    },
    {
      id: 'volunteers',
      label: 'Dispatch Volunteers',
      icon: Users,
      color: 'hover:border-green-500/50',
      bgColor: 'hover:bg-green-900/20',
    },
    {
      id: 'gate',
      label: 'Close Gate/Redirect',
      icon: Gate,
      color: 'hover:border-orange-500/50',
      bgColor: 'hover:bg-orange-900/20',
    },
  ]

  return (
    <div className="space-y-3">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Button
            key={action.id}
            onClick={() => handleAction(action.id)}
            disabled={loading === action.id}
            className={`w-full h-12 font-semibold border border-primary/30 bg-card/50 text-foreground justify-start gap-3 group transition-all ${action.color} ${action.bgColor}`}
          >
            {loading === action.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Icon className="w-4 h-4 text-primary group-hover:text-primary" />
            )}
            {action.label}
          </Button>
        )
      })}
    </div>
  )
}
