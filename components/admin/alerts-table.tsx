'use client'

import { AlertTriangle, Heart, Zap, Gauge as Gate, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const alerts = [
  {
    id: 'ALT-001',
    type: 'crowd',
    description: 'Crowd surge in Garbha Griha',
    zone: 'Garbha Griha',
    severity: 'high',
    timestamp: '5 minutes ago',
    status: 'active',
  },
  {
    id: 'ALT-002',
    type: 'medical',
    description: 'Medical assistance provided',
    zone: 'Prasad Area',
    severity: 'high',
    timestamp: '12 minutes ago',
    status: 'resolved',
  },
  {
    id: 'ALT-003',
    type: 'gate',
    description: 'North gate capacity threshold',
    zone: 'North Gate',
    severity: 'medium',
    timestamp: '23 minutes ago',
    status: 'active',
  },
  {
    id: 'ALT-004',
    type: 'safety',
    description: 'Fire exit clearance confirmed',
    zone: 'Main Exit',
    severity: 'low',
    timestamp: '1 hour ago',
    status: 'resolved',
  },
  {
    id: 'ALT-005',
    type: 'crowd',
    description: 'Gentle clearance initiated',
    zone: 'Pradakshina',
    severity: 'medium',
    timestamp: '1.5 hours ago',
    status: 'resolved',
  },
]

const typeIcons = {
  crowd: AlertTriangle,
  medical: Heart,
  safety: Zap,
  gate: Gate,
}

export default function AlertsTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50 bg-card/50">
            <th className="text-left px-4 py-3 font-semibold text-foreground">#</th>
            <th className="text-left px-4 py-3 font-semibold text-foreground">Type</th>
            <th className="text-left px-4 py-3 font-semibold text-foreground">Description</th>
            <th className="text-left px-4 py-3 font-semibold text-foreground">Zone</th>
            <th className="text-left px-4 py-3 font-semibold text-foreground">Severity</th>
            <th className="text-left px-4 py-3 font-semibold text-foreground">Time</th>
            <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => {
            const Icon = typeIcons[alert.type as keyof typeof typeIcons]
            return (
              <tr key={alert.id} className="border-b border-border/30 hover:bg-card/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{alert.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="capitalize">{alert.type}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground">{alert.description}</td>
                <td className="px-4 py-3 text-muted-foreground">{alert.zone}</td>
                <td className="px-4 py-3">
                  <Badge
                    className={`text-xs ${
                      alert.severity === 'high'
                        ? 'bg-red-900/30 text-red-300 border border-red-500/50'
                        : alert.severity === 'medium'
                          ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/50'
                          : 'bg-green-900/30 text-green-300 border border-green-500/50'
                    }`}
                  >
                    {alert.severity.toUpperCase()}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{alert.timestamp}</td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      alert.status === 'active'
                        ? 'bg-blue-900/30 text-blue-300 border border-blue-500/50'
                        : 'bg-green-900/30 text-green-300 border border-green-500/50'
                    }`}
                  >
                    {alert.status === 'active' ? '🔴' : '✓'} {alert.status.toUpperCase()}
                  </Badge>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
