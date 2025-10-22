'use client'

import * as React from 'react'
import { Label, Pie, PieChart, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Entry = {
  shape: string
  color: string
}

export function ShapesChart({ entries }: { entries: Entry[] }) {
  const shapeColorMap: Record<string, number> = {
    box: 1,
    circle: 2,
    cone: 3,
    cuboid: 4,
    cylinder: 5,
    diamond: 6,
    heart: 7,
    hexagon: 8,
  }

  const chartData = React.useMemo(() => {
    const shapeCounts = entries.reduce((acc, entry) => {
      acc[entry.shape] = (acc[entry.shape] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(shapeCounts).map(([shape, count]) => ({
      shape,
      count,
      fill: `var(--chart-${shapeColorMap[shape] || 1})`,
    }))
  }, [entries])

  const totalShapes = React.useMemo(() => {
    return entries.length
  }, [entries])

  return (
    <Card className="flex flex-col rounded-[100px] border-0 bg-[rgb(255,255,255)] dark:bg-[rgb(40,42,52)]" style={{ boxShadow: 'rgba(0, 0, 0, 0) 0px -23px 25px 0px inset, rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset, rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset, rgba(0, 0, 0, 0.06) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px' }}>
      <CardContent className="flex-1 pb-6 flex items-center justify-center">
        <div>
          <div className="mx-auto aspect-square max-h-[250px]">
            <PieChart width={250} height={250}>
              <Tooltip />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="shape"
                innerRadius={85}
                strokeWidth={0}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalShapes.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Shapes
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </div>
          <div className="mt-4 mx-auto max-w-fit grid grid-cols-2 gap-2 text-xs">
            {Object.entries(shapeColorMap).map(([shape, colorIndex]) => (
              <div key={shape} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: `var(--chart-${colorIndex})` }} />
                <span className="capitalize">{shape}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
