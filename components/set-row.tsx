"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { StrengthEntry } from "@/data/models"
import { CheckCircle, Plus } from "lucide-react"

interface SetRowProps {
  exerciseId: string
  setNumber: number
  onSetComplete: (entry: Omit<StrengthEntry, "setIndex">) => void
  targetReps?: number
  targetRepRange?: [number, number]
  previousSet?: StrengthEntry
}

export function SetRow({ exerciseId, setNumber, onSetComplete, targetReps, targetRepRange, previousSet }: SetRowProps) {
  const [weight, setWeight] = useState(previousSet?.weight?.toString() || "")
  const [reps, setReps] = useState(targetReps?.toString() || "")
  const [rir, setRir] = useState("")
  const [rpe, setRpe] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!weight || !reps) return

    const entry: Omit<StrengthEntry, "setIndex"> = {
      exerciseId,
      weight: Number.parseFloat(weight),
      reps: Number.parseInt(reps),
      rir: rir ? Number.parseInt(rir) : undefined,
      rpe: rpe ? Number.parseInt(rpe) : undefined,
    }

    onSetComplete(entry)

    // Reset form but keep weight for next set
    setReps(targetReps?.toString() || "")
    setRir("")
    setRpe("")
  }

  const handleQuickAdd = () => {
    if (weight && reps) {
      handleSubmit(new Event("submit") as any)
    }
  }

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault()
      handleQuickAdd()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Serie {setNumber}</h4>
        {targetReps && (
          <Badge variant="outline" className="text-xs">
            Objetivo: {targetReps} reps
          </Badge>
        )}
        {targetRepRange && (
          <Badge variant="outline" className="text-xs">
            Objetivo: {targetRepRange[0]}-{targetRepRange[1]} reps
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0"
              required
            />
          </div>
          <div>
            <Label htmlFor="reps">Repeticiones</Label>
            <Input
              id="reps"
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rir">RIR (opcional)</Label>
            <Input
              id="rir"
              type="number"
              min="0"
              max="10"
              value={rir}
              onChange={(e) => setRir(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0-10"
            />
          </div>
          <div>
            <Label htmlFor="rpe">RPE (opcional)</Label>
            <Input
              id="rpe"
              type="number"
              min="1"
              max="10"
              value={rpe}
              onChange={(e) => setRpe(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="1-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={!weight || !reps} className="flex-1">
            <CheckCircle className="h-4 w-4 mr-2" />
            Completar Serie
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleQuickAdd}
            disabled={!weight || !reps}
            className="bg-transparent"
            title="Ctrl + Enter"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </form>

      <div className="text-xs text-muted-foreground">
        Atajos: <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl + Enter</kbd> para añadir rápidamente
      </div>
    </div>
  )
}
