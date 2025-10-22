"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: Record<string, { label: string; color: string }>
    children: React.ComponentElement<any, any>
  }
>(({ id, className, children, config, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex aspect-video justify-center text-xs", className)} {...props}>
      <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
        {children}
      </RechartsPrimitive.ResponsiveContainer>
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> & {
    hideLabel?: boolean
  }
>(({ active, payload, label, hideLabel }, ref) => {
  if (!active || !payload?.length) return null

  return (
    <div ref={ref} className="rounded-lg border bg-background p-2 shadow-sm">
      {!hideLabel && <div className="font-medium mb-1">{label}</div>}
      <div className="grid gap-1">
        {payload.map((item: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground">{item.name}:</span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

type ChartConfig = Record<string, { label: string; color: string }>

export { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig }
