"use client"

import { Progress } from "@/components/ui/progress"
import type { ExerciseFrequency as ExerciseFrequencyType } from "@/lib/analytics"
import { Calendar, BarChart3 } from "lucide-react"

interface ExerciseFrequencyProps {
  data: ExerciseFrequencyType[]
}

export function ExerciseFrequency({ data }: ExerciseFrequencyProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BarChart3 className="mx-auto h-8 w-8 mb-2" />
        <p>No hay datos de frecuencia disponibles</p>
      </div>
    )
  }

  const maxCount = Math.max(...data.map((d) => d.count))

  return (
    <div className="space-y-4">
      {data.slice(0, 10).map((exercise) => (
        <div key={exercise.exerciseId} className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{exercise.exerciseName}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Último: {new Date(exercise.lastPerformed).toLocaleDateString("es-ES")}
              </div>
            </div>

            <div className="text-right">
              <span className="font-bold text-lg">{exercise.count}</span>
              <p className="text-sm text-muted-foreground">sesiones</p>
            </div>
          </div>

          <Progress value={(exercise.count / maxCount) * 100} className="h-2" />
        </div>
      ))}
    </div>
  )
}
