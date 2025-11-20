'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { time: '12:00 PM', footfall: 1200 },
  { time: '1:00 PM', footfall: 1800 },
  { time: '2:00 PM', footfall: 2100 },
  { time: '3:00 PM', footfall: 2850 },
  { time: '4:00 PM', footfall: 2650 },
  { time: '5:00 PM', footfall: 2400 },
  { time: '6:00 PM', footfall: 1950 },
]

export default function FootfallChart() {
  return (
    <div className="w-full h-64 -mx-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorFootfall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--color-primary))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--color-primary))" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
          <XAxis dataKey="time" stroke="hsl(var(--color-muted-foreground))" style={{ fontSize: '12px' }} />
          <YAxis stroke="hsl(var(--color-muted-foreground))" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--color-card))',
              border: '1px solid hsl(var(--color-primary))',
              borderRadius: '8px',
            }}
          />
          <Line
            type="monotone"
            dataKey="footfall"
            stroke="hsl(var(--color-primary))"
            strokeWidth={2}
            dot={false}
            fillOpacity={1}
            fill="url(#colorFootfall)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
