import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, Calendar, Dumbbell, Plus, TrendingUp, Target } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de tu progreso y entrenamientos de hoy</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Quick Actions */}
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Button asChild className="h-auto p-4 flex-col gap-2">
                <Link href="/log/strength">
                  <Dumbbell className="h-6 w-6" />
                  <span>Registrar Set</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent">
                <Link href="/log/run">
                  <Activity className="h-6 w-6" />
                  <span>Registrar Carrera</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent">
                <Link href="/workouts/new">
                  <Plus className="h-6 w-6" />
                  <span>Nueva Rutina</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent">
                <Link href="/calendar">
                  <Calendar className="h-6 w-6" />
                  <span>Ver Calendario</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Today's Workout */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Entrenamiento de Hoy
            </CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push - Pecho y Hombros</p>
                  <p className="text-sm text-muted-foreground">5 ejercicios • 45-60 min</p>
                </div>
                <Badge variant="outline">Planificado</Badge>
              </div>
              <Button asChild className="w-full">
                <Link href="/log/strength">Empezar Entrenamiento</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent PRs */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Récords Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Press Banca</p>
                  <p className="text-sm text-muted-foreground">85kg × 5 reps</p>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">+2.5kg</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sentadilla</p>
                  <p className="text-sm text-muted-foreground">100kg × 3 reps</p>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">+5kg</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">5K Running</p>
                  <p className="text-sm text-muted-foreground">22:45 min</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">-0:30</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Esta Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span>Entrenamientos</span>
                  <span>4/5</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 mt-1">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "80%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span>Volumen</span>
                  <span>12.5 ton</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 mt-1">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "75%" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Running Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Running
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-2xl font-bold">15.2 km</p>
                <p className="text-sm text-muted-foreground">Esta semana</p>
              </div>
              <div className="flex justify-between text-sm">
                <div className="text-center">
                  <p className="font-medium">4:45</p>
                  <p className="text-muted-foreground">Ritmo avg</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">3</p>
                  <p className="text-muted-foreground">Carreras</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
