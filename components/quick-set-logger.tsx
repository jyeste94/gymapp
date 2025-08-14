"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { exercises } from "@/data/exercises"
import type { StrengthEntry } from "@/data/models"
import { Search, Plus } from "lucide-react"

interface QuickSetLoggerProps {
  onSetLogged: (entry: StrengthEntry) => void
}

export function QuickSetLogger({ onSetLogged }: QuickSetLoggerProps) {
  const [exerciseSearch, setExerciseSearch] = useState("")
  const [selectedExerciseId, setSelectedExerciseId] = useState("")
  const [weight, setWeight] = useState("")
  const [reps, setReps] = useState("")
  const [showExerciseList, setShowExerciseList] = useState(false)

  const filteredExercises = exercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(exerciseSearch.toLowerCase()),
  )

  const selectedExercise = exercises.find((ex) => ex.id === selectedExerciseId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedExerciseId || !weight || !reps) return

    const entry: StrengthEntry = {
      exerciseId: selectedExerciseId,
      setIndex: 1, // Quick sets are always index 1
      weight: Number.parseFloat(weight),
      reps: Number.parseInt(reps),
    }

    onSetLogged(entry)

    // Reset form
    setWeight("")
    setReps("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Exercise Selection */}
      <div>
        <Label>Ejercicio</Label>
        <div className="relative">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar ejercicio..."
              value={exerciseSearch}
              onChange={(e) => {
                setExerciseSearch(e.target.value)
                setShowExerciseList(true)
              }}
              onFocus={() => setShowExerciseList(true)}
            />
            <Button variant="outline" size="icon" type="button" className="bg-transparent">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {showExerciseList && exerciseSearch && (
            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredExercises.slice(0, 10).map((exercise) => (
                <div
                  key={exercise.id}
                  className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                  onClick={() => {
                    setSelectedExerciseId(exercise.id)
                    setExerciseSearch(exercise.name)
                    setShowExerciseList(false)
                  }}
                >
                  <div className="font-medium">{exercise.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {exercise.muscles.slice(0, 2).join(", ")} • {exercise.equipment}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedExercise && (
          <div className="mt-2 p-3 bg-muted/50 rounded-lg">
            <div className="font-medium">{selectedExercise.name}</div>
            <div className="text-sm text-muted-foreground">
              {selectedExercise.muscles.join(", ")} • {selectedExercise.equipment}
            </div>
          </div>
        )}
      </div>

      {/* Weight and Reps */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quick-weight">Peso (kg)</Label>
          <Input
            id="quick-weight"
            type="number"
            step="0.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="0"
            required
          />
        </div>
        <div>
          <Label htmlFor="quick-reps">Repeticiones</Label>
          <Input
            id="quick-reps"
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="0"
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={!selectedExerciseId || !weight || !reps} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Registrar Set
      </Button>
    </form>
  )
}
