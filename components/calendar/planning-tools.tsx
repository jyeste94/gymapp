"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wand2, Calendar, Target, Repeat } from "lucide-react"
import { addDays, format } from "date-fns"
import { es } from "date-fns/locale"
import type { WorkoutTemplate } from "@/data/models"

interface PlanningToolsProps {
  templates: WorkoutTemplate[]
  plannedWorkouts: PlannedWorkout[]
  onUpdatePlanned: (workouts: PlannedWorkout[]) => void
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

export function PlanningTools({ templates, plannedWorkouts, onUpdatePlanned }: PlanningToolsProps) {
  const [plannerOpen, setPlannerOpen] = useState(false)
  const [planConfig, setPlanConfig] = useState({
    startDate: format(new Date(), "yyyy-MM-dd"),
    weeks: 4,
    daysPerWeek: 3,
    selectedTemplates: [] as string[],
  })

  const generateWeeklyPlan = () => {
    if (planConfig.selectedTemplates.length === 0) return

    const newWorkouts: PlannedWorkout[] = []
    const startDate = new Date(planConfig.startDate)

    for (let week = 0; week < planConfig.weeks; week++) {
      for (let day = 0; day < planConfig.daysPerWeek; day++) {
        const templateIndex = day % planConfig.selectedTemplates.length
        const templateId = planConfig.selectedTemplates[templateIndex]
        const template = templates.find((t) => t.id === templateId)

        if (template) {
          const workoutDate = addDays(startDate, week * 7 + day * Math.floor(7 / planConfig.daysPerWeek))

          newWorkouts.push({
            id: `planned-${Date.now()}-${week}-${day}`,
            templateId,
            templateName: template.name,
            date: format(workoutDate, "yyyy-MM-dd"),
            notes: `Semana ${week + 1} - Día ${day + 1}`,
            completed: false,
          })
        }
      }
    }

    onUpdatePlanned([...plannedWorkouts, ...newWorkouts])
    setPlannerOpen(false)
  }

  const clearAllPlanned = () => {
    onUpdatePlanned([])
  }

  const upcomingWorkouts = plannedWorkouts
    .filter((w) => new Date(w.date) >= new Date() && !w.completed)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Herramientas de Planificación
          </CardTitle>
          <CardDescription>Genera planes de entrenamiento automáticamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dialog open={plannerOpen} onOpenChange={setPlannerOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Generar Plan Semanal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generar Plan de Entrenamiento</DialogTitle>
                <DialogDescription>Crea un plan automático basado en tus rutinas favoritas</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha de inicio</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={planConfig.startDate}
                    onChange={(e) => setPlanConfig({ ...planConfig, startDate: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weeks">Semanas</Label>
                    <Select
                      value={planConfig.weeks.toString()}
                      onValueChange={(value) => setPlanConfig({ ...planConfig, weeks: Number.parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 semanas</SelectItem>
                        <SelectItem value="4">4 semanas</SelectItem>
                        <SelectItem value="6">6 semanas</SelectItem>
                        <SelectItem value="8">8 semanas</SelectItem>
                        <SelectItem value="12">12 semanas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="daysPerWeek">Días por semana</Label>
                    <Select
                      value={planConfig.daysPerWeek.toString()}
                      onValueChange={(value) => setPlanConfig({ ...planConfig, daysPerWeek: Number.parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 días</SelectItem>
                        <SelectItem value="3">3 días</SelectItem>
                        <SelectItem value="4">4 días</SelectItem>
                        <SelectItem value="5">5 días</SelectItem>
                        <SelectItem value="6">6 días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Rutinas a incluir</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {templates.map((template) => (
                      <label key={template.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={planConfig.selectedTemplates.includes(template.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPlanConfig({
                                ...planConfig,
                                selectedTemplates: [...planConfig.selectedTemplates, template.id],
                              })
                            } else {
                              setPlanConfig({
                                ...planConfig,
                                selectedTemplates: planConfig.selectedTemplates.filter((id) => id !== template.id),
                              })
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{template.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setPlannerOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button
                    onClick={generateWeeklyPlan}
                    disabled={planConfig.selectedTemplates.length === 0}
                    className="flex-1"
                  >
                    Generar Plan
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={clearAllPlanned} className="w-full bg-transparent">
            Limpiar Planificación
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Próximos Entrenamientos
          </CardTitle>
          <CardDescription>Tus entrenamientos programados</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingWorkouts.length > 0 ? (
            <div className="space-y-3">
              {upcomingWorkouts.map((workout) => (
                <div key={workout.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{workout.templateName}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(workout.date), "EEEE, d MMMM", { locale: es })}
                      {workout.time && ` • ${workout.time}`}
                    </p>
                  </div>

                  <Badge variant="outline">
                    <Repeat className="h-3 w-3 mr-1" />
                    Programado
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="mx-auto h-8 w-8 mb-2" />
              <p>No hay entrenamientos programados</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
