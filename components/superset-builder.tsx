"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type { Superset, SetScheme } from "@/data/models"
import { Plus, Trash2 } from "lucide-react"
import { SetSchemeBuilder } from "./set-scheme-builder"

interface SupersetBuilderProps {
  superset: Superset
  onSupersetChange: (superset: Superset) => void
}

export function SupersetBuilder({ superset, onSupersetChange }: SupersetBuilderProps) {
  const updateSuperset = (updates: Partial<Superset>) => {
    onSupersetChange({ ...superset, ...updates })
  }

  const addExercise = () => {
    const newSetScheme: SetScheme = {
      exerciseId: "",
      sets: superset.items[0]?.sets || 3,
      reps: 10,
      weightType: "absoluto",
      restSec: superset.items.length === 0 ? 90 : 0, // Last exercise gets rest, others get 0
    }

    // Update rest times: all exercises except the last should have 0 rest
    const updatedItems = superset.items.map((item, index) => ({
      ...item,
      restSec: 0,
    }))

    updateSuperset({
      items: [...updatedItems, newSetScheme],
    })
  }

  const updateExercise = (index: number, setScheme: SetScheme) => {
    const newItems = [...superset.items]
    newItems[index] = setScheme
    updateSuperset({ items: newItems })
  }

  const removeExercise = (index: number) => {
    const newItems = superset.items.filter((_, i) => i !== index)
    // Ensure the last exercise has rest time
    if (newItems.length > 0) {
      newItems[newItems.length - 1].restSec = 90
    }
    updateSuperset({ items: newItems })
  }

  return (
    <div className="space-y-6">
      {/* Superset Name */}
      <div>
        <Label htmlFor="superset-name">Nombre del superset</Label>
        <Input
          id="superset-name"
          placeholder="Ej: Superset brazos, Circuito core..."
          value={superset.name || ""}
          onChange={(e) => updateSuperset({ name: e.target.value })}
        />
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Ejercicios del superset</h4>
          <Button variant="outline" onClick={addExercise} size="sm" className="bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Añadir ejercicio
          </Button>
        </div>

        {superset.items.map((setScheme, index) => (
          <div key={index} className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="font-medium text-sm">
                Ejercicio {index + 1}
                {index === superset.items.length - 1 && (
                  <span className="text-muted-foreground ml-2">(último - con descanso)</span>
                )}
              </h5>
              {superset.items.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => removeExercise(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="pl-4 border-l-2 border-muted">
              <SetSchemeBuilder setScheme={setScheme} onSetSchemeChange={(updated) => updateExercise(index, updated)} />
            </div>

            {index < superset.items.length - 1 && <Separator />}
          </div>
        ))}

        {superset.items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-4">No hay ejercicios en este superset</p>
            <Button variant="outline" onClick={addExercise} className="bg-transparent">
              <Plus className="h-4 w-4 mr-2" />
              Añadir primer ejercicio
            </Button>
          </div>
        )}
      </div>

      {superset.items.length > 0 && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <h5 className="font-medium text-sm mb-2">Instrucciones del superset:</h5>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Realiza todos los ejercicios seguidos sin descanso</li>
            <li>
              • Descansa {superset.items[superset.items.length - 1]?.restSec || 90} segundos al final de cada ronda
            </li>
            <li>• Completa {superset.items[0]?.sets || 3} rondas en total</li>
          </ul>
        </div>
      )}
    </div>
  )
}
