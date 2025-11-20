'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const data = [
  { date: 'Nov 17', footfall: 2400 },
  { date: 'Nov 18', footfall: 2800 },
  { date: 'Nov 19', footfall: 2200 },
  { date: 'Nov 20', footfall: 3100 },
  { date: 'Nov 21', footfall: 3800 },
  { date: 'Nov 22', footfall: 3200 },
  { date: 'Nov 23', footfall: 4100 },
  { date: 'Nov 24', footfall: 3600 },
  { date: 'Nov 25', footfall: 4200 },
  { date: 'Nov 26', footfall: 3900 },
  { date: 'Nov 27', footfall: 4500 },
  { date: 'Nov 28', footfall: 4800 },
  { date: 'Nov 29', footfall: 4200 },
  { date: 'Nov 30', footfall: 5100 },
]

export default function DailyFootfallChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" vertical={false} />
        <XAxis
          dataKey="date"
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
        <Line
          type="monotone"
          dataKey="footfall"
          stroke="hsl(var(--color-primary))"
          strokeWidth={2}
          dot={false}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
