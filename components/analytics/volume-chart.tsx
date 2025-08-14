"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { VolumeData } from "@/lib/analytics"

interface VolumeChartProps {
  data: VolumeData[]
}

export function VolumeChart({ data }: VolumeChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    week: new Date(item.week).toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    }),
  }))

  return (
    <ChartContainer
      config={{
        volume: {
          label: "Volumen (kg)",
          color: "hsl(var(--chart-1))",
        },
        sessions: {
          label: "Sesiones",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="volume" fill="var(--color-volume)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
