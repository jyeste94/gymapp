"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnalyticsService, type AnalyticsData } from "@/lib/analytics"
import { useStorage } from "@/hooks/use-storage"
import type { Session } from "@/data/models"
import { VolumeChart } from "@/components/analytics/volume-chart"
import { ProgressChart } from "@/components/analytics/progress-chart"
import { RunningChart } from "@/components/analytics/running-chart"
import { PRList } from "@/components/analytics/pr-list"
import { ExerciseFrequency } from "@/components/analytics/exercise-frequency"
import { Activity, Target, Clock, Zap } from "lucide-react"

type TimeRange = "week" | "month" | "quarter" | "year" | "all"

export default function AnalyticsPage() {
  const { data: sessions } = useStorage<Session[]>("sessions", [])
  const [timeRange, setTimeRange] = useState<TimeRange>("month")
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    if (sessions.length > 0) {
      const filteredSessions = timeRange === "all" ? sessions : AnalyticsService.getTimeRangeFilter(sessions, timeRange)

      const analyticsData = AnalyticsService.calculateAnalytics(filteredSessions)
      setAnalytics(analyticsData)
    }
  }, [sessions, timeRange])

  if (!analytics) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No hay datos para analizar</h2>
          <p className="text-muted-foreground">Registra algunas sesiones para ver tus estadísticas</p>
        </div>
      </div>
    )
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}k kg`
    }
    return `${Math.round(volume)} kg`
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Análisis</h1>
          <p className="text-muted-foreground">Seguimiento de tu progreso y rendimiento</p>
        </div>

        <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Última semana</SelectItem>
            <SelectItem value="month">Último mes</SelectItem>
            <SelectItem value="quarter">Últimos 3 meses</SelectItem>
            <SelectItem value="year">Último año</SelectItem>
            <SelectItem value="all">Todo el tiempo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesiones Totales</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.averageSessionDuration > 0 && `${formatDuration(analytics.averageSessionDuration)} promedio`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volumen Total</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatVolume(analytics.totalVolume)}</div>
            <p className="text-xs text-muted-foreground">Peso × repeticiones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distancia Total</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalDistance.toFixed(1)} km</div>
            <p className="text-xs text-muted-foreground">Carrera y cardio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(analytics.totalTime)}</div>
            <p className="text-xs text-muted-foreground">Tiempo de entrenamiento</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="progress">Progreso</TabsTrigger>
          <TabsTrigger value="volume">Volumen</TabsTrigger>
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="frequency">Frecuencia</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progreso de Fuerza</CardTitle>
                <CardDescription>Evolución de tus ejercicios principales</CardDescription>
              </CardHeader>
              <CardContent>
                <ProgressChart data={analytics.strengthProgress} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progreso de Carrera</CardTitle>
                <CardDescription>Mejora en ritmo y distancia</CardDescription>
              </CardHeader>
              <CardContent>
                <RunningChart data={analytics.runningProgress} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="volume" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Volumen Semanal</CardTitle>
              <CardDescription>Carga de entrenamiento por semana</CardDescription>
            </CardHeader>
            <CardContent>
              <VolumeChart data={analytics.volumeByWeek} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Records Personales</CardTitle>
              <CardDescription>Tus mejores marcas recientes</CardDescription>
            </CardHeader>
            <CardContent>
              <PRList records={analytics.personalRecords} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frequency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frecuencia de Ejercicios</CardTitle>
              <CardDescription>Ejercicios más realizados</CardDescription>
            </CardHeader>
            <CardContent>
              <ExerciseFrequency data={analytics.exerciseFrequency} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
