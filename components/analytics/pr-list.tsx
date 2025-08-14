"use client"

import { Badge } from "@/components/ui/badge"
import type { PersonalRecord } from "@/lib/analytics"
import { TrendingUp, Trophy, Calendar } from "lucide-react"

interface PRListProps {
  records: PersonalRecord[]
}

export function PRList({ records }: PRListProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Trophy className="mx-auto h-8 w-8 mb-2" />
        <p>No hay records personales registrados</p>
      </div>
    )
  }

  const formatValue = (record: PersonalRecord) => {
    switch (record.type) {
      case "weight":
        return `${record.value} kg`
      case "reps":
        return `${record.value} reps`
      case "distance":
        return `${record.value} km`
      case "time":
        return `${Math.floor(record.value / 60)}:${(record.value % 60).toString().padStart(2, "0")}`
      default:
        return record.value.toString()
    }
  }

  const getImprovement = (record: PersonalRecord) => {
    if (!record.previousValue) return null

    const improvement = record.value - record.previousValue
    const percentage = ((improvement / record.previousValue) * 100).toFixed(1)

    return {
      absolute: improvement,
      percentage: Number.parseFloat(percentage),
    }
  }

  return (
    <div className="space-y-3">
      {records.slice(0, 10).map((record, index) => {
        const improvement = getImprovement(record)

        return (
          <div
            key={`${record.exerciseId}-${record.type}-${index}`}
            className="flex items-center justify-between p-3 rounded-lg border"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                <Trophy className="h-4 w-4 text-primary" />
              </div>

              <div>
                <p className="font-medium">{record.exerciseName}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(record.date).toLocaleDateString("es-ES")}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{formatValue(record)}</span>
                <Badge variant={record.type === "weight" ? "default" : "secondary"}>
                  {record.type === "weight"
                    ? "Peso"
                    : record.type === "reps"
                      ? "Reps"
                      : record.type === "distance"
                        ? "Distancia"
                        : "Tiempo"}
                </Badge>
              </div>

              {improvement && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>
                    +{improvement.absolute} ({improvement.percentage > 0 ? "+" : ""}
                    {improvement.percentage}%)
                  </span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
