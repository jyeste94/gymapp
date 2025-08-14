"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ExerciseFiltersProps {
  selectedEquipment: string[]
  setSelectedEquipment: (equipment: string[]) => void
  selectedEnvironment: string[]
  setSelectedEnvironment: (environment: string[]) => void
  selectedMuscles: string[]
  setSelectedMuscles: (muscles: string[]) => void
  selectedMovement: string[]
  setSelectedMovement: (movement: string[]) => void
  selectedDifficulty: string[]
  setSelectedDifficulty: (difficulty: string[]) => void
}

const equipmentOptions = ["peso corporal", "mancuernas", "barra", "kettlebell", "polea", "máquina", "banda", "mixto"]

const environmentOptions = ["gimnasio", "casa"]

const muscleOptions = [
  "pectorales",
  "deltoides",
  "tríceps",
  "bíceps",
  "dorsales",
  "romboides",
  "trapecios",
  "cuádriceps",
  "glúteos",
  "isquiotibiales",
  "pantorrillas",
  "core",
  "oblicuos",
]

const movementOptions = ["empuje", "tirón", "dominante rodilla", "dominante cadera", "core", "otros"]

const difficultyOptions = ["fácil", "media", "difícil"]

export function ExerciseFilters({
  selectedEquipment,
  setSelectedEquipment,
  selectedEnvironment,
  setSelectedEnvironment,
  selectedMuscles,
  setSelectedMuscles,
  selectedMovement,
  setSelectedMovement,
  selectedDifficulty,
  setSelectedDifficulty,
}: ExerciseFiltersProps) {
  const toggleFilter = (value: string, selected: string[], setter: (values: string[]) => void) => {
    if (selected.includes(value)) {
      setter(selected.filter((item) => item !== value))
    } else {
      setter([...selected, value])
    }
  }

  const clearAllFilters = () => {
    setSelectedEquipment([])
    setSelectedEnvironment([])
    setSelectedMuscles([])
    setSelectedMovement([])
    setSelectedDifficulty([])
  }

  const hasActiveFilters =
    selectedEquipment.length > 0 ||
    selectedEnvironment.length > 0 ||
    selectedMuscles.length > 0 ||
    selectedMovement.length > 0 ||
    selectedDifficulty.length > 0

  return (
    <div className="space-y-6 mb-8 p-6 bg-muted/50 rounded-2xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filtros</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-2" />
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Environment */}
        <div>
          <h4 className="text-sm font-medium mb-2">Entorno</h4>
          <div className="flex flex-wrap gap-2">
            {environmentOptions.map((env) => (
              <Badge
                key={env}
                variant={selectedEnvironment.includes(env) ? "default" : "secondary"}
                className="cursor-pointer capitalize"
                onClick={() => toggleFilter(env, selectedEnvironment, setSelectedEnvironment)}
              >
                {env}
              </Badge>
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div>
          <h4 className="text-sm font-medium mb-2">Equipo</h4>
          <div className="flex flex-wrap gap-2">
            {equipmentOptions.map((equipment) => (
              <Badge
                key={equipment}
                variant={selectedEquipment.includes(equipment) ? "default" : "secondary"}
                className="cursor-pointer capitalize"
                onClick={() => toggleFilter(equipment, selectedEquipment, setSelectedEquipment)}
              >
                {equipment}
              </Badge>
            ))}
          </div>
        </div>

        {/* Muscles */}
        <div>
          <h4 className="text-sm font-medium mb-2">Músculos</h4>
          <div className="flex flex-wrap gap-2">
            {muscleOptions.map((muscle) => (
              <Badge
                key={muscle}
                variant={selectedMuscles.includes(muscle) ? "default" : "secondary"}
                className="cursor-pointer capitalize"
                onClick={() => toggleFilter(muscle, selectedMuscles, setSelectedMuscles)}
              >
                {muscle}
              </Badge>
            ))}
          </div>
        </div>

        {/* Movement */}
        <div>
          <h4 className="text-sm font-medium mb-2">Patrón de Movimiento</h4>
          <div className="flex flex-wrap gap-2">
            {movementOptions.map((movement) => (
              <Badge
                key={movement}
                variant={selectedMovement.includes(movement) ? "default" : "secondary"}
                className="cursor-pointer capitalize"
                onClick={() => toggleFilter(movement, selectedMovement, setSelectedMovement)}
              >
                {movement}
              </Badge>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <h4 className="text-sm font-medium mb-2">Dificultad</h4>
          <div className="flex flex-wrap gap-2">
            {difficultyOptions.map((difficulty) => (
              <Badge
                key={difficulty}
                variant={selectedDifficulty.includes(difficulty) ? "default" : "secondary"}
                className="cursor-pointer capitalize"
                onClick={() => toggleFilter(difficulty, selectedDifficulty, setSelectedDifficulty)}
              >
                {difficulty}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
