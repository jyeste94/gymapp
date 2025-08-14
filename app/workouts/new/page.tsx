"use client"

import { useState } from "react"
import { WorkoutBuilder } from "@/components/workouts/workout-builder"
import type { WorkoutTemplate } from "@/data/models"

export default function NewWorkoutPage() {
  const [template, setTemplate] = useState<WorkoutTemplate>({
    id: "",
    name: "",
    goal: undefined,
    blocks: [],
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Crear Nueva Rutina</h1>
        <p className="text-muted-foreground">Diseña tu rutina personalizada con bloques, ejercicios y superseries</p>
      </div>

      <WorkoutBuilder template={template} onTemplateChange={setTemplate} />
    </div>
  )
}
