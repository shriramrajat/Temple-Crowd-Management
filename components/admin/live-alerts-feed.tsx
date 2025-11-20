'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Heart, Zap, Gauge as Gate } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const ALERT_TYPES = {
  medical: { icon: Heart, label: 'Medical', color: 'bg-red-900/20 border-red-500/30' },
  crowd: { icon: AlertTriangle, label: 'Crowd Surge', color: 'bg-orange-900/20 border-orange-500/30' },
  safety: { icon: Zap, label: 'Safety', color: 'bg-yellow-900/20 border-yellow-500/30' },
  gate: { icon: Gate, label: 'Gate Issue', color: 'bg-blue-900/20 border-blue-500/30' },
}

const MOCK_ALERTS = [
  { id: 1, type: 'crowd', message: 'Crowd surge detected in Garbha Griha', time: '5s ago', severity: 'high', animate: true },
  { id: 2, type: 'medical', message: 'Medical assistance needed at Prasad area', time: '12s ago', severity: 'high', animate: true },
  { id: 3, type: 'gate', message: 'North gate capacity at 85%', time: '23s ago', severity: 'medium', animate: false },
  { id: 4, type: 'safety', message: 'Fire extinguisher check complete', time: '45s ago', severity: 'low', animate: false },
  { id: 5, type: 'crowd', message: 'Pradakshina path clearance initiated', time: '1m ago', severity: 'medium', animate: false },
]

export default function LiveAlertsFeed() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS)

  useEffect(() => {
    const interval = setInterval(() => {
      const newAlert = {
        id: Math.max(...alerts.map((a) => a.id)) + 1,
        type: ['crowd', 'medical', 'safety', 'gate'][Math.floor(Math.random() * 4)] as keyof typeof ALERT_TYPES,
        message: ['High density detected', 'Medical assistance needed', 'Safety check', 'Gate status update'][
          Math.floor(Math.random() * 4)
        ],
        time: 'just now',
        severity: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as string,
        animate: true,
      }

      setAlerts((prev) => [newAlert, ...prev.slice(0, 4)])
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-2 overflow-y-auto max-h-80 pr-2">
      {alerts.map((alert) => {
        const alertConfig = ALERT_TYPES[alert.type as keyof typeof ALERT_TYPES]
        const Icon = alertConfig.icon
        return (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border text-sm transition-all ${alertConfig.color} ${
              alert.animate ? 'animate-pulse-neon' : ''
            }`}
          >
            <div className="flex items-start gap-2 mb-1">
              <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${alert.severity === 'high' ? 'text-red-400' : alert.severity === 'medium' ? 'text-yellow-400' : 'text-green-400'}`} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground text-xs">{alertConfig.label}</div>
                <div className="text-muted-foreground text-xs line-clamp-1">{alert.message}</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{alert.time}</span>
              <Badge
                variant="outline"
                className={`text-xs px-2 py-0.5 ${
                  alert.severity === 'high'
                    ? 'border-red-500/50 bg-red-900/20 text-red-300'
                    : alert.severity === 'medium'
                      ? 'border-yellow-500/50 bg-yellow-900/20 text-yellow-300'
                      : 'border-green-500/50 bg-green-900/20 text-green-300'
                }`}
              >
                {alert.severity.toUpperCase()}
              </Badge>
            </div>
          </div>
        )
      })}
    </div>
  )
}
