"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import { es } from "date-fns/locale"
import type { Session } from "@/data/models"

interface CalendarViewProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
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

export function CalendarView({
  selectedDate,
  onDateSelect,
  sessions,
  plannedWorkouts,
  onScheduleWorkout,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Pad the calendar to start on Monday
  const startDate = new Date(monthStart)
  const dayOfWeek = startDate.getDay()
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  startDate.setDate(startDate.getDate() - daysToSubtract)

  // Create 42 days (6 weeks) for the calendar grid
  const calendarDays = []
  for (let i = 0; i < 42; i++) {
    const day = new Date(startDate)
    day.setDate(startDate.getDate() + i)
    calendarDays.push(day)
  }

  const getSessionsForDate = (date: Date) => {
    return sessions.filter((session) => isSameDay(new Date(session.date), date))
  }

  const getPlannedWorkoutsForDate = (date: Date) => {
    return plannedWorkouts.filter((workout) => isSameDay(new Date(workout.date), date))
  }

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{format(currentMonth, "MMMM yyyy", { locale: es })}</h2>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isSelected = isSameDay(day, selectedDate)
            const isToday = isSameDay(day, new Date())
            const daySessions = getSessionsForDate(day)
            const dayPlanned = getPlannedWorkoutsForDate(day)

            return (
              <div
                key={index}
                className={`
                  min-h-[80px] p-1 border rounded-lg cursor-pointer transition-colors
                  ${isCurrentMonth ? "bg-background" : "bg-muted/30"}
                  ${isSelected ? "ring-2 ring-primary" : ""}
                  ${isToday ? "bg-primary/5" : ""}
                  hover:bg-muted/50
                `}
                onClick={() => onDateSelect(day)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm ${isCurrentMonth ? "text-foreground" : "text-muted-foreground"}`}>
                    {format(day, "d")}
                  </span>

                  {isCurrentMonth && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDateSelect(day)
                        onScheduleWorkout()
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <div className="space-y-1">
                  {daySessions.map((session, idx) => (
                    <Badge
                      key={idx}
                      variant={session.type === "strength" ? "default" : "secondary"}
                      className="text-xs px-1 py-0 h-4 block truncate"
                    >
                      {session.type === "strength" ? "Fuerza" : "Carrera"}
                    </Badge>
                  ))}

                  {dayPlanned.map((workout, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs px-1 py-0 h-4 block truncate">
                      {workout.templateName}
                    </Badge>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
