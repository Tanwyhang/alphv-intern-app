'use client'
import * as React from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

type Entry = {
  shape: string
  created_at: string
}

const chartConfig = {
  box: { label: 'Box', color: 'var(--chart-1)' },
  circle: { label: 'Circle', color: 'var(--chart-2)' },
  cone: { label: 'Cone', color: 'var(--chart-3)' },
  cuboid: { label: 'Cuboid', color: 'var(--chart-4)' },
  cylinder: { label: 'Cylinder', color: 'var(--chart-5)' },
  diamond: { label: 'Diamond', color: 'var(--chart-6)' },
  heart: { label: 'Heart', color: 'var(--chart-7)' },
  hexagon: { label: 'Hexagon', color: 'var(--chart-8)' },
} satisfies ChartConfig

export function ShapesTimelineChart({ entries }: { entries: Entry[] }) {
  const { chartData, activeShapes } = React.useMemo(() => {
    if (entries.length === 0) return { chartData: [], activeShapes: [] }

    const sorted = [...entries].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    const shapeCounts: Record<string, number> = {}
    const shapes = new Set<string>()
    
    const data = sorted.map((entry, index) => {
      shapeCounts[entry.shape] = (shapeCounts[entry.shape] || 0) + 1
      shapes.add(entry.shape)
      const point: any = {
        date: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        index,
      }
      shapes.forEach(s => {
        point[s] = shapeCounts[s] || 0
      })
      return point
    })
    
    return { chartData: data, activeShapes: Array.from(shapes) }
  }, [entries])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shape Timeline</CardTitle>
        <CardDescription>Cumulative shapes added over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="index" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => chartData[value]?.date || ''} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {activeShapes.map((shape) => (
              <Line
                key={shape}
                dataKey={shape}
                type="monotone"
                stroke={chartConfig[shape as keyof typeof chartConfig]?.color}
                strokeWidth={2}
                dot={true}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
