'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const data = [
  { hour: '06:00', visitors: 150 },
  { hour: '08:00', visitors: 450 },
  { hour: '10:00', visitors: 820 },
  { hour: '12:00', visitors: 1200 },
  { hour: '14:00', visitors: 950 },
  { hour: '16:00', visitors: 1100 },
  { hour: '18:00', visitors: 1850 },
  { hour: '20:00', visitors: 1200 },
  { hour: '22:00', visitors: 480 },
]

export default function HourlyPeaksChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" vertical={false} />
        <XAxis
          dataKey="hour"
          stroke="hsl(var(--color-muted-foreground))"
          style={{ fontSize: '12px' }}
          tickLine={false}
        />
        <YAxis
          stroke="hsl(var(--color-muted-foreground))"
          style={{ fontSize: '12px' }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--color-card))',
            border: '1px solid hsl(var(--color-border))',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'hsl(var(--color-foreground))' }}
        />
        <Bar dataKey="visitors" fill="hsl(var(--color-primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
