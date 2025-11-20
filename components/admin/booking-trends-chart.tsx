'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

interface Slot {
  id: string
  timeRange: string
  capacity: number
  booked: number
  status: string
}

export default function BookingTrendsChart({ slots }: { slots: Slot[] }) {
  const data = slots.map(slot => {
    const utilization = Math.round((slot.booked / slot.capacity) * 100)
    const timeStart = slot.timeRange.split(' - ')[0]
    return {
      time: timeStart,
      booked: slot.booked,
      utilization,
      slotId: slot.id,
    }
  })

  const getBarColor = (utilization: number) => {
    if (utilization >= 80) return 'rgb(239, 68, 68)' // red
    if (utilization >= 50) return 'rgb(234, 179, 8)' // yellow
    return 'rgb(34, 197, 94)' // green
  }

  return (
    <ChartContainer
      config={{
        booked: {
          label: 'Bookings',
          color: 'hsl(var(--chart-1))',
        },
      }}
      className="h-64"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="booked" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.utilization)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
