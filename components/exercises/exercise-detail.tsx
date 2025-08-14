import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Exercise } from "@/data/models"
import { ArrowLeft, Home, Building2, AlertTriangle, CheckCircle, Lightbulb, Play } from "lucide-react"
import Link from "next/link"

interface ExerciseDetailProps {
  exercise: Exercise
}

const difficultyColors = {
  fácil: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  media: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  difícil: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
}

export function ExerciseDetail({ exercise }: ExerciseDetailProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/exercises">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a ejercicios
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold tracking-tight">{exercise.name}</h1>
              <Badge className={difficultyColors[exercise.difficulty]}>{exercise.difficulty}</Badge>
            </div>

            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                {exercise.environment === "casa" ? <Home className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                <span className="capitalize">{exercise.environment}</span>
              </div>
              <span>•</span>
              <span className="capitalize">{exercise.equipment}</span>
              <span>•</span>
              <span className="capitalize">{exercise.movement}</span>
            </div>
          </div>

          {/* Video */}
          {exercise.videoUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Video Demostrativo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Video: {exercise.videoUrl}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Técnica Correcta
              </CardTitle>
              <CardDescription>Sigue estos pasos para ejecutar el ejercicio correctamente</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {exercise.cues.map((cue, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span>{cue}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Common Mistakes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Errores Comunes
              </CardTitle>
              <CardDescription>Evita estos errores frecuentes para prevenir lesiones</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {exercise.mistakes.map((mistake, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-2 h-2 bg-destructive rounded-full mt-2"></span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Variations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Variaciones
              </CardTitle>
              <CardDescription>Ejercicios similares que puedes probar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {exercise.variations.map((variation, index) => (
                  <Badge key={index} variant="outline">
                    {variation}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información Rápida</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Músculos Principales</h4>
                <div className="flex flex-wrap gap-1">
                  {exercise.muscles.map((muscle) => (
                    <Badge key={muscle} variant="secondary" className="text-xs">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Patrón de Movimiento</h4>
                <Badge variant="outline" className="capitalize">
                  {exercise.movement}
                </Badge>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Equipo Necesario</h4>
                <Badge variant="outline" className="capitalize">
                  {exercise.equipment}
                </Badge>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Entorno</h4>
                <div className="flex items-center gap-2">
                  {exercise.environment === "casa" ? <Home className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                  <span className="capitalize">{exercise.environment}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">Añadir a Rutina</Button>
              <Button variant="outline" className="w-full bg-transparent">
                Registrar Set
              </Button>
              <Button variant="ghost" className="w-full">
                Marcar como Favorito
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
