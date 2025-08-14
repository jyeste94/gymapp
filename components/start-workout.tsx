"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SetRow } from "./set-row"
import { Timer } from "./timer"
import { workoutTemplates } from "@/data/templates"
import { exercises } from "@/data/exercises"
import type { StrengthSession, StrengthEntry } from "@/data/models"
import { Square, Clock, Target, CheckCircle } from "lucide-react"

interface StartWorkoutProps {
  session: StrengthSession
  templateId?: string | null
  onFinish: (session: StrengthSession) => void
  onCancel: () => void
  onUpdate: (session: StrengthSession) => void
}

interface WorkoutExercise {
  exerciseId: string
  sets: number
  reps?: number
  repRange?: [number, number]
  weightType: "absoluto" | "%" | "RPE"
  intensity?: number
  restSec?: number
  notes?: string
  completed: number
}

export function StartWorkout({ session, templateId, onFinish, onCancel, onUpdate }: StartWorkoutProps) {
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [restTimeLeft, setRestTimeLeft] = useState(0)
  const [workoutStartTime] = useState(Date.now())

  const template = templateId ? workoutTemplates.find((t) => t.id === templateId) : null

  useEffect(() => {
    if (template) {
      const exercises: WorkoutExercise[] = []

      template.blocks.forEach((block) => {
        block.items.forEach((item) => {
          if ("items" in item) {
            // It's a superset
            item.items.forEach((setScheme) => {
              exercises.push({
                ...setScheme,
                completed: 0,
              })
            })
          } else {
            // It's a regular set scheme
            exercises.push({
              ...item,
              completed: 0,
            })
          }
        })
      })

      setWorkoutExercises(exercises)
    }
  }, [template])

  const currentExercise = workoutExercises[currentExerciseIndex]
  const exerciseData = currentExercise ? exercises.find((ex) => ex.id === currentExercise.exerciseId) : null

  const addSet = (entry: Omit<StrengthEntry, "setIndex">) => {
    const newEntry: StrengthEntry = {
      ...entry,
      setIndex: session.entries.filter((e) => e.exerciseId === entry.exerciseId).length + 1,
    }

    const updatedSession = {
      ...session,
      entries: [...session.entries, newEntry],
    }

    onUpdate(updatedSession)

    // Update completed sets for current exercise
    if (currentExercise && entry.exerciseId === currentExercise.exerciseId) {
      const updatedExercises = [...workoutExercises]
      updatedExercises[currentExerciseIndex].completed += 1
      setWorkoutExercises(updatedExercises)

      // Start rest timer if there's rest time specified
      if (currentExercise.restSec && currentExercise.restSec > 0) {
        setRestTimeLeft(currentExercise.restSec)
        setIsResting(true)
      }
    }
  }

  const nextExercise = () => {
    if (currentExerciseIndex < workoutExercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
      setIsResting(false)
      setRestTimeLeft(0)
    }
  }

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1)
      setIsResting(false)
      setRestTimeLeft(0)
    }
  }

  const finishWorkout = () => {
    const finalSession = {
      ...session,
      notes: `Entrenamiento completado en ${Math.round((Date.now() - workoutStartTime) / 60000)} minutos`,
    }
    onFinish(finalSession)
  }

  const workoutDuration = Math.floor((Date.now() - workoutStartTime) / 1000)
  const totalSets = session.entries.length
  const completedExercises = workoutExercises.filter((ex) => ex.completed >= ex.sets).length

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{template ? template.name : "Entrenamiento Libre"}</h1>
          <div className="flex items-center gap-4 text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {Math.floor(workoutDuration / 60)}:{(workoutDuration % 60).toString().padStart(2, "0")}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{totalSets} sets completados</span>
            </div>
            {template && (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                <span>
                  {completedExercises}/{workoutExercises.length} ejercicios
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="bg-transparent">
            <Square className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={finishWorkout}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Finalizar
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Exercise */}
          {currentExercise && exerciseData ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {currentExerciseIndex + 1}
                      </span>
                      {exerciseData.name}
                    </CardTitle>
                    <CardDescription>
                      {currentExercise.completed}/{currentExercise.sets} series completadas
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{exerciseData.equipment}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Exercise Info */}
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Objetivo: </span>
                        <span>
                          {currentExercise.sets} ×{" "}
                          {currentExercise.reps || `${currentExercise.repRange?.[0]}-${currentExercise.repRange?.[1]}`}{" "}
                          reps
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Descanso: </span>
                        <span>{currentExercise.restSec ? `${currentExercise.restSec}s` : "Libre"}</span>
                      </div>
                    </div>
                    {currentExercise.notes && (
                      <div className="mt-2 text-sm italic text-muted-foreground">{currentExercise.notes}</div>
                    )}
                  </div>

                  {/* Set Logger */}
                  <SetRow
                    exerciseId={currentExercise.exerciseId}
                    setNumber={currentExercise.completed + 1}
                    onSetComplete={addSet}
                    targetReps={currentExercise.reps}
                    targetRepRange={currentExercise.repRange}
                  />

                  {/* Navigation */}
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={previousExercise}
                      disabled={currentExerciseIndex === 0}
                      className="bg-transparent"
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      onClick={nextExercise}
                      disabled={currentExerciseIndex === workoutExercises.length - 1}
                      className="bg-transparent"
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">No hay ejercicios programados</p>
                  <Button onClick={finishWorkout}>Finalizar Entrenamiento</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rest Timer */}
          {isResting && restTimeLeft > 0 && (
            <Card>
              <CardContent className="py-6">
                <Timer
                  initialSeconds={restTimeLeft}
                  onComplete={() => {
                    setIsResting(false)
                    setRestTimeLeft(0)
                  }}
                  title="Tiempo de descanso"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Workout Progress */}
          {template && (
            <Card>
              <CardHeader>
                <CardTitle>Progreso del Entrenamiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workoutExercises.map((exercise, index) => {
                    const exerciseData = exercises.find((ex) => ex.id === exercise.exerciseId)
                    const isActive = index === currentExerciseIndex
                    const isCompleted = exercise.completed >= exercise.sets

                    return (
                      <div
                        key={index}
                        className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                          isActive
                            ? "bg-primary/10 border-primary"
                            : isCompleted
                              ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                              : "hover:bg-muted/50"
                        }`}
                        onClick={() => setCurrentExerciseIndex(index)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{exerciseData?.name || "Ejercicio desconocido"}</div>
                            <div className="text-xs text-muted-foreground">
                              {exercise.completed}/{exercise.sets} series
                            </div>
                          </div>
                          {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Session Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de la Sesión</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Duración:</span>
                  <span>
                    {Math.floor(workoutDuration / 60)}:{(workoutDuration % 60).toString().padStart(2, "0")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Sets completados:</span>
                  <span>{totalSets}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Volumen total:</span>
                  <span>
                    {Math.round(session.entries.reduce((sum, entry) => sum + entry.weight * entry.reps, 0) / 1000)} ton
                  </span>
                </div>
                {template && (
                  <div className="flex justify-between text-sm">
                    <span>Progreso:</span>
                    <span>{Math.round((completedExercises / workoutExercises.length) * 100)}%</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
