'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const data = [
  { time: '06:00', predicted: 200, actual: 150 },
  { time: '08:00', predicted: 480, actual: 450 },
  { time: '10:00', predicted: 850, actual: 820 },
  { time: '12:00', predicted: 1250, actual: 1200 },
  { time: '14:00', predicted: 980, actual: 950 },
  { time: '16:00', predicted: 1120, actual: 1100 },
  { time: '18:00', predicted: 1900, actual: 1850 },
  { time: '20:00', predicted: 1250, actual: 1200 },
  { time: '22:00', predicted: 500, actual: 480 },
]

export default function PredictionVsActualChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" vertical={false} />
        <XAxis
          dataKey="time"
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
        <Legend wrapperStyle={{ color: 'hsl(var(--color-foreground))' }} />
        <Line
          type="monotone"
          dataKey="predicted"
          stroke="hsl(var(--color-chart-2))"
          strokeWidth={2}
          dot={false}
          name="Predicted"
        />
        <Line
          type="monotone"
          dataKey="actual"
          stroke="hsl(var(--color-primary))"
          strokeWidth={2}
          dot={false}
          name="Actual"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
