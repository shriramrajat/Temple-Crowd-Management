'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const data = [
  { week: 'Week 1', visitors: 18200, weeklyAvg: 2600 },
  { week: 'Week 2', visitors: 21500, weeklyAvg: 3071 },
  { week: 'Week 3', visitors: 19800, weeklyAvg: 2829 },
  { week: 'Week 4', visitors: 24300, weeklyAvg: 3471 },
  { week: 'Week 5', visitors: 22900, weeklyAvg: 3271 },
  { week: 'Week 6', visitors: 26100, weeklyAvg: 3729 },
  { week: 'Week 7', visitors: 28400, weeklyAvg: 4057 },
  { week: 'Week 8', visitors: 25600, weeklyAvg: 3657 },
  { week: 'Week 9', visitors: 29200, weeklyAvg: 4171 },
  { week: 'Week 10', visitors: 31500, weeklyAvg: 4500 },
  { week: 'Week 11', visitors: 29800, weeklyAvg: 4257 },
  { week: 'Week 12', visitors: 33200, weeklyAvg: 4743 },
]

export default function HistoricalTrendsChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--color-primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--color-primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" vertical={false} />
        <XAxis
          dataKey="week"
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
        <Area
          type="monotone"
          dataKey="visitors"
          stroke="hsl(var(--color-primary))"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorVisitors)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
