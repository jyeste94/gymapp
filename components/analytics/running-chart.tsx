"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { RunningData } from "@/lib/analytics"

interface RunningChartProps {
  data: RunningData[]
}

export function RunningChart({ data }: RunningChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    }),
    pace: Math.round(item.pace * 100) / 100, // Round to 2 decimals
  }))

  return (
    <ChartContainer
      config={{
        distance: {
          label: "Distancia (km)",
          color: "hsl(var(--chart-1))",
        },
        pace: {
          label: "Ritmo (min/km)",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line type="monotone" dataKey="distance" stroke="var(--color-distance)" strokeWidth={2} dot={{ r: 4 }} />
          <Line
            type="monotone"
            dataKey="pace"
            stroke="var(--color-pace)"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
