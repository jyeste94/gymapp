import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { WorkoutTemplate, SetScheme, Superset } from "@/data/models"
import { exercises } from "@/data/exercises"
import { ArrowLeft, Play, Copy, Clock, Target, Dumbbell, Users } from "lucide-react"
import Link from "next/link"

interface WorkoutTemplateDetailProps {
  template: WorkoutTemplate
}

const goalColors = {
  fuerza: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  hipertrofia: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  potencia: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
  mixto: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
}

function isSuperset(item: SetScheme | Superset): item is Superset {
  return "items" in item && Array.isArray(item.items)
}

export function WorkoutTemplateDetail({ template }: WorkoutTemplateDetailProps) {
  const totalExercises = template.blocks.reduce((total, block) => {
    return (
      total +
      block.items.reduce((blockTotal, item) => {
        if (isSuperset(item)) {
          return blockTotal + item.items.length
        }
        return blockTotal + 1
      }, 0)
    )
  }, 0)

  const estimatedDuration = Math.max(30, totalExercises * 4)

  const formatReps = (setScheme: SetScheme) => {
    if (setScheme.reps) {
      return `${setScheme.reps} reps`
    }
    if (setScheme.repRange) {
      return `${setScheme.repRange[0]}-${setScheme.repRange[1]} reps`
    }
    return "- reps"
  }

  const formatWeight = (setScheme: SetScheme) => {
    if (setScheme.weightType === "%") {
      return `${setScheme.intensity}% 1RM`
    }
    if (setScheme.weightType === "RPE") {
      return `RPE ${setScheme.intensity}`
    }
    return "Peso libre"
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/workouts">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a rutinas
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold tracking-tight">{template.name}</h1>
              {template.goal && <Badge className={goalColors[template.goal]}>{template.goal}</Badge>}
            </div>

            <div className="flex items-center gap-6 text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4" />
                <span>{template.blocks.length} bloques</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>{totalExercises} ejercicios</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{estimatedDuration} min aprox.</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button asChild size="lg">
                <Link href={`/log/strength?template=${template.id}`}>
                  <Play className="h-4 w-4 mr-2" />
                  Empezar Entrenamiento
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="bg-transparent">
                <Copy className="h-4 w-4 mr-2" />
                Duplicar Rutina
              </Button>
            </div>
          </div>

          {/* Blocks */}
          {template.blocks.map((block, blockIndex) => (
            <Card key={blockIndex}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {blockIndex + 1}
                  </span>
                  {block.name || `Bloque ${blockIndex + 1}`}
                </CardTitle>
                <CardDescription>{block.items.length} ejercicios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {block.items.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      {isSuperset(item) ? (
                        <div className="border rounded-lg p-4 bg-muted/30">
                          <div className="flex items-center gap-2 mb-3">
                            <Users className="h-4 w-4" />
                            <span className="font-medium">{item.name || "Superset"}</span>
                            <Badge variant="outline" className="text-xs">
                              {item.items.length} ejercicios
                            </Badge>
                          </div>
                          <div className="space-y-3">
                            {item.items.map((setScheme, setIndex) => {
                              const exercise = exercises.find((ex) => ex.id === setScheme.exerciseId)
                              return (
                                <div
                                  key={setIndex}
                                  className="flex items-center justify-between pl-4 border-l-2 border-primary/30"
                                >
                                  <div className="flex-1">
                                    <div className="font-medium">{exercise?.name || "Ejercicio no encontrado"}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {exercise?.muscles.slice(0, 2).join(", ")}
                                    </div>
                                  </div>
                                  <div className="text-right text-sm">
                                    <div className="font-medium">
                                      {setScheme.sets} × {formatReps(setScheme)}
                                    </div>
                                    <div className="text-muted-foreground">{formatWeight(setScheme)}</div>
                                    {setScheme.restSec !== undefined && setScheme.restSec > 0 && (
                                      <div className="text-muted-foreground">{setScheme.restSec}s descanso</div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">
                              {exercises.find((ex) => ex.id === item.exerciseId)?.name || "Ejercicio no encontrado"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {exercises
                                .find((ex) => ex.id === item.exerciseId)
                                ?.muscles.slice(0, 2)
                                .join(", ")}
                            </div>
                            {item.notes && <div className="text-sm text-muted-foreground italic">{item.notes}</div>}
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-medium">
                              {item.sets} × {formatReps(item)}
                            </div>
                            <div className="text-muted-foreground">{formatWeight(item)}</div>
                            {item.restSec && <div className="text-muted-foreground">{item.restSec}s descanso</div>}
                          </div>
                        </div>
                      )}

                      {itemIndex < block.items.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la Rutina</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Objetivo:</span>
                <span className="capitalize">{template.goal || "No especificado"}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bloques:</span>
                <span>{template.blocks.length}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ejercicios:</span>
                <span>{totalExercises}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duración estimada:</span>
                <span>{estimatedDuration} min</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link href={`/log/strength?template=${template.id}`}>
                  <Play className="h-4 w-4 mr-2" />
                  Empezar Ahora
                </Link>
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <Copy className="h-4 w-4 mr-2" />
                Duplicar y Editar
              </Button>
              <Button variant="ghost" className="w-full">
                Añadir a Calendario
              </Button>
              <Button variant="ghost" className="w-full">
                Marcar como Favorita
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
