"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { SetScheme } from "@/data/models"
import { exercises } from "@/data/exercises"
import { Search } from "lucide-react"

interface SetSchemeBuilderProps {
  setScheme: SetScheme
  onSetSchemeChange: (setScheme: SetScheme) => void
}

export function SetSchemeBuilder({ setScheme, onSetSchemeChange }: SetSchemeBuilderProps) {
  const [exerciseSearch, setExerciseSearch] = useState("")
  const [showExerciseList, setShowExerciseList] = useState(false)

  const updateSetScheme = (updates: Partial<SetScheme>) => {
    onSetSchemeChange({ ...setScheme, ...updates })
  }

  const filteredExercises = exercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(exerciseSearch.toLowerCase()),
  )

  const selectedExercise = exercises.find((ex) => ex.id === setScheme.exerciseId)

  return (
    <div className="space-y-4">
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
            <Button variant="outline" size="icon" className="bg-transparent">
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
                    updateSetScheme({ exerciseId: exercise.id })
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
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{selectedExercise.name}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedExercise.muscles.join(", ")} • {selectedExercise.equipment}
                </div>
              </div>
              <Badge variant="outline">{selectedExercise.difficulty}</Badge>
            </div>
          </div>
        )}
      </div>

      {/* Sets and Reps */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sets">Series</Label>
          <Input
            id="sets"
            type="number"
            min="1"
            value={setScheme.sets}
            onChange={(e) => updateSetScheme({ sets: Number.parseInt(e.target.value) || 1 })}
          />
        </div>

        <div>
          <Label>Repeticiones</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Reps fijas"
              type="number"
              min="1"
              value={setScheme.reps || ""}
              onChange={(e) => {
                const reps = Number.parseInt(e.target.value) || undefined
                updateSetScheme({ reps, repRange: undefined })
              }}
            />
            <span className="flex items-center text-muted-foreground">o</span>
            <div className="flex gap-1">
              <Input
                placeholder="Min"
                type="number"
                min="1"
                value={setScheme.repRange?.[0] || ""}
                onChange={(e) => {
                  const min = Number.parseInt(e.target.value) || 1
                  updateSetScheme({
                    repRange: [min, setScheme.repRange?.[1] || min + 2],
                    reps: undefined,
                  })
                }}
              />
              <Input
                placeholder="Max"
                type="number"
                min="1"
                value={setScheme.repRange?.[1] || ""}
                onChange={(e) => {
                  const max = Number.parseInt(e.target.value) || 1
                  updateSetScheme({
                    repRange: [setScheme.repRange?.[0] || max - 2, max],
                    reps: undefined,
                  })
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Weight Type and Intensity */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo de carga</Label>
          <Select value={setScheme.weightType} onValueChange={(value: any) => updateSetScheme({ weightType: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="absoluto">Peso absoluto (kg)</SelectItem>
              <SelectItem value="%">Porcentaje del 1RM</SelectItem>
              <SelectItem value="RPE">RPE (Esfuerzo percibido)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(setScheme.weightType === "%" || setScheme.weightType === "RPE") && (
          <div>
            <Label>{setScheme.weightType === "%" ? "Porcentaje (%)" : "RPE"}</Label>
            <Input
              type="number"
              min={setScheme.weightType === "%" ? "1" : "1"}
              max={setScheme.weightType === "%" ? "100" : "10"}
              value={setScheme.intensity || ""}
              onChange={(e) => updateSetScheme({ intensity: Number.parseInt(e.target.value) || undefined })}
            />
          </div>
        )}
      </div>

      {/* Rest and Tempo */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rest">Descanso (segundos)</Label>
          <Input
            id="rest"
            type="number"
            min="0"
            value={setScheme.restSec || ""}
            onChange={(e) => updateSetScheme({ restSec: Number.parseInt(e.target.value) || undefined })}
          />
        </div>

        <div>
          <Label htmlFor="tempo">Tempo (ej: 3-1-2-0)</Label>
          <Input
            id="tempo"
            placeholder="3-1-2-0"
            value={setScheme.tempo || ""}
            onChange={(e) => updateSetScheme({ tempo: e.target.value || undefined })}
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          placeholder="Instrucciones adicionales, modificaciones, etc."
          value={setScheme.notes || ""}
          onChange={(e) => updateSetScheme({ notes: e.target.value || undefined })}
          rows={3}
        />
      </div>
    </div>
  )
}
