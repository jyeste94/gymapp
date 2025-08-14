"use client"

import { useState, useMemo } from "react"
import { exercises } from "@/data/exercises"
import { ExerciseCard } from "@/components/exercises/exercise-card"
import { ExerciseFilters } from "@/components/exercises/exercise-filters"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function ExercisesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [selectedEnvironment, setSelectedEnvironment] = useState<string[]>([])
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([])
  const [selectedMovement, setSelectedMovement] = useState<string[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([])

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          exercise.name.toLowerCase().includes(query) ||
          exercise.muscles.some((muscle) => muscle.toLowerCase().includes(query)) ||
          exercise.movement.toLowerCase().includes(query) ||
          exercise.equipment.toLowerCase().includes(query)

        if (!matchesSearch) return false
      }

      // Equipment filter
      if (selectedEquipment.length > 0 && !selectedEquipment.includes(exercise.equipment)) {
        return false
      }

      // Environment filter
      if (selectedEnvironment.length > 0 && !selectedEnvironment.includes(exercise.environment)) {
        return false
      }

      // Muscles filter
      if (selectedMuscles.length > 0) {
        const hasMatchingMuscle = exercise.muscles.some((muscle) =>
          selectedMuscles.some((selected) => muscle.toLowerCase().includes(selected.toLowerCase())),
        )
        if (!hasMatchingMuscle) return false
      }

      // Movement filter
      if (selectedMovement.length > 0 && !selectedMovement.includes(exercise.movement)) {
        return false
      }

      // Difficulty filter
      if (selectedDifficulty.length > 0 && !selectedDifficulty.includes(exercise.difficulty)) {
        return false
      }

      return true
    })
  }, [searchQuery, selectedEquipment, selectedEnvironment, selectedMuscles, selectedMovement, selectedDifficulty])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Directorio de Ejercicios</h1>
        <p className="text-muted-foreground">
          Explora nuestra base de datos de {exercises.length} ejercicios con instrucciones detalladas
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar ejercicios por nombre, músculo o equipo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <ExerciseFilters
        selectedEquipment={selectedEquipment}
        setSelectedEquipment={setSelectedEquipment}
        selectedEnvironment={selectedEnvironment}
        setSelectedEnvironment={setSelectedEnvironment}
        selectedMuscles={selectedMuscles}
        setSelectedMuscles={setSelectedMuscles}
        selectedMovement={selectedMovement}
        setSelectedMovement={setSelectedMovement}
        selectedDifficulty={selectedDifficulty}
        setSelectedDifficulty={setSelectedDifficulty}
      />

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredExercises.length} de {exercises.length} ejercicios
        </p>
      </div>

      {/* Exercise Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron ejercicios con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  )
}
