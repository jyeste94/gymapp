"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarView } from "@/components/calendar/calendar-view"
import { WeekView } from "@/components/calendar/week-view"
import { WorkoutScheduler } from "@/components/calendar/workout-scheduler"
import { PlanningTools } from "@/components/calendar/planning-tools"
import { useStorage } from "@/hooks/use-storage"
import type { Session, WorkoutTemplate } from "@/data/models"
import { CalendarDays, Plus, Target, Clock } from "lucide-react"
import { format, startOfWeek, endOfWeek } from "date-fns"
import { es } from "date-fns/locale"

export default function CalendarPage() {
  const { data: sessions } = useStorage<Session[]>("sessions", [])
  const { data: templates } = useStorage<WorkoutTemplate[]>("workout-templates", [])
  const { data: plannedWorkouts, setData: setPlannedWorkouts } = useStorage<PlannedWorkout[]>("planned-workouts", [])

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [view, setView] = useState<"month" | "week">("month")
  const [showScheduler, setShowScheduler] = useState(false)

  // Get this week's stats
  const weekStart = startOfWeek(new Date(), { locale: es })
  const weekEnd = endOfWeek(new Date(), { locale: es })
  const thisWeekSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.date)
    return sessionDate >= weekStart && sessionDate <= weekEnd
  })

  const thisWeekPlanned = plannedWorkouts.filter((workout) => {
    const workoutDate = new Date(workout.date)
    return workoutDate >= weekStart && workoutDate <= weekEnd
  })

  const completedThisWeek = thisWeekSessions.length
  const plannedThisWeek = thisWeekPlanned.length
  const completionRate = plannedThisWeek > 0 ? Math.round((completedThisWeek / plannedThisWeek) * 100) : 0

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Calendario</h1>
          <p className="text-muted-foreground">Planifica y organiza tus entrenamientos</p>
        </div>

        <Button onClick={() => setShowScheduler(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Programar Entrenamiento
        </Button>
      </div>

      {/* Weekly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedThisWeek}/{plannedThisWeek}
            </div>
            <p className="text-xs text-muted-foreground">Entrenamientos completados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Cumplimiento</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">Objetivos alcanzados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Entrenamiento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {thisWeekPlanned.find((w) => new Date(w.date) > new Date())?.templateName || "Ninguno"}
            </div>
            <p className="text-xs text-muted-foreground">Programado</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={view} onValueChange={(value: "month" | "week") => setView(value)} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="month">Mes</TabsTrigger>
            <TabsTrigger value="week">Semana</TabsTrigger>
          </TabsList>

          <div className="text-sm text-muted-foreground">
            {view === "month"
              ? format(selectedDate, "MMMM yyyy", { locale: es })
              : `${format(weekStart, "d MMM", { locale: es })} - ${format(weekEnd, "d MMM yyyy", { locale: es })}`}
          </div>
        </div>

        <TabsContent value="month">
          <CalendarView
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            sessions={sessions}
            plannedWorkouts={plannedWorkouts}
            onScheduleWorkout={() => setShowScheduler(true)}
          />
        </TabsContent>

        <TabsContent value="week">
          <WeekView
            selectedDate={selectedDate}
            sessions={sessions}
            plannedWorkouts={plannedWorkouts}
            onScheduleWorkout={() => setShowScheduler(true)}
          />
        </TabsContent>
      </Tabs>

      <PlanningTools templates={templates} plannedWorkouts={plannedWorkouts} onUpdatePlanned={setPlannedWorkouts} />

      <WorkoutScheduler
        open={showScheduler}
        onOpenChange={setShowScheduler}
        templates={templates}
        selectedDate={selectedDate}
        plannedWorkouts={plannedWorkouts}
        onSchedule={(workout) => {
          setPlannedWorkouts([...plannedWorkouts, workout])
          setShowScheduler(false)
        }}
      />
    </div>
  )
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
