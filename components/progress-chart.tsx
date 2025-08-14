"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ProgressData } from "@/lib/analytics"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface ProgressChartProps {
  data: ProgressData[]
}

export function ProgressChart({ data }: ProgressChartProps) {
  const [selectedExercise, setSelectedExercise] = useState<string>("all")

  const exercises = Array.from(new Set(data.map((d) => d.exerciseId)))
  const exerciseNames = Array.from(new Set(data.map((d) => d.exerciseName)))

  const filteredData = selectedExercise === "all" ? data : data.filter((d) => d.exerciseId === selectedExercise)

  const chartData = filteredData.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    }),
  }))

  return (
    <div className="space-y-4">
      <Select value={selectedExercise} onValueChange={setSelectedExercise}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Seleccionar ejercicio" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los ejercicios</SelectItem>
          {exercises.map((exerciseId, index) => (
            <SelectItem key={exerciseId} value={exerciseId}>
              {exerciseNames[index]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ChartContainer
        config={{
          weight: {
            label: "Peso (kg)",
            color: "hsl(var(--chart-1))",
          },
          estimatedMax: {
            label: "1RM Estimado (kg)",
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
            <Legend />
            <Line type="monotone" dataKey="weight" stroke="var(--color-weight)" strokeWidth={2} dot={{ r: 4 }} />
            <Line
              type="monotone"
              dataKey="estimatedMax"
              stroke="var(--color-estimatedMax)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
