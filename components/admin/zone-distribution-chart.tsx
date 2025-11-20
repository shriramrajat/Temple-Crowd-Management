'use client'

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Main Sanctum', value: 2450, color: 'hsl(var(--color-primary))' },
  { name: 'South Entrance', value: 3200, color: 'hsl(var(--color-chart-2))' },
  { name: 'North Gate', value: 1820, color: 'hsl(var(--color-chart-3))' },
  { name: 'Prayer Hall', value: 950, color: 'hsl(var(--color-chart-4))' },
]

export default function ZoneDistributionChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--color-card))',
            border: '1px solid hsl(var(--color-border))',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'hsl(var(--color-foreground))' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
