"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RunForm } from "@/components/logging/run-form"
import { RunSplits } from "@/components/logging/run-splits"
import { useStorage } from "@/hooks/use-storage"
import type { RunSession } from "@/data/models"
import { formatPace } from "@/lib/estimates"
import { Play, MapPin, Clock, Zap } from "lucide-react"

export default function RunLogPage() {
  const [isLogging, setIsLogging] = useState(false)
  const [sessions, setSessions] = useStorage<RunSession[]>("run-sessions", [])

  const handleRunLogged = (session: RunSession) => {
    setSessions((prev) => [...prev, session])
    setIsLogging(false)
  }

  const todaysSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.dateISO).toDateString()
    const today = new Date().toDateString()
    return sessionDate === today
  })

  const recentSessions = sessions.slice(-5).reverse()
  const thisWeekSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.dateISO)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return sessionDate >= weekAgo
  })

  const weeklyDistance = thisWeekSessions.reduce((total, session) => total + session.distanceKm, 0)
  const weeklyTime = thisWeekSessions.reduce((total, session) => total + session.durationSec, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Registro de Running</h1>
        <p className="text-muted-foreground">Registra tus carreras y analiza tu progreso</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Registrar Carrera
              </CardTitle>
              <CardDescription>Registra una nueva sesión de running</CardDescription>
            </CardHeader>
            <CardContent>
              {!isLogging ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  <Button onClick={() => setIsLogging(true)} className="h-auto p-4 flex-col gap-2">
                    <MapPin className="h-6 w-6" />
                    <span>Carrera Libre</span>
                    <span className="text-xs opacity-80">Distancia y tiempo</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent">
                    <Zap className="h-6 w-6" />
                    <span>Intervalos</span>
                    <span className="text-xs opacity-80">Entrenamiento fraccionado</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent">
                    <Clock className="h-6 w-6" />
                    <span>Por Tiempo</span>
                    <span className="text-xs opacity-80">Duración fija</span>
                  </Button>
                </div>
              ) : (
                <RunForm onRunLogged={handleRunLogged} onCancel={() => setIsLogging(false)} />
              )}
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Sesiones Recientes</CardTitle>
              <CardDescription>Tus últimas carreras registradas</CardDescription>
            </CardHeader>
            <CardContent>
              {recentSessions.length > 0 ? (
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium">
                            {new Date(session.dateISO).toLocaleDateString("es-ES", {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {Math.floor(session.durationSec / 60)}:
                            {(session.durationSec % 60).toString().padStart(2, "0")} min
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{session.distanceKm.toFixed(2)} km</div>
                          <div className="text-sm text-muted-foreground">
                            {formatPace(session.durationSec / session.distanceKm)} /km
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        {session.rpe && (
                          <Badge variant="outline" className="text-xs">
                            RPE {session.rpe}
                          </Badge>
                        )}
                        {session.elevationGain && (
                          <span className="text-muted-foreground">+{session.elevationGain}m</span>
                        )}
                        {session.intervals && (
                          <Badge variant="secondary" className="text-xs">
                            Intervalos
                          </Badge>
                        )}
                      </div>

                      {session.intervals && <RunSplits intervals={session.intervals} />}

                      {session.notes && (
                        <div className="mt-3 p-2 bg-muted/50 rounded text-sm italic">{session.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No hay carreras registradas aún</p>
              )}
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
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {todaysSessions.reduce((total, session) => total + session.distanceKm, 0).toFixed(1)} km
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {Math.floor(todaysSessions.reduce((total, session) => total + session.durationSec, 0) / 60)} min
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Carreras:</span>
                    <span>{todaysSessions.length}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No hay carreras registradas hoy</p>
              )}
            </CardContent>
          </Card>

          {/* Weekly Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Esta Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">{weeklyDistance.toFixed(1)} km</div>
                  <div className="text-sm text-muted-foreground">{Math.floor(weeklyTime / 60)} min totales</div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Sesiones:</span>
                  <span>{thisWeekSessions.length}</span>
                </div>
                {weeklyDistance > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Ritmo promedio:</span>
                    <span>{formatPace(weeklyTime / weeklyDistance)} /km</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Récords Personales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Distancia más larga:</span>
                  <span>
                    {sessions.length > 0 ? Math.max(...sessions.map((s) => s.distanceKm)).toFixed(1) : "0"} km
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Mejor ritmo:</span>
                  <span>
                    {sessions.length > 0
                      ? formatPace(Math.min(...sessions.map((s) => s.durationSec / s.distanceKm)))
                      : "--:--"}{" "}
                    /km
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total carreras:</span>
                  <span>{sessions.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
