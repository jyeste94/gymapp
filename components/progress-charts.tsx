"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"
import { useProgressMetrics } from "@/hooks/use-progress-metrics"

export function ProgressCharts() {
  const { volumeByMuscle } = useProgressMetrics()
  const data = Object.entries(volumeByMuscle).map(([muscle, vol]) => ({ muscle, vol }))

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="muscle" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="vol" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
