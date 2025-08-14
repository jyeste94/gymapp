"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock, Target } from "lucide-react"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import type { Session } from "@/data/models"

interface WeekViewProps {
  selectedDate: Date
  sessions: Session[]
  plannedWorkouts: PlannedWorkout[]
  onScheduleWorkout: () => void
}

interface PlannedWorkout {
  id: string
  templateId: string
  templateName: string
  date: string
  time?: string
  notes?: string
  completed?: boolean
}

export function WeekView({ selectedDate, sessions, plannedWorkouts, onScheduleWorkout }: WeekViewProps) {
  const weekStart = startOfWeek(selectedDate, { locale: es })
  const weekEnd = endOfWeek(selectedDate, { locale: es })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const getSessionsForDate = (date: Date) => {
    return sessions.filter((session) => isSameDay(new Date(session.date), date))
  }

  const getPlannedWorkoutsForDate = (date: Date) => {
    return plannedWorkouts.filter((workout) => isSameDay(new Date(workout.date), date))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
      {weekDays.map((day) => {
        const isToday = isSameDay(day, new Date())
        const daySessions = getSessionsForDate(day)
        const dayPlanned = getPlannedWorkoutsForDate(day)

        return (
          <Card key={day.toISOString()} className={isToday ? "ring-2 ring-primary" : ""}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <div>
                  <div className="font-medium">{format(day, "EEEE", { locale: es })}</div>
                  <div className="text-lg font-bold">{format(day, "d")}</div>
                </div>

                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onScheduleWorkout}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-0 space-y-2">
              {/* Completed Sessions */}
              {daySessions.map((session, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-3 w-3 text-primary" />
                    <span className="text-sm font-medium">{session.type === "strength" ? "Fuerza" : "Carrera"}</span>
                  </div>

                  {session.duration && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {Math.round(session.duration)} min
                    </div>
                  )}
                </div>
              ))}

              {/* Planned Workouts */}
              {dayPlanned.map((workout, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-muted/50 border border-muted">
                  <div className="text-sm font-medium mb-1">{workout.templateName}</div>

                  {workout.time && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {workout.time}
                    </div>
                  )}

                  <Badge variant="outline" className="text-xs mt-1">
                    Programado
                  </Badge>
                </div>
              ))}

              {daySessions.length === 0 && dayPlanned.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">Sin entrenamientos</div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
