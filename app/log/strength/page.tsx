"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StartWorkout } from "@/components/logging/start-workout"
import { QuickSetLogger } from "@/components/logging/quick-set-logger"
import { useStorage } from "@/hooks/use-storage"
import type { StrengthSession } from "@/data/models"
import { workoutTemplates } from "@/data/templates"
import { Play, Plus, Clock, Target } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function StrengthLogPage() {
  const [activeSession, setActiveSession] = useState<StrengthSession | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [sessions, setSessions] = useStorage<StrengthSession[]>("strength-sessions", [])
  const searchParams = useSearchParams()

  useEffect(() => {
    const templateId = searchParams.get("template")
    if (templateId && !activeSession) {
      startWorkout(templateId)
    }
  }, [searchParams])

  const startWorkout = (templateId?: string) => {
    const newSession: StrengthSession = {
      id: `session-${Date.now()}`,
      dateISO: new Date().toISOString(),
      entries: [],
    }
    setActiveSession(newSession)
    if (templateId) {
      setSelectedTemplate(templateId)
    }
  }

  const finishWorkout = (session: StrengthSession) => {
    setSessions((prev) => [...prev, session])
    setActiveSession(null)
    setSelectedTemplate(null)
  }

  const cancelWorkout = () => {
    setActiveSession(null)
    setSelectedTemplate(null)
  }

  if (activeSession) {
    return (
      <StartWorkout
        session={activeSession}
        templateId={selectedTemplate}
        onFinish={finishWorkout}
        onCancel={cancelWorkout}
        onUpdate={setActiveSession}
      />
    )
  }

  const todaysSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.dateISO).toDateString()
    const today = new Date().toDateString()
    return sessionDate === today
  })

  const recentSessions = sessions.slice(-5).reverse()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Registro de Fuerza</h1>
        <p className="text-muted-foreground">Registra tus entrenamientos de fuerza y sigue tu progreso</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Empezar Entrenamiento
              </CardTitle>
              <CardDescription>Inicia un nuevo entrenamiento o registra sets individuales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <Button onClick={() => startWorkout()} className="h-auto p-4 flex-col gap-2">
                  <Plus className="h-6 w-6" />
                  <span>Entrenamiento Libre</span>
                  <span className="text-xs opacity-80">Sin plantilla</span>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent">
                  <Link href="/workouts">
                    <Target className="h-6 w-6" />
                    <span>Usar Plantilla</span>
                    <span className="text-xs opacity-80">Rutina predefinida</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Set Logger */}
          <Card>
            <CardHeader>
              <CardTitle>Registro Rápido de Sets</CardTitle>
              <CardDescription>Registra sets individuales sin iniciar un entrenamiento completo</CardDescription>
            </CardHeader>
            <CardContent>
              <QuickSetLogger onSetLogged={(entry) => console.log("Set logged:", entry)} />
            </CardContent>
          </Card>

          {/* Recent Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Plantillas Recientes</CardTitle>
              <CardDescription>Inicia rápidamente con tus rutinas más usadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {workoutTemplates.slice(0, 4).map((template) => (
                  <div
                    key={template.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => startWorkout(template.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {template.blocks.length} bloques • {template.goal}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaysSessions.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Entrenamientos:</span>
                    <span>{todaysSessions.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sets totales:</span>
                    <span>{todaysSessions.reduce((total, session) => total + session.entries.length, 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Volumen:</span>
                    <span>
                      {Math.round(
                        todaysSessions.reduce(
                          (total, session) =>
                            total + session.entries.reduce((sum, entry) => sum + entry.weight * entry.reps, 0),
                          0,
                        ) / 1000,
                      )}{" "}
                      ton
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No hay entrenamientos registrados hoy</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Sesiones Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium">
                            {new Date(session.dateISO).toLocaleDateString("es-ES", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground">{session.entries.length} sets</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(
                            session.entries.reduce((sum, entry) => sum + entry.weight * entry.reps, 0) / 1000,
                          )}{" "}
                          ton
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No hay sesiones registradas</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
